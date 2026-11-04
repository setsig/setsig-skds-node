import { HttpClient } from "./http.js";
import { TokensResource } from "./resources/tokens.js";
import { SessionsResource } from "./resources/sessions.js";
import { VenuesResource } from "./resources/venues.js";
import { BillingResource } from "./resources/billing.js";
import { WebhooksResource } from "./resources/webhooks.js";
import type { SetsigClientOptions } from "./types.js";

export class SetsigClient {
  public readonly tokens: TokensResource;
  public readonly sessions: SessionsResource;
  public readonly venues: VenuesResource;
  public readonly billing: BillingResource;
  public readonly webhooks: WebhooksResource;

  private readonly http: HttpClient;

  constructor(options: SetsigClientOptions) {
    if (!options.apiKey) {
      throw new Error("Missing required 'apiKey' in SetsigClient configuration");
    }

    const baseURL = options.baseURL || "https://api.setsig.com";
    const timeoutMs = options.timeoutMs ?? 15000;
    const maxRetries = options.maxRetries ?? 3;

    this.http = new HttpClient({
      apiKey: options.apiKey,
      baseURL,
      timeoutMs,
      maxRetries,
    });

    this.tokens = new TokensResource(this.http);
    this.sessions = new SessionsResource(this.http);
    this.venues = new VenuesResource(this.http);
    this.billing = new BillingResource(this.http);
    this.webhooks = new WebhooksResource(options.secretKey);
  }
}

// Re-export types, crypto utilities, and domain errors
export * from "./types.js";
export * from "./errors.js";
export { verifyWebhookSignature } from "./crypto.js";
export default SetsigClient;

