"use client";

import { Card, Grid, Stack, Title } from "@mantine/core";
import { IconCashRegister } from "@tabler/icons-react";

import { CardPayment } from "./components/CardPayment";
import { CartSummary } from "./components/CartSummary";
import { CartTable } from "./components/CartTable";
import { CashPayment } from "./components/CashPayment";
import { PaymentMethodSelector } from "./components/PaymentMethodSelector";
import { ProductSearch } from "./components/ProductSearch";
import { TicketPreview } from "./components/TicketPreview";
import { TransferPayment } from "./components/TransferPayment";
import { usePosCart } from "./usePosCart";

export default function PosContent() {
  const cart = usePosCart();

  // ── Completed stage ─────────────────────────────────────
  if (cart.stage === "completed" && cart.completedSale) {
    return (
      <Stack gap="md" maw={600} mx="auto">
        <TicketPreview sale={cart.completedSale} onNewSale={cart.clearCart} />
      </Stack>
    );
  }

  // ── Paying stage ────────────────────────────────────────
  if (cart.stage === "paying") {
    return (
      <Stack gap="md" maw={500} mx="auto">
        <PaymentMethodSelector
          value={cart.paymentMethod}
          onChange={cart.setPaymentMethod}
        />

        {cart.paymentMethod === "cash" && (
          <CashPayment
            total={cart.total}
            onConfirm={cart.processCash}
            onBack={() => cart.startPayment() /* go back resets nothing, stays in paying */}
          />
        )}

        {cart.paymentMethod === "transfer" && (
          <TransferPayment
            total={cart.total}
            transferMode={cart.transferMode}
            onTransferModeChange={cart.setTransferMode}
            qrData={cart.qrData}
            aliasData={cart.aliasData}
            onGenerateQR={cart.generateQR}
            onGenerateAlias={cart.generateAlias}
            onConfirm={cart.confirmTransfer}
            onBack={() => cart.startPayment()}
          />
        )}

        {cart.paymentMethod === "card" && (
          <CardPayment
            total={cart.total}
            waiting={cart.posnetWaiting}
            onStart={cart.startPosnet}
            onCancel={cart.cancelPosnet}
            onSkip={cart.skipPosnet}
            onBack={() => cart.startPayment()}
          />
        )}
      </Stack>
    );
  }

  // ── Browsing stage (default) ────────────────────────────
  return (
    <Grid gutter="md">
      <Grid.Col span={{ base: 12, md: 8 }}>
        <Stack gap="md">
          <Title order={4}>
            <IconCashRegister size={22} style={{ verticalAlign: "middle", marginRight: 8 }} />
            Punto de Venta
          </Title>

          <ProductSearch onAdd={cart.addItem} />

          <Card withBorder p={0}>
            <CartTable
              items={cart.items}
              onUpdateQty={cart.updateQty}
              onRemove={cart.removeItem}
            />
          </Card>
        </Stack>
      </Grid.Col>

      <Grid.Col span={{ base: 12, md: 4 }}>
        <CartSummary
          itemCount={cart.itemCount}
          subtotal={cart.subtotal}
          total={cart.total}
          canPay={cart.items.length > 0}
          onStartPayment={cart.startPayment}
        />
      </Grid.Col>
    </Grid>
  );
}
