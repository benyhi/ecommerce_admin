"use client";

import { useCallback, useMemo, useRef, useState } from "react";

import { ordersAdmin } from "@/lib/api/services/admin.service";
import { mercadoPagoProvider } from "./payments/mercadopago";
import type { PaymentProvider } from "./payments/types";
import type {
  CompletedSale,
  PaymentMethod,
  PaymentResult,
  PosCartItem,
  PosProduct,
  PosStage,
  ProductVariant,
  TransferMode,
} from "./types";

const provider: PaymentProvider = mercadoPagoProvider;

export function usePosCart() {
  const [items, setItems] = useState<PosCartItem[]>([]);
  const [stage, setStage] = useState<PosStage>("browsing");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [transferMode, setTransferMode] = useState<TransferMode>("qr");
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);
  const [completedSale, setCompletedSale] = useState<CompletedSale | null>(null);

  // For transfer payments
  const [qrData, setQrData] = useState<string | null>(null);
  const [aliasData, setAliasData] = useState<string | null>(null);
  const [transferRef, setTransferRef] = useState<string>("");

  // For card payments
  const [posnetWaiting, setPosnetWaiting] = useState(false);
  const posnetAbort = useRef<AbortController | null>(null);

  // ── Computed ──────────────────────────────────────────────
  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.lineTotal, 0),
    [items],
  );
  const total = subtotal; // taxes can be layered here later
  const itemCount = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items],
  );

  // ── Cart actions ─────────────────────────────────────────
  const addItem = useCallback(
    (product: PosProduct, variant: ProductVariant | null = null, qty = 1) => {
      setItems((prev) => {
        const unitPrice = product.price + (variant?.priceModifier ?? 0);
        const existingIdx = prev.findIndex(
          (i) =>
            i.product.id === product.id &&
            (i.variant?.id ?? null) === (variant?.id ?? null),
        );

        if (existingIdx >= 0) {
          const updated = [...prev];
          const existing = updated[existingIdx];
          const newQty = existing.quantity + qty;
          updated[existingIdx] = {
            ...existing,
            quantity: newQty,
            lineTotal: newQty * unitPrice,
          };
          return updated;
        }

        return [
          ...prev,
          { product, variant, quantity: qty, unitPrice, lineTotal: qty * unitPrice },
        ];
      });
    },
    [],
  );

  const removeItem = useCallback((index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateQty = useCallback((index: number, qty: number) => {
    if (qty < 1) return;
    setItems((prev) => {
      const updated = [...prev];
      const item = updated[index];
      updated[index] = { ...item, quantity: qty, lineTotal: qty * item.unitPrice };
      return updated;
    });
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setStage("browsing");
    setPaymentResult(null);
    setCompletedSale(null);
    setQrData(null);
    setAliasData(null);
    setPosnetWaiting(false);
    posnetAbort.current?.abort();
    posnetAbort.current = null;
  }, []);

  // ── Payment flow ─────────────────────────────────────────
  const startPayment = useCallback(() => {
    setStage("paying");
    setPaymentResult(null);
  }, []);

  const generateQR = useCallback(async () => {
    const res = await provider.generateQR(total);
    setQrData(res.data);
    setTransferRef(res.reference);
  }, [total]);

  const generateAlias = useCallback(async () => {
    const res = await provider.generateAlias(total);
    setAliasData(res.alias);
    setTransferRef(res.reference);
  }, [total]);

  const confirmTransfer = useCallback(() => {
    const result: PaymentResult = {
      success: true,
      method: "transfer",
      amount: total,
      reference: transferRef,
      provider: provider.name,
    };
    setPaymentResult(result);
    void finishSale(result);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total, transferRef]);

  const processCash = useCallback(
    (amountPaid: number) => {
      const change = amountPaid - total;
      const result: PaymentResult = {
        success: true,
        method: "cash",
        amount: amountPaid,
        change: Math.max(change, 0),
        provider: "Efectivo",
      };
      setPaymentResult(result);
      void finishSale(result);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [total],
  );

  const startPosnet = useCallback(async () => {
    setPosnetWaiting(true);
    const ac = new AbortController();
    posnetAbort.current = ac;

    try {
      const res = await provider.waitForPosnet(total, ac.signal);
      const result: PaymentResult = {
        success: res.success,
        method: "card",
        amount: total,
        reference: res.reference,
        provider: provider.name,
      };
      setPaymentResult(result);
      if (res.success) void finishSale(result);
    } catch {
      // cancelled — do nothing
    } finally {
      setPosnetWaiting(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total]);

  const cancelPosnet = useCallback(() => {
    posnetAbort.current?.abort();
    posnetAbort.current = null;
    setPosnetWaiting(false);
  }, []);

  const skipPosnet = useCallback(() => {
    cancelPosnet();
    const result: PaymentResult = {
      success: true,
      method: "card",
      amount: total,
      reference: `MANUAL-${Date.now()}`,
      provider: "Manual",
    };
    setPaymentResult(result);
    void finishSale(result);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total, cancelPosnet]);

  // ── Internal ─────────────────────────────────────────────
  async function finishSale(result: PaymentResult) {
    const order = await ordersAdmin.create({
      customer_name: "POS - Venta directa",
      customer_email: "",
      customer_phone: "",
      status: "confirmed",
      payment_method: result.method,
      payment_status: "paid",
      delivery_type: "pickup",
      notes: result.reference ? `Referencia POS: ${result.reference}` : "Venta POS",
      items: items.map((item) => ({
        product: item.product.id,
        product_name: item.variant
          ? `${item.product.name} (${item.variant.name})`
          : item.product.name,
        quantity: item.quantity,
        unit_price: item.unitPrice,
      })),
    });

    const orderNumber =
      typeof order.order_number === "string"
        ? order.order_number
        : `POS-${Date.now().toString().slice(-6)}`;

    setCompletedSale({
      items: [...items],
      subtotal,
      total,
      payment: result,
      timestamp: new Date().toISOString(),
      orderNumber,
    });
    setStage("completed");
  }

  return {
    // Cart
    items,
    subtotal,
    total,
    itemCount,
    addItem,
    removeItem,
    updateQty,
    clearCart,

    // Stage
    stage,
    startPayment,

    // Payment
    paymentMethod,
    setPaymentMethod,
    transferMode,
    setTransferMode,

    // Cash
    processCash,

    // Transfer
    qrData,
    aliasData,
    generateQR,
    generateAlias,
    confirmTransfer,

    // Card
    posnetWaiting,
    startPosnet,
    cancelPosnet,
    skipPosnet,

    // Result
    paymentResult,
    completedSale,
  };
}
