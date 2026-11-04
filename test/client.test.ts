import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { SetsigClient, verifyWebhookSignature, InvalidSignatureError, AuthenticationError } from "../dist/index.js";

describe("@setsig/node SDK", () => {
  const secretKey = "test_whsec_secret_key_32bytes_long";

  test("instantiates client with all resources", () => {
    const client = new SetsigClient({
      apiKey: "pk_test_12345",
      secretKey,
      baseURL: "http://localhost:8080",
    });

    assert.ok(client.tokens, "tokens resource defined");
    assert.ok(client.sessions, "sessions resource defined");
    assert.ok(client.venues, "venues resource defined");
    assert.ok(client.billing, "billing resource defined");
    assert.ok(client.webhooks, "webhooks resource defined");
  });

  test("throws when missing apiKey", () => {
    assert.throws(() => {
      // @ts-expect-error test invalid param
      new SetsigClient({});
    }, /Missing required 'apiKey'/);
  });

  describe("Webhook signature verification", () => {
    const payload = JSON.stringify({
      event: "session.verified",
      timestamp: "2026-11-04T10:00:00Z",
      tenant_id: "ten_test",
      data: {
        session_id: "sess_123",
        client_token: "tkt_456",
        user_ref: "usr_789",
        venue_id: "ven_999",
        proof_signature: "sig_abc",
      },
    });

    test("successfully verifies valid HMAC signature", () => {
      const now = Math.floor(Date.now() / 1000);
      const signature = createHmac("sha256", secretKey).update(payload).digest("hex");
      const header = `t=${now},v1=${signature}`;

      const isValid = verifyWebhookSignature(payload, header, secretKey);
      assert.equal(isValid, true);
    });

    test("rejects invalid signature with false", () => {
      const now = Math.floor(Date.now() / 1000);
      const invalidSig = "0000000000000000000000000000000000000000000000000000000000000000";
      const header = `t=${now},v1=${invalidSig}`;

      const isValid = verifyWebhookSignature(payload, header, secretKey);
      assert.equal(isValid, false);
    });

    test("throws on expired timestamp outside tolerance", () => {
      const expiredTimestamp = Math.floor(Date.now() / 1000) - 400; // 400s > 300s
      const signature = createHmac("sha256", secretKey).update(payload).digest("hex");
      const header = `t=${expiredTimestamp},v1=${signature}`;

      assert.throws(() => {
        verifyWebhookSignature(payload, header, secretKey, 300);
      }, InvalidSignatureError);
    });

    test("constructEvent parses payload when signature is valid", () => {
      const client = new SetsigClient({
        apiKey: "pk_test_123",
        secretKey,
      });

      const now = Math.floor(Date.now() / 1000);
      const signature = createHmac("sha256", secretKey).update(payload).digest("hex");
      const header = `t=${now},v1=${signature}`;

      const event = client.webhooks.constructEvent(payload, header);
      assert.equal(event.event, "session.verified");
      assert.equal(event.data.sessionId, undefined); // raw is session_id in payload
    });
  });

  describe("Error Hierarchy", () => {
    test("instantiates AuthenticationError with status 401", () => {
      const err = new AuthenticationError("Token expired");
      assert.equal(err.name, "AuthenticationError");
      assert.equal(err.statusCode, 401);
      assert.equal(err.code, "ERR_UNAUTHORIZED");
    });
  });
});
