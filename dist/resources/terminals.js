export class TerminalsResource {
    http;
    constructor(http) {
        this.http = http;
    }
    /**
     * Initializes a scoped terminal session for kiosk display or turnstile gatekeeper.
     */
    async createSession(data) {
        const payload = {
            terminal_key: data.terminalKey,
            venue_id: data.venueId,
        };
        return this.http.request("POST", "/v1/terminals/session", payload);
    }
}
//# sourceMappingURL=terminals.js.map