import { format } from "date-fns";

export function generateOrderNumber(): string {
  const today = format(new Date(), "yyyyMMdd");
  const random = Math.floor(Math.random() * 9999)
    .toString()
    .padStart(4, "0");
  return `INV-${today}-${random}`;
}
