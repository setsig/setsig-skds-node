import type { HttpClient } from "../http.js";
import type { TenantBillingSummary, DepositCreditsResponse, LedgerTransactionItem } from "../types.js";
export declare class BillingResource {
    private readonly http;
    constructor(http: HttpClient);
    /**
     * Retrieves prepaid credit balance, remaining estimates, and auto-recharge settings.
     */
    getBalance(): Promise<TenantBillingSummary>;
    /**
     * Top up prepaid verification credits with double-entry ledger bookkeeping.
     */
    deposit(amount: number, currency?: string): Promise<DepositCreditsResponse>;
    /**
     * Updates auto-recharge rule.
     */
    updateAutoRecharge(config: {
        enabled: boolean;
        threshold: number;
        amount: number;
    }): Promise<void>;
    /**
     * Lists chronological double-entry ledger transactions.
     */
    listTransactions(limit?: number): Promise<LedgerTransactionItem[]>;
}
//# sourceMappingURL=billing.d.ts.map