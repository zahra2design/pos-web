import { Users } from "lucide-react";

export function CustomersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Users className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Pelanggan</h1>
      </div>
      <div className="rounded-lg border p-8 text-center text-muted-foreground">
        Customer management akan tersedia di Sprint 6.
      </div>
    </div>
  );
}
