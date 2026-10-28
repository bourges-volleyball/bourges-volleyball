// Verification du calcul des commandes : npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { verifier, ouverte, alerter } from "./boutique.mjs";

const stage = {
  id: "stage",
  nominatif: true,
  questions: [{ libelle: "Droit à l'image", type: "ouinon" }],
  articles: [
    { nom: "1 jour", prix: 13, places: 2 },
    { nom: "Repas", prix: 5.5 },
    { nom: "T-shirt", prix: 17.99, tailles: ["S", "M"] },
  ],
};
const payeur = { prenom: "Alex", nom: "Martin", email: "alex@exemple.fr" };
const jeune = { participant: "Sam Martin", reponses: { "Droit à l'image": "Oui" }, taille: "M" };

test("le montant vient du catalogue, en centimes", () => {
  const r = verifier(stage, {
    payeur,
    lignes: [
      { article: "1 jour", quantite: 2, details: [jeune, jeune], prix: 0.01 },
      { article: "Repas", quantite: 1, details: [jeune] },
      { article: "T-shirt", quantite: 1, details: [jeune] },
    ],
  });
  assert.equal(r.erreur, undefined);
  assert.equal(r.total, 2600 + 550 + 1799);
});

test("refus : places, taille, nom, question, quantite, doublon", () => {
  const ligne = (l) => verifier(stage, { payeur, lignes: [l] }, { "1 jour": 1 }).erreur;
  assert.match(ligne({ article: "1 jour", quantite: 2, details: [jeune, jeune] }), /reste que 1/);
  assert.match(ligne({ article: "T-shirt", quantite: 1, details: [{ ...jeune, taille: "XXL" }] }), /taille/);
  assert.match(ligne({ article: "Repas", quantite: 1, details: [{ ...jeune, participant: " " }] }), /nom et le prénom/);
  assert.match(ligne({ article: "Repas", quantite: 1, details: [{ participant: "Sam" }] }), /Droit à l'image/);
  assert.match(ligne({ article: "Repas", quantite: 0.5 }), /Quantité/);
  assert.match(ligne({ article: "Inconnu", quantite: 1 }), /inconnu/);
  const doublon = { article: "Repas", quantite: 1, details: [jeune] };
  assert.match(verifier(stage, { payeur, lignes: [doublon, doublon] }).erreur, /inconnu/);
  assert.match(verifier(stage, { payeur: { ...payeur, email: "x" }, lignes: [doublon] }).erreur, /mail/);
  assert.match(verifier(stage, { payeur, lignes: [] }).erreur, /vide/);
});

test("stage : jours coches, options par jour, sortie liee a un jour", () => {
  const semaine = ["2099-10-26", "2099-10-27", "2099-10-28", "2099-10-29", "2099-10-30"];
  const journees = {
    ...stage,
    articles: [{
      nom: "Stage",
      prix: 13,
      places: 24,
      jours: semaine,
      options: [{ nom: "Repas", prix: 5.5, parJour: true }, { nom: "Sortie", prix: 10, jour: "2099-10-28", offerteDes: 5 }],
    }],
  };
  // Ordre et doublons du navigateur ignores : on garde l'ordre du calendrier
  const sam = { ...jeune, jours: ["2099-10-28", "2099-10-26", "2099-10-28"], options: ["Repas", "Sortie"] };
  const lou = { ...jeune, participant: "Lou Martin", jours: semaine, options: ["Sortie"] };
  const r = verifier(journees, { payeur, lignes: [{ article: "Stage", quantite: 2, details: [sam, lou] }] });
  assert.equal(r.erreur, undefined);
  // Sortie payee a 2 jours, offerte a 5 jours
  assert.equal(r.total, 2 * 1300 + 2 * 550 + 1000 + 5 * 1300);
  assert.deepEqual(r.lignes[0].details[0].jours, ["2099-10-26", "2099-10-28"]);
  assert.deepEqual(r.lignes[0].details.map((d) => d.montant), [4700, 6500]);

  const un = (d, restantes) => verifier(journees, { payeur, lignes: [{ article: "Stage", quantite: 1, details: [d] }] }, restantes).erreur;
  for (const jours of [[], undefined, ["2099-11-02"]]) assert.match(un({ ...jeune, jours }), /au moins un jour/);
  assert.match(un({ ...jeune, jours: ["2099-10-26"], options: ["Sortie"] }), /cochez ce jour/);
  assert.match(un({ ...jeune, jours: ["2099-10-26"], options: ["Piscine"] }), /Option inconnue/);
  assert.match(un({ ...jeune, jours: ["2099-10-27"] }, { "Stage / 2099-10-27": 0 }), /complet/);
  assert.equal(un({ ...jeune, jours: ["2099-10-26"] }, { "Stage / 2099-10-27": 0 }), undefined);
  // Pas de fermeture jour par jour : seule la date de fermeture de la vente compte
  const passe = { ...journees, articles: [{ ...journees.articles[0], jours: ["2020-01-06"] }] };
  assert.equal(verifier(passe, { payeur, lignes: [{ article: "Stage", quantite: 1, details: [{ ...jeune, jours: ["2020-01-06"] }] }] }).erreur, undefined);
});

test("ouverte jusqu'au soir de la date de fermeture", () => {
  const c = { ouvertureLe: "2026-10-01T00:00:00.000Z", fermetureLe: "2026-12-03T00:00:00.000Z" };
  assert.ok(ouverte(c, Date.parse("2026-12-03T20:00:00Z")));
  assert.ok(!ouverte(c, Date.parse("2026-12-04T01:00:00Z")));
  assert.ok(!ouverte(c, Date.parse("2026-09-30T12:00:00Z")));
  assert.ok(ouverte({}, Date.now()));
  assert.match(verifier({ ...stage, fermetureLe: "2020-01-01" }, { payeur, lignes: [] }).erreur, /fermée/);
});

test("alerte au club : seulement si activee, sans nom ni adresse", async () => {
  const envois = [];
  const avant = globalThis.fetch;
  globalThis.fetch = async (url, o) => (envois.push({ url: String(url), corps: new URLSearchParams(o.body) }), { ok: true });
  const c = {
    id: "e9c0d1e2-0000-4000-8000-000000000000",
    campagneNom: "Stage",
    total: 6000,
    payeur,
    lignes: [{ article: "Stage, à la journée", quantite: 2, details: [] }],
  };
  try {
    delete process.env.ALERTE_COMMANDES;
    await alerter(c, "https://exemple.fr");
    assert.equal(envois.length, 0);
    process.env.ALERTE_COMMANDES = "oui";
    await alerter(c, "https://exemple.fr");
    assert.equal(envois[0].url, "https://exemple.fr/");
    const corps = Object.fromEntries(envois[0].corps);
    assert.equal(corps["form-name"], "commande-payee");
    assert.equal(corps.montant, "60,00 €");
    assert.equal(corps.commande, "E9C0D1E2");
    assert.equal(corps.articles, "2 × Stage, à la journée");
    assert.ok(!JSON.stringify(corps).includes("alex@exemple.fr"));
  } finally {
    globalThis.fetch = avant;
    delete process.env.ALERTE_COMMANDES;
  }
});
