import { supabase } from "@/lib/supabase/client";
import type { Order, Payment } from "@/types/database.types";
import type { CreateOrderInput, CreatePaymentInput } from "../types/order.types";

export const orderService = {
  async createOrder(input: CreateOrderInput): Promise<Order> {
    const orderNumber = generateOrderNumber();

    const subtotal = input.items.reduce((sum, item) => {
      const addonTotal = item.addons.reduce((as, a) => as + a.price, 0);
      return sum + (item.price + addonTotal) * item.quantity;
    }, 0);

    const { data: outlet } = await supabase
      .from("outlets")
      .select("tax_rate, service_charge_rate")
      .limit(1)
      .single();

    const taxRate = outlet?.tax_rate ?? 11;
    const serviceChargeRate = outlet?.service_charge_rate ?? 0;

    let discountAmount = 0;
    if (input.discount_type === "percentage") {
      discountAmount = Math.round((subtotal * input.discount_value) / 100);
    } else if (input.discount_type === "fixed") {
      discountAmount = Math.min(input.discount_value, subtotal);
    }

    const afterDiscount = subtotal - discountAmount;
    const taxAmount = Math.round((afterDiscount * taxRate) / 100);
    const serviceChargeAmount = Math.round((afterDiscount * serviceChargeRate) / 100);
    const total = afterDiscount + taxAmount + serviceChargeAmount;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    let cashierId: string | null = null;
    if (user) {
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("id")
        .eq("id", user.id)
        .single();
      cashierId = profile?.id ?? null;
    }

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        order_type: input.order_type,
        table_number: input.table_number,
        status: "new",
        customer_id: input.customer_id,
        subtotal,
        discount_type: input.discount_type,
        discount_value: input.discount_value,
        discount_amount: discountAmount,
        tax_rate: taxRate,
        tax_amount: taxAmount,
        service_charge_rate: serviceChargeRate,
        service_charge_amount: serviceChargeAmount,
        total,
        notes: input.notes,
        cashier_id: cashierId,
      })
      .select()
      .single();

    if (orderError) throw orderError;

    for (const item of input.items) {
      const addonTotal = item.addons.reduce((as, a) => as + a.price, 0);
      const itemSubtotal = (item.price + addonTotal) * item.quantity;

      const { data: orderItem, error: itemError } = await supabase
        .from("order_items")
        .insert({
          order_id: order.id,
          product_id: item.product_id,
          variant_id: item.variant_id,
          product_name: item.product_name,
          variant_name: item.variant_name,
          price: item.price,
          quantity: item.quantity,
          subtotal: itemSubtotal,
          notes: item.notes,
        })
        .select()
        .single();

      if (itemError) throw itemError;

      if (item.addons.length > 0) {
        const addonRows = item.addons.map((a) => ({
          order_item_id: orderItem.id,
          addon_id: a.addon_id,
          addon_name: a.addon_name,
          price: a.price,
        }));
        const { error: addonError } = await supabase
          .from("order_item_addons")
          .insert(addonRows);
        if (addonError) throw addonError;
      }
    }

    return order as Order;
  },

  async createPayment(input: CreatePaymentInput): Promise<Payment> {
    const { data, error } = await supabase
      .from("payments")
      .insert(input)
      .select()
      .single();
    if (error) throw error;

    await supabase
      .from("orders")
      .update({ status: "new" })
      .eq("id", input.order_id);

    return data as Payment;
  },

  async getOrders(filters?: {
    dateFrom?: string;
    dateTo?: string;
    status?: string;
    limit?: number;
  }): Promise<Order[]> {
    let query = supabase
      .from("orders")
      .select("*, items:order_items(*, addons:order_item_addons(*)), payments:payments(*)")
      .order("created_at", { ascending: false });

    if (filters?.dateFrom) {
      query = query.gte("created_at", filters.dateFrom);
    }
    if (filters?.dateTo) {
      query = query.lte("created_at", filters.dateTo + "T23:59:59");
    }
    if (filters?.status) {
      query = query.eq("status", filters.status);
    }
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data as Order[]) ?? [];
  },

  async getOrder(id: string): Promise<Order | null> {
    const { data, error } = await supabase
      .from("orders")
      .select("*, items:order_items(*, addons:order_item_addons(*)), payments:payments(*)")
      .eq("id", id)
      .single();
    if (error) return null;
    return data as Order;
  },

  async updateOrderStatus(
    id: string,
    status: "new" | "preparing" | "ready" | "completed" | "cancelled"
  ): Promise<void> {
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", id);
    if (error) throw error;
  },
};

function generateOrderNumber(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const rand = String(Math.floor(Math.random() * 10000)).padStart(4, "0");
  return `INV-${y}${m}${d}-${rand}`;
}
