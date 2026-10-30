/* Chaque lundi vers 6h : republie le site si la FFVolley a du nouveau (scores
   du week-end, calendrier modifie, classement), sinon ne fait rien.

   Chaque publication coute 15 credits Netlify, sur 300 par mois avec l'offre
   gratuite. Une semaine sans match (vacances, intersaison), ou deja couverte
   par une publication depuis l'administration (qui relit aussi la FFVolley),
   n'en coute donc aucun. Entre deux publications, le « prochain match »
   avance tout seul dans le navigateur des visiteurs.

   Comme le bouton « Publier le site », elle s'abstient quand le garde-fou
   des credits (netlify/lib/credits.mjs) dit que le mois est epuise, ou
   qu'il ne peut pas le verifier.

   BUILD_HOOK_URL : Netlify, Site configuration > Build & deploy > Build hooks. */

import { aRepublier } from "../lib/ffvb.mjs";
import { etat } from "../lib/credits.mjs";

export default async (req, context) => {
  if (!process.env.BUILD_HOOK_URL) return console.log("BUILD_HOOK_URL absente : pas de reconstruction");
  const site = context?.site?.url ?? process.env.URL;
  // Dans le doute (site injoignable...), on republie : c'est l'ancien comportement
  const raison = await aRepublier(site).catch((e) => `verification impossible (${e.message})`);
  if (!raison) return console.log("FFVolley : rien de neuf depuis la derniere publication, pas de reconstruction");
  const credits = await etat().catch(() => null);
  if (!credits?.permis)
    return console.log(`Garde-fou des credits : pas de reconstruction (${credits ? `${credits.utilises} credits utilises` : "credits illisibles"}), ${raison}`);
  const r = await fetch(process.env.BUILD_HOOK_URL, { method: "POST" });
  console.log(`Reconstruction demandee, ${raison} : ${r.status}`);
};

// En heure UTC : 5h, soit 6h ou 7h a Bourges selon la saison
export const config = { schedule: "0 5 * * 1" };
