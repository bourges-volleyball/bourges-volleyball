import { getCollection } from "astro:content";
import ffvb from "../data/ffvb.json";

/* Toute la logique de tri et de filtrage vit ici, pour que l'accueil et les
   pages internes ne divergent jamais sur ce qu'est « un match a venir ». */

/** Libelles affiches des types d evenement. Le schema stocke des valeurs
 *  techniques en minuscules ; c est ici qu on les rend presentables. */
export const LIBELLE_TYPE: Record<string, string> = {
  match: "Match",
  tournoi: "Tournoi",
  "vie du club": "Vie du club",
  stage: "Stage",
  autre: "Événement",
};

export const FUSEAU = "Europe/Paris";

export async function equipes() {
  const liste = await getCollection("equipes");
  return liste.sort((a, b) => a.data.ordre - b.data.ordre);
}

/* Le site n'est reconstruit qu'une fois par semaine (netlify/functions/
   reconstruire.mjs) : entre deux, c'est le navigateur qui retire ce qui est
   passe, grace a l'attribut data-jusqua (script dans Base.astro).
   Un match quitte « a venir » deux heures apres son debut, un evenement le lendemain. */
export const finDuMatch = (d: Date) => new Date(d.getTime() + 2 * 3600000);

/** Un match est « joué » des lors qu'il porte un score. */
function estJoue(m: { data: { scoreNous?: number; scoreEux?: number } }) {
  return m.data.scoreNous !== undefined && m.data.scoreEux !== undefined;
}

/* Les rencontres FFVolley sont recuperees automatiquement (voir
   scripts/ffvb.mjs) et presentees comme celles saisies a la main. Les
   benevoles n ont donc a saisir que les matchs Ufolep et amicaux. */
function depuisFFVB() {
  return ffvb.matchs.map((m) => ({
    id: `ffvb-${m.id}`,
    data: {
      date: new Date(m.date),
      equipe: m.equipe,
      adversaire: m.adversaire,
      domicile: m.domicile,
      competition: m.competition,
      lieu: m.lieu ?? undefined,
      scoreNous: m.scoreNous ?? undefined,
      scoreEux: m.scoreEux ?? undefined,
      sets: undefined as string | undefined,
    },
  }));
}

export async function matchs() {
  const saisis = await getCollection("matchs");
  const tous = [...depuisFFVB(), ...saisis];
  const joues = tous
    .filter(estJoue)
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
  const aVenir = tous
    .filter((m) => !estJoue(m))
    .sort((a, b) => a.data.date.getTime() - b.data.date.getTime());
  return { joues, aVenir, prochain: aVenir[0] ?? null };
}

export async function actus(limite?: number) {
  const liste = (await getCollection("actus"))
    .filter((a) => !a.data.brouillon)
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
  return limite ? liste.slice(0, limite) : liste;
}

export async function diaporama() {
  return (await getCollection("diaporama")).sort((a, b) => a.data.ordre - b.data.ordre);
}

export async function partenaires() {
  const liste = await getCollection("partenaires");
  const par = (niveau: string) =>
    liste
      .filter((p) => p.data.niveau === niveau)
      .sort((a, b) => a.data.ordre - b.data.ordre);
  return {
    principal: par("principal"),
    officiel: par("officiel"),
    institutionnel: par("institutionnel"),
  };
}

/** « samedi 14 septembre » — sans l'année, qui alourdit sans informer. */
export function dateLongue(d: Date) {
  return d.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: FUSEAU,
  });
}

export function heure(d: Date) {
  return d
    .toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: FUSEAU })
    .replace(":", "h");
}

/** Victoire du point de vue du club : c'est ce qui declenche le vert lime. */
export function gagne(m: { data: { scoreNous?: number; scoreEux?: number } }) {
  const { scoreNous, scoreEux } = m.data;
  return scoreNous !== undefined && scoreEux !== undefined && scoreNous > scoreEux;
}

/* Boutique : les rayons, dans l'ordre de la page. */
export const RAYONS = [
  { id: "equipement", titre: "Équipements", action: "Commander" },
  { id: "adhesion", titre: "Adhésions", action: "Adhérer" },
  { id: "stage", titre: "Stages", action: "S’inscrire" },
  { id: "tournoi", titre: "Tournois", action: "S’inscrire" },
  { id: "buvette", titre: "Buvette", action: "Commander" },
] as const;

/* Une vente est ouverte jusqu'au soir de sa date de fermeture ; sans date,
   elle reste ouverte. Meme regle que ouverte() dans netlify/lib/boutique.mjs,
   qui refuse les commandes : les deux doivent rester d'accord. */
export function venteOuverte(d: { ouvertureLe?: Date; fermetureLe?: Date }, maintenant = Date.now()) {
  return (
    (!d.ouvertureLe || d.ouvertureLe.getTime() <= maintenant) &&
    (!d.fermetureLe || d.fermetureLe.getTime() + 86400000 > maintenant)
  );
}

export async function boutique() {
  const tous = (await getCollection("boutique")).sort((a, b) => a.data.ordre - b.data.ordre);
  const maintenant = Date.now();
  return {
    ouverts: tous.filter((c) => venteOuverte(c.data, maintenant)),
    aVenir: tous.filter((c) => c.data.ouvertureLe && c.data.ouvertureLe.getTime() > maintenant),
  };
}

/** 17.99 -> « 17,99 € » ; 13 -> « 13 € » */
export function euros(n: number) {
  return n.toLocaleString("fr-FR", { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 }) + " €";
}

/* Agenda : matchs a venir et evenements fusionnes, par ordre chronologique.
   Un visiteur veut savoir ce qui se passe au club, pas naviguer entre
   deux calendriers separes. */
export async function agenda(limite?: number) {
  const [{ aVenir }, evts] = await Promise.all([matchs(), getCollection("evenements")]);
  const maintenant = Date.now();

  const depuisMatchs = aVenir.map((m) => ({
    type: "match" as const,
    categorie: m.data.equipe,
    date: m.data.date,
    jusqua: finDuMatch(m.data.date),
    dateFin: undefined as Date | undefined,
    avecHeure: true,
    titre: m.data.domicile
      ? `Bourges VB — ${m.data.adversaire}`
      : `${m.data.adversaire} — Bourges VB`,
    detail: m.data.competition,
    lieu: m.data.lieu,
    /* Pas de lien par ligne : toutes les rencontres menaient a la meme page,
       ce qui donnait 44 liens identiques sur l'agenda. Le lien vers le
       calendrier est desormais dans l'en-tete de section. */
    lien: undefined as string | undefined,
  }));

  const depuisEvts = evts
    .filter((e) => (e.data.dateFin ?? e.data.date).getTime() >= maintenant)
    .map((e) => ({
      type: e.data.type,
      categorie: LIBELLE_TYPE[e.data.type] ?? "Événement",
      date: e.data.date,
      jusqua: new Date((e.data.dateFin ?? e.data.date).getTime() + 86400000),
      dateFin: e.data.dateFin,
      avecHeure: e.data.avecHeure,
      titre: e.data.titre,
      detail: e.data.description,
      lieu: e.data.lieu,
      lien: e.data.lien,
    }));

  const tout = [...depuisMatchs, ...depuisEvts].sort(
    (a, b) => a.date.getTime() - b.date.getTime(),
  );
  return limite ? tout.slice(0, limite) : tout;
}
