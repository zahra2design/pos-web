import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase/client";
import { kdsService, type KDSOrder } from "../services/kds.service";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

export function useKitchenOrders() {
  const [orders, setOrders] = useState<KDSOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const ordersRef = useRef(orders);
  ordersRef.current = orders;

  const loadOrders = useCallback(async () => {
    try {
      const data = await kdsService.getActiveOrders();
      setOrders(data);
    } catch (err) {
      console.error("Failed to load KDS orders:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();

    const channel = supabase
      .channel("kds-orders")
      .on<KDSOrder>(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        async (payload: RealtimePostgresChangesPayload<KDSOrder>) => {
          const newOrder = payload.new as KDSOrder;
          const eventType = payload.eventType;

          if (eventType === "INSERT") {
            if (newOrder.status === "new") {
              const fullOrder = await kdsService
                .getActiveOrders()
                .then((orders) =>
                  orders.find((o) => o.id === newOrder.id)
                );
              if (fullOrder) {
                setOrders((prev) => [fullOrder, ...prev]);
              }
            }
          } else if (eventType === "UPDATE") {
            const status = newOrder.status;
            if (["new", "preparing", "ready"].includes(status)) {
              setOrders((prev) =>
                prev.map((o) =>
                  o.id === newOrder.id ? { ...o, ...newOrder } : o
                )
              );
            } else {
              setOrders((prev) => prev.filter((o) => o.id !== newOrder.id));
            }
          } else if (eventType === "DELETE") {
            const oldId = (payload.old as { id?: string })?.id;
            if (oldId) {
              setOrders((prev) => prev.filter((o) => o.id !== oldId));
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadOrders]);

  const moveToPreparing = useCallback(async (id: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: "preparing" as const } : o))
    );
    await kdsService.updateOrderStatus(id, "preparing");
  }, []);

  const moveToReady = useCallback(async (id: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: "ready" as const } : o))
    );
    await kdsService.updateOrderStatus(id, "ready");
  }, []);

  const moveToCompleted = useCallback(async (id: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== id));
    await kdsService.updateOrderStatus(id, "completed");
  }, []);

  return {
    orders,
    loading,
    moveToPreparing,
    moveToReady,
    moveToCompleted,
    refresh: loadOrders,
  };
}
