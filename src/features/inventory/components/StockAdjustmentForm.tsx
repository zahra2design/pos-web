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
import type { StockAdjustmentFormData } from "../types/inventory.types";

const REASONS = [
  { value: "damaged", label: "Rusak" },
  { value: "expired", label: "Kadaluarsa" },
  { value: "missing", label: "Hilang" },
  { value: "other", label: "Lainnya" },
];

const schema = z.object({
  ingredient_id: z.string().min(1, "Pilih bahan"),
  quantity: z.number(),
  reason: z.string().min(1, "Pilih alasan"),
  notes: z.string().optional(),
});

interface StockAdjustmentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: StockAdjustmentFormData) => Promise<void>;
}

export function StockAdjustmentForm({
  open,
  onOpenChange,
  onSubmit,
}: StockAdjustmentFormProps) {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      ingredient_id: "",
      quantity: 0,
      reason: "damaged",
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
        reason: "damaged",
        notes: "",
      });
    }
  }, [open, reset]);

  const handleFormSubmit = async (data: Record<string, unknown>) => {
    await onSubmit(data as unknown as StockAdjustmentFormData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Penyesuaian Stok</DialogTitle>
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
              <Label htmlFor="quantity">Jumlah (+/-)</Label>
              <Input
                id="quantity"
                type="number"
                step={0.01}
                placeholder="+ untuk tambah, - untuk kurang"
                {...register("quantity")}
              />
              <p className="text-xs text-muted-foreground">
                Positif = penambahan, Negatif = pengurangan
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Alasan</Label>
              <select
                id="reason"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                {...register("reason")}
              >
                {REASONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
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
