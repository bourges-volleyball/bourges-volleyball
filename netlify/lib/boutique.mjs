/* Le coeur de la boutique, partage par les fonctions de netlify/functions.

   Le site prend la commande, HelloAsso n'encaisse que le paiement (son
   service « Checkout »). Le navigateur n'envoie que des choix : articles,
   quantites, tailles, noms. Le montant est toujours recalcule ici, a partir
   du catalogue publie, sinon n'importe qui pourrait payer 1 EUR un jogging.

   Les commandes sont rangees dans Netlify Blobs, sous la cle
   « id-de-la-vente/id-de-la-commande ». */

import { getStore } from "@netlify/blobs";

export const MAX_PAR_ARTICLE = 20;
const JOUR = 86400000;

/* Une vente est ouverte jusqu'au soir de sa date de fermeture. Meme regle que
   venteOuverte() dans src/lib/donnees.ts : les deux doivent rester d'accord. */
export function ouverte(c, maintenant = Date.now()) {
  return (
    (!c.ouvertureLe || Date.parse(c.ouvertureLe) <= maintenant) &&
    (!c.fermetureLe || Date.parse(c.fermetureLe) + JOUR > maintenant)
  );
}

const texte = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/** Verifie une commande et calcule son montant en centimes.
 *  `restantes` : places encore libres par article (voir placesRestantes).
 *  Renvoie { erreur } ou { total, lignes, payeur }. */
export function verifier(campagne, demande, restantes = {}) {
  if (!campagne || !ouverte(campagne)) return { erreur: "Cette vente est fermée." };

  const p = demande?.payeur ?? {};
  const payeur = { prenom: texte(p.prenom, 50), nom: texte(p.nom, 50), email: texte(p.email, 80) };
  if (!payeur.prenom || !payeur.nom) return { erreur: "Indiquez votre prénom et votre nom." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payeur.email)) return { erreur: "Votre adresse mail semble incorrecte." };

  const lignes = [];
  let total = 0;
  for (const l of Array.isArray(demande?.lignes) ? demande.lignes : []) {
    const article = campagne.articles.find((a) => a.nom === l?.article);
    const quantite = Number(l?.quantite);
    if (!article || lignes.some((x) => x.article === article.nom)) return { erreur: "Article inconnu." };
    if (!Number.isInteger(quantite) || quantite < 1 || quantite > MAX_PAR_ARTICLE) {
      return { erreur: `Quantité invalide pour « ${article.nom} ».` };
    }
    const reste = restantes[article.nom];
    if (reste !== undefined && quantite > reste) {
      return { erreur: reste ? `Il ne reste que ${reste} place(s) pour « ${article.nom} ».` : `« ${article.nom} » est complet.` };
    }

    /* Stage a la journee : chaque personne choisit son nombre de jours et ses
       options (repas, sortie...). Une option « par jour » est comptee chaque
       jour ; une option « offerte des N jours » est gratuite a partir de N jours. */
    const prix = Math.round(article.prix * 100);
    const options = article.options ?? [];
    let montantLigne = 0;
    const details = [];
    for (let i = 0; i < quantite; i++) {
      const d = Array.isArray(l.details) ? l.details[i] ?? {} : {};
      const detail = {};
      let jours = 1;
      if (article.jours) {
        jours = Number(d.jours);
        if (!Number.isInteger(jours) || jours < 1 || jours > article.jours) {
          return { erreur: `Choisissez le nombre de jours pour « ${article.nom} ».` };
        }
        detail.jours = jours;
      }
      let montant = prix * jours;
      if (options.length) {
        const choisies = Array.isArray(d.options) ? d.options : [];
        if (choisies.some((n) => !options.some((o) => o.nom === n))) return { erreur: "Option inconnue." };
        detail.options = options.filter((o) => choisies.includes(o.nom)).map((o) => o.nom);
        for (const o of options) {
          if (!choisies.includes(o.nom) || (o.offerteDes && jours >= o.offerteDes)) continue;
          montant += Math.round(o.prix * 100) * (o.parJour ? jours : 1);
        }
      }
      if (article.jours || options.length) detail.montant = montant;
      montantLigne += montant;
      if (article.tailles?.length) {
        if (!article.tailles.includes(d.taille)) return { erreur: `Choisissez une taille pour « ${article.nom} ».` };
        detail.taille = d.taille;
      }
      if (campagne.nominatif) {
        detail.participant = texte(d.participant, 100);
        if (!detail.participant) return { erreur: `Indiquez le nom et le prénom pour « ${article.nom} ».` };
        detail.reponses = {};
        for (const q of campagne.questions ?? []) {
          const brut = d.reponses?.[q.libelle];
          const r = q.type === "ouinon" ? (["Oui", "Non"].includes(brut) ? brut : "") : texte(brut, 250);
          if (!r) return { erreur: `Répondez à « ${q.libelle} » pour « ${article.nom} ».` };
          detail.reponses[q.libelle] = r;
        }
      }
      details.push(detail);
    }

    total += montantLigne;
    lignes.push({ article: article.nom, prix, quantite, details });
  }
  if (!lignes.length) return { erreur: "Votre commande est vide." };
  return { total, lignes, payeur };
}

export const store = () => getStore({ name: "commandes", consistency: "strong" });

/** Le catalogue tel que publie par le site (src/pages/boutique/catalogue.json.ts). */
export async function catalogue(origine) {
  const r = await fetch(new URL("/boutique/catalogue.json", origine));
  if (!r.ok) throw new Error(`Catalogue introuvable (${r.status})`);
  return r.json();
}

/* Une commande en attente retient ses places 20 minutes : le lien de
   paiement HelloAsso expire au bout de 15. */
const retient = (c) => c.statut === "payée" || Date.now() - Date.parse(c.creeLe) < 20 * 60000;

/** Places encore libres, pour les seuls articles qui ont un nombre de places. */
export async function placesRestantes(campagne) {
  const limites = campagne.articles.filter((a) => a.places != null);
  if (!limites.length) return {};
  // ponytail: relit toutes les commandes de la vente a chaque appel ; quelques
  // centaines par saison, ca tient. Un compteur par article si ca grossit.
  // Deux acheteurs a la meme seconde peuvent prendre la derniere place.
  const s = store();
  const { blobs } = await s.list({ prefix: `${campagne.id}/` });
  const pris = {};
  for (const { key } of blobs) {
    const c = await s.get(key, { type: "json" });
    if (!c || !retient(c)) continue;
    for (const l of c.lignes) pris[l.article] = (pris[l.article] ?? 0) + l.quantite;
  }
  return Object.fromEntries(limites.map((a) => [a.nom, Math.max(0, a.places - (pris[a.nom] ?? 0))]));
}

/* ---- HelloAsso ---------------------------------------------------------
   Cle API generee dans l'espace HelloAsso du club (Mon compte > Integrations
   et API), rangee dans les variables d'environnement de Netlify.
   HELLOASSO_API permet de viser le bac a sable pour des essais :
   https://api.helloasso-sandbox.com */
const API = process.env.HELLOASSO_API ?? "https://api.helloasso.com";
const ORGANISATION = process.env.HELLOASSO_ORGANISATION ?? "bourges-volley";

let jeton; // valable 30 minutes, garde tant que la fonction reste chaude
async function jetonHelloAsso() {
  if (jeton && jeton.expire > Date.now()) return jeton.valeur;
  const r = await fetch(`${API}/oauth2/token`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: process.env.HELLOASSO_CLIENT_ID ?? "",
      client_secret: process.env.HELLOASSO_CLIENT_SECRET ?? "",
    }),
  });
  if (!r.ok) throw new Error(`HelloAsso refuse la cle API (${r.status})`);
  const j = await r.json();
  jeton = { valeur: j.access_token, expire: Date.now() + (Number(j.expires_in) - 60) * 1000 };
  return jeton.valeur;
}

export async function helloasso(chemin, corps) {
  const r = await fetch(`${API}/v5/organizations/${ORGANISATION}${chemin}`, {
    method: corps ? "POST" : "GET",
    headers: { authorization: `Bearer ${await jetonHelloAsso()}`, "content-type": "application/json" },
    body: corps ? JSON.stringify(corps) : undefined,
  });
  if (!r.ok) throw new Error(`HelloAsso ${chemin} : ${r.status} ${await r.text()}`);
  return r.json();
}

/** Demande a HelloAsso si la commande a ete payee, et l'enregistre si oui.
 *  C'est la seule source de verite : ni le retour du visiteur sur le site,
 *  ni le contenu d'une notification ne suffisent a marquer une commande payee. */
export async function confirmer(cle) {
  const s = store();
  const c = await s.get(cle, { type: "json" });
  if (!c || c.statut === "payée" || !c.checkoutIntentId) return c;
  const intention = await helloasso(`/checkout-intents/${c.checkoutIntentId}`);
  if (intention.order?.payments?.some((p) => p.state === "Authorized")) {
    c.statut = "payée";
    c.payeeLe = new Date().toISOString();
    c.commandeHelloAsso = intention.order.id;
    await s.setJSON(cle, c);
  }
  return c;
}

export const cleValide = (cle) => /^[a-z0-9-]+\/[0-9a-f-]{36}$/.test(cle);
