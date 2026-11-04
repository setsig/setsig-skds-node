import type { HttpClient } from "../http.js";
import type { VerifySessionInput, VerifySessionResponse, VerifyIntentInput, VerifyIntentResponse } from "../types.js";
export declare class SessionsResource {
    private readonly http;
    constructor(http: HttpClient);
    /**
     * Performs atomic presence verification (Geofence + Hardware Attestation + TOTP + Visual Proof).
     */
    verify(input: VerifySessionInput): Promise<VerifySessionResponse>;
    /**
     * Initiates intent to verify, returning presigned upload parameters if visual proof is enforced.
     */
    verifyIntent(input: VerifyIntentInput): Promise<VerifyIntentResponse>;
}
//# sourceMappingURL=sessions.d.ts.map