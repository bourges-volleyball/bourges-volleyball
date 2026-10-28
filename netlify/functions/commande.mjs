/* /.netlify/functions/commande
   GET  ?campagne=id : places encore libres, affichees sur la page de la vente.
   POST            : enregistre la commande et renvoie l'adresse de paiement HelloAsso. */

import { catalogue, verifier, placesRestantes, store, helloasso } from "../lib/boutique.mjs";

export default async (req) => {
  const origine = new URL(req.url).origin;
  const campagnes = await catalogue(origine);

  if (req.method === "GET") {
    const campagne = campagnes.find((c) => c.id === new URL(req.url).searchParams.get("campagne"));
    if (!campagne) return Response.json({}, { status: 404 });
    return Response.json(await placesRestantes(campagne));
  }
  if (req.method !== "POST") return new Response(null, { status: 405 });

  const demande = await req.json().catch(() => null);
  const campagne = campagnes.find((c) => c.id === demande?.campagne);
  const v = verifier(campagne, demande, campagne ? await placesRestantes(campagne) : {});
  if (v.erreur) return Response.json({ erreur: v.erreur }, { status: 400 });

  // Enregistree avant le paiement : si HelloAsso encaisse, la commande existe deja.
  const id = crypto.randomUUID();
  const cle = `${campagne.id}/${id}`;
  const commande = {
    id,
    campagne: campagne.id,
    campagneNom: campagne.nom,
    categorie: campagne.categorie,
    creeLe: new Date().toISOString(),
    statut: "en attente",
    remis: false,
    ...v,
  };
  const s = store();
  await s.setJSON(cle, commande);

  const retour = `${origine}/boutique/paiement/?campagne=${campagne.id}&commande=${id}`;
  try {
    const intention = await helloasso("/checkout-intents", {
      totalAmount: v.total,
      initialAmount: v.total,
      itemName: campagne.nom.slice(0, 250),
      backUrl: `${origine}/boutique/${campagne.id}/`,
      errorUrl: `${retour}&erreur=1`,
      returnUrl: retour,
      containsDonation: false,
      payer: { firstName: v.payeur.prenom, lastName: v.payeur.nom, email: v.payeur.email },
      metadata: { campagne: campagne.id, commande: id },
    });
    await s.setJSON(cle, { ...commande, checkoutIntentId: intention.id });
    return Response.json({ url: intention.redirectUrl });
  } catch (e) {
    console.error(e);
    await s.delete(cle);
    return Response.json(
      { erreur: "Le paiement est momentanément indisponible. Réessayez dans quelques minutes." },
      { status: 502 },
    );
  }
};
