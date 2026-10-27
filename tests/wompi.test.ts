import { test } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { integritySignature, verifyEventChecksum, type WompiEvent } from "../src/lib/wompi.ts";

test("firma de integridad = SHA256(ref + centavos + moneda + secreto) — vector de la documentación de Wompi", () => {
  const sig = integritySignature("sk8-438k4-xmxm392-sn2m", 2490000, "COP", "prod_integrity_Z5mMke9x0k8gpErbDqwrJXMqsI6SFli6");
  assert.equal(sig, "37c8407747e595535433ef8f6a811d853cd943046624a0ec04662b17bbf33bf5");
});

function signedEvent(secret: string): WompiEvent {
  const tx = { id: "1234-1610641025-49201", status: "APPROVED" as const, reference: "ISZ-1", amount_in_cents: 3000000, currency: "COP" };
  const timestamp = 1530291411;
  const checksum = crypto.createHash("sha256").update(`${tx.id}${tx.status}${tx.amount_in_cents}${timestamp}${secret}`).digest("hex");
  return {
    event: "transaction.updated",
    data: { transaction: tx },
    signature: { properties: ["transaction.id", "transaction.status", "transaction.amount_in_cents"], checksum },
    timestamp,
  };
}

test("webhook: checksum válido", () => {
  assert.equal(verifyEventChecksum(signedEvent("evt_secret"), "evt_secret"), true);
});

test("webhook: rechaza secreto incorrecto o evento alterado", () => {
  assert.equal(verifyEventChecksum(signedEvent("evt_secret"), "otro"), false);
  const e = signedEvent("evt_secret");
  e.data.transaction.amount_in_cents = 100;
  assert.equal(verifyEventChecksum(e, "evt_secret"), false);
});
