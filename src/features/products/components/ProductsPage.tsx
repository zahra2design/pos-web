import { Package } from "lucide-react";

export function ProductsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Package className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Produk</h1>
        </div>
        <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          Tambah Produk
        </button>
      </div>
      <div className="rounded-lg border p-8 text-center text-muted-foreground">
        Daftar produk akan tersedia setelah setup Supabase.
      </div>
    </div>
  );
}
