export const PAYMENT_METHODS = {
  CASH: "cash",
  DEBIT: "debit",
  CREDIT: "credit",
  QRIS: "qris",
  EWALLET: "ewallet",
} as const;

export type PaymentMethod =
  (typeof PAYMENT_METHODS)[keyof typeof PAYMENT_METHODS];

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  [PAYMENT_METHODS.CASH]: "Tunai",
  [PAYMENT_METHODS.DEBIT]: "Debit",
  [PAYMENT_METHODS.CREDIT]: "Kartu Kredit",
  [PAYMENT_METHODS.QRIS]: "QRIS",
  [PAYMENT_METHODS.EWALLET]: "E-Wallet",
};
