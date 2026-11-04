import type { IncomingMessage, ServerResponse } from "node:http";
import { verifyWebhookSignature } from "../crypto.js";
import { InvalidSignatureError } from "../errors.js";
import type { WebhookEvent } from "../types.js";

export class WebhooksResource {
  constructor(private readonly defaultSecretKey?: string) {}

  /**
   * Verifies timing-safe HMAC signature from the X-Setsig-Signature header.
   */
  public verifySignature(
    rawBody: string | Buffer,
    signatureHeader: string,
    secretKey?: string,
    toleranceSeconds = 300
  ): boolean {
    const key = secretKey || this.defaultSecretKey;
    if (!key) {
      throw new InvalidSignatureError("No webhook secret key provided");
    }
    return verifyWebhookSignature(rawBody, signatureHeader, key, toleranceSeconds);
  }

  /**
   * Validates signature and parses the verified webhook event payload.
   */
  public constructEvent(
    rawBody: string | Buffer,
    signatureHeader: string,
    secretKey?: string
  ): WebhookEvent {
    const isValid = this.verifySignature(rawBody, signatureHeader, secretKey);
    if (!isValid) {
      throw new InvalidSignatureError("Webhook signature validation failed");
    }

    const jsonString = Buffer.isBuffer(rawBody)
      ? rawBody.toString("utf-8")
      : rawBody;

    try {
      return JSON.parse(jsonString) as WebhookEvent;
    } catch (err) {
      throw new InvalidSignatureError("Failed to parse webhook JSON payload", err);
    }
  }

  /**
   * Helper middleware for Express / Connect web servers.
   */
  public expressMiddleware(options: {
    secretKey?: string;
    onEvent: (event: WebhookEvent) => void | Promise<void>;
  }) {
    return async (
      req: IncomingMessage & { body?: unknown; rawBody?: Buffer | string },
      res: ServerResponse,
      next: (err?: unknown) => void
    ) => {
      const signatureHeader = req.headers["x-setsig-signature"] as string | undefined;

      if (!signatureHeader) {
        res.statusCode = 400;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: "Missing X-Setsig-Signature header" }));
        return;
      }

      const raw = req.rawBody || (typeof req.body === "string" ? req.body : JSON.stringify(req.body));
      if (!raw) {
        res.statusCode = 400;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: "Missing raw body payload for webhook verification" }));
        return;
      }

      try {
        const event = this.constructEvent(raw, signatureHeader, options.secretKey);
        await options.onEvent(event);
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ received: true }));
      } catch (err) {
        if (err instanceof InvalidSignatureError) {
          res.statusCode = 401;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: err.message }));
          return;
        }
        next(err);
      }
    };
  }
}

