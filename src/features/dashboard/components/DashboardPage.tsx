import { LayoutDashboard } from "lucide-react";

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <LayoutDashboard className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Revenue Hari Ini", value: "Rp 0" },
          { label: "Revenue Bulan Ini", value: "Rp 0" },
          { label: "Total Orders", value: "0" },
          { label: "Avg Order Value", value: "Rp 0" },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-lg border p-4 shadow-sm"
          >
            <div className="text-sm text-muted-foreground">{kpi.label}</div>
            <div className="mt-1 text-2xl font-bold">{kpi.value}</div>
          </div>
        ))}
      </div>
      <div className="rounded-lg border p-8 text-center text-muted-foreground">
        Charts dan analytics akan tersedia setelah ada data transaksi.
      </div>
    </div>
  );
}
