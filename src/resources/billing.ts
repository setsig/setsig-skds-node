import type { HttpClient } from "../http.js";
import type {
  TenantBillingSummary,
  DepositCreditsResponse,
  LedgerTransactionItem,
} from "../types.js";

export class BillingResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * Retrieves prepaid credit balance, remaining estimates, and auto-recharge settings.
   */
  public async getBalance(): Promise<TenantBillingSummary> {
    const res = await this.http.request<{
      tenant_id: string;
      prepaid_balance: number;
      currency: string;
      estimated_remaining_verifications: number;
      billing_zone_id: string;
      auto_recharge_enabled: boolean;
      auto_recharge_threshold: number;
      auto_recharge_amount: number;
      is_audit_flagged: boolean;
    }>("GET", "/v1/billing/balance");

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
  public async deposit(amount: number, currency = "TRY"): Promise<DepositCreditsResponse> {
    const res = await this.http.request<{
      transaction_id: string;
      new_balance: number;
      currency: string;
      status: string;
    }>("POST", "/v1/billing/deposit", {
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
  public async updateAutoRecharge(config: {
    enabled: boolean;
    threshold: number;
    amount: number;
  }): Promise<void> {
    await this.http.request<void>("PATCH", "/v1/billing/auto-recharge", config);
  }

  /**
   * Lists chronological double-entry ledger transactions.
   */
  public async listTransactions(limit = 50): Promise<LedgerTransactionItem[]> {
    const res = await this.http.request<{
      data: Array<{
        transaction: {
          id: string;
          tenant_id: string;
          reference_id: string;
          transaction_type: string;
          description: string;
          created_at: string;
        };
        total_amount: number;
      }>;
    }>("GET", `/v1/billing/transactions?limit=${limit}`);

    return res.data.map((item) => ({
      transaction: {
        id: item.transaction.id,
        tenantId: item.transaction.tenant_id,
        referenceId: item.transaction.reference_id,
        transactionType: item.transaction.transaction_type as
          | "USAGE_CHARGE"
          | "PREPAYMENT"
          | "REFUND"
          | "INSURANCE_ESCROW",
        description: item.transaction.description,
        createdAt: item.transaction.created_at,
      },
      totalAmount: item.total_amount,
    }));
  }
}

