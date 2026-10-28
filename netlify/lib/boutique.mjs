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

/* Stage : les jours sont des dates (AAAA-MM-JJ). Un jour se reserve
   jusqu'au soir meme, comme une vente jusqu'au soir de sa fermeture. */
const jourPasse = (j, maintenant) => Date.parse(j) + JOUR <= maintenant;
export const jourEnClair = (j) =>
  new Date(j).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });
/** Cle des places restantes d'un jour de stage, partagee avec la page de la vente. */
export const cleJour = (article, jour) => `${article} / ${jour}`;

/** Verifie une commande et calcule son montant en centimes.
 *  `restantes` : places encore libres par article (voir placesRestantes).
 *  Renvoie { erreur } ou { total, lignes, payeur }. */
export function verifier(campagne, demande, restantes = {}, maintenant = Date.now()) {
  if (!campagne || !ouverte(campagne, maintenant)) return { erreur: "Cette vente est fermée." };

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

    /* Stage a la journee : chaque personne coche ses jours et ses options
       (repas, sortie...). Une option « par jour » est comptee chaque jour
       coche ; une option « offerte des N jours » est gratuite a partir de N
       jours ; une option liee a un jour (la sortie du mercredi) demande ce jour. */
    const prix = Math.round(article.prix * 100);
    const options = article.options ?? [];
    const calendrier = article.jours ?? [];
    let montantLigne = 0;
    const details = [];
    for (let i = 0; i < quantite; i++) {
      const d = Array.isArray(l.details) ? l.details[i] ?? {} : {};
      const detail = {};
      let jours = 1;
      if (calendrier.length) {
        const coches = Array.isArray(d.jours) ? d.jours : [];
        if (!coches.length || coches.some((j) => !calendrier.includes(j))) {
          return { erreur: `Cochez au moins un jour pour « ${article.nom} ».` };
        }
        detail.jours = calendrier.filter((j) => coches.includes(j));
        const passe = detail.jours.find((j) => jourPasse(j, maintenant));
        if (passe) return { erreur: `Le ${jourEnClair(passe)} est passé : décochez-le.` };
        jours = detail.jours.length;
      }
      let montant = prix * jours;
      if (options.length) {
        const choisies = Array.isArray(d.options) ? d.options : [];
        if (choisies.some((n) => !options.some((o) => o.nom === n))) return { erreur: "Option inconnue." };
        detail.options = options.filter((o) => choisies.includes(o.nom)).map((o) => o.nom);
        for (const o of options) {
          if (!choisies.includes(o.nom)) continue;
          if (o.jour && !detail.jours?.includes(o.jour)) {
            return { erreur: `« ${o.nom} » a lieu le ${jourEnClair(o.jour)} : cochez ce jour pour la choisir.` };
          }
          if (o.offerteDes && jours >= o.offerteDes) continue;
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

    // Places d'un stage : comptees jour par jour
    for (const j of calendrier) {
      const reste = restantes[cleJour(article.nom, j)];
      const n = details.filter((d) => d.jours.includes(j)).length;
      if (reste !== undefined && n > reste) {
        return { erreur: reste ? `Il ne reste que ${reste} place(s) le ${jourEnClair(j)}.` : `Le ${jourEnClair(j)} est complet.` };
      }
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

/** Places encore libres, pour les seuls articles qui ont un nombre de places.
 *  Pour un stage, une entree par jour (cleJour) : le nombre de places est
 *  celui d'une journee. */
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
    for (const l of c.lignes) {
      pris[l.article] = (pris[l.article] ?? 0) + l.quantite;
      for (const d of l.details ?? []) {
        for (const j of Array.isArray(d.jours) ? d.jours : []) pris[cleJour(l.article, j)] = (pris[cleJour(l.article, j)] ?? 0) + 1;
      }
    }
  }
  const libres = (cle, places) => Math.max(0, places - (pris[cle] ?? 0));
  return Object.fromEntries(
    limites.flatMap((a) =>
      a.jours?.length ? a.jours.map((j) => [cleJour(a.nom, j), libres(cleJour(a.nom, j), a.places)]) : [[a.nom, libres(a.nom, a.places)]],
    ),
  );
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

/* Alerte au club : une commande vient d'etre payee. Passe par un formulaire
   Netlify cache (« commande-payee », dans src/pages/boutique/paiement.astro) :
   Netlify envoie chaque envoi par mail aux adresses choisies dans
   Forms > Form notifications. Seulement si ALERTE_COMMANDES vaut « oui » :
   selon l'offre Netlify, un envoi de formulaire peut consommer des credits.
   Ni nom ni adresse : le detail se lit sur la page Commandes. */
export async function alerter(c, site) {
  if (process.env.ALERTE_COMMANDES !== "oui" || !site) return;
  const r = await fetch(new URL("/", site), {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      "form-name": "commande-payee",
      vente: c.campagneNom,
      montant: `${(c.total / 100).toFixed(2).replace(".", ",")} €`,
      commande: c.id.slice(0, 8).toUpperCase(),
      articles: c.lignes.map((l) => `${l.quantite} × ${l.article}`).join(", "),
      voir: new URL("/admin/commandes.html", site).href,
    }),
  });
  if (!r.ok) console.error(`Alerte de commande refusee : ${r.status}`);
}

/** Demande a HelloAsso si la commande a ete payee, et l'enregistre si oui.
 *  C'est la seule source de verite : ni le retour du visiteur sur le site,
 *  ni le contenu d'une notification ne suffisent a marquer une commande payee.
 *  `site` : l'adresse du site, pour prevenir le club (alerter). */
export async function confirmer(cle, site) {
  const s = store();
  const c = await s.get(cle, { type: "json" });
  if (!c || c.statut === "payée" || !c.checkoutIntentId) return c;
  const intention = await helloasso(`/checkout-intents/${c.checkoutIntentId}`);
  if (intention.order?.payments?.some((p) => p.state === "Authorized")) {
    c.statut = "payée";
    c.payeeLe = new Date().toISOString();
    c.commandeHelloAsso = intention.order.id;
    await s.setJSON(cle, c);
    // Une seule fois : la commande est desormais « payée », confirmer() s'arrete plus haut
    await alerter(c, site).catch((e) => console.error(e));
  }
  return c;
}

export const cleValide = (cle) => /^[a-z0-9-]+\/[0-9a-f-]{36}$/.test(cle);
