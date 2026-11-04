import type { IncomingMessage, ServerResponse } from "node:http";
import type { WebhookEvent } from "../types.js";
export declare class WebhooksResource {
    private readonly defaultSecretKey?;
    constructor(defaultSecretKey?: string | undefined);
    /**
     * Verifies timing-safe HMAC signature from the X-Setsig-Signature header.
     */
    verifySignature(rawBody: string | Buffer, signatureHeader: string, secretKey?: string, toleranceSeconds?: number): boolean;
    /**
     * Validates signature and parses the verified webhook event payload.
     */
    constructEvent(rawBody: string | Buffer, signatureHeader: string, secretKey?: string): WebhookEvent;
    /**
     * Helper middleware for Express / Connect web servers.
     */
    expressMiddleware(options: {
        secretKey?: string;
        onEvent: (event: WebhookEvent) => void | Promise<void>;
    }): (req: IncomingMessage & {
        body?: unknown;
        rawBody?: Buffer | string;
    }, res: ServerResponse, next: (err?: unknown) => void) => Promise<void>;
}
//# sourceMappingURL=webhooks.d.ts.map