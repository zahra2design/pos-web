import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { variantService } from "../services/product.service";
import { formatCurrency } from "@/lib/utils/format-currency";
import { Plus, Edit2, Trash2, Loader2, Check } from "lucide-react";
import type { ProductVariant } from "@/types/database.types";
import type { VariantFormData } from "../types/product.types";

const variantSchema = z.object({
  name: z.string().min(1, "Nama varian wajib diisi"),
  price_modifier: z.number().default(0),
  is_default: z.boolean().default(false),
});

interface VariantManagerProps {
  productId: string;
}

export function VariantManager({ productId }: VariantManagerProps) {
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(variantSchema),
    defaultValues: { name: "", price_modifier: 0, is_default: false },
  });

  useEffect(() => {
    loadVariants();
  }, [productId]);

  const loadVariants = async () => {
    setLoading(true);
    try {
      const data = await variantService.getVariants(productId);
      setVariants(data);
    } catch (err) {
      console.error("Failed to load variants:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingVariant(null);
    reset({ name: "", price_modifier: 0, is_default: variants.length === 0 });
    setShowForm(true);
  };

  const handleOpenEdit = (variant: ProductVariant) => {
    setEditingVariant(variant);
    reset({
      name: variant.name,
      price_modifier: variant.price_modifier,
      is_default: variant.is_default,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus varian ini?")) return;
    await variantService.deleteVariant(id);
    await loadVariants();
  };

  const handleFormSubmit = async (data: Record<string, unknown>) => {
    if (editingVariant) {
      await variantService.updateVariant(editingVariant.id, data as VariantFormData);
    } else {
      await variantService.createVariant(productId, data as VariantFormData);
    }
    setShowForm(false);
    await loadVariants();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Varian untuk produk ini (misal: Regular, Large)
        </p>
        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm hover:bg-accent"
        >
          <Plus className="h-3.5 w-3.5" />
          Tambah Varian
        </button>
      </div>

      {variants.length === 0 ? (
        <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
          Belum ada varian. Tambahkan varian jika produk punya ukuran atau tipe
          berbeda.
        </div>
      ) : (
        <div className="space-y-2">
          {variants.map((v) => (
            <div
              key={v.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div className="flex items-center gap-3">
                {v.is_default && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                    <Check className="h-3 w-3" /> Default
                  </span>
                )}
                <span className="font-medium">{v.name}</span>
                <span className="text-sm text-muted-foreground">
                  {v.price_modifier === 0
                    ? "Harga dasar"
                    : `${v.price_modifier > 0 ? "+" : ""}${formatCurrency(v.price_modifier)}`}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(v)}
                  className="rounded-md p-1.5 hover:bg-accent"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(v.id)}
                  className="rounded-md p-1.5 text-red-500 hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Inline Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="space-y-3 rounded-lg border bg-muted/30 p-4"
        >
          <h4 className="text-sm font-medium">
            {editingVariant ? "Edit Varian" : "Tambah Varian"}
          </h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium">Nama</label>
              <input
                type="text"
                placeholder="Regular / Large"
                className="w-full rounded-md border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Modifier Harga (Rp)</label>
              <input
                type="number"
                placeholder="0"
                className="w-full rounded-md border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                {...register("price_modifier")}
              />
            </div>
            <div className="flex items-end gap-2">
              <label className="flex items-center gap-1.5 text-xs">
                <input type="checkbox" className="rounded" {...register("is_default")} />
                Default
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {isSubmitting ? "..." : "Simpan"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
