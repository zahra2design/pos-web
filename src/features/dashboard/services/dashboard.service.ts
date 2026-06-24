import { supabase } from "@/lib/supabase/client";

export interface DashboardKPI {
  revenueToday: number;
  revenueMonth: number;
  totalOrdersToday: number;
  totalOrdersMonth: number;
  avgOrderValue: number;
}

export interface SalesTrendPoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface TopProduct {
  name: string;
  quantity: number;
  revenue: number;
}

export interface CategoryRevenue {
  name: string;
  revenue: number;
}

export const dashboardService = {
  async getKPI(): Promise<DashboardKPI> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString();

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthStr = monthStart.toISOString();

    const [todayOrders, monthOrders] = await Promise.all([
      supabase
        .from("orders")
        .select("total")
        .gte("created_at", todayStr)
        .neq("status", "cancelled"),
      supabase
        .from("orders")
        .select("total")
        .gte("created_at", monthStr)
        .neq("status", "cancelled"),
    ]);

    const todayData = todayOrders.data ?? [];
    const monthData = monthOrders.data ?? [];

    const revenueToday = todayData.reduce((s, o) => s + (o.total ?? 0), 0);
    const revenueMonth = monthData.reduce((s, o) => s + (o.total ?? 0), 0);
    const totalOrdersToday = todayData.length;
    const totalOrdersMonth = monthData.length;
    const avgOrderValue =
      totalOrdersMonth > 0 ? Math.round(revenueMonth / totalOrdersMonth) : 0;

    return {
      revenueToday,
      revenueMonth,
      totalOrdersToday,
      totalOrdersMonth,
      avgOrderValue,
    };
  },

  async getSalesTrend(days: number = 7): Promise<SalesTrendPoint[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from("orders")
      .select("total, created_at")
      .gte("created_at", startDate.toISOString())
      .neq("status", "cancelled")
      .order("created_at", { ascending: true });

    if (error) throw error;

    const grouped: Record<string, { revenue: number; orders: number }> = {};
    for (let i = 0; i < days; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (days - 1 - i));
      const key = d.toISOString().split("T")[0];
      grouped[key] = { revenue: 0, orders: 0 };
    }

    for (const order of data ?? []) {
      const key = order.created_at.split("T")[0];
      if (grouped[key]) {
        grouped[key].revenue += order.total ?? 0;
        grouped[key].orders += 1;
      }
    }

    return Object.entries(grouped).map(([date, val]) => ({
      date,
      revenue: val.revenue,
      orders: val.orders,
    }));
  },

  async getTopProducts(limit: number = 10): Promise<TopProduct[]> {
    const { data, error } = await supabase
      .from("order_items")
      .select("product_name, quantity, subtotal, order:orders!inner(status)")
      .neq("order.status", "cancelled")
      .limit(500);

    if (error) throw error;

    const grouped: Record<string, { quantity: number; revenue: number }> = {};
    for (const item of data ?? []) {
      const name = item.product_name;
      if (!grouped[name]) grouped[name] = { quantity: 0, revenue: 0 };
      grouped[name].quantity += item.quantity;
      grouped[name].revenue += item.subtotal;
    }

    return Object.entries(grouped)
      .map(([name, val]) => ({ name, ...val }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, limit);
  },

  async getCategoryRevenue(): Promise<CategoryRevenue[]> {
    const { data, error } = await supabase
      .from("order_items")
      .select(
        "subtotal, product:products!inner(category:categories!inner(name)), order:orders!inner(status)"
      )
      .neq("order.status", "cancelled")
      .limit(500);

    if (error) throw error;

    const grouped: Record<string, number> = {};
    for (const item of data ?? []) {
      const cat =
        (item.product as unknown as { category?: { name?: string } })?.category
          ?.name ?? "Lainnya";
      grouped[cat] = (grouped[cat] ?? 0) + (item.subtotal ?? 0);
    }

    return Object.entries(grouped)
      .map(([name, revenue]) => ({ name, revenue }))
      .sort((a, b) => b.revenue - a.revenue);
  },
};
