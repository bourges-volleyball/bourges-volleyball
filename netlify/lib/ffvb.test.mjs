import { test } from "node:test";
import assert from "node:assert/strict";
import { extraire, classement, aRepublier, url } from "./ffvb.mjs";

const ligne = (...c) => `<tr>${c.map((x) => `<td>${x}</td>`).join("")}</tr>`;
// Une page Calendrier reduite : le classement en tete, puis les rencontres
const page = (score = ["3", "1"]) =>
  "<table>" +
  ligne("1.", "BOURGES VOLLEY-BALL", "5", "2", "2", "0") +
  ligne("2.", "TOURS VOLLEY-BALL", "3", "2", "1", "1") +
  "</table><table>" +
  ligne("PNMA001", "03/10/26", "20:00", "BOURGES VOLLEY-BALL", "", "TOURS VOLLEY-BALL", ...score, "25:20, 23:25, 25:18, 25:22") +
  ligne("PNMA002", "10/10/26", "20:00", "BOURGES VOLLEY-BALL", "", "xxxxx", "", "", "") +
  ligne("PNMA003", "14/11/26", "18:00", "TOURS VOLLEY-BALL", "", "BOURGES VOLLEY-BALL", "", "GYMNASE GRENON", "") +
  "</table>";
const poule = { equipe: "Seniors masculins", competition: "Prénationale masculine", saison: "2026/2027", codent: "LICE", poule: "PNM" };

test("extraire : match joue, journee exempte ecartee, match a venir", () => {
  const m = extraire(page(), poule);
  assert.equal(m.length, 2);
  assert.deepEqual(
    { ...m[0], date: undefined },
    { id: "PNMA001", equipe: "Seniors masculins", competition: "Prénationale masculine", date: undefined, domicile: true,
      adversaire: "TOURS VOLLEY-BALL", lieu: null, scoreNous: 3, scoreEux: 1, sets: "25:20, 23:25, 25:18, 25:22", forfait: undefined },
  );
  assert.equal(m[0].date, "2026-10-03T18:00:00.000Z"); // 20h a Paris, heure d'ete
  assert.equal(m[1].lieu, "GYMNASE GRENON");
  assert.equal(m[1].domicile, false);
  assert.equal(m[1].scoreNous, undefined);
});

test("classement : les lignes « rang. equipe points... »", () => {
  const c = classement(page());
  assert.deepEqual(c.map((l) => [l.rang, l.nous]), [[1, true], [2, false]]);
});

/* aRepublier lit /ffvb.json sur le site puis la FFVolley : on remplace fetch */
function simuler(enLigne, pageFFVB) {
  const avant = globalThis.fetch;
  globalThis.fetch = async (u) => {
    if (String(u).endsWith("/ffvb.json")) return Response.json(enLigne);
    if (String(u) === url(poule) && pageFFVB) return new Response(new TextEncoder().encode(pageFFVB));
    return new Response("", { status: 503 });
  };
  return () => (globalThis.fetch = avant);
}
// Ce que la construction du site aurait publie : le meme JSON que scripts/ffvb.mjs
const publie = (html) => JSON.parse(JSON.stringify({ poules: [poule], matchs: extraire(html, poule), classements: { [poule.equipe]: classement(html) } }));

test("aRepublier : rien de neuf, pas de publication", async () => {
  const retablir = simuler(publie(page()), page());
  try { assert.equal(await aRepublier("https://exemple.fr"), null); } finally { retablir(); }
});

test("aRepublier : un score change, on republie", async () => {
  const retablir = simuler(publie(page(["", "GYMNASE LEO LAGRANGE"])), page());
  try { assert.match(await aRepublier("https://exemple.fr"), /Seniors masculins/); } finally { retablir(); }
});

test("aRepublier : FFVolley injoignable, on attend la semaine suivante", async () => {
  const retablir = simuler(publie(page()), null);
  try { assert.equal(await aRepublier("https://exemple.fr"), null); } finally { retablir(); }
});

test("aRepublier : site injoignable, on republie dans le doute", async () => {
  const avant = globalThis.fetch;
  globalThis.fetch = async () => new Response("", { status: 404 });
  try { assert.match(await aRepublier("https://exemple.fr"), /illisibles/); } finally { globalThis.fetch = avant; }
});
