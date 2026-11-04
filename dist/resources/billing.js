export class BillingResource {
    http;
    constructor(http) {
        this.http = http;
    }
    /**
     * Retrieves prepaid credit balance, remaining estimates, and auto-recharge settings.
     */
    async getBalance() {
        const res = await this.http.request("GET", "/v1/billing/balance");
        return {
            tenantId: res.tenant_id,
            prepaidBalance: res.prepaid_balance,
            currency: res.currency,
            estimatedRemainingVerifications: res.estimated_remaining_verifications,
            billingZoneId: res.billing_zone_id,
            autoRechargeEnabled: res.auto_recharge_enabled,
            autoRechargeThreshold: res.auto_recharge_threshold,
            autoRechargeAmount: res.auto_recharge_amount,
            isAuditFlagged: res.is_audit_flagged,
        };
    }
    /**
     * Top up prepaid verification credits with double-entry ledger bookkeeping.
     */
    async deposit(amount, currency = "TRY") {
        const res = await this.http.request("POST", "/v1/billing/deposit", {
            amount,
            currency,
        });
        return {
            transactionId: res.transaction_id,
            newBalance: res.new_balance,
            currency: res.currency,
            status: res.status,
        };
    }
    /**
     * Updates auto-recharge rule.
     */
    async updateAutoRecharge(config) {
        await this.http.request("PATCH", "/v1/billing/auto-recharge", config);
    }
    /**
     * Lists chronological double-entry ledger transactions.
     */
    async listTransactions(limit = 50) {
        const res = await this.http.request("GET", `/v1/billing/transactions?limit=${limit}`);
        return res.data.map((item) => ({
            transaction: {
                id: item.transaction.id,
                tenantId: item.transaction.tenant_id,
                referenceId: item.transaction.reference_id,
                transactionType: item.transaction.transaction_type,
                description: item.transaction.description,
                createdAt: item.transaction.created_at,
            },
            totalAmount: item.total_amount,
        }));
    }
}
//# sourceMappingURL=billing.js.map