export declare class SetsigError extends Error {
    readonly code: string;
    readonly statusCode?: number;
    readonly details?: unknown;
    constructor(message: string, code?: string, statusCode?: number, details?: unknown);
}
export declare class AuthenticationError extends SetsigError {
    constructor(message?: string, details?: unknown);
}
export declare class InsufficientCreditsError extends SetsigError {
    constructor(message?: string, details?: unknown);
}
export declare class RateLimitError extends SetsigError {
    constructor(message?: string, details?: unknown);
}
export declare class ReplayAttackError extends SetsigError {
    constructor(message?: string, details?: unknown);
}
export declare class GeofenceOutOfBoundsError extends SetsigError {
    constructor(message?: string, details?: unknown);
}
export declare class InvalidSignatureError extends SetsigError {
    constructor(message?: string, details?: unknown);
}
//# sourceMappingURL=errors.d.ts.map