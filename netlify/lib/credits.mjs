/* Garde-fou des credits Netlify. L'offre gratuite donne 300 credits par mois ;
   une fois depasses, Netlify met le site en pause : il est injoignable
   jusqu'au mois suivant. Chaque mise en ligne en coute 15, les visites
   (bande passante, requetes) le reste.

   Netlify ne donne pas le solde aux sites. On compte donc nous-memes les mises
   en ligne reussies, que Netlify signale a netlify/functions/deploy-succeeded.mjs,
   et on garde de cote une reserve pour les visites. Quand la prochaine mise en
   ligne entamerait cette reserve, ni le bouton « Publier le site »
   (netlify/functions/publier.mjs) ni la mise a jour du lundi
   (netlify/functions/reconstruire.mjs) ne publient plus, jusqu'au debut du
   cycle suivant.

   Les reglages (jour du debut de cycle, reserve, releve du tableau de bord
   Netlify) se changent depuis la page /admin/publier.html : ils sont ranges ici,
   dans Netlify Blobs, et non dans le depot, pour rester modifiables quand
   les publications sont bloquees. */

import { getStore } from "@netlify/blobs";

export const PLAFOND = 300;
export const PAR_PUBLICATION = 15;
export const DEFAUT = { jour: 1, reserve: 60 };

export const store = () => getStore("credits");

const jourDansMois = (annee, mois, jour) =>
  new Date(Date.UTC(annee, mois, Math.min(jour, new Date(Date.UTC(annee, mois + 1, 0)).getUTCDate())));

/** Debut du cycle de facturation en cours : le `jour` du mois (ou le dernier
 *  jour d'un mois trop court), a minuit UTC. */
export function debutCycle(jour, maintenant = new Date()) {
  const a = maintenant.getUTCFullYear();
  const m = maintenant.getUTCMonth();
  const ce = jourDansMois(a, m, jour);
  return ce <= maintenant ? ce : jourDansMois(a, m - 1, jour);
}

/** Etat du mois. `dates` : les mises en ligne de production notees (ISO).
 *  `releve` : les credits lus sur le tableau de bord Netlify, a une date ; il
 *  remplace le compte des mises en ligne anterieures, et couvre aussi les
 *  visites deja faites. */
export function bilan(dates, reglages = {}, maintenant = new Date()) {
  const { jour, reserve, releve } = { ...DEFAUT, ...reglages };
  const debut = debutCycle(jour, maintenant);
  const fin = jourDansMois(debut.getUTCFullYear(), debut.getUTCMonth() + 1, jour);
  const ceMois = dates.map((d) => new Date(d)).filter((d) => d >= debut && d <= maintenant);
  const releveValable = releve && new Date(releve.le) >= debut ? releve : null;
  const apres = releveValable ? ceMois.filter((d) => d > new Date(releveValable.le)) : ceMois;
  const utilises = (releveValable?.credits ?? 0) + PAR_PUBLICATION * apres.length;
  const libres = PLAFOND - reserve - utilises;
  return {
    plafond: PLAFOND,
    parPublication: PAR_PUBLICATION,
    jour,
    reserve,
    releve: releveValable,
    publications: ceMois.length,
    utilises,
    restantes: Math.max(0, Math.floor(libres / PAR_PUBLICATION)),
    permis: libres >= PAR_PUBLICATION,
    debut: debut.toISOString(),
    remiseLe: fin.toISOString(),
  };
}

/** Reglages saisis sur /admin/publier.html, verifies (null s'ils sont
 *  invalides). Un nouveau releve est date du moment ou il est saisi ; sans
 *  releve, le precedent est garde. */
export function reglagesValides(r, precedents, maintenant = new Date()) {
  const entier = (v, min, max) => Number.isInteger(v) && v >= min && v <= max;
  if (!r || !entier(r.jour, 1, 31) || !entier(r.reserve, 0, PLAFOND - PAR_PUBLICATION)) return null;
  if (r.releve != null && !entier(r.releve, 0, 1000)) return null;
  const releve = r.releve != null ? { credits: r.releve, le: maintenant.toISOString() } : (precedents?.releve ?? null);
  return { jour: r.jour, reserve: r.reserve, releve };
}

/* Une mise en ligne par cle : deploy/<date ISO>/<identifiant Netlify> */
const DATE_CLE = /^deploy\/([^/]+)\//;

export async function etat(maintenant = new Date()) {
  const s = store();
  const [reglages, { blobs }] = await Promise.all([s.get("reglages", { type: "json" }), s.list({ prefix: "deploy/" })]);
  const dates = blobs.map((b) => b.key.match(DATE_CLE)?.[1]).filter(Boolean);
  // regle : le jour du cycle a ete donne, sinon il vaut 1 par defaut
  return { ...bilan(dates, reglages ?? {}, maintenant), regle: reglages != null };
}

export async function noterMiseEnLigne(deploiement, maintenant = new Date()) {
  const s = store();
  const le = deploiement.published_at ?? deploiement.publishedAt ?? maintenant.toISOString();
  await s.setJSON(`deploy/${new Date(le).toISOString()}/${deploiement.id}`, {
    titre: deploiement.title ?? null,
    branche: deploiement.branch ?? null,
  });
  // Rien ne sert au-dela de deux mois
  const { blobs } = await s.list({ prefix: "deploy/" });
  const limite = maintenant.getTime() - 62 * 86400000;
  await Promise.all(
    blobs.filter((b) => Date.parse(b.key.match(DATE_CLE)?.[1]) < limite).map((b) => s.delete(b.key)),
  );
}
