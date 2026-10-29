/* /.netlify/functions/commandes : la liste des commandes payees, pour la page
   /admin/commandes.html.
   GET  : toutes les commandes payees.
   POST : { cle, remis } coche ou decoche « remis » (article livre, place pointee). */

import { store, cleValide, benevoleConnecte } from "../lib/boutique.mjs";

export default async (req) => {
  // Meme connexion que l'administration
  if (!(await benevoleConnecte(req))) return new Response("Connexion requise", { status: 401 });

  const s = store();
  if (req.method === "POST") {
    const { cle, remis } = (await req.json().catch(() => null)) ?? {};
    const c = cleValide(cle) && (await s.get(cle, { type: "json" }));
    if (!c) return new Response(null, { status: 404 });
    await s.setJSON(cle, { ...c, remis: remis === true });
    return Response.json({ ok: true });
  }

  const { blobs } = await s.list();
  const toutes = await Promise.all(blobs.map(async ({ key }) => ({ cle: key, ...(await s.get(key, { type: "json" })) })));
  return Response.json(
    toutes.filter((c) => c.statut === "payée").sort((a, b) => b.creeLe.localeCompare(a.creeLe)),
  );
};
