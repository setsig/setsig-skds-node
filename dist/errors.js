export class SetsigError extends Error {
    code;
    statusCode;
    details;
    constructor(message, code = "ERR_SETSIG_SDK", statusCode, details) {
        super(message);
        this.name = "SetsigError";
        this.code = code;
        if (statusCode !== undefined) {
            this.statusCode = statusCode;
        }
        if (details !== undefined) {
            this.details = details;
        }
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
export class AuthenticationError extends SetsigError {
    constructor(message = "Invalid or missing setsig API key", details) {
        super(message, "ERR_UNAUTHORIZED", 401, details);
        this.name = "AuthenticationError";
    }
}
export class InsufficientCreditsError extends SetsigError {
    constructor(message = "Insufficient prepaid balance for presence verification", details) {
        super(message, "ERR_INSUFFICIENT_CREDITS", 402, details);
        this.name = "InsufficientCreditsError";
    }
}
export class RateLimitError extends SetsigError {
    constructor(message = "Rate limit exceeded. Please throttle requests.", details) {
        super(message, "ERR_RATE_LIMIT_EXCEEDED", 429, details);
        this.name = "RateLimitError";
    }
}
export class ReplayAttackError extends SetsigError {
    constructor(message = "Single-use token already consumed (replay attack detected)", details) {
        super(message, "ERR_REPLAY_DETECTED", 409, details);
        this.name = "ReplayAttackError";
    }
}
export class GeofenceOutOfBoundsError extends SetsigError {
    constructor(message = "Client coordinates outside authorized venue radius", details) {
        super(message, "ERR_GEOFENCE_OUT_OF_BOUNDS", 400, details);
        this.name = "GeofenceOutOfBoundsError";
    }
}
export class InvalidSignatureError extends SetsigError {
    constructor(message = "Webhook cryptographic signature mismatch or expired timestamp", details) {
        super(message, "ERR_INVALID_SIGNATURE", 401, details);
        this.name = "InvalidSignatureError";
    }
}
//# sourceMappingURL=errors.js.map