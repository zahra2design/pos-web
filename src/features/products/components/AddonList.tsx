import { useState, useEffect } from "react";
import { addonService } from "../services/product.service";
import { AddonForm } from "./AddonForm";
import { formatCurrency } from "@/lib/utils/format-currency";
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Loader2,
} from "lucide-react";
import type { Addon } from "@/types/database.types";
import type { AddonFormData } from "../types/product.types";

const ADDON_CATEGORIES = [
  { value: "coffee", label: "Coffee" },
  { value: "milk", label: "Susu" },
  { value: "syrup", label: "Syrup" },
  { value: "topping", label: "Topping" },
  { value: "other", label: "Lainnya" },
];

export function AddonList() {
  const [addons, setAddons] = useState<Addon[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [showForm, setShowForm] = useState(false);
  const [editingAddon, setEditingAddon] = useState<Addon | null>(null);

  useEffect(() => {
    loadAddons();
  }, []);

  const loadAddons = async () => {
    setLoading(true);
    try {
      const data = await addonService.getAddons();
      setAddons(data);
    } catch (err) {
      console.error("Failed to load addons:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: AddonFormData) => {
    await addonService.createAddon(data);
    await loadAddons();
  };

  const handleUpdate = async (data: AddonFormData) => {
    if (!editingAddon) return;
    await addonService.updateAddon(editingAddon.id, data);
    await loadAddons();
  };

  const handleDelete = async (addon: Addon) => {
    if (!confirm(`Nonaktifkan addon "${addon.name}"?`)) return;
    await addonService.deleteAddon(addon.id);
    await loadAddons();
  };

  const handleOpenCreate = () => {
    setEditingAddon(null);
    setShowForm(true);
  };

  const handleOpenEdit = (addon: Addon) => {
    setEditingAddon(addon);
    setShowForm(true);
  };

  const filtered = addons.filter((a) => {
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory =
      categoryFilter === "all" || a.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  const getCategoryBadge = (cat: string | null) => {
    const colors: Record<string, string> = {
      coffee: "bg-amber-100 text-amber-700",
      milk: "bg-blue-100 text-blue-700",
      syrup: "bg-purple-100 text-purple-700",
      topping: "bg-pink-100 text-pink-700",
      other: "bg-gray-100 text-gray-700",
    };
    return colors[cat ?? "other"] ?? colors.other;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari addon..."
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
          {ADDON_CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Tambah Addon
        </button>
      </div>

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
                  Kategori
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  Harga
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
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    {search ? "Tidak ada addon yang cocok" : "Belum ada addon"}
                  </td>
                </tr>
              ) : (
                filtered.map((addon) => (
                  <tr key={addon.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3 font-medium">{addon.name}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getCategoryBadge(addon.category)}`}
                      >
                        {addon.category ?? "other"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono">
                      {formatCurrency(addon.price)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {addon.is_active ? (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                          Aktif
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
                          onClick={() => handleOpenEdit(addon)}
                          className="rounded-md p-1.5 hover:bg-accent"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(addon)}
                          className="rounded-md p-1.5 text-red-500 hover:bg-red-50"
                          title="Nonaktifkan"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <AddonForm
        open={showForm}
        onOpenChange={setShowForm}
        addon={editingAddon}
        onSubmit={editingAddon ? handleUpdate : handleCreate}
      />
    </div>
  );
}
