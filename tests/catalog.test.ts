import { test } from "node:test";
import assert from "node:assert/strict";
import { filterGyms } from "../apps/web/src/lib/catalog";
import { gyms, plans } from "../apps/web/src/lib/demo";
test("combina distrito, categoría, precio, equipamiento y servicios", () => {
  const result = filterGyms(gyms, {
    district: "Miraflores",
    category: "Musculación",
    equipment: "Pesas libres",
    service: "Duchas",
    maxPrice: "25",
  });
  assert.deepEqual(
    result.map((g) => g.slug),
    ["concreto-club"],
  );
});
test("búsqueda ignora mayúsculas, tildes y espacios externos", () => {
  assert.deepEqual(
    filterGyms(gyms, { query: "  maquinas " }).map((g) => g.slug),
    ["concreto-club", "norte-fuerza"],
  );
});
test("filtros incompatibles producen estado vacío", () => {
  assert.equal(
    filterGyms(gyms, { district: "Barranco", maxPrice: "20" }).length,
    0,
  );
});
test("ordenar por precio no modifica el catálogo original", () => {
  const before = gyms.map((g) => g.id);
  assert.deepEqual(
    filterGyms(gyms, { sort: "price" }).map((g) => g.price),
    [20, 25, 30, 35],
  );
  assert.deepEqual(
    gyms.map((g) => g.id),
    before,
  );
});
test("todos los ejemplos están rotulados y los identificadores son únicos", () => {
  assert.ok(gyms.every((g) => g.demo));
  assert.ok(plans.every((p) => p.demo && p.visits > 0 && p.days > 0));
  assert.equal(new Set(gyms.map((g) => g.slug)).size, gyms.length);
});
