import { BarChart3 } from "lucide-react";

export function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BarChart3 className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Laporan</h1>
      </div>
      <div className="rounded-lg border p-8 text-center text-muted-foreground">
        Reporting akan tersedia di Sprint 6.
      </div>
    </div>
  );
}
