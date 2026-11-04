import type { HttpClient } from "../http.js";
import type { Venue, CreateVenueInput } from "../types.js";
export declare class VenuesResource {
    private readonly http;
    constructor(http: HttpClient);
    /**
     * Lists physical venues and check-in checkpoints.
     */
    list(params?: {
        status?: string;
        hardwareProfile?: string;
    }): Promise<Venue[]>;
    /**
     * Retrieves single venue details and active telemetry profile.
     */
    get(id: string): Promise<Venue>;
    /**
     * Creates a new venue boundary with hardware profile and coordinates.
     */
    create(data: CreateVenueInput): Promise<Venue>;
    /**
     * Rotates venue's TOTP secret key, instantly invalidating cached kiosk seeds.
     */
    rotateSecret(id: string): Promise<{
        newSecretPreview: string;
    }>;
    /**
     * Archives a venue (soft delete).
     */
    archive(id: string): Promise<void>;
}
//# sourceMappingURL=venues.d.ts.map