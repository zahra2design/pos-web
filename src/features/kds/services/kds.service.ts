import { supabase } from "@/lib/supabase/client";
import type { Order, OrderItem } from "@/types/database.types";

export interface KDSOrder extends Order {
  items?: (OrderItem & { addons?: { addon_name: string; price: number }[] })[];
}

export const kdsService = {
  async getActiveOrders(): Promise<KDSOrder[]> {
    const { data, error } = await supabase
      .from("orders")
      .select("*, items:order_items(*, addons:order_item_addons(*))")
      .in("status", ["new", "preparing", "ready"])
      .order("created_at", { ascending: true });
    if (error) throw error;
    return (data as KDSOrder[]) ?? [];
  },

  async updateOrderStatus(
    id: string,
    status: "preparing" | "ready" | "completed"
  ): Promise<void> {
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", id);
    if (error) throw error;
  },
};
