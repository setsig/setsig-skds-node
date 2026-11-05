export type HardwareProfile = "STANDARD_GPS" | "BLE_BEACON" | "WEIGHT_LOADCELL" | "HIGH_TRUST_PARLIAMENT";
export type SessionState = "PENDING" | "ACTIVE" | "COMPLETED" | "REJECTED" | "EXPIRED";
export interface SetsigClientOptions {
    apiKey: string;
    secretKey?: string;
    baseURL?: string;
    timeoutMs?: number;
    maxRetries?: number;
}
export interface HostTelemetry {
    latitude: number;
    longitude: number;
}
export interface GenerateTokenInput {
    venueId: string;
    ttlSeconds?: number;
    hostTelemetry?: HostTelemetry;
    bindToClientToken?: string;
}
export interface GenerateTokenResponse {
    tokenId: string;
    qrPayload: string;
    expiresAt: number;
    ttlRemaining: number;
}
export interface ClientBinding {
    clientToken: string;
    userRef: string;
    userIdentityHash?: string;
}
export interface ClientTelemetry {
    latitude: number;
    longitude: number;
    accuracyMeters: number;
    bleBeaconRssi?: number;
    loadcellWeightKg?: number;
}
export interface ClientAttestation {
    platform: "ios_app_attest" | "google_play_integrity" | "web_none";
    token: string;
}
export interface VisualProofPayload {
    imageHashSha256: string;
    storageKey: string;
    capturedAt: string;
    livenessScore?: number;
}
export interface VerifySessionInput {
    qrPayload: string;
    clientBinding: ClientBinding;
    telemetry: ClientTelemetry;
    attestation?: ClientAttestation;
    visualProof?: VisualProofPayload;
}
export interface VerificationStatus {
    geofenceStatus: string;
    distanceMeters: number;
    replayAttackRisk: string;
    mockLocationDetected: boolean;
    hardwareAttestation: string;
    visualProofVerified: boolean;
}
export interface ProofData {
    signature: string;
    ntpTimestamp: string;
}
export interface VisualProofResponse {
    url?: string;
    imageHashSha256: string;
    livenessScore?: number;
    verified: boolean;
}
export interface VerifySessionResponse {
    status: "verified" | "rejected";
    sessionId: string;
    verification: VerificationStatus;
    visualProof?: VisualProofResponse;
    proof: ProofData;
}
export interface VerifyIntentInput {
    venueId: string;
    clientToken: string;
    contentType?: string;
}
export interface VerifyIntentResponse {
    sessionId: string;
    uploadUrl: string;
    storageKey: string;
    expiresInSeconds: number;
}
export interface VenueCoordinates {
    latitude: number;
    longitude: number;
    radiusMeters: number;
    altitudeMeters?: number;
}
export interface VenueSettings {
    totpIntervalSeconds: number;
    allowMockLocations: boolean;
}
export interface CreateVenueInput {
    name: string;
    externalReference?: string;
    referenceId?: string;
    coordinates: VenueCoordinates;
    hardwareProfile: HardwareProfile;
    hardwareConfig?: Record<string, unknown>;
    settings?: VenueSettings;
    requireVisualProof?: boolean;
    visualProofPrompt?: string;
    countryCode?: string;
}
export interface TerminalSessionInput {
    terminalKey: string;
    venueId: string;
}
export interface TerminalSessionResponse {
    status: string;
    terminalSessionToken: string;
    venueName: string;
    totpIntervalSeconds: number;
    scope: string;
}
export interface Venue {
    id: string;
    tenantId?: string;
    externalReference?: string;
    name: string;
    latitude: number;
    longitude: number;
    radiusMeters?: number;
    altitudeMeters?: number;
    hardwareProfile: HardwareProfile;
    hardwareConfig?: Record<string, unknown>;
    bleBeaconUuid?: string;
    status?: "ACTIVE" | "INACTIVE";
    totpIntervalSeconds?: number;
    secretKeyPreview?: string;
    requireVisualProof?: boolean;
    visualProofPrompt?: string;
    countryCode?: string;
    isArchived?: boolean;
    activeSessionsCount?: number;
    createdAt?: string;
    updatedAt?: string;
}
export interface TenantBillingSummary {
    tenantId: string;
    prepaidBalance: number;
    currency: string;
    estimatedRemainingVerifications: number;
    billingZoneId: string;
    autoRechargeEnabled: boolean;
    autoRechargeThreshold: number;
    autoRechargeAmount: number;
    isAuditFlagged: boolean;
}
export interface DepositCreditsResponse {
    transactionId: string;
    newBalance: number;
    currency: string;
    status: string;
}
export interface LedgerTransactionItem {
    transaction: {
        id: string;
        tenantId: string;
        referenceId: string;
        transactionType: string;
        description: string;
        createdAt: string;
    };
    totalAmount: number;
}
export interface WebhookSessionData {
    sessionId: string;
    clientToken: string;
    userRef: string;
    venueId: string;
    weightKg?: number;
    proofSignature: string;
}
export interface WebhookEvent {
    event: "session.verified" | "session.rejected" | "venue.rotated";
    timestamp: string;
    tenantId: string;
    data: WebhookSessionData;
}
//# sourceMappingURL=types.d.ts.map