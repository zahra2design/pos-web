import { useState } from "react";
import { useCartStore } from "@/stores/cart.store";
import { formatCurrency } from "@/lib/utils/format-currency";
import {
  ShoppingCart,
  Minus,
  Plus,
  Trash2,
  StickyNote,
  Pause,
  CreditCard,
  Tag,
} from "lucide-react";
import { CheckoutDialog } from "./CheckoutDialog";
import { DiscountDialog } from "./DiscountDialog";

export function Cart() {
  const {
    items,
    orderType,
    tableNumber,
    discountType,
    removeItem,
    updateQuantity,
    updateNotes,
    setOrderType,
    setTableNumber,
    holdOrder,
    clearCart,
    getSubtotal,
    getDiscountAmount,
  } = useCartStore();

  const [showCheckout, setShowCheckout] = useState(false);
  const [showDiscount, setShowDiscount] = useState(false);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesText, setNotesText] = useState("");

  const subtotal = getSubtotal();
  const discountAmount = getDiscountAmount();

  const handleHold = () => {
    if (items.length === 0) return;
    holdOrder();
  };

  const handleStartNotes = (itemId: string, currentNotes: string | null) => {
    setEditingNotes(itemId);
    setNotesText(currentNotes ?? "");
  };

  const handleSaveNotes = (itemId: string) => {
    updateNotes(itemId, notesText);
    setEditingNotes(null);
  };

  return (
    <div className="flex h-full flex-col rounded-lg border bg-card">
      {/* Header */}
      <div className="border-b p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-semibold">
            <ShoppingCart className="h-5 w-5" />
            Keranjang
          </h2>
          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs text-destructive hover:underline"
            >
              Kosongkan
            </button>
          )}
        </div>

        {/* Order Type */}
        <div className="flex gap-2">
          <button
            onClick={() => setOrderType("dine_in")}
            className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-colors ${
              orderType === "dine_in"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            Dine In
          </button>
          <button
            onClick={() => setOrderType("take_away")}
            className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-colors ${
              orderType === "take_away"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            Take Away
          </button>
        </div>

        {/* Table Number (Dine In) */}
        {orderType === "dine_in" && (
          <input
            type="text"
            placeholder="No. Meja"
            value={tableNumber ?? ""}
            onChange={(e) => setTableNumber(e.target.value || null)}
            className="mt-2 w-full rounded-md border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        )}
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto p-4">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <ShoppingCart className="mb-2 h-8 w-8" />
            <p className="text-sm">Keranjang kosong</p>
            <p className="text-xs">Pilih produk untuk ditambahkan</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="rounded-lg border p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium">{item.product_name}</h4>
                    {item.variant_name && (
                      <p className="text-xs text-muted-foreground">
                        {item.variant_name}
                      </p>
                    )}
                    {item.addons.length > 0 && (
                      <div className="mt-0.5 flex flex-wrap gap-1">
                        {item.addons.map((a) => (
                          <span
                            key={a.addon_id}
                            className="inline-flex items-center rounded bg-muted px-1 py-0.5 text-xs"
                          >
                            +{a.addon_name}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="mt-1 text-xs font-medium text-primary">
                      {formatCurrency(item.price)}
                    </p>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="rounded p-1 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Notes */}
                {editingNotes === item.id ? (
                  <div className="mt-2 flex gap-1">
                    <input
                      type="text"
                      value={notesText}
                      onChange={(e) => setNotesText(e.target.value)}
                      placeholder="Catatan..."
                      className="flex-1 rounded border bg-background px-2 py-1 text-xs focus:outline-none"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveNotes(item.id);
                        if (e.key === "Escape") setEditingNotes(null);
                      }}
                    />
                    <button
                      onClick={() => handleSaveNotes(item.id)}
                      className="rounded bg-primary px-2 py-1 text-xs text-primary-foreground"
                    >
                      OK
                    </button>
                  </div>
                ) : item.notes ? (
                  <button
                    onClick={() => handleStartNotes(item.id, item.notes)}
                    className="mt-1 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <StickyNote className="h-3 w-3" />
                    {item.notes}
                  </button>
                ) : null}

                {/* Quantity */}
                <div className="mt-2 flex items-center justify-between">
                  <button
                    onClick={() => handleStartNotes(item.id, item.notes)}
                    className="rounded p-1 text-muted-foreground hover:bg-accent"
                    title="Tambah catatan"
                  >
                    <StickyNote className="h-3.5 w-3.5" />
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="flex h-6 w-6 items-center justify-center rounded border hover:bg-accent"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-6 text-center text-sm font-medium">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="flex h-6 w-6 items-center justify-center rounded border hover:bg-accent"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary + Actions */}
      {items.length > 0 && (
        <div className="border-t p-4">
          {/* Discount */}
          <div className="mb-2 flex items-center justify-between text-sm">
            <button
              onClick={() => setShowDiscount(true)}
              className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
            >
              <Tag className="h-3.5 w-3.5" />
              Diskon
            </button>
            {discountType && (
              <span className="text-destructive">
                -{formatCurrency(discountAmount)}
              </span>
            )}
          </div>

          {/* Subtotal */}
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Subtotal</span>
            <span className="text-lg font-bold">{formatCurrency(subtotal - discountAmount)}</span>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleHold}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md border px-3 py-2 text-sm font-medium hover:bg-accent"
            >
              <Pause className="h-4 w-4" />
              Tahan
            </button>
            <button
              onClick={() => setShowCheckout(true)}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <CreditCard className="h-4 w-4" />
              Bayar
            </button>
          </div>
        </div>
      )}

      <CheckoutDialog open={showCheckout} onOpenChange={setShowCheckout} />
      <DiscountDialog open={showDiscount} onOpenChange={setShowDiscount} />
    </div>
  );
}
