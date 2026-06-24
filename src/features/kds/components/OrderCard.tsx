import { OrderTimer } from "./OrderTimer";
import {
  ChevronRight,
  Check,
  UtensilsCrossed,
  ShoppingBag,
  StickyNote,
} from "lucide-react";
import type { KDSOrder } from "../services/kds.service";

interface OrderCardProps {
  order: KDSOrder;
  onMoveNext: (id: string) => void;
  nextLabel: string;
  nextColor: string;
}

export function OrderCard({
  order,
  onMoveNext,
  nextLabel,
  nextColor,
}: OrderCardProps) {
  const isDineIn = order.order_type === "dine_in";

  return (
    <div className="overflow-hidden rounded-lg border bg-card shadow-sm transition-shadow hover:shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between border-b bg-muted/30 p-3">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold">{order.order_number}</span>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
              isDineIn
                ? "bg-blue-100 text-blue-700"
                : "bg-orange-100 text-orange-700"
            }`}
          >
            {isDineIn ? (
              <UtensilsCrossed className="h-3 w-3" />
            ) : (
              <ShoppingBag className="h-3 w-3" />
            )}
            {isDineIn
              ? `Dine In${order.table_number ? ` - Meja ${order.table_number}` : ""}`
              : "Take Away"}
          </span>
        </div>
        <OrderTimer createdAt={order.created_at} />
      </div>

      {/* Items */}
      <div className="space-y-1 p-3">
        {order.items?.map((item) => (
          <div key={item.id} className="text-sm">
            <div className="flex items-baseline justify-between">
              <span className="font-medium">
                {item.quantity}x {item.product_name}
                {item.variant_name && (
                  <span className="ml-1 text-muted-foreground">
                    ({item.variant_name})
                  </span>
                )}
              </span>
            </div>
            {item.addons && item.addons.length > 0 && (
              <div className="ml-4 text-xs text-muted-foreground">
                {item.addons.map((a, i) => (
                  <span key={i}>+ {a.addon_name} </span>
                ))}
              </div>
            )}
            {item.notes && (
              <div className="ml-4 flex items-center gap-1 text-xs text-amber-600">
                <StickyNote className="h-3 w-3" />
                <span className="italic">{item.notes}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Order Notes */}
      {order.notes && (
        <div className="mx-3 mb-3 flex items-start gap-1.5 rounded-md bg-amber-50 p-2 text-xs text-amber-700">
          <StickyNote className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
          <span>{order.notes}</span>
        </div>
      )}

      {/* Action Button */}
      <div className="border-t p-3">
        <button
          onClick={() => onMoveNext(order.id)}
          className={`flex w-full items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-white transition-colors ${nextColor}`}
        >
          {nextLabel === "Selesai" ? (
            <Check className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
          {nextLabel}
        </button>
      </div>
    </div>
  );
}
