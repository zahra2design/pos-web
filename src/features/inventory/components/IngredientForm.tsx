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
import type { Ingredient } from "@/types/database.types";
import type { IngredientFormData } from "../types/inventory.types";

const UNITS = [
  { value: "gram", label: "Gram" },
  { value: "ml", label: "ml" },
  { value: "pcs", label: "Pcs" },
  { value: "liter", label: "Liter" },
];

const schema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  unit: z.string().min(1, "Satuan wajib dipilih"),
  current_stock: z.number().min(0).default(0),
  minimum_stock: z.number().min(0).default(0),
  cost_per_unit: z.number().min(0).default(0),
  is_active: z.boolean().default(true),
});

interface IngredientFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ingredient?: Ingredient | null;
  onSubmit: (data: IngredientFormData) => Promise<void>;
}

export function IngredientForm({
  open,
  onOpenChange,
  ingredient,
  onSubmit,
}: IngredientFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      unit: "gram",
      current_stock: 0,
      minimum_stock: 0,
      cost_per_unit: 0,
      is_active: true,
    },
  });

  useEffect(() => {
    if (open) {
      if (ingredient) {
        reset({
          name: ingredient.name,
          unit: ingredient.unit,
          current_stock: ingredient.current_stock,
          minimum_stock: ingredient.minimum_stock,
          cost_per_unit: ingredient.cost_per_unit,
          is_active: ingredient.is_active,
        });
      } else {
        reset({
          name: "",
          unit: "gram",
          current_stock: 0,
          minimum_stock: 0,
          cost_per_unit: 0,
          is_active: true,
        });
      }
    }
  }, [open, ingredient, reset]);

  const handleFormSubmit = async (data: Record<string, unknown>) => {
    await onSubmit(data as unknown as IngredientFormData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {ingredient ? "Edit Bahan" : "Tambah Bahan"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Bahan</Label>
            <Input id="name" placeholder="Contoh: Coffee Beans" {...register("name")} />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="unit">Satuan</Label>
              <select
                id="unit"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                {...register("unit")}
              >
                {UNITS.map((u) => (
                  <option key={u.value} value={u.value}>
                    {u.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cost_per_unit">Harga/Satuan (Rp)</Label>
              <Input id="cost_per_unit" type="number" min={0} {...register("cost_per_unit")} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="current_stock">Stok Saat Ini</Label>
              <Input
                id="current_stock"
                type="number"
                min={0}
                {...register("current_stock")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minimum_stock">Stok Minimum</Label>
              <Input
                id="minimum_stock"
                type="number"
                min={0}
                {...register("minimum_stock")}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
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
