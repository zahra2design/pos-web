export const ORDER_STATUS = {
  NEW: "new",
  PREPARING: "preparing",
  READY: "ready",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  [ORDER_STATUS.NEW]: "Baru",
  [ORDER_STATUS.PREPARING]: "Sedang Dibuat",
  [ORDER_STATUS.READY]: "Siap",
  [ORDER_STATUS.COMPLETED]: "Selesai",
  [ORDER_STATUS.CANCELLED]: "Dibatalkan",
};
