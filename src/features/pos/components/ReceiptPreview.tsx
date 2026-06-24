import { useEffect, useState } from "react";
import { orderService } from "../services/order.service";
import { formatCurrency } from "@/lib/utils/format-currency";
import { formatDateTime } from "@/lib/utils/format-date";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, Loader2 } from "lucide-react";
import type { Order, OrderItem, Payment } from "@/types/database.types";

interface OrderWithRelations extends Order {
  items?: (OrderItem & { addons?: { addon_name: string; price: number }[] })[];
  payments?: Payment[];
}

interface ReceiptPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order;
}

export function ReceiptPreview({ open, onOpenChange, order }: ReceiptPreviewProps) {
  const [fullOrder, setFullOrder] = useState<OrderWithRelations | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      loadOrder();
    }
  }, [open, order.id]);

  const loadOrder = async () => {
    setLoading(true);
    try {
      const data = await orderService.getOrder(order.id);
      setFullOrder(data as OrderWithRelations);
    } catch (err) {
      console.error("Failed to load order:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const o = fullOrder ?? order;
  const payment = fullOrder?.payments?.[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Struk Pembayaran</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4" id="receipt-content">
            {/* Receipt Header */}
            <div className="text-center">
              <h2 className="text-lg font-bold">CafePOS</h2>
              <p className="text-xs text-muted-foreground">
                Jl. Contoh No. 123, Jakarta
              </p>
              <p className="text-xs text-muted-foreground">021-1234567</p>
            </div>

            {/* Transaction Info */}
            <div className="space-y-1 border-t border-dashed pt-3 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">No.</span>
                <span className="font-medium">{o.order_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tanggal</span>
                <span>{formatDateTime(o.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tipe</span>
                <span>
                  {o.order_type === "dine_in"
                    ? `Dine In${o.table_number ? ` - Meja ${o.table_number}` : ""}`
                    : "Take Away"}
                </span>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-2 border-t border-dashed pt-3">
              {fullOrder?.items?.map((item) => (
                <div key={item.id} className="text-xs">
                  <div className="flex justify-between">
                    <span className="font-medium">
                      {item.product_name}
                      {item.variant_name && ` (${item.variant_name})`}
                    </span>
                    <span>{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>
                      {item.quantity} x {formatCurrency(item.price)}
                    </span>
                  </div>
                  {item.addons && item.addons.length > 0 && (
                    <div className="ml-2 text-muted-foreground">
                      {item.addons.map((a, i) => (
                        <div key={i} className="flex justify-between">
                          <span>+ {a.addon_name}</span>
                          <span>{formatCurrency(a.price)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {item.notes && (
                    <p className="ml-2 italic text-muted-foreground">
                      Catatan: {item.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="space-y-1 border-t border-dashed pt-3 text-xs">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(o.subtotal)}</span>
              </div>
              {o.discount_amount > 0 && (
                <div className="flex justify-between">
                  <span>Diskon</span>
                  <span className="text-destructive">
                    -{formatCurrency(o.discount_amount)}
                  </span>
                </div>
              )}
              {o.tax_amount > 0 && (
                <div className="flex justify-between">
                  <span>PPN ({o.tax_rate}%)</span>
                  <span>{formatCurrency(o.tax_amount)}</span>
                </div>
              )}
              {o.service_charge_amount > 0 && (
                <div className="flex justify-between">
                  <span>Service Charge</span>
                  <span>{formatCurrency(o.service_charge_amount)}</span>
                </div>
              )}
              <div className="flex justify-between border-t pt-1 text-sm font-bold">
                <span>TOTAL</span>
                <span>{formatCurrency(o.total)}</span>
              </div>
            </div>

            {/* Payment */}
            {payment && (
              <div className="space-y-1 border-t border-dashed pt-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pembayaran</span>
                  <span className="capitalize">{payment.method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Jumlah Bayar</span>
                  <span>{formatCurrency(payment.amount_received ?? payment.amount)}</span>
                </div>
                {payment.change_amount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Kembalian</span>
                    <span>{formatCurrency(payment.change_amount)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="border-t border-dashed pt-3 text-center text-xs text-muted-foreground">
              <p>Terima kasih atas kunjungan Anda!</p>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Tutup
              </Button>
              <Button onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                Cetak
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
