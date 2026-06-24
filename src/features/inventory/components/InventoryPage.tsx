import { useState, useEffect } from "react";
import { Warehouse, ChefHat, ArrowDownUp, Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { IngredientList } from "./IngredientList";
import { RecipeManager } from "./RecipeManager";
import { StockInForm } from "./StockInForm";
import { StockAdjustmentForm } from "./StockAdjustmentForm";
import {
  inventoryService,
  ingredientService,
} from "../services/inventory.service";
import { productService } from "@/features/products/services/product.service";
import { formatDate } from "@/lib/utils/format-date";
import type { ProductWithRelations } from "@/features/products/types/product.types";
import type {
  StockInFormData,
  StockAdjustmentFormData,
} from "../types/inventory.types";
import type { TransactionWithIngredient } from "../services/inventory.service";

const tabs = [
  { id: "ingredients", label: "Bahan Baku", icon: Warehouse },
  { id: "recipes", label: "Resep", icon: ChefHat },
  { id: "transactions", label: "Riwayat", icon: ArrowDownUp },
];

const TX_TYPE_LABELS: Record<string, string> = {
  stock_in: "Stok Masuk",
  stock_out: "Stok Keluar",
  adjustment: "Penyesuaian",
};

const TX_TYPE_COLORS: Record<string, string> = {
  stock_in: "bg-green-100 text-green-700",
  stock_out: "bg-red-100 text-red-700",
  adjustment: "bg-yellow-100 text-yellow-700",
};

export function InventoryPage() {
  const [activeTab, setActiveTab] = useState("ingredients");
  const [showStockIn, setShowStockIn] = useState(false);
  const [showAdjustment, setShowAdjustment] = useState(false);
  const [transactions, setTransactions] = useState<TransactionWithIngredient[]>([]);
  const [products, setProducts] = useState<ProductWithRelations[]>([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [txLoading, setTxLoading] = useState(false);
  const [txTypeFilter, setTxTypeFilter] = useState("");
  const [lowStockCount, setLowStockCount] = useState(0);

  useEffect(() => {
    loadLowStock();
  }, []);

  useEffect(() => {
    if (activeTab === "transactions") loadTransactions();
    if (activeTab === "recipes") loadProducts();
  }, [activeTab]);

  const loadLowStock = async () => {
    try {
      const low = await ingredientService.getLowStock();
      setLowStockCount(low.length);
    } catch {}
  };

  const loadTransactions = async () => {
    setTxLoading(true);
    try {
      const data = await inventoryService.getTransactions({
        type: txTypeFilter || undefined,
        limit: 100,
      });
      setTransactions(data);
    } catch (err) {
      console.error("Failed to load transactions:", err);
    } finally {
      setTxLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const data = await productService.getProducts();
      setProducts(data.filter((p) => p.is_active));
    } catch {}
  };

  const handleStockIn = async (data: StockInFormData) => {
    await inventoryService.stockIn(data);
    await loadLowStock();
  };

  const handleAdjustment = async (data: StockAdjustmentFormData) => {
    await inventoryService.adjustStock(data);
    await loadLowStock();
  };

  useEffect(() => {
    if (activeTab === "transactions") loadTransactions();
  }, [txTypeFilter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Warehouse className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Inventory</h1>
          {lowStockCount > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
              {lowStockCount} stok rendah
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowStockIn(true)}
            className="inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm font-medium hover:bg-accent"
          >
            <Plus className="h-4 w-4" />
            Stok Masuk
          </button>
          <button
            onClick={() => setShowAdjustment(true)}
            className="inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm font-medium hover:bg-accent"
          >
            <ArrowDownUp className="h-4 w-4" />
            Penyesuaian
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 border-b-2 px-1 pb-3 text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "ingredients" && <IngredientList />}

      {activeTab === "recipes" && (
        <div className="space-y-4">
          <div className="max-w-sm">
            <label className="mb-1 block text-sm font-medium">Pilih Produk</label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Pilih produk untuk melihat resep</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          {selectedProduct && (
            <RecipeManager
              productId={selectedProduct}
              productName={
                products.find((p) => p.id === selectedProduct)?.name ?? ""
              }
            />
          )}
        </div>
      )}

      {activeTab === "transactions" && (
        <div className="space-y-4">
          <div className="max-w-xs">
            <select
              value={txTypeFilter}
              onChange={(e) => setTxTypeFilter(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Semua Tipe</option>
              <option value="stock_in">Stok Masuk</option>
              <option value="stock_out">Stok Keluar</option>
              <option value="adjustment">Penyesuaian</option>
            </select>
          </div>

          {txLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Tanggal
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Bahan
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Tipe
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                      Jumlah
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Catatan
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                        Belum ada transaksi
                      </td>
                    </tr>
                  ) : (
                    transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-muted/50">
                        <td className="px-4 py-3 text-muted-foreground">
                          {formatDate(tx.created_at)}
                        </td>
                        <td className="px-4 py-3 font-medium">
                          {tx.ingredient?.name ?? "-"}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${TX_TYPE_COLORS[tx.type] ?? ""}`}
                          >
                            {TX_TYPE_LABELS[tx.type] ?? tx.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-mono">
                          <span
                            className={
                              tx.quantity > 0 ? "text-green-600" : "text-red-600"
                            }
                          >
                            {tx.quantity > 0 ? "+" : ""}
                            {tx.quantity}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {tx.notes || tx.reason || "-"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <StockInForm
        open={showStockIn}
        onOpenChange={setShowStockIn}
        onSubmit={handleStockIn}
      />
      <StockAdjustmentForm
        open={showAdjustment}
        onOpenChange={setShowAdjustment}
        onSubmit={handleAdjustment}
      />
    </div>
  );
}
