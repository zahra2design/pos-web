import { useCartStore } from "@/stores/cart.store";
import { formatCurrency } from "@/lib/utils/format-currency";
import { formatRelativeTime } from "@/lib/utils/format-date";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Play, Trash2, Clock } from "lucide-react";

interface HeldOrdersProps {
  onClose: () => void;
}

export function HeldOrders({ onClose }: HeldOrdersProps) {
  const { heldOrders, resumeOrder, deleteHeldOrder } = useCartStore();

  const handleResume = (id: string) => {
    resumeOrder(id);
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pesanan Ditahan ({heldOrders.length})</DialogTitle>
        </DialogHeader>

        {heldOrders.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <p>Tidak ada pesanan ditahan</p>
          </div>
        ) : (
          <div className="space-y-3">
            {heldOrders.map((held) => {
              const subtotal = held.items.reduce((sum, item) => {
                const addonTotal = item.addons.reduce(
                  (as, a) => as + a.price,
                  0
                );
                return sum + (item.price + addonTotal) * item.quantity;
              }, 0);

              return (
                <div
                  key={held.id}
                  className="rounded-lg border p-3"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {held.order_type === "dine_in"
                          ? `Dine In${held.table_number ? ` - Meja ${held.table_number}` : ""}`
                          : "Take Away"}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatRelativeTime(held.created_at)}
                      </span>
                    </div>
                    <span className="text-sm font-bold">
                      {formatCurrency(subtotal)}
                    </span>
                  </div>

                  {/* Items Preview */}
                  <div className="mb-2 space-y-0.5">
                    {held.items.slice(0, 3).map((item, i) => (
                      <p key={i} className="text-xs text-muted-foreground">
                        {item.product_name} x{item.quantity}
                      </p>
                    ))}
                    {held.items.length > 3 && (
                      <p className="text-xs text-muted-foreground">
                        +{held.items.length - 3} item lainnya
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleResume(held.id)}
                      className="flex-1"
                    >
                      <Play className="mr-1 h-3.5 w-3.5" />
                      Lanjutkan
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteHeldOrder(held.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
