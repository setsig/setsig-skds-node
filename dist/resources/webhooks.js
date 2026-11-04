import { verifyWebhookSignature } from "../crypto.js";
import { InvalidSignatureError } from "../errors.js";
export class WebhooksResource {
    defaultSecretKey;
    constructor(defaultSecretKey) {
        this.defaultSecretKey = defaultSecretKey;
    }
    /**
     * Verifies timing-safe HMAC signature from the X-Setsig-Signature header.
     */
    verifySignature(rawBody, signatureHeader, secretKey, toleranceSeconds = 300) {
        const key = secretKey || this.defaultSecretKey;
        if (!key) {
            throw new InvalidSignatureError("No webhook secret key provided");
        }
        return verifyWebhookSignature(rawBody, signatureHeader, key, toleranceSeconds);
    }
    /**
     * Validates signature and parses the verified webhook event payload.
     */
    constructEvent(rawBody, signatureHeader, secretKey) {
        const isValid = this.verifySignature(rawBody, signatureHeader, secretKey);
        if (!isValid) {
            throw new InvalidSignatureError("Webhook signature validation failed");
        }
        const jsonString = Buffer.isBuffer(rawBody)
            ? rawBody.toString("utf-8")
            : rawBody;
        try {
            return JSON.parse(jsonString);
        }
        catch (err) {
            throw new InvalidSignatureError("Failed to parse webhook JSON payload", err);
        }
    }
    /**
     * Helper middleware for Express / Connect web servers.
     */
    expressMiddleware(options) {
        return async (req, res, next) => {
            const signatureHeader = req.headers["x-setsig-signature"];
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
            }
            catch (err) {
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
//# sourceMappingURL=webhooks.js.map