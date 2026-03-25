import type { PaymentProvider } from "./types";

/**
 * Mock MercadoPago payment provider.
 *
 * Every method simulates a realistic delay so the UI behaves like a
 * real integration. Replace the bodies with actual MercadoPago SDK
 * calls when connecting to production.
 */
export const mercadoPagoProvider: PaymentProvider = {
  name: "MercadoPago",
  supportsQR: true,
  supportsAlias: true,
  supportsPosnet: true,

  async generateQR(amount) {
    await delay(800);
    const reference = `MP-QR-${Date.now()}`;
    // In production this would be a real QR URI from the MP API.
    // For now we return a placeholder SVG data-URL that the UI can show.
    const placeholder =
      `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=` +
      encodeURIComponent(`mercadopago://pay?amount=${amount}&ref=${reference}`);
    return { data: placeholder, reference };
  },

  async generateAlias(amount) {
    await delay(500);
    const reference = `MP-ALIAS-${Date.now()}`;
    return { alias: "ecommerce.mp", reference };
  },

  async waitForPosnet(amount, signal) {
    // Simulate a 3-second posnet authorization
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        resolve({ success: true, reference: `MP-POSNET-${Date.now()}` });
      }, 3000);

      signal?.addEventListener("abort", () => {
        clearTimeout(timer);
        reject(new DOMException("Posnet payment cancelled", "AbortError"));
      });
    });
  },
};

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
