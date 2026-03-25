/**
 * Generic payment provider interface.
 *
 * Implement this for each payment gateway (MercadoPago, banks, etc.).
 * POS components only depend on this interface — never on a concrete provider.
 */
export interface PaymentProvider {
  /** Human-readable name shown in receipts */
  readonly name: string;

  readonly supportsQR: boolean;
  readonly supportsAlias: boolean;
  readonly supportsPosnet: boolean;

  /**
   * Generate a QR code payload for a given amount.
   * Returns a data-URL or a string the UI can render as a QR image.
   */
  generateQR(amount: number): Promise<{ data: string; reference: string }>;

  /**
   * Return the alias/CBU the customer should transfer to.
   */
  generateAlias(amount: number): Promise<{ alias: string; reference: string }>;

  /**
   * Start a card payment on the connected POS terminal.
   * Resolves when the terminal confirms the payment or rejects it.
   * The returned AbortController lets the caller cancel the wait.
   */
  waitForPosnet(
    amount: number,
    signal?: AbortSignal,
  ): Promise<{ success: boolean; reference: string }>;
}
