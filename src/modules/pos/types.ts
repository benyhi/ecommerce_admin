export type ProductVariant = {
  id: string;
  name: string;
  /** Price adjustment added to the base product price */
  priceModifier: number;
};

export type PosProduct = {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  price: number;
  stock: number;
  variants: ProductVariant[];
};

export type PosCartItem = {
  product: PosProduct;
  variant: ProductVariant | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type PaymentMethod = "cash" | "transfer" | "card";

export type TransferMode = "qr" | "alias";

export type PaymentResult = {
  success: boolean;
  method: PaymentMethod;
  amount: number;
  change?: number;
  reference?: string;
  provider: string;
};

export type PosStage = "browsing" | "paying" | "completed";

export type CompletedSale = {
  items: PosCartItem[];
  subtotal: number;
  total: number;
  payment: PaymentResult;
  timestamp: string;
  orderNumber: string;
};
