/* /.netlify/functions/paiement
   GET  ?campagne=&commande= : la page de retour demande ou en est le paiement.
   POST                      : notification de HelloAsso (adresse a renseigner
                               dans son espace, Integrations et API).
   Dans les deux cas, on redemande a HelloAsso : rien de ce qui arrive ici
   ne suffit a marquer une commande payee. */

import { confirmer, cleValide } from "../lib/boutique.mjs";

export default async (req) => {
  let campagne, commande;
  if (req.method === "POST") {
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
  const c = await confirmer(cle);
  if (!c) return Response.json({ statut: "inconnue" }, { status: 404 });

  // Ni nom ni adresse : seulement de quoi afficher le recapitulatif
  return Response.json({
    statut: c.statut,
    ref: c.id.slice(0, 8).toUpperCase(),
    payeeLe: c.payeeLe,
    categorie: c.categorie,
    vente: c.campagneNom,
    total: c.total,
    lignes: c.lignes.map((l) => ({ article: l.article, quantite: l.quantite })),
  });
};
