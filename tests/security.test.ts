import { test } from "node:test";
import assert from "node:assert/strict";
import {
  hashPassword,
  verifyPassword,
  hashToken,
  makeToken,
  seal,
  unseal,
} from "../apps/api/src/security";
test("scrypt no guarda texto plano y las sales son distintas", async () => {
  const a = await hashPassword("A-test-password-2026!");
  const b = await hashPassword("A-test-password-2026!");
  assert.notEqual(a, b);
  assert.ok(await verifyPassword("A-test-password-2026!", a));
  assert.equal(await verifyPassword("incorrecta", a), false);
  assert.equal(await verifyPassword("p", "malformed"), false);
});
test("tokens tienen entropía y el hash no revela su valor", () => {
  const a = makeToken();
  assert.notEqual(a, makeToken());
  assert.equal(hashToken(a).length, 64);
  assert.notEqual(hashToken(a), a);
});
test("bandeja cifrada detecta manipulación y claves distintas", () => {
  const key = "a".repeat(64);
  const payload = seal("enlace-privado", key);
  assert.equal(unseal(payload, key), "enlace-privado");
  assert.throws(() => unseal(payload, "b".repeat(64)));
  assert.throws(() => unseal(payload + "a", key));
});
