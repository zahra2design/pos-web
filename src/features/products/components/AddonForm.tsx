import { useEffect } from "react";
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
import type { Addon } from "@/types/database.types";
import type { AddonFormData } from "../types/product.types";

const addonSchema = z.object({
  name: z.string().min(1, "Nama addon wajib diisi"),
  price: z.coerce.number().min(0, "Harga harus positif"),
  category: z.string().min(1, "Kategori wajib dipilih"),
  is_active: z.boolean().default(true),
});

const ADDON_CATEGORIES = [
  { value: "coffee", label: "Coffee" },
  { value: "milk", label: "Susu" },
  { value: "syrup", label: "Syrup" },
  { value: "topping", label: "Topping" },
  { value: "other", label: "Lainnya" },
];

interface AddonFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  addon?: Addon | null;
  onSubmit: (data: AddonFormData) => Promise<void>;
}

export function AddonForm({
  open,
  onOpenChange,
  addon,
  onSubmit,
}: AddonFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddonFormData>({
    resolver: zodResolver(addonSchema),
    defaultValues: {
      name: "",
      price: 0,
      category: "other",
      is_active: true,
    },
  });

  useEffect(() => {
    if (open) {
      if (addon) {
        reset({
          name: addon.name,
          price: addon.price,
          category: addon.category ?? "other",
          is_active: addon.is_active,
        });
      } else {
        reset({
          name: "",
          price: 0,
          category: "other",
          is_active: true,
        });
      }
    }
  }, [open, addon, reset]);

  const handleFormSubmit = async (data: AddonFormData) => {
    await onSubmit(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{addon ? "Edit Addon" : "Tambah Addon"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Addon</Label>
            <Input
              id="name"
              placeholder="Contoh: Extra Shot, Oat Milk"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Harga (Rp)</Label>
              <Input id="price" type="number" min={0} {...register("price")} />
              {errors.price && (
                <p className="text-xs text-destructive">{errors.price.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Kategori</Label>
              <select
                id="category"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                {...register("category")}
              >
                {ADDON_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-xs text-destructive">
                  {errors.category.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
