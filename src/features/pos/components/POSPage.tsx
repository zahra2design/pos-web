import { useState, useEffect } from "react";
import { useCartStore } from "@/stores/cart.store";
import { categoryService, productService } from "@/features/products/services/product.service";
import { ProductGrid } from "./ProductGrid";
import { Cart } from "./Cart";
import { HeldOrders } from "./HeldOrders";
import type { Category } from "@/types/database.types";
import type { ProductWithRelations } from "@/features/products/types/product.types";

export function POSPage() {
  const [products, setProducts] = useState<ProductWithRelations[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showHeld, setShowHeld] = useState(false);

  const heldOrders = useCartStore((s) => s.heldOrders);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [productsData, categoriesData] = await Promise.all([
        productService.getProducts(),
        categoryService.getCategories(),
      ]);
      setProducts(productsData.filter((p) => p.is_active && p.is_available));
      setCategories(categoriesData.filter((c) => c.is_active));
    } catch (err) {
      console.error("Failed to load POS data:", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.sku ?? "").toLowerCase().includes(search.toLowerCase());
    const matchCategory =
      categoryFilter === "all" || p.category_id === categoryFilter;
    return matchSearch && matchCategory;
  });

  return (
    <div className="flex h-[calc(100vh-7rem)] gap-4">
      {/* Left: Products */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Search + Category + Held Orders */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="Cari produk..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64 rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCategoryFilter("all")}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                categoryFilter === "all"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Semua
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  categoryFilter === cat.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
          {heldOrders.length > 0 && (
            <button
              onClick={() => setShowHeld(true)}
              className="ml-auto inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-accent"
            >
              Tahan ({heldOrders.length})
            </button>
          )}
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto">
          <ProductGrid products={filtered} loading={loading} />
        </div>
      </div>

      {/* Right: Cart */}
      <div className="w-80 flex-shrink-0">
        <Cart />
      </div>

      {/* Held Orders Dialog */}
      {showHeld && <HeldOrders onClose={() => setShowHeld(false)} />}
    </div>
  );
}
