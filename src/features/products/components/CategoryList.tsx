import { useState, useEffect } from "react";
import { categoryService } from "../services/product.service";
import { CategoryForm } from "./CategoryForm";
import { formatDate } from "@/lib/utils/format-date";
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Loader2,
  GripVertical,
} from "lucide-react";
import type { Category } from "@/types/database.types";
import type { CategoryFormData } from "../types/product.types";

export function CategoryList() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await categoryService.getCategories();
      setCategories(data);
    } catch (err) {
      console.error("Failed to load categories:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: CategoryFormData) => {
    await categoryService.createCategory(data);
    await loadCategories();
  };

  const handleUpdate = async (data: CategoryFormData) => {
    if (!editingCategory) return;
    await categoryService.updateCategory(editingCategory.id, data);
    await loadCategories();
  };

  const handleDelete = async (category: Category) => {
    if (!confirm(`Nonaktifkan kategori "${category.name}"?`)) return;
    await categoryService.deleteCategory(category.id);
    await loadCategories();
  };

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setShowForm(true);
  };

  const handleOpenEdit = (category: Category) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari kategori..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border bg-background py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Tambah Kategori
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
                <th className="w-10 px-4 py-3"></th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Nama
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Deskripsi
                </th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                  Urutan
                </th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                  Status
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Dibuat
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
                    {search ? "Tidak ada kategori yang cocok" : "Belum ada kategori"}
                  </td>
                </tr>
              ) : (
                filtered.map((cat) => (
                  <tr key={cat.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3 text-muted-foreground">
                      <GripVertical className="h-4 w-4" />
                    </td>
                    <td className="px-4 py-3 font-medium">{cat.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {cat.description || "-"}
                    </td>
                    <td className="px-4 py-3 text-center">{cat.display_order}</td>
                    <td className="px-4 py-3 text-center">
                      {cat.is_active ? (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                          Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                          Nonaktif
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(cat.created_at)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(cat)}
                          className="rounded-md p-1.5 hover:bg-accent"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat)}
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

      <CategoryForm
        open={showForm}
        onOpenChange={setShowForm}
        category={editingCategory}
        onSubmit={editingCategory ? handleUpdate : handleCreate}
      />
    </div>
  );
}
