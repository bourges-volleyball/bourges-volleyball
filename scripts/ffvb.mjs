/* Recuperation du calendrier et des resultats FFVolley, avant chaque
 * construction du site (lecture des pages : netlify/lib/ffvb.mjs).
 *
 * C'est fragile par nature, donc ce script ne fait jamais echouer la
 * construction du site. En cas de probleme, il conserve les donnees
 * precedentes et le site continue de fonctionner avec.
 *
 * Lancement : npm run maj:ffvb
 */
import fs from "node:fs";
import { poulesDepuis, recuperer } from "../netlify/lib/ffvb.mjs";

const SORTIE = "src/data/ffvb.json";
const REGLAGES = "src/data/ffvb-poules.json";

function lireReglages() {
  try {
    return poulesDepuis(JSON.parse(fs.readFileSync(REGLAGES, "utf8")).poules);
  } catch (e) {
    console.warn(`Reglages illisibles (${REGLAGES} : ${e.message}) : le fichier existant est conserve.`);
    process.exit(0);
  }
}
const POULES = lireReglages();

const { matchs, classements, echecs } = await recuperer(POULES);

/* Regle de prudence : si aucune poule n'a repondu, on ne touche a rien.
   Mieux vaut un calendrier de la veille qu'une page vide. */
if (matchs.length === 0) {
  console.warn("Aucune donnee recuperee — le fichier existant est conserve.");
  process.exit(0);
}

/* Une poule seule en echec garde ses donnees de la derniere lecture reussie,
   plutot que de disparaitre du site jusqu'a la publication suivante. */
let ancien = {};
try {
  ancien = JSON.parse(fs.readFileSync(SORTIE, "utf8"));
} catch {}
for (const e of echecs) matchs.push(...(ancien.matchs ?? []).filter((m) => m.equipe === e.equipe));
matchs.sort((a, b) => a.date.localeCompare(b.date));

const contenu = {
  miseAJour: new Date().toISOString(),
  saison: POULES[0]?.saison ?? null,
  source: "ffvbbeach.org",
  poulesEnEchec: echecs.map((e) => `${e.poule} : ${e.erreur}`),
  // Dans l'ordre de POULES : c'est aussi l'ordre des onglets de la page Matchs
  classements: Object.fromEntries(
    POULES.map((p) => [p.equipe, classements[p.equipe] ?? ancien.classements?.[p.equipe]]).filter(([, c]) => c),
  ),
  matchs,
};

fs.writeFileSync(SORTIE, JSON.stringify(contenu, null, 2) + "\n", "utf8");
console.log(`\n${matchs.length} rencontre(s) ecrites dans ${SORTIE}`);
