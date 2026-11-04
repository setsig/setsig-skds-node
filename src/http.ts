import { randomUUID } from "node:crypto";
import {
  SetsigError,
  AuthenticationError,
  InsufficientCreditsError,
  RateLimitError,
  ReplayAttackError,
  GeofenceOutOfBoundsError,
} from "./errors.js";

export interface HttpClientOptions {
  apiKey: string;
  baseURL: string;
  timeoutMs: number;
  maxRetries: number;
}

export class HttpClient {
  private readonly apiKey: string;
  private readonly baseURL: string;
  private readonly timeoutMs: number;
  private readonly maxRetries: number;

  constructor(options: HttpClientOptions) {
    this.apiKey = options.apiKey;
    this.baseURL = options.baseURL.replace(/\/+$/, "");
    this.timeoutMs = options.timeoutMs;
    this.maxRetries = options.maxRetries;
  }

  public async request<T>(
    method: "GET" | "POST" | "PATCH" | "DELETE",
    path: string,
    body?: unknown,
    customHeaders?: Record<string, string>
  ): Promise<T> {
    const url = `${this.baseURL}${path.startsWith("/") ? path : `/${path}`}`;
    let attempt = 0;

    const headers: Record<string, string> = {
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
            return (await response.json()) as T;
          }
          return {} as T;
        }

        // Handle error responses
        const errorData = (await response.json().catch(() => ({}))) as {
          error_code?: string;
          message?: string;
          details?: unknown;
        };

        const message = errorData.message || `HTTP ${response.status} ${response.statusText}`;
        const code = errorData.error_code || "ERR_API_ERROR";

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
      } catch (err: unknown) {
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

  private delay(attempt: number): Promise<void> {
    const baseDelay = 150;
    const exponential = baseDelay * Math.pow(2, attempt);
    const jitter = Math.random() * 100;
    return new Promise((resolve) => setTimeout(resolve, exponential + jitter));
  }
}
