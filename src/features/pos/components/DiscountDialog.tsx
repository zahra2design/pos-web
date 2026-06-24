import { useState } from "react";
import { useCartStore } from "@/stores/cart.store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tag, X } from "lucide-react";

interface DiscountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DiscountDialog({ open, onOpenChange }: DiscountDialogProps) {
  const { discountType, discountValue, setDiscount, clearDiscount } =
    useCartStore();

  const [type, setType] = useState<"percentage" | "fixed">(
    discountType ?? "percentage"
  );
  const [value, setValue] = useState(String(discountValue));

  const handleApply = () => {
    const numValue = parseFloat(value) || 0;
    if (numValue <= 0) return;
    setDiscount(type, numValue);
    onOpenChange(false);
  };

  const handleRemove = () => {
    clearDiscount();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Diskon
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Type Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setType("percentage")}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
                type === "percentage"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              Persen (%)
            </button>
            <button
              onClick={() => setType("fixed")}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
                type === "fixed"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              Nominal (Rp)
            </button>
          </div>

          {/* Value Input */}
          <div className="space-y-2">
            <Label>
              {type === "percentage" ? "Diskon (%)" : "Diskon (Rp)"}
            </Label>
            <Input
              type="number"
              min={0}
              max={type === "percentage" ? 100 : undefined}
              placeholder={type === "percentage" ? "10" : "5000"}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              autoFocus
            />
          </div>

          {/* Actions */}
          <div className="flex justify-between">
            {discountType && (
              <Button variant="ghost" onClick={handleRemove} className="text-destructive">
                <X className="mr-1 h-4 w-4" />
                Hapus Diskon
              </Button>
            )}
            <div className="ml-auto flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Batal
              </Button>
              <Button onClick={handleApply}>Terapkan</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
