/* /.netlify/functions/essai-helloasso : le bouton « Tester HelloAsso » de la
   page /admin/commandes.html. Verifie la cle API sans rien encaisser : lit la
   fiche de l'association, puis prepare un paiement de 1 EUR que le benevole
   regarde sans payer. Aucune commande n'est enregistree. */

import { benevoleConnecte, helloasso, bacASable } from "../lib/boutique.mjs";

export default async (req) => {
  if (req.method !== "POST") return new Response(null, { status: 405 });
  if (!(await benevoleConnecte(req))) return new Response("Connexion requise", { status: 401 });
  if (!process.env.HELLOASSO_CLIENT_ID || !process.env.HELLOASSO_CLIENT_SECRET) {
    return Response.json({
      erreur:
        "le site ne voit pas encore la clé API. Vérifiez HELLOASSO_CLIENT_ID et HELLOASSO_CLIENT_SECRET dans Netlify, puis relancez une publication : une variable n'est lue qu'à partir de la publication suivante.",
    });
  }
  const page = `${new URL(req.url).origin}/admin/commandes.html`;
  try {
    const association = await helloasso("");
    const intention = await helloasso("/checkout-intents", {
      totalAmount: 100,
      initialAmount: 100,
      itemName: "Essai de connexion du site - ne pas payer",
      backUrl: page,
      errorUrl: page,
      returnUrl: page,
      containsDonation: false,
    });
    return Response.json({ association: association.name, bacASable, lien: intention.redirectUrl });
  } catch (e) {
    console.error(e);
    return Response.json({ erreur: e.message });
  }
};
