import type { HttpClient } from "../http.js";
import type { GenerateTokenInput, GenerateTokenResponse } from "../types.js";
export declare class TokensResource {
    private readonly http;
    constructor(http: HttpClient);
    /**
     * Generates a new dynamic TOTP presence token and QR payload for display on a venue kiosk.
     */
    generate(input: GenerateTokenInput): Promise<GenerateTokenResponse>;
}
//# sourceMappingURL=tokens.d.ts.map