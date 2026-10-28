// Verification du calcul des commandes : npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { verifier, ouverte } from "./boutique.mjs";

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

test("ouverte jusqu'au soir de la date de fermeture", () => {
  const c = { ouvertureLe: "2026-10-01T00:00:00.000Z", fermetureLe: "2026-12-03T00:00:00.000Z" };
  assert.ok(ouverte(c, Date.parse("2026-12-03T20:00:00Z")));
  assert.ok(!ouverte(c, Date.parse("2026-12-04T01:00:00Z")));
  assert.ok(!ouverte(c, Date.parse("2026-09-30T12:00:00Z")));
  assert.ok(ouverte({}, Date.now()));
  assert.match(verifier({ ...stage, fermetureLe: "2020-01-01" }, { payeur, lignes: [] }).erreur, /fermée/);
});
