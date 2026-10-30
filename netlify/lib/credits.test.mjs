import { test } from "node:test";
import assert from "node:assert/strict";
import { debutCycle, bilan, reglagesValides } from "./credits.mjs";

const le = (iso) => new Date(iso);

test("debutCycle : le jour du mois, ou celui du mois precedent s'il n'est pas encore venu", () => {
  assert.equal(debutCycle(14, le("2026-10-30T08:00:00Z")).toISOString(), "2026-10-14T00:00:00.000Z");
  assert.equal(debutCycle(14, le("2026-11-03T08:00:00Z")).toISOString(), "2026-10-14T00:00:00.000Z");
  assert.equal(debutCycle(14, le("2026-01-05T08:00:00Z")).toISOString(), "2025-12-14T00:00:00.000Z");
  // Un 31 en fevrier devient le dernier jour du mois
  assert.equal(debutCycle(31, le("2027-03-01T08:00:00Z")).toISOString(), "2027-02-28T00:00:00.000Z");
});

test("bilan : 15 credits par mise en ligne du cycle, celles d'avant ne comptent pas", () => {
  const dates = ["2026-10-10T10:00:00Z", "2026-10-15T10:00:00Z", "2026-10-20T10:00:00Z"];
  const b = bilan(dates, { jour: 14, reserve: 60 }, le("2026-10-30T08:00:00Z"));
  assert.equal(b.publications, 2);
  assert.equal(b.utilises, 30);
  assert.equal(b.restantes, 14); // (300 - 60 - 30) / 15
  assert.equal(b.permis, true);
  assert.equal(b.remiseLe, "2026-11-14T00:00:00.000Z");
});

test("bilan : bloque quand la prochaine mise en ligne entamerait la reserve", () => {
  const dates = Array.from({ length: 16 }, (_, i) => `2026-10-${String(14 + i).padStart(2, "0")}T10:00:00Z`);
  const b = bilan(dates, { jour: 14, reserve: 60 }, le("2026-10-30T20:00:00Z"));
  assert.equal(b.utilises, 240);
  assert.equal(b.restantes, 0);
  assert.equal(b.permis, false);
  // Le mois suivant, tout repart de zero
  assert.equal(bilan(dates, { jour: 14, reserve: 60 }, le("2026-11-14T01:00:00Z")).permis, true);
});

test("bilan : un releve du tableau de bord remplace le compte d'avant, visites comprises", () => {
  const dates = ["2026-10-15T10:00:00Z", "2026-10-20T10:00:00Z", "2026-10-25T10:00:00Z"];
  const releve = { credits: 180, le: "2026-10-22T12:00:00Z" };
  const b = bilan(dates, { jour: 14, reserve: 60, releve }, le("2026-10-30T08:00:00Z"));
  assert.equal(b.utilises, 195); // 180 au releve, puis une mise en ligne
  assert.equal(b.restantes, 3);
  // Un releve du cycle precedent est oublie
  const ancien = { credits: 290, le: "2026-10-01T12:00:00Z" };
  assert.equal(bilan(dates, { jour: 14, reserve: 60, releve: ancien }, le("2026-10-30T08:00:00Z")).utilises, 45);
});

test("reglagesValides : bornes, et releve date du moment de la saisie", () => {
  assert.equal(reglagesValides({ jour: 0, reserve: 60 }), null);
  assert.equal(reglagesValides({ jour: 14, reserve: 290 }), null);
  assert.equal(reglagesValides({ jour: 14, reserve: "60" }), null);
  const avant = { jour: 14, reserve: 60, releve: { credits: 100, le: "2026-10-20T00:00:00Z" } };
  assert.deepEqual(reglagesValides({ jour: 14, reserve: 90 }, avant).releve, avant.releve);
  const r = reglagesValides({ jour: 14, reserve: 90, releve: 120 }, avant, le("2026-10-30T08:00:00Z"));
  assert.deepEqual(r, { jour: 14, reserve: 90, releve: { credits: 120, le: "2026-10-30T08:00:00.000Z" } });
});
