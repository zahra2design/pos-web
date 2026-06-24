import { ShoppingCart } from "lucide-react";

export function POSPage() {
  return (
    <div className="flex h-full gap-4">
      <div className="flex-1 space-y-4">
        <div className="flex items-center gap-3">
          <ShoppingCart className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Point of Sale</h1>
        </div>
        <div className="rounded-lg border p-8 text-center text-muted-foreground">
          POS screen akan tersedia setelah setup Supabase.
        </div>
      </div>
      <div className="w-80 rounded-lg border p-4">
        <h2 className="mb-4 font-semibold">Keranjang</h2>
        <p className="text-sm text-muted-foreground">Keranjang kosong</p>
      </div>
    </div>
  );
}
