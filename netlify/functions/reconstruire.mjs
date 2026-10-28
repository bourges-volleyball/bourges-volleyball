/* Chaque lundi vers 6h : reconstruit le site, ce qui relit le calendrier et
   les resultats FFVolley du week-end (scripts/ffvb.mjs).

   Une fois par semaine seulement : chaque publication coute 15 credits
   Netlify, sur 300 par mois avec l'offre gratuite, et chaque modification
   faite dans l'administration en coute autant. Entre deux reconstructions,
   le « prochain match » avance tout seul dans le navigateur des visiteurs.

   BUILD_HOOK_URL : Netlify, Site configuration > Build & deploy > Build hooks. */

export default async () => {
  if (!process.env.BUILD_HOOK_URL) return console.log("BUILD_HOOK_URL absente : pas de reconstruction");
  const r = await fetch(process.env.BUILD_HOOK_URL, { method: "POST" });
  console.log(`Reconstruction demandee : ${r.status}`);
};

// En heure UTC : 5h, soit 6h ou 7h a Bourges selon la saison
export const config = { schedule: "0 5 * * 1" };
