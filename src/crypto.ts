import { createHmac, timingSafeEqual } from "node:crypto";
import { InvalidSignatureError } from "./errors.js";

/**
 * Verifies the X-Setsig-Signature header against the raw payload and HMAC secret key.
 * Uses timingSafeEqual to prevent timing side-channel attacks.
 *
 * Header format: t={timestamp},v1={hex_signature}
 */
export function verifyWebhookSignature(
  rawPayload: string | Buffer,
  signatureHeader: string,
  secretKey: string,
  toleranceSeconds = 300
): boolean {
  if (!signatureHeader || !secretKey) {
    throw new InvalidSignatureError("Missing signature header or secret key");
  }

  const parts = signatureHeader.split(",");
  let timestampStr: string | null = null;
  let signatureHex: string | null = null;

  for (const part of parts) {
    const [key, value] = part.trim().split("=");
    if (key === "t" && value) {
      timestampStr = value;
    } else if (key === "v1" && value) {
      signatureHex = value;
    }
  }

  // Fallback: raw hex signature if header format is pure hex
  if (!timestampStr && !signatureHex && parts.length === 1 && signatureHeader.length === 64) {
    signatureHex = signatureHeader;
  }

  if (!signatureHex) {
    throw new InvalidSignatureError("Signature format invalid (expected v1=...)");
  }

  // Timestamp freshness validation (if timestamp was included in header)
  if (timestampStr) {
    const timestamp = parseInt(timestampStr, 10);
    const now = Math.floor(Date.now() / 1000);
    if (isNaN(timestamp) || Math.abs(now - timestamp) > toleranceSeconds) {
      throw new InvalidSignatureError(`Webhook timestamp outside tolerance (${toleranceSeconds}s)`);
    }
  }

  const payloadBuffer = Buffer.isBuffer(rawPayload)
    ? rawPayload
    : Buffer.from(rawPayload, "utf-8");

  const computedHmac = createHmac("sha256", secretKey)
    .update(payloadBuffer)
    .digest("hex");

  const expectedBuffer = Buffer.from(signatureHex, "utf-8");
  const computedBuffer = Buffer.from(computedHmac, "utf-8");

  if (expectedBuffer.length !== computedBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, computedBuffer);
}

