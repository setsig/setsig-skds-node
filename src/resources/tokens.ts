import type { HttpClient } from "../http.js";
import type { GenerateTokenInput, GenerateTokenResponse } from "../types.js";

export class TokensResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * Generates a new dynamic TOTP presence token and QR payload for display on a venue kiosk.
   */
  public async generate(input: GenerateTokenInput): Promise<GenerateTokenResponse> {
    const payload = {
      venue_id: input.venueId,
      ttl_seconds: input.ttlSeconds ?? 60,
      host_telemetry: input.hostTelemetry,
      bind_to_client_token: input.bindToClientToken,
    };

    const res = await this.http.request<{
      token_id: string;
      qr_payload: string;
      expires_at: number;
      ttl_remaining: number;
    }>("POST", "/v1/tokens/generate", payload);

    return {
      tokenId: res.token_id,
      qrPayload: res.qr_payload,
      expiresAt: res.expires_at,
      ttlRemaining: res.ttl_remaining,
    };
  }
}

