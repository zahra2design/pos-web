import { useState } from "react";
import { orderService } from "../services/order.service";
import { formatCurrency } from "@/lib/utils/format-currency";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Banknote } from "lucide-react";
import type { Order } from "@/types/database.types";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order;
  onPaymentComplete: () => void;
}

export function PaymentDialog({
  open,
  onOpenChange,
  order,
  onPaymentComplete,
}: PaymentDialogProps) {
  const [amountReceived, setAmountReceived] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = order.total;
  const received = parseInt(amountReceived.replace(/\D/g, ""), 10) || 0;
  const change = received - total;
  const isValid = received >= total;

  const quickAmounts = [
    Math.ceil(total / 1000) * 1000,
    Math.ceil(total / 5000) * 5000,
    Math.ceil(total / 10000) * 10000,
    Math.ceil(total / 50000) * 50000,
  ];

  const handlePayment = async () => {
    if (!isValid) return;
    setLoading(true);
    setError(null);
    try {
      await orderService.createPayment({
        order_id: order.id,
        method: "cash",
        amount: total,
        amount_received: received,
        change_amount: Math.max(0, change),
      });
      onPaymentComplete();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gagal memproses pembayaran";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pembayaran</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Total */}
          <div className="rounded-lg bg-muted p-4 text-center">
            <p className="text-sm text-muted-foreground">Total Bayar</p>
            <p className="text-3xl font-bold text-primary">
              {formatCurrency(total)}
            </p>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount">Jumlah Bayar (Rp)</Label>
            <Input
              id="amount"
              type="text"
              inputMode="numeric"
              placeholder="Masukkan jumlah"
              value={amountReceived}
              onChange={(e) => setAmountReceived(e.target.value)}
              className="text-lg font-medium"
              autoFocus
            />
          </div>

          {/* Quick Amount Buttons */}
          <div className="flex flex-wrap gap-2">
            {quickAmounts.map((amt) => (
              <button
                key={amt}
                onClick={() => setAmountReceived(String(amt))}
                className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent"
              >
                {formatCurrency(amt)}
              </button>
            ))}
            <button
              onClick={() => setAmountReceived(String(total))}
              className="rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-accent"
            >
              Uang Pas
            </button>
          </div>

          {/* Change */}
          {received > 0 && (
            <div
              className={`rounded-lg p-3 text-center ${
                isValid
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {isValid ? (
                <>
                  <p className="text-sm">Kembalian</p>
                  <p className="text-xl font-bold">{formatCurrency(change)}</p>
                </>
              ) : (
                <p className="text-sm font-medium">
                  Kurang {formatCurrency(Math.abs(change))}
                </p>
              )}
            </div>
          )}

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
            <Button onClick={handlePayment} disabled={!isValid || loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <Banknote className="mr-2 h-4 w-4" />
                  Bayar
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
