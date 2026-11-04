/**
 * Verifies the X-Setsig-Signature header against the raw payload and HMAC secret key.
 * Uses timingSafeEqual to prevent timing side-channel attacks.
 *
 * Header format: t={timestamp},v1={hex_signature}
 */
export declare function verifyWebhookSignature(rawPayload: string | Buffer, signatureHeader: string, secretKey: string, toleranceSeconds?: number): boolean;
//# sourceMappingURL=crypto.d.ts.map