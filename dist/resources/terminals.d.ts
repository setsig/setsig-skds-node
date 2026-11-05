import type { HttpClient } from "../http.js";
import type { TerminalSessionInput, TerminalSessionResponse } from "../types.js";
export declare class TerminalsResource {
    private readonly http;
    constructor(http: HttpClient);
    /**
     * Initializes a scoped terminal session for kiosk display or turnstile gatekeeper.
     */
    createSession(data: TerminalSessionInput): Promise<TerminalSessionResponse>;
}
//# sourceMappingURL=terminals.d.ts.map