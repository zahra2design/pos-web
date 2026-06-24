import { useState, useEffect } from "react";
import {
  BarChart3,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Loader2,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { formatCurrency } from "@/lib/utils/format-currency";
import {
  dashboardService,
  type DashboardKPI,
  type SalesTrendPoint,
  type TopProduct,
  type CategoryRevenue,
} from "../services/dashboard.service";

const PIE_COLORS = [
  "#171717",
  "#525252",
  "#a3a3a3",
  "#d4d4d4",
  "#e5e5e5",
  "#f5f5f5",
];

export function DashboardPage() {
  const [kpi, setKpi] = useState<DashboardKPI | null>(null);
  const [trend, setTrend] = useState<SalesTrendPoint[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [categoryRevenue, setCategoryRevenue] = useState<CategoryRevenue[]>([]);
  const [loading, setLoading] = useState(true);
  const [trendDays, setTrendDays] = useState(7);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    dashboardService.getSalesTrend(trendDays).then(setTrend);
  }, [trendDays]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [kpiData, trendData, topData, catData] = await Promise.all([
        dashboardService.getKPI(),
        dashboardService.getSalesTrend(7),
        dashboardService.getTopProducts(10),
        dashboardService.getCategoryRevenue(),
      ]);
      setKpi(kpiData);
      setTrend(trendData);
      setTopProducts(topData);
      setCategoryRevenue(catData);
    } catch (err) {
      console.error("Failed to load dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const kpiCards = [
    {
      label: "Revenue Hari Ini",
      value: kpi?.revenueToday ?? 0,
      icon: DollarSign,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Revenue Bulan Ini",
      value: kpi?.revenueMonth ?? 0,
      icon: TrendingUp,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Order Hari Ini",
      value: kpi?.totalOrdersToday ?? 0,
      icon: ShoppingCart,
      color: "text-purple-600",
      bg: "bg-purple-50",
      isCurrency: false,
    },
    {
      label: "Rata-rata Order",
      value: kpi?.avgOrderValue ?? 0,
      icon: BarChart3,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BarChart3 className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((card) => (
          <div
            key={card.label}
            className="rounded-lg border bg-card p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{card.label}</p>
              <div className={`rounded-lg p-2 ${card.bg}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </div>
            <p className="mt-2 text-2xl font-bold">
              {card.isCurrency === false
                ? card.value
                : formatCurrency(card.value)}
            </p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Sales Trend */}
        <div className="rounded-lg border bg-card p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Tren Penjualan</h2>
            <div className="flex gap-1">
              {[7, 14, 30].map((d) => (
                <button
                  key={d}
                  onClick={() => setTrendDays(d)}
                  className={`rounded px-2 py-1 text-xs ${
                    trendDays === d
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {d}H
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trend}>
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
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                labelFormatter={(l) => `Tanggal: ${l}`}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#171717"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Products */}
        <div className="rounded-lg border bg-card p-4">
          <h2 className="mb-4 font-semibold">Produk Terlaris</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={topProducts} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis
                type="category"
                dataKey="name"
                width={100}
                tick={{ fontSize: 11 }}
              />
              <Tooltip formatter={(value: number) => `${value} item`} />
              <Bar dataKey="quantity" fill="#171717" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Revenue */}
      {categoryRevenue.length > 0 && (
        <div className="rounded-lg border bg-card p-4">
          <h2 className="mb-4 font-semibold">Revenue per Kategori</h2>
          <div className="flex items-center gap-8">
            <ResponsiveContainer width="50%" height={250}>
              <PieChart>
                <Pie
                  data={categoryRevenue}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="revenue"
                  nameKey="name"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {categoryRevenue.map((_, index) => (
                    <Cell
                      key={index}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {categoryRevenue.map((cat, i) => (
                <div key={cat.name} className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{
                      backgroundColor: PIE_COLORS[i % PIE_COLORS.length],
                    }}
                  />
                  <span className="flex-1 text-sm">{cat.name}</span>
                  <span className="text-sm font-medium">
                    {formatCurrency(cat.revenue)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
