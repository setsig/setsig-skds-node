import type { HttpClient } from "../http.js";
import type { Venue, CreateVenueInput } from "../types.js";

export class VenuesResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * Lists physical venues and check-in checkpoints.
   */
  public async list(params?: { status?: string; hardwareProfile?: string }): Promise<Venue[]> {
    const query = new URLSearchParams();
    if (params?.status) query.set("status", params.status);
    if (params?.hardwareProfile) query.set("hardware_profile", params.hardwareProfile);

    const path = `/v1/venues${query.toString() ? `?${query.toString()}` : ""}`;
    const res = await this.http.request<{ data: Venue[] }>("GET", path);
    return res.data;
  }

  /**
   * Retrieves single venue details and active telemetry profile.
   */
  public async get(id: string): Promise<Venue> {
    const res = await this.http.request<{ data: Venue }>("GET", `/v1/venues/${id}`);
    return res.data;
  }

  /**
   * Creates a new venue boundary with hardware profile and coordinates.
   */
  public async create(data: CreateVenueInput): Promise<Venue> {
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

    const res = await this.http.request<{ data: Venue }>("POST", "/v1/venues", payload);
    return res.data;
  }

  /**
   * Rotates venue's TOTP secret key, instantly invalidating cached kiosk seeds.
   */
  public async rotateSecret(id: string): Promise<{ newSecretPreview: string }> {
    const res = await this.http.request<{
      data: {
        venue_id: string;
        new_secret_preview: string;
        rotated_at: string;
      };
    }>("POST", `/v1/venues/${id}/rotate-secret`);

    return {
      newSecretPreview: res.data.new_secret_preview,
    };
  }

  /**
   * Archives a venue (soft delete).
   */
  public async archive(id: string): Promise<void> {
    await this.http.request<void>("DELETE", `/v1/venues/${id}`);
  }
}

