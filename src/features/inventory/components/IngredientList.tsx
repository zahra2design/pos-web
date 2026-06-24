import { useState, useEffect } from "react";
import { ingredientService } from "../services/inventory.service";
import { IngredientForm } from "./IngredientForm";
import { formatCurrency } from "@/lib/utils/format-currency";
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import type { Ingredient } from "@/types/database.types";
import type { IngredientFormData } from "../types/inventory.types";

const UNITS = [
  { value: "gram", label: "Gram" },
  { value: "ml", label: "ml" },
  { value: "pcs", label: "Pcs" },
  { value: "liter", label: "Liter" },
];

export function IngredientList() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [unitFilter, setUnitFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Ingredient | null>(null);
  const [showLowOnly, setShowLowOnly] = useState(false);

  useEffect(() => {
    loadIngredients();
  }, []);

  const loadIngredients = async () => {
    setLoading(true);
    try {
      const data = await ingredientService.getIngredients();
      setIngredients(data);
    } catch (err) {
      console.error("Failed to load ingredients:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: IngredientFormData) => {
    await ingredientService.createIngredient(data);
    await loadIngredients();
  };

  const handleUpdate = async (data: IngredientFormData) => {
    if (!editing) return;
    await ingredientService.updateIngredient(editing.id, data);
    await loadIngredients();
  };

  const handleDelete = async (ing: Ingredient) => {
    if (!confirm(`Nonaktifkan "${ing.name}"?`)) return;
    await ingredientService.deleteIngredient(ing.id);
    await loadIngredients();
  };

  const handleOpenCreate = () => {
    setEditing(null);
    setShowForm(true);
  };

  const handleOpenEdit = (ing: Ingredient) => {
    setEditing(ing);
    setShowForm(true);
  };

  const filtered = ingredients.filter((i) => {
    const matchSearch = i.name.toLowerCase().includes(search.toLowerCase());
    const matchUnit = unitFilter === "all" || i.unit === unitFilter;
    const matchLow = !showLowOnly || i.current_stock < i.minimum_stock;
    return matchSearch && matchUnit && matchLow;
  });

  const lowStockCount = ingredients.filter(
    (i) => i.is_active && i.current_stock < i.minimum_stock
  ).length;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari bahan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border bg-background py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <select
          value={unitFilter}
          onChange={(e) => setUnitFilter(e.target.value)}
          className="rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="all">Semua Satuan</option>
          {UNITS.map((u) => (
            <option key={u.value} value={u.value}>
              {u.label}
            </option>
          ))}
        </select>
        {lowStockCount > 0 && (
          <button
            onClick={() => setShowLowOnly(!showLowOnly)}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium ${
              showLowOnly
                ? "bg-red-100 text-red-700"
                : "border text-muted-foreground hover:bg-accent"
            }`}
          >
            <AlertTriangle className="h-4 w-4" />
            Stok Rendah ({lowStockCount})
          </button>
        )}
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Tambah Bahan
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Nama
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Satuan
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  Stok Saat Ini
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  Stok Minimum
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  Harga/Satuan
                </th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                  Status
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    {search ? "Tidak ada bahan yang cocok" : "Belum ada bahan"}
                  </td>
                </tr>
              ) : (
                filtered.map((ing) => {
                  const isLow = ing.current_stock < ing.minimum_stock;
                  return (
                    <tr
                      key={ing.id}
                      className={isLow ? "bg-red-50/50" : "hover:bg-muted/50"}
                    >
                      <td className="px-4 py-3 font-medium">{ing.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {ing.unit}
                      </td>
                      <td className="px-4 py-3 text-right font-mono">
                        <span className={isLow ? "font-bold text-red-600" : ""}>
                          {ing.current_stock}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-muted-foreground">
                        {ing.minimum_stock}
                      </td>
                      <td className="px-4 py-3 text-right font-mono">
                        {formatCurrency(ing.cost_per_unit)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {isLow ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                            <AlertTriangle className="h-3 w-3" />
                            Rendah
                          </span>
                        ) : ing.is_active ? (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                            Normal
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                            Nonaktif
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEdit(ing)}
                            className="rounded-md p-1.5 hover:bg-accent"
                            title="Edit"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(ing)}
                            className="rounded-md p-1.5 text-red-500 hover:bg-red-50"
                            title="Nonaktifkan"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      <IngredientForm
        open={showForm}
        onOpenChange={setShowForm}
        ingredient={editing}
        onSubmit={editing ? handleUpdate : handleCreate}
      />
    </div>
  );
}
