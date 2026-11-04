export class TokensResource {
    http;
    constructor(http) {
        this.http = http;
    }
    /**
     * Generates a new dynamic TOTP presence token and QR payload for display on a venue kiosk.
     */
    async generate(input) {
        const payload = {
            venue_id: input.venueId,
            ttl_seconds: input.ttlSeconds ?? 60,
            host_telemetry: input.hostTelemetry,
            bind_to_client_token: input.bindToClientToken,
        };
        const res = await this.http.request("POST", "/v1/tokens/generate", payload);
        return {
            tokenId: res.token_id,
            qrPayload: res.qr_payload,
            expiresAt: res.expires_at,
            ttlRemaining: res.ttl_remaining,
        };
    }
}
//# sourceMappingURL=tokens.js.map