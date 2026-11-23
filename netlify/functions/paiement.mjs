/* /.netlify/functions/paiement
   GET  ?campagne=&commande= : la page de retour demande ou en est le paiement.
   POST                      : notification de HelloAsso (adresse a renseigner
                               dans son espace, Integrations et API).
   Dans les deux cas, on redemande a HelloAsso : rien de ce qui arrive ici
   ne suffit a marquer une commande payee.
   
   SECURITE :
   - Verification CSRF pour les requetes POST (notifications)
   - Validation stricte des parametres
   */

import { confirmer, cleValide } from "../lib/boutique.mjs";

// Secret pour la verification CSRF (doit correspondre a celui de commande.mjs)
const CSRF_SECRET = process.env.CSRF_SECRET || 'changer-ce-secret-en-production';

/** Verifie le jeton CSRF */
function verifierCSRF(jeton) {
  if (!jeton) return false;
  return jeton === CSRF_SECRET;
}


export default async (req, context) => {
  let campagne, commande;
  
  // Verification du Content-Type pour POST
  if (req.method === "POST") {
    const contentType = req.headers.get("content-type");
    if (contentType && !contentType.includes("application/json")) {
      return new Response(null, { status: 415 });
    }
    
    // Verification CSRF pour les notifications
    const csrfToken = req.headers.get("x-csrf-token");
    if (!verifierCSRF(csrfToken)) {
      console.warn("Notification HelloAsso refusee : jeton CSRF invalide");
      return new Response(null, { status: 403 });
    }
    
    const n = await req.json().catch(() => null);
    ({ campagne, commande } = n?.metadata ?? {});
    // HelloAsso notifie aussi ses propres formulaires : rien a faire pour eux
    if (!commande) return new Response(null, { status: 200 });
  } else {
    const p = new URL(req.url).searchParams;
    campagne = p.get("campagne");
    commande = p.get("commande");
  }

  const cle = `${campagne}/${commande}`;
  if (!cleValide(cle)) return Response.json({ statut: "inconnue" }, { status: 404 });
  const c = await confirmer(cle, context?.site?.url ?? new URL(req.url).origin);
  if (!c) return Response.json({ statut: "inconnue" }, { status: 404 });

  /* Ni le nom ni l'adresse du payeur : seulement de quoi afficher le
     recapitulatif. Les participants (et leurs jours, tailles, options), que
     le payeur vient de saisir, n'y sont qu'avec l'identifiant de la commande,
     impossible a deviner. */
  return Response.json({
    statut: c.statut,
    ref: c.id.slice(0, 8).toUpperCase(),
    payeeLe: c.payeeLe,
    categorie: c.categorie,
    vente: c.campagneNom,
    total: c.total,
    lignes: c.lignes.map((l) => ({
      article: l.article,
      quantite: l.quantite,
      details: (l.details ?? []).map((d) => ({
        participant: d.participant,
        taille: d.taille,
        jours: d.jours,
        options: d.options,
        montant: d.montant,
      })),
    })),
  });
};
