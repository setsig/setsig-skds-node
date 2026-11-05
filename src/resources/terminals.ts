import type { HttpClient } from "../http.js";
import type { TerminalSessionInput, TerminalSessionResponse } from "../types.js";

export class TerminalsResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * Initializes a scoped terminal session for kiosk display or turnstile gatekeeper.
   */
  public async createSession(data: TerminalSessionInput): Promise<TerminalSessionResponse> {
    const payload = {
      terminal_key: data.terminalKey,
      venue_id: data.venueId,
    };

    return this.http.request<TerminalSessionResponse>("POST", "/v1/terminals/session", payload);
  }
}

