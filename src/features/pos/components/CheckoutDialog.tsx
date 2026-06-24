import { useState } from "react";
import { useCartStore } from "@/stores/cart.store";
import { orderService } from "../services/order.service";
import { formatCurrency } from "@/lib/utils/format-currency";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { PaymentDialog } from "./PaymentDialog";
import { ReceiptPreview } from "./ReceiptPreview";
import type { Order } from "@/types/database.types";

interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CheckoutDialog({ open, onOpenChange }: CheckoutDialogProps) {
  const {
    items,
    orderType,
    tableNumber,
    discountType,
    discountValue,
    getSubtotal,
    getDiscountAmount,
    clearCart,
  } = useCartStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);

  const subtotal = getSubtotal();
  const discountAmount = getDiscountAmount();

  const handlePlaceOrder = async () => {
    setLoading(true);
    setError(null);
    try {
      const order = await orderService.createOrder({
        order_type: orderType,
        table_number: orderType === "dine_in" ? tableNumber : null,
        customer_id: null,
        items: items.map((item) => ({
          product_id: item.product_id,
          variant_id: item.variant_id,
          product_name: item.product_name,
          variant_name: item.variant_name,
          price: item.price,
          quantity: item.quantity,
          notes: item.notes,
          addons: item.addons,
        })),
        discount_type: discountType,
        discount_value: discountValue,
        notes: null,
      });
      setCreatedOrder(order);
      setShowPayment(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gagal membuat pesanan";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentComplete = () => {
    setShowPayment(false);
    setShowReceipt(true);
  };

  const handleCloseAll = () => {
    clearCart();
    setCreatedOrder(null);
    setShowReceipt(false);
    onOpenChange(false);
  };

  if (showReceipt && createdOrder) {
    return (
      <ReceiptPreview
        open={true}
        onOpenChange={handleCloseAll}
        order={createdOrder}
      />
    );
  }

  if (showPayment && createdOrder) {
    return (
      <PaymentDialog
        open={true}
        onOpenChange={(open) => {
          if (!open) setShowPayment(false);
        }}
        order={createdOrder}
        onPaymentComplete={handlePaymentComplete}
      />
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Konfirmasi Pesanan</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Order Type */}
          <div className="flex items-center justify-between rounded-lg bg-muted p-3">
            <span className="text-sm font-medium">
              {orderType === "dine_in" ? "Dine In" : "Take Away"}
            </span>
            {orderType === "dine_in" && tableNumber && (
              <span className="text-sm text-muted-foreground">
                Meja {tableNumber}
              </span>
            )}
          </div>

          {/* Items */}
          <div className="max-h-60 space-y-2 overflow-y-auto">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <div>
                  <span className="font-medium">{item.product_name}</span>
                  {item.variant_name && (
                    <span className="ml-1 text-muted-foreground">
                      ({item.variant_name})
                    </span>
                  )}
                  <span className="ml-1 text-muted-foreground">
                    x{item.quantity}
                  </span>
                </div>
                <span>{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="space-y-1 border-t pt-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Diskon</span>
                <span className="text-destructive">
                  -{formatCurrency(discountAmount)}
                </span>
              </div>
            )}
          </div>

          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button onClick={handlePlaceOrder} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                "Buat Pesanan"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
