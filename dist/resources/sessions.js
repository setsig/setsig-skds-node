export class SessionsResource {
    http;
    constructor(http) {
        this.http = http;
    }
    /**
     * Performs atomic presence verification (Geofence + Hardware Attestation + TOTP + Visual Proof).
     */
    async verify(input) {
        const payload = {
            qr_payload: input.qrPayload,
            client_binding: {
                client_token: input.clientBinding.clientToken,
                user_ref: input.clientBinding.userRef,
                user_identity_hash: input.clientBinding.userIdentityHash,
            },
            telemetry: {
                latitude: input.telemetry.latitude,
                longitude: input.telemetry.longitude,
                accuracy_meters: input.telemetry.accuracyMeters,
                ble_beacon_rssi: input.telemetry.bleBeaconRssi,
                loadcell_weight_kg: input.telemetry.loadcellWeightKg,
            },
            attestation: input.attestation
                ? {
                    platform: input.attestation.platform,
                    token: input.attestation.token,
                }
                : undefined,
            visual_proof: input.visualProof
                ? {
                    image_hash_sha256: input.visualProof.imageHashSha256,
                    storage_key: input.visualProof.storageKey,
                    captured_at: input.visualProof.capturedAt,
                    liveness_score: input.visualProof.livenessScore,
                }
                : undefined,
        };
        const res = await this.http.request("POST", "/v1/sessions/verify", payload);
        const result = {
            status: res.status,
            sessionId: res.session_id,
            verification: {
                geofenceStatus: res.verification.geofence_status,
                distanceMeters: res.verification.distance_meters,
                replayAttackRisk: res.verification.replay_attack_risk,
                mockLocationDetected: res.verification.mock_location_detected,
                hardwareAttestation: res.verification.hardware_attestation,
                visualProofVerified: res.verification.visual_proof_verified,
            },
            proof: {
                signature: res.proof.signature,
                ntpTimestamp: res.proof.ntp_timestamp,
            },
        };
        if (res.visual_proof) {
            result.visualProof = {
                imageHashSha256: res.visual_proof.image_hash_sha256,
                verified: res.visual_proof.verified,
            };
            if (res.visual_proof.url) {
                result.visualProof.url = res.visual_proof.url;
            }
            if (res.visual_proof.liveness_score !== undefined) {
                result.visualProof.livenessScore = res.visual_proof.liveness_score;
            }
        }
        return result;
    }
    /**
     * Initiates intent to verify, returning presigned upload parameters if visual proof is enforced.
     */
    async verifyIntent(input) {
        const payload = {
            venue_id: input.venueId,
            client_token: input.clientToken,
            content_type: input.contentType,
        };
        const res = await this.http.request("POST", "/v1/sessions/verify-intent", payload);
        return {
            sessionId: res.session_id,
            uploadUrl: res.upload_url,
            storageKey: res.storage_key,
            expiresInSeconds: res.expires_in_seconds,
        };
    }
}
//# sourceMappingURL=sessions.js.map