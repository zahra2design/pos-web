import { useState, useEffect } from "react";
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
import { ingredientService } from "../services/inventory.service";
import type { Ingredient } from "@/types/database.types";
import type { StockInFormData } from "../types/inventory.types";

const schema = z.object({
  ingredient_id: z.string().min(1, "Pilih bahan"),
  quantity: z.coerce.number().min(0.01, "Jumlah harus positif"),
  cost_per_unit: z.coerce.number().min(0).default(0),
  supplier: z.string().optional(),
  notes: z.string().optional(),
});

interface StockInFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: StockInFormData) => Promise<void>;
}

export function StockInForm({ open, onOpenChange, onSubmit }: StockInFormProps) {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<StockInFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      ingredient_id: "",
      quantity: 0,
      cost_per_unit: 0,
      supplier: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (open) {
      ingredientService.getIngredients().then((data) => {
        setIngredients(data.filter((i) => i.is_active));
      });
      reset({
        ingredient_id: "",
        quantity: 0,
        cost_per_unit: 0,
        supplier: "",
        notes: "",
      });
    }
  }, [open, reset]);

  const handleFormSubmit = async (data: StockInFormData) => {
    await onSubmit(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Stok Masuk</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ingredient_id">Bahan</Label>
            <select
              id="ingredient_id"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              {...register("ingredient_id")}
            >
              <option value="">Pilih bahan</option>
              {ingredients.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name} ({i.unit}) — stok: {i.current_stock}
                </option>
              ))}
            </select>
            {errors.ingredient_id && (
              <p className="text-xs text-destructive">
                {errors.ingredient_id.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Jumlah</Label>
              <Input id="quantity" type="number" min={0} step={0.01} {...register("quantity")} />
              {errors.quantity && (
                <p className="text-xs text-destructive">{errors.quantity.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="cost_per_unit">Harga/Satuan (Rp)</Label>
              <Input id="cost_per_unit" type="number" min={0} {...register("cost_per_unit")} />
              <p className="text-xs text-muted-foreground">Kosongkan jika tidak berubah</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="supplier">Supplier</Label>
            <Input id="supplier" placeholder="Nama supplier (opsional)" {...register("supplier")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Catatan</Label>
            <Input id="notes" placeholder="Catatan (opsional)" {...register("notes")} />
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
