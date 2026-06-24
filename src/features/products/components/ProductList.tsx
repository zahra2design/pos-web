import { useState, useEffect } from "react";
import { productService, categoryService } from "../services/product.service";
import { ProductForm } from "./ProductForm";
import { formatCurrency } from "@/lib/utils/format-currency";
import {
  Plus,
  Edit2,
  Search,
  Loader2,
  Package,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import type { Category, Product } from "@/types/database.types";
import type { ProductFormData, ProductWithRelations } from "../types/product.types";

export function ProductList() {
  const [products, setProducts] = useState<ProductWithRelations[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductWithRelations | null>(null);

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
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: ProductFormData) => {
    await productService.createProduct(data);
    await loadData();
  };

  const handleUpdate = async (data: ProductFormData) => {
    if (!editingProduct) return;
    await productService.updateProduct(editingProduct.id, data);
    await loadData();
  };

  const handleToggleActive = async (product: Product) => {
    await productService.updateProduct(product.id, {
      is_active: !product.is_active,
    });
    await loadData();
  };

  const handleToggleAvailable = async (product: Product) => {
    await productService.updateProduct(product.id, {
      is_available: !product.is_available,
    });
    await loadData();
  };

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleOpenEdit = (product: ProductWithRelations) => {
    setEditingProduct(product);
    setShowForm(true);
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
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari produk atau SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border bg-background py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="all">Semua Kategori</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Tambah Produk
        </button>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border p-8 text-center text-muted-foreground">
          <Package className="mx-auto mb-4 h-12 w-12" />
          <p>{search ? "Tidak ada produk yang cocok" : "Belum ada produk"}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((product) => (
            <div
              key={product.id}
              className="group relative overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-md"
            >
              {/* Image */}
              <div className="aspect-square bg-muted">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Package className="h-12 w-12 text-muted-foreground/50" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-3">
                <div className="mb-1 flex items-start justify-between">
                  <div>
                    <h3 className="font-medium leading-tight">{product.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {product.sku || "Tanpa SKU"}
                    </p>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs">
                    {product.category?.name || "-"}
                  </span>
                </div>

                <p className="text-lg font-bold text-primary">
                  {formatCurrency(product.price)}
                </p>

                {/* Variants */}
                {product.variants && product.variants.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {product.variants.map((v) => (
                      <span
                        key={v.id}
                        className="inline-flex items-center rounded bg-muted px-1.5 py-0.5 text-xs"
                      >
                        {v.name}
                        {v.price_modifier !== 0 && (
                          <span className="ml-1 text-muted-foreground">
                            ({v.price_modifier > 0 ? "+" : ""}
                            {formatCurrency(v.price_modifier)})
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                )}

                {/* Status + Actions */}
                <div className="mt-3 flex items-center justify-between border-t pt-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleActive(product)}
                      className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs ${
                        product.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                      title={product.is_active ? "Nonaktifkan" : "Aktifkan"}
                    >
                      {product.is_active ? (
                        <ToggleRight className="h-3 w-3" />
                      ) : (
                        <ToggleLeft className="h-3 w-3" />
                      )}
                      {product.is_active ? "Aktif" : "Nonaktif"}
                    </button>
                    <button
                      onClick={() => handleToggleAvailable(product)}
                      className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs ${
                        product.is_available
                          ? "bg-blue-100 text-blue-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                      title={product.is_available ? "Tandai habis" : "Tandai tersedia"}
                    >
                      {product.is_available ? "Tersedia" : "Habis"}
                    </button>
                  </div>
                  <button
                    onClick={() => handleOpenEdit(product)}
                    className="rounded-md p-1.5 hover:bg-accent"
                    title="Edit"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ProductForm
        open={showForm}
        onOpenChange={setShowForm}
        product={editingProduct}
        categories={categories}
        onSubmit={editingProduct ? handleUpdate : handleCreate}
      />
    </div>
  );
}
