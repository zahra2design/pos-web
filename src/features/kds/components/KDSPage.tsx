import { Monitor } from "lucide-react";

export function KDSPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Monitor className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Kitchen Display</h1>
      </div>
      <div className="rounded-lg border p-8 text-center text-muted-foreground">
        Kitchen Display System akan tersedia di Sprint 4.
      </div>
    </div>
  );
}
