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

const SAISON = process.env.FFVB_SAISON ?? "2026/2027";
const CODENT = "LICE"; // Ligue Centre-Val de Loire
const NOUS = "BOURGES VOLLEY-BALL";
const SORTIE = "src/data/ffvb.json";

const POULES = [
  { poule: "PNM", equipe: "Seniors masculins", competition: "Prénationale masculine" },
  { poule: "RFS", equipe: "Seniors féminines", competition: "Régionale féminine" },
  { poule: "18A", equipe: "M18 filles", competition: "Régionale M18 filles" },
  { poule: "18M", equipe: "M18 garçons", competition: "Prénationale M18 garçons" },
];

const url = (poule) =>
  `https://www.ffvbbeach.org/ffvbapp/resu/vbspo_calendrier.php` +
  `?saison=${encodeURIComponent(SAISON)}&codent=${CODENT}&poule=${poule}`;

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
    const scoreD = /^\d+$/.test(c[6] ?? "") ? Number(c[6]) : undefined;
    const scoreE = /^\d+$/.test(c[7] ?? "") ? Number(c[7]) : undefined;

    // Le lieu est la premiere cellule suivante qui ressemble a un nom de salle.
    const lieu = c.slice(6).find((v) => /[A-Za-zÀ-ÿ]{3,}/.test(v) && !/\//.test(v));

    matchs.push({
      id: c[0],
      equipe,
      competition,
      date: versISO(c[1], c[2]),
      domicile: nous,
      adversaire: nous ? exterieur : domicile,
      lieu: lieu ?? null,
      scoreNous: nous ? scoreD : scoreE,
      scoreEux: nous ? scoreE : scoreD,
    });
  }
  return matchs;
}

const tous = [];
const echecs = [];

for (const p of POULES) {
  try {
    const html = await lirePage(url(p.poule));
    const m = extraire(html, p);
    tous.push(...m);
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
  saison: SAISON,
  source: "ffvbbeach.org",
  poulesEnEchec: echecs,
  matchs: tous,
};

fs.writeFileSync(SORTIE, JSON.stringify(contenu, null, 2) + "\n", "utf8");
console.log(`\n${tous.length} rencontre(s) ecrites dans ${SORTIE}`);
