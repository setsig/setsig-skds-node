import { TokensResource } from "./resources/tokens.js";
import { SessionsResource } from "./resources/sessions.js";
import { VenuesResource } from "./resources/venues.js";
import { BillingResource } from "./resources/billing.js";
import { WebhooksResource } from "./resources/webhooks.js";
import type { SetsigClientOptions } from "./types.js";
export declare class SetsigClient {
    readonly tokens: TokensResource;
    readonly sessions: SessionsResource;
    readonly venues: VenuesResource;
    readonly billing: BillingResource;
    readonly webhooks: WebhooksResource;
    private readonly http;
    constructor(options: SetsigClientOptions);
}
export * from "./types.js";
export * from "./errors.js";
export { verifyWebhookSignature } from "./crypto.js";
export default SetsigClient;
//# sourceMappingURL=index.d.ts.map