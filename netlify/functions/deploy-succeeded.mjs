/* Appelee par Netlify apres chaque mise en ligne reussie (le nom du fichier
   suffit a l'y abonner). Note celles de production : ce sont elles que
   Netlify facture 15 credits, et que compte le garde-fou
   (netlify/lib/credits.mjs). Les copies d'essai (deploy previews, branches)
   sont gratuites et ignorees.

   Netlify signe l'appel et le verifie avant d'executer la fonction : on ne
   peut pas la declencher de l'exterieur pour fausser le compte. */

import { noterMiseEnLigne } from "../lib/credits.mjs";

export default async (req) => {
  const { payload } = await req.json().catch(() => ({}));
  if (payload?.context === "production") await noterMiseEnLigne(payload);
  return new Response(null, { status: 204 });
};
