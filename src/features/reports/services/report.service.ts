import { supabase } from "@/lib/supabase/client";
import type { Order } from "@/types/database.types";

export interface SalesReportRow {
  date: string;
  orders: number;
  revenue: number;
  avgOrder: number;
}

export interface SalesReportSummary {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  totalProfit: number;
}

export const reportService = {
  async getSalesReport(filters: {
    dateFrom: string;
    dateTo: string;
  }): Promise<{ summary: SalesReportSummary; rows: SalesReportRow[]; orders: Order[] }> {
    const { data: orders, error } = await supabase
      .from("orders")
      .select("*, items:order_items(*)")
      .gte("created_at", filters.dateFrom)
      .lte("created_at", filters.dateTo + "T23:59:59")
      .neq("status", "cancelled")
      .order("created_at", { ascending: false });

    if (error) throw error;
    const orderList = (orders as Order[]) ?? [];

    const totalRevenue = orderList.reduce((s, o) => s + (o.total ?? 0), 0);
    const totalOrders = orderList.length;
    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    let totalCost = 0;
    for (const order of orderList) {
      if (order.items) {
        for (const item of order.items) {
          totalCost += (item as unknown as { cost?: number }).cost ?? 0;
        }
      }
    }
    const totalProfit = totalRevenue - totalCost;

    const grouped: Record<string, { orders: number; revenue: number }> = {};
    for (const order of orderList) {
      const key = order.created_at.split("T")[0];
      if (!grouped[key]) grouped[key] = { orders: 0, revenue: 0 };
      grouped[key].orders += 1;
      grouped[key].revenue += order.total ?? 0;
    }

    const rows: SalesReportRow[] = Object.entries(grouped)
      .map(([date, val]) => ({
        date,
        orders: val.orders,
        revenue: val.revenue,
        avgOrder: Math.round(val.revenue / val.orders),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      summary: { totalRevenue, totalOrders, avgOrderValue, totalProfit },
      rows,
      orders: orderList,
    };
  },
};

export function exportToCSV(data: Record<string, unknown>[], filename: string) {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((h) => {
          const val = row[h];
          const str = String(val ?? "");
          return str.includes(",") ? `"${str}"` : str;
        })
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
