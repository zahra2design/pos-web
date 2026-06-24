import { Warehouse } from "lucide-react";

export function InventoryPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Warehouse className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Inventory</h1>
      </div>
      <div className="rounded-lg border p-8 text-center text-muted-foreground">
        Inventory management akan tersedia di Sprint 5.
      </div>
    </div>
  );
}
