/* Lecture du calendrier, des resultats et des classements FFVolley.
 *
 * La federation ne publie aucune API : on lit les pages HTML de
 * ffvbbeach.org. Partage entre scripts/ffvb.mjs, qui ecrit les donnees du
 * site avant chaque construction, et netlify/functions/reconstruire.mjs, qui
 * le lundi ne republie le site que si la FFVolley a change.
 */

export const NOUS = "BOURGES VOLLEY-BALL";

/* Les equipes suivies se reglent dans l'administration (Reglages > Matchs
   FFVolley). Chaque poule y est donnee par l'adresse de sa page Calendrier
   sur ffvbbeach.org : on en tire la saison, le code de ligue (codent) et le
   code de poule. Changer de saison, c'est donc coller les nouvelles adresses. */
export function poulesDepuis(reglages) {
  return reglages.flatMap((p) => {
    const u = new URL(p.adresse);
    const q = Object.fromEntries(["saison", "codent", "poule"].map((k) => [k, u.searchParams.get(k)]));
    if (!/(^|\.)ffvbbeach\.org$/.test(u.hostname) || !q.saison || !q.codent || !q.poule) {
      console.warn(`${p.equipe} : l'adresse ne donne pas saison, codent et poule, equipe ignoree`);
      return [];
    }
    return [{ equipe: p.equipe, competition: p.competition, ...q }];
  });
}

// L'adresse est reconstruite a partir des seuls codes : on n'interroge jamais
// un autre site que celui de la federation, quoi qu'on ait colle.
export const url = (p) =>
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

export function extraire(html, { equipe, competition }) {
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
export function classement(html) {
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

/** Toutes les poules, dans leur ordre (celui des onglets de la page Matchs).
 *  Une poule illisible ne bloque pas les autres : elle est listee dans echecs. */
export async function recuperer(poules) {
  const matchs = [];
  const classements = {};
  const echecs = [];
  for (const p of poules) {
    try {
      const html = await lirePage(url(p));
      const m = extraire(html, p);
      matchs.push(...m);
      classements[p.equipe] = classement(html);
      console.log(`${p.poule} (${p.equipe}) : ${m.length} rencontre(s)`);
    } catch (e) {
      echecs.push({ equipe: p.equipe, poule: p.poule, erreur: e.message });
      console.warn(`${p.poule} : echec de lecture (${e.message})`);
    }
  }
  matchs.sort((a, b) => a.date.localeCompare(b.date));
  return { matchs, classements, echecs };
}

/** Ce que le site montre d'une equipe : ses rencontres et son classement.
 *  Deux empreintes egales, c'est un site deja a jour pour cette equipe. */
export const empreinte = (d, equipe) =>
  JSON.stringify([d.matchs.filter((m) => m.equipe === equipe), d.classements?.[equipe] ?? []]);

/** La raison de republier, ou null si le site montre deja ce que publie la FFVolley. */
export async function aRepublier(site) {
  const r = await fetch(new URL("/ffvb.json", site));
  if (!r.ok) return `donnees en ligne illisibles (HTTP ${r.status})`;
  const enLigne = await r.json();
  const frais = await recuperer(enLigne.poules);
  // Une poule injoignable ce matin n'est pas un changement : on la compare la semaine prochaine
  const changees = enLigne.poules
    .filter((p) => !frais.echecs.some((e) => e.equipe === p.equipe))
    .filter((p) => empreinte(frais, p.equipe) !== empreinte(enLigne, p.equipe))
    .map((p) => p.equipe);
  return changees.length ? `du nouveau pour ${changees.join(", ")}` : null;
}
