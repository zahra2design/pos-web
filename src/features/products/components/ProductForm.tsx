import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { productService } from "../services/product.service";
import { VariantManager } from "./VariantManager";
import type { Category } from "@/types/database.types";
import type { ProductFormData, ProductWithRelations } from "../types/product.types";
import { ImagePlus, Loader2 } from "lucide-react";

const productSchema = z.object({
  name: z.string().min(1, "Nama produk wajib diisi"),
  sku: z.string().optional(),
  category_id: z.string().min(1, "Kategori wajib dipilih"),
  price: z.coerce.number().min(0, "Harga harus positif"),
  cost: z.coerce.number().min(0).default(0),
  image_url: z.string().nullable().optional(),
  is_active: z.boolean().default(true),
  is_available: z.boolean().default(true),
});

interface ProductFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: ProductWithRelations | null;
  categories: Category[];
  onSubmit: (data: ProductFormData) => Promise<void>;
}

export function ProductForm({
  open,
  onOpenChange,
  product,
  categories,
  onSubmit,
}: ProductFormProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<"info" | "variants">("info");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      sku: "",
      category_id: "",
      price: 0,
      cost: 0,
      image_url: null,
      is_active: true,
      is_available: true,
    },
  });

  const categoryId = watch("category_id");

  useEffect(() => {
    if (open) {
      if (product) {
        reset({
          name: product.name,
          sku: product.sku ?? "",
          category_id: product.category_id ?? "",
          price: product.price,
          cost: product.cost,
          image_url: product.image_url,
          is_active: product.is_active,
          is_available: product.is_available,
        });
        setImageUrl(product.image_url);
      } else {
        reset({
          name: "",
          sku: "",
          category_id: categories[0]?.id ?? "",
          price: 0,
          cost: 0,
          image_url: null,
          is_active: true,
          is_available: true,
        });
        setImageUrl(null);
      }
      setActiveTab("info");
    }
  }, [open, product, categories, reset]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Ukuran file maksimal 2MB");
      return;
    }

    setUploading(true);
    try {
      const tempId = product?.id ?? `temp-${Date.now()}`;
      const url = await productService.uploadImage(file, tempId);
      setImageUrl(url);
      setValue("image_url", url);
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Gagal upload gambar");
    } finally {
      setUploading(false);
    }
  };

  const handleFormSubmit = async (data: ProductFormData) => {
    const submitData = { ...data, image_url: imageUrl };
    await onSubmit(submitData);
    onOpenChange(false);
  };

  const handleAutoSku = async () => {
    const cat = categories.find((c) => c.id === categoryId);
    if (cat) {
      const sku = await productService.generateSku(cat.name);
      setValue("sku", sku);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {product ? "Edit Produk" : "Tambah Produk"}
          </DialogTitle>
        </DialogHeader>

        {/* Tabs */}
        {product && (
          <div className="flex gap-4 border-b">
            <button
              type="button"
              onClick={() => setActiveTab("info")}
              className={`border-b-2 pb-2 text-sm font-medium ${
                activeTab === "info"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Informasi Produk
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("variants")}
              className={`border-b-2 pb-2 text-sm font-medium ${
                activeTab === "variants"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Varian
            </button>
          </div>
        )}

        {activeTab === "info" ? (
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            {/* Image Upload */}
            <div className="space-y-2">
              <Label>Gambar Produk</Label>
              <div className="flex items-center gap-4">
                <div className="flex h-24 w-24 items-center justify-center rounded-lg border bg-muted">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="h-full w-full rounded-lg object-cover"
                    />
                  ) : (
                    <ImagePlus className="h-8 w-8 text-muted-foreground/50" />
                  )}
                </div>
                <div>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-accent">
                    {uploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ImagePlus className="h-4 w-4" />
                    )}
                    {uploading ? "Mengupload..." : "Pilih Gambar"}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={uploading}
                    />
                  </label>
                  <p className="mt-1 text-xs text-muted-foreground">
                    JPG, PNG, atau WebP. Maks 2MB.
                  </p>
                </div>
              </div>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Nama Produk</Label>
              <Input id="name" placeholder="Contoh: Latte" {...register("name")} />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>

            {/* SKU + Category */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <div className="flex gap-2">
                  <Input
                    id="sku"
                    placeholder="Otomatis jika kosong"
                    {...register("sku")}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAutoSku}
                    disabled={!categoryId}
                  >
                    Auto
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category_id">Kategori</Label>
                <select
                  id="category_id"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  {...register("category_id")}
                >
                  <option value="">Pilih Kategori</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {errors.category_id && (
                  <p className="text-xs text-destructive">
                    {errors.category_id.message}
                  </p>
                )}
              </div>
            </div>

            {/* Price + Cost */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Harga Jual (Rp)</Label>
                <Input
                  id="price"
                  type="number"
                  min={0}
                  {...register("price")}
                />
                {errors.price && (
                  <p className="text-xs text-destructive">{errors.price.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="cost">HPP (Rp)</Label>
                <Input
                  id="cost"
                  type="number"
                  min={0}
                  {...register("cost")}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting || uploading}>
                {isSubmitting ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </form>
        ) : (
          product && <VariantManager productId={product.id} />
        )}
      </DialogContent>
    </Dialog>
  );
}
