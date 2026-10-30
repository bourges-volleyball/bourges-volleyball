/* /.netlify/functions/publier : le bouton « Publier le site » de
   l'administration (/admin/publier.html et la barre du haut de /admin/).

   Les benevoles enregistrent sur la branche « preparation »
   (public/admin/config.yml) : rien ne change en ligne. Publier verse d'un coup
   toutes ces modifications dans main, que Netlify met en ligne (15 credits),
   si le garde-fou des credits le permet (netlify/lib/credits.mjs).

   GET  : ce qui attend d'etre publie, et les credits du mois.
   POST : publie.
   PUT  : { jour, reserve, releve } reglages du garde-fou.

   GitHub est appele par Git Gateway, avec le jeton du benevole connecte :
   la fonction n'a besoin d'aucune cle. */

import { benevole } from "../lib/boutique.mjs";
import { etat, store, reglagesValides } from "../lib/credits.mjs";

const PREPARATION = "preparation";
const PRODUCTION = "main";

export default async (req) => {
  const qui = await benevole(req);
  if (!qui) return new Response("Connexion requise", { status: 401 });

  const github = (chemin, options = {}) =>
    fetch(`${new URL(req.url).origin}/.netlify/git/github${chemin}`, {
      ...options,
      headers: { authorization: req.headers.get("authorization"), "content-type": "application/json" },
      body: options.body && JSON.stringify(options.body),
    });

  if (req.method === "PUT") {
    const s = store();
    const reglages = reglagesValides(
      await req.json().catch(() => null),
      await s.get("reglages", { type: "json" }),
    );
    if (!reglages) return Response.json({ erreur: "Réglages invalides." }, { status: 400 });
    await s.setJSON("reglages", reglages);
    return Response.json(await etat());
  }

  const attente = await enAttente(github);
  if (attente.erreur) return Response.json(attente, { status: 502 });

  if (req.method !== "POST") return Response.json({ ...attente, credits: await etat().catch(() => null) });

  const credits = await etat().catch(() => null);
  if (!credits) return Response.json({ erreur: "Les crédits n'ont pas pu être vérifiés. Réessayez dans un instant." }, { status: 503 });
  if (!credits.permis) return Response.json({ erreur: "Plus assez de crédits Netlify ce mois-ci.", credits }, { status: 409 });
  if (!attente.modifications.length) return Response.json({ erreur: "Rien à publier." }, { status: 409 });

  const nom = qui.user_metadata?.full_name || qui.email;
  const n = attente.modifications.length;
  const fusion = await github("/merges", {
    method: "POST",
    body: { base: PRODUCTION, head: PREPARATION, commit_message: `Publication du site par ${nom} : ${n} modification${n > 1 ? "s" : ""}` },
  });
  if (fusion.status === 409)
    return Response.json({ erreur: "Conflit : une même fiche a changé des deux côtés. Demandez de l'aide (guide technique)." }, { status: 409 });
  if (!fusion.ok) return Response.json({ erreur: `GitHub a refusé la publication (${fusion.status}).` }, { status: 502 });

  // preparation rejoint main : la prochaine publication repartira de zero.
  // Si quelqu'un vient d'enregistrer, ce n'est plus une avance rapide : on
  // laisse faire, son enregistrement partira la fois suivante.
  if (fusion.status === 201) {
    const { sha } = await fusion.json();
    await github(`/git/refs/heads/${PREPARATION}`, { method: "PATCH", body: { sha, force: false } });
  }
  return Response.json({ ok: true, publiees: n });
};

/** Les enregistrements de preparation qui ne sont pas encore dans main. */
async function enAttente(github) {
  let comparaison = await github(`/compare/${PRODUCTION}...${PREPARATION}`);
  if (comparaison.status === 404) {
    // Premiere visite : la branche n'existe pas encore, on la cree depuis main
    const main = await github(`/git/refs/heads/${PRODUCTION}`);
    if (!main.ok) return { erreur: `GitHub injoignable (${main.status}).` };
    const { object } = await main.json();
    const creee = await github("/git/refs", { method: "POST", body: { ref: `refs/heads/${PREPARATION}`, sha: object.sha } });
    if (!creee.ok) return { erreur: `La branche ${PREPARATION} n'a pas pu être créée (${creee.status}).` };
    return { modifications: [], creee: true };
  }
  if (!comparaison.ok) return { erreur: `GitHub injoignable (${comparaison.status}).` };
  const c = await comparaison.json();

  // Rien en attente, mais main a avance (code du site, publication) :
  // preparation le rattrape, pour que l'administration montre le site a jour
  if (c.ahead_by === 0 && c.behind_by > 0)
    await github(`/git/refs/heads/${PREPARATION}`, { method: "PATCH", body: { sha: c.base_commit.sha, force: false } });

  // Un enregistrement = un commit de Decap (« Modification : une équipe
  // « m15-filles » », voir commit_messages dans config.yml). Plusieurs
  // enregistrements d'une meme fiche n'en font qu'une ligne, la plus recente.
  const parFiche = new Map();
  for (const k of c.commits ?? []) {
    if (k.parents.length > 1) continue;
    const titre = k.commit.message.split("\n")[0];
    parFiche.delete(titre);
    parFiche.set(titre, { titre, auteur: k.commit.author.name, le: k.commit.author.date });
  }
  return { modifications: [...parFiche.values()].reverse() };
}
