import { randomUUID } from "node:crypto";
import { SetsigError, AuthenticationError, InsufficientCreditsError, PaywallBlockedError, CrossBorderCreditRequiredError, PaywallTierRequiredError, AttestationFailedError, VisualProofRequiredError, StaleVisualProofError, InvalidImageHashError, RateLimitError, ReplayAttackError, GeofenceOutOfBoundsError, } from "./errors.js";
export class HttpClient {
    apiKey;
    baseURL;
    timeoutMs;
    maxRetries;
    constructor(options) {
        this.apiKey = options.apiKey;
        this.baseURL = options.baseURL.replace(/\/+$/, "");
        this.timeoutMs = options.timeoutMs;
        this.maxRetries = options.maxRetries;
    }
    async request(method, path, body, customHeaders) {
        const url = `${this.baseURL}${path.startsWith("/") ? path : `/${path}`}`;
        let attempt = 0;
        const headers = {
            "Authorization": `Bearer ${this.apiKey}`,
            "Accept": "application/json",
            "User-Agent": "setsig-node-sdk/1.0.0",
            ...customHeaders,
        };
        if (body !== undefined) {
            headers["Content-Type"] = "application/json";
            if (method === "POST" || method === "PATCH") {
                headers["Idempotency-Key"] = randomUUID();
            }
        }
        while (attempt <= this.maxRetries) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);
                const response = await fetch(url, {
                    method,
                    headers,
                    body: body !== undefined ? JSON.stringify(body) : null,
                    signal: controller.signal,
                });
                clearTimeout(timeoutId);
                if (response.ok) {
                    const contentType = response.headers.get("content-type");
                    if (contentType && contentType.includes("application/json")) {
                        return (await response.json());
                    }
                    return {};
                }
                // Handle error responses
                const errorData = (await response.json().catch(() => ({})));
                const message = errorData.message || `HTTP ${response.status} ${response.statusText}`;
                const code = errorData.error_code || "ERR_API_ERROR";
                if (code === "ERR_PAYWALL_BLOCKED") {
                    throw new PaywallBlockedError(message, errorData.details);
                }
                if (code === "ERR_CROSS_BORDER_CREDIT_REQUIRED") {
                    throw new CrossBorderCreditRequiredError(message, errorData.details);
                }
                if (code === "ERR_PAYWALL_TIER_REQUIRED") {
                    throw new PaywallTierRequiredError(message, errorData.details);
                }
                if (code === "ERR_ATTESTATION_FAILED") {
                    throw new AttestationFailedError(message, errorData.details);
                }
                if (code === "ERR_VISUAL_PROOF_REQUIRED") {
                    throw new VisualProofRequiredError(message, errorData.details);
                }
                if (code === "ERR_STALE_VISUAL_PROOF") {
                    throw new StaleVisualProofError(message, errorData.details);
                }
                if (code === "ERR_INVALID_IMAGE_HASH") {
                    throw new InvalidImageHashError(message, errorData.details);
                }
                switch (response.status) {
                    case 401:
                        throw new AuthenticationError(message, errorData.details);
                    case 402:
                        throw new InsufficientCreditsError(message, errorData.details);
                    case 409:
                        throw new ReplayAttackError(message, errorData.details);
                    case 429:
                        throw new RateLimitError(message, errorData.details);
                    default:
                        if (code === "ERR_GEOFENCE_OUT_OF_BOUNDS") {
                            throw new GeofenceOutOfBoundsError(message, errorData.details);
                        }
                        if (response.status >= 500 && attempt < this.maxRetries) {
                            attempt++;
                            await this.delay(attempt);
                            continue;
                        }
                        throw new SetsigError(message, code, response.status, errorData.details);
                }
            }
            catch (err) {
                if (err instanceof SetsigError) {
                    throw err;
                }
                if (attempt < this.maxRetries) {
                    attempt++;
                    await this.delay(attempt);
                    continue;
                }
                const message = err instanceof Error ? err.message : "Network request failed";
                throw new SetsigError(message, "ERR_NETWORK_ERROR", 0, err);
            }
        }
        throw new SetsigError("Request failed after maximum retries", "ERR_MAX_RETRIES_EXCEEDED");
    }
    delay(attempt) {
        const baseDelay = 150;
        const exponential = baseDelay * Math.pow(2, attempt);
        const jitter = Math.random() * 100;
        return new Promise((resolve) => setTimeout(resolve, exponential + jitter));
    }
}
//# sourceMappingURL=http.js.map