/* Recuperation du calendrier et des resultats FFVolley.
 *
 * La federation ne publie aucune API : on lit les pages HTML de
 * ffvbbeach.org. C'est fragile par nature, donc ce script ne fait jamais
 * echouer la construction du site. En cas de probleme, il conserve le
 * fichier precedent et le site continue de fonctionner avec.
 *
 * Lancement : npm run maj:ffvb
 */
import fs from "node:fs";

const NOUS = "BOURGES VOLLEY-BALL";
const SORTIE = "src/data/ffvb.json";
const REGLAGES = "src/data/ffvb-poules.json";

/* Les equipes suivies se reglent dans l'administration (Reglages > Matchs
   FFVolley). Chaque poule y est donnee par l'adresse de sa page Calendrier
   sur ffvbbeach.org : on en tire la saison, le code de ligue (codent) et le
   code de poule. Changer de saison, c'est donc coller les nouvelles adresses. */
function lireReglages() {
  try {
    return JSON.parse(fs.readFileSync(REGLAGES, "utf8")).poules.flatMap((p) => {
      const u = new URL(p.adresse);
      const q = Object.fromEntries(["saison", "codent", "poule"].map((k) => [k, u.searchParams.get(k)]));
      if (!/(^|\.)ffvbbeach\.org$/.test(u.hostname) || !q.saison || !q.codent || !q.poule) {
        console.warn(`${p.equipe} : l'adresse ne donne pas saison, codent et poule, equipe ignoree`);
        return [];
      }
      return [{ equipe: p.equipe, competition: p.competition, ...q }];
    });
  } catch (e) {
    console.warn(`Reglages illisibles (${REGLAGES} : ${e.message}) : le fichier existant est conserve.`);
    process.exit(0);
  }
}
const POULES = lireReglages();

// L'adresse est reconstruite a partir des seuls codes : on n'interroge jamais
// un autre site que celui de la federation, quoi qu'on ait colle.
const url = (p) =>
  `https://www.ffvbbeach.org/ffvbapp/resu/vbspo_calendrier.php` +
  `?saison=${encodeURIComponent(p.saison)}&codent=${encodeURIComponent(p.codent)}&poule=${encodeURIComponent(p.poule)}`;

/** Les pages sont en ISO-8859-1 : decodees en UTF-8, les accents seraient perdus. */
async function lirePage(u) {
  const r = await fetch(u, { headers: { "User-Agent": "Mozilla/5.0 (compatible; site-bvb)" } });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return new TextDecoder("iso-8859-1").decode(Buffer.from(await r.arrayBuffer()));
}

function cellules(ligne) {
  return [...ligne.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((m) =>
    m[1]
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

/** Decalage horaire de Paris a cet instant, pour ne pas decaler les matchs. */
function decalageParis(date) {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "Europe/Paris",
      hour12: false,
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit",
    })
      .formatToParts(date)
      .map((x) => [x.type, x.value]),
  );
  return Date.UTC(p.year, p.month - 1, p.day, p.hour === "24" ? 0 : p.hour, p.minute) - date.getTime();
}

function versISO(jjmmaa, hhmm) {
  const [j, m, a] = jjmmaa.split("/").map(Number);
  const [h, mn] = (hhmm || "00:00").split(":").map(Number);
  const annee = 2000 + a;
  const approx = Date.UTC(annee, m - 1, j, h, mn);
  return new Date(approx - decalageParis(new Date(approx))).toISOString();
}

function extraire(html, { equipe, competition }) {
  const lignes = html.match(/<tr[^>]*>[\s\S]*?<\/tr>/g) ?? [];
  const matchs = [];

  for (const ligne of lignes) {
    const c = cellules(ligne);
    // Une ligne de match commence par un code (PNMA001) suivi d'une date.
    if (!c[0] || !/\d{3}$/.test(c[0])) continue;
    if (!/^\d{2}\/\d{2}\/\d{2}$/.test(c[1] ?? "")) continue;

    const domicile = c[3] ?? "";
    const exterieur = c[5] ?? "";
    if (domicile !== NOUS && exterieur !== NOUS) continue;

    // « xxxxx » signifie que le club est exempt cette journee-la : il n y a
    // pas de match. On l ecarte du calendrier plutot que d afficher une
    // rencontre contre un adversaire fantome.
    const adverse = domicile === NOUS ? exterieur : domicile;
    if (/^x+$/i.test(adverse.trim())) continue;

    const nous = domicile === NOUS;
    // Match joue : scores en 6 et 7, detail des sets en 8. A venir : la
    // salle en 7. « F » marque l'equipe forfait, comptee 3-0 par la FFVolley.
    const forfait = c[6] === "F" || c[7] === "F";
    const score = (v) => (/^\d+$/.test(v ?? "") ? Number(v) : v === "F" ? 0 : undefined);
    const scoreD = score(c[6]);
    const scoreE = score(c[7]);
    const joue = scoreD !== undefined && scoreE !== undefined;

    matchs.push({
      id: c[0],
      equipe,
      competition,
      date: versISO(c[1], c[2]),
      domicile: nous,
      adversaire: nous ? exterieur : domicile,
      lieu: joue ? null : c[7] || null,
      scoreNous: nous ? scoreD : scoreE,
      scoreEux: nous ? scoreE : scoreD,
      // Sets dans l'ordre domicile:exterieur, comme le score affiche
      sets: joue && !forfait ? c[8] || undefined : undefined,
      forfait: forfait || undefined,
    });
  }
  return matchs;
}

/** Le classement est le tableau en tete de page : « 1. | EQUIPE | points | joues | gagnes | perdus ». */
function classement(html) {
  return (html.match(/<tr[^>]*>[\s\S]*?<\/tr>/g) ?? [])
    .map(cellules)
    .filter((c) => /^\d+\.$/.test(c[0] ?? ""))
    .map((c) => ({
      rang: parseInt(c[0], 10),
      nom: c[1],
      points: Number(c[2]) || 0,
      joues: Number(c[3]) || 0,
      gagnes: Number(c[4]) || 0,
      perdus: Number(c[5]) || 0,
      nous: c[1] === NOUS,
    }));
}

const tous = [];
const classements = {};
const echecs = [];

for (const p of POULES) {
  try {
    const html = await lirePage(url(p));
    const m = extraire(html, p);
    tous.push(...m);
    classements[p.equipe] = classement(html);
    console.log(`${p.poule} (${p.equipe}) : ${m.length} rencontre(s)`);
  } catch (e) {
    echecs.push(`${p.poule} : ${e.message}`);
    console.warn(`${p.poule} : echec de lecture (${e.message})`);
  }
}

/* Regle de prudence : si aucune poule n'a repondu, on ne touche a rien.
   Mieux vaut un calendrier de la veille qu'une page vide. */
if (tous.length === 0) {
  console.warn("Aucune donnee recuperee — le fichier existant est conserve.");
  process.exit(0);
}

tous.sort((a, b) => a.date.localeCompare(b.date));

const contenu = {
  miseAJour: new Date().toISOString(),
  saison: POULES[0]?.saison ?? null,
  source: "ffvbbeach.org",
  poulesEnEchec: echecs,
  // Dans l'ordre de POULES : c'est aussi l'ordre des onglets de la page Matchs
  classements,
  matchs: tous,
};

fs.writeFileSync(SORTIE, JSON.stringify(contenu, null, 2) + "\n", "utf8");
console.log(`\n${tous.length} rencontre(s) ecrites dans ${SORTIE}`);
