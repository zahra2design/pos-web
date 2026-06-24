import { useKitchenOrders } from "../hooks/useKitchenOrders";
import { OrderCard } from "./OrderCard";
import { Monitor, Loader2, RefreshCw } from "lucide-react";

const columns = [
  {
    status: "new" as const,
    label: "Baru",
    color: "bg-blue-500 hover:bg-blue-600",
    headerBg: "bg-blue-50 border-blue-200",
    headerText: "text-blue-700",
    nextLabel: "Mulai Buat",
    nextStatus: "preparing" as const,
  },
  {
    status: "preparing" as const,
    label: "Sedang Dibuat",
    color: "bg-amber-500 hover:bg-amber-600",
    headerBg: "bg-amber-50 border-amber-200",
    headerText: "text-amber-700",
    nextLabel: "Siap",
    nextStatus: "ready" as const,
  },
  {
    status: "ready" as const,
    label: "Siap Diambil",
    color: "bg-green-500 hover:bg-green-600",
    headerBg: "bg-green-50 border-green-200",
    headerText: "text-green-700",
    nextLabel: "Selesai",
    nextStatus: "completed" as const,
  },
];

export function KDSPage() {
  const { orders, loading, moveToPreparing, moveToReady, moveToCompleted, refresh } =
    useKitchenOrders();

  const handleMoveNext = (id: string, targetStatus: string) => {
    if (targetStatus === "preparing") moveToPreparing(id);
    else if (targetStatus === "ready") moveToReady(id);
    else if (targetStatus === "completed") moveToCompleted(id);
  };

  const getOrdersByStatus = (status: string) =>
    orders.filter((o) => o.status === status);

  const totalActive = orders.length;

  return (
    <div className="flex h-[calc(100vh-7rem)] flex-col">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Monitor className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Kitchen Display</h1>
          {totalActive > 0 && (
            <span className="inline-flex items-center rounded-full bg-primary px-2.5 py-0.5 text-xs font-medium text-primary-foreground">
              {totalActive} pesanan aktif
            </span>
          )}
        </div>
        <button
          onClick={refresh}
          className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm hover:bg-accent"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Columns */}
      {loading ? (
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid min-h-0 flex-1 grid-cols-3 gap-4">
          {columns.map((col) => {
            const colOrders = getOrdersByStatus(col.status);
            return (
              <div
                key={col.status}
                className="flex min-h-0 flex-col rounded-lg border"
              >
                {/* Column Header */}
                <div
                  className={`flex items-center justify-between border-b px-4 py-2.5 ${col.headerBg}`}
                >
                  <h2 className={`text-sm font-semibold ${col.headerText}`}>
                    {col.label}
                  </h2>
                  <span
                    className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${col.headerText} bg-white`}
                  >
                    {colOrders.length}
                  </span>
                </div>

                {/* Column Content */}
                <div className="flex-1 space-y-3 overflow-y-auto p-3">
                  {colOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                      <p className="text-sm">Tidak ada pesanan</p>
                    </div>
                  ) : (
                    colOrders.map((order) => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        onMoveNext={(id) => handleMoveNext(id, col.nextStatus)}
                        nextLabel={col.nextLabel}
                        nextColor={col.color}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
