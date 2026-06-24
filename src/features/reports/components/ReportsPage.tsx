import { useState, useEffect } from "react";
import { BarChart3, Download, Loader2 } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "@/lib/utils/format-currency";
import { formatDate } from "@/lib/utils/format-date";
import {
  reportService,
  exportToCSV,
  type SalesReportSummary,
  type SalesReportRow,
} from "../services/report.service";
import type { Order } from "@/types/database.types";

export function ReportsPage() {
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split("T")[0];
  });
  const [dateTo, setDateTo] = useState(() =>
    new Date().toISOString().split("T")[0]
  );
  const [summary, setSummary] = useState<SalesReportSummary | null>(null);
  const [rows, setRows] = useState<SalesReportRow[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReport();
  }, [dateFrom, dateTo]);

  const loadReport = async () => {
    setLoading(true);
    try {
      const data = await reportService.getSalesReport({ dateFrom, dateTo });
      setSummary(data.summary);
      setRows(data.rows);
      setOrders(data.orders);
    } catch (err) {
      console.error("Failed to load report:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportOrders = () => {
    const data = orders.map((o) => ({
      "No. Order": o.order_number,
      Tanggal: formatDate(o.created_at),
      Tipe: o.order_type === "dine_in" ? "Dine In" : "Take Away",
      Subtotal: o.subtotal,
      Diskon: o.discount_amount,
      Pajak: o.tax_amount,
      Total: o.total,
      Status: o.status,
    }));
    exportToCSV(data, `laporan-penjualan-${dateFrom}-${dateTo}`);
  };

  const handleExportSummary = () => {
    const data = rows.map((r) => ({
      Tanggal: r.date,
      Order: r.orders,
      Revenue: r.revenue,
      "Rata-rata": r.avgOrder,
    }));
    exportToCSV(data, `ringkasan-harian-${dateFrom}-${dateTo}`);
  };

  const setPreset = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    setDateFrom(d.toISOString().split("T")[0]);
    setDateTo(new Date().toISOString().split("T")[0]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Laporan Penjualan</h1>
        </div>
        <button
          onClick={handleExportOrders}
          className="inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm hover:bg-accent"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium">Dari</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium">Sampai</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex gap-1">
          {[
            { label: "7H", days: 7 },
            { label: "14H", days: 14 },
            { label: "30H", days: 30 },
            { label: "90H", days: 90 },
          ].map((p) => (
            <button
              key={p.days}
              onClick={() => setPreset(p.days)}
              className="rounded-md border px-3 py-2 text-sm hover:bg-accent"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          {summary && (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <div className="rounded-lg border bg-card p-4">
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(summary.totalRevenue)}</p>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <p className="text-sm text-muted-foreground">Total Order</p>
                <p className="text-2xl font-bold">{summary.totalOrders}</p>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <p className="text-sm text-muted-foreground">Rata-rata Order</p>
                <p className="text-2xl font-bold">{formatCurrency(summary.avgOrderValue)}</p>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <p className="text-sm text-muted-foreground">Estimasi Profit</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(summary.totalProfit)}</p>
              </div>
            </div>
          )}

          {/* Chart */}
          {rows.length > 0 && (
            <div className="rounded-lg border bg-card p-4">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold">Revenue Harian</h2>
                <button
                  onClick={handleExportSummary}
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  <Download className="h-3 w-3" />
                  Export Ringkasan
                </button>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={rows}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v) => v.split("-").slice(1).join("/")}
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v) =>
                      v >= 1000000
                        ? `${(v / 1000000).toFixed(1)}jt`
                        : v >= 1000
                          ? `${(v / 1000).toFixed(0)}rb`
                          : v
                    }
                  />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Line type="monotone" dataKey="revenue" stroke="#171717" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Detail Table */}
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">No. Order</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Tanggal</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Tipe</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Subtotal</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Diskon</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Pajak</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                      Tidak ada data untuk periode ini
                    </td>
                  </tr>
                ) : (
                  orders.slice(0, 50).map((o) => (
                    <tr key={o.id} className="hover:bg-muted/50">
                      <td className="px-4 py-3 font-mono text-xs">{o.order_number}</td>
                      <td className="px-4 py-3 text-muted-foreground">{formatDate(o.created_at)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs ${o.order_type === "dine_in" ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"}`}>
                          {o.order_type === "dine_in" ? "Dine In" : "Take Away"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono">{formatCurrency(o.subtotal)}</td>
                      <td className="px-4 py-3 text-right font-mono text-destructive">
                        {o.discount_amount > 0 ? `-${formatCurrency(o.discount_amount)}` : "-"}
                      </td>
                      <td className="px-4 py-3 text-right font-mono">{formatCurrency(o.tax_amount)}</td>
                      <td className="px-4 py-3 text-right font-mono font-medium">{formatCurrency(o.total)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {orders.length > 50 && (
            <p className="text-center text-xs text-muted-foreground">
              Menampilkan 50 dari {orders.length} order
            </p>
          )}
        </>
      )}
    </div>
  );
}
