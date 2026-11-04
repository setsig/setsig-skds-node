export class VenuesResource {
    http;
    constructor(http) {
        this.http = http;
    }
    /**
     * Lists physical venues and check-in checkpoints.
     */
    async list(params) {
        const query = new URLSearchParams();
        if (params?.status)
            query.set("status", params.status);
        if (params?.hardwareProfile)
            query.set("hardware_profile", params.hardwareProfile);
        const path = `/v1/venues${query.toString() ? `?${query.toString()}` : ""}`;
        const res = await this.http.request("GET", path);
        return res.data;
    }
    /**
     * Retrieves single venue details and active telemetry profile.
     */
    async get(id) {
        const res = await this.http.request("GET", `/v1/venues/${id}`);
        return res.data;
    }
    /**
     * Creates a new venue boundary with hardware profile and coordinates.
     */
    async create(data) {
        const payload = {
            name: data.name,
            external_reference: data.externalReference,
            coordinates: {
                latitude: data.coordinates.latitude,
                longitude: data.coordinates.longitude,
                radius_meters: data.coordinates.radiusMeters,
                altitude_meters: data.coordinates.altitudeMeters,
            },
            hardware_profile: data.hardwareProfile,
            hardware_config: data.hardwareConfig,
            settings: data.settings
                ? {
                    totp_interval_seconds: data.settings.totpIntervalSeconds,
                    allow_mock_locations: data.settings.allowMockLocations,
                }
                : undefined,
            require_visual_proof: data.requireVisualProof,
            visual_proof_prompt: data.visualProofPrompt,
            country_code: data.countryCode,
        };
        const res = await this.http.request("POST", "/v1/venues", payload);
        return res.data;
    }
    /**
     * Rotates venue's TOTP secret key, instantly invalidating cached kiosk seeds.
     */
    async rotateSecret(id) {
        const res = await this.http.request("POST", `/v1/venues/${id}/rotate-secret`);
        return {
            newSecretPreview: res.data.new_secret_preview,
        };
    }
    /**
     * Archives a venue (soft delete).
     */
    async archive(id) {
        await this.http.request("DELETE", `/v1/venues/${id}`);
    }
}
//# sourceMappingURL=venues.js.map