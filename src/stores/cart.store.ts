import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string;
  product_id: string;
  product_name: string;
  variant_id: string | null;
  variant_name: string | null;
  price: number;
  quantity: number;
  notes: string | null;
  addons: {
    addon_id: string;
    addon_name: string;
    price: number;
  }[];
}

export interface HeldOrder {
  id: string;
  items: CartItem[];
  order_type: "dine_in" | "take_away";
  table_number: string | null;
  customer_name: string | null;
  created_at: string;
}

interface CartState {
  items: CartItem[];
  heldOrders: HeldOrder[];
  orderType: "dine_in" | "take_away";
  tableNumber: string | null;
  discountType: "percentage" | "fixed" | null;
  discountValue: number;
  addItem: (item: Omit<CartItem, "id" | "quantity" | "notes" | "addons">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateNotes: (id: string, notes: string) => void;
  addAddon: (itemId: string, addon: { addon_id: string; addon_name: string; price: number }) => void;
  removeAddon: (itemId: string, addonId: string) => void;
  setOrderType: (type: "dine_in" | "take_away") => void;
  setTableNumber: (table: string | null) => void;
  setDiscount: (type: "percentage" | "fixed" | null, value: number) => void;
  clearDiscount: () => void;
  holdOrder: () => void;
  resumeOrder: (id: string) => void;
  deleteHeldOrder: (id: string) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getDiscountAmount: () => number;
  getTaxAmount: (taxRate: number) => number;
  getTotal: (taxRate: number) => number;
}

let nextId = 1;

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      heldOrders: [],
      orderType: "dine_in",
      tableNumber: null,
      discountType: null,
      discountValue: 0,

      addItem: (item) => {
        const existing = get().items.find(
          (i) =>
            i.product_id === item.product_id &&
            i.variant_id === item.variant_id
        );
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.id === existing.id
                ? { ...i, quantity: i.quantity + 1 }
                : i
            ),
          });
        } else {
          set({
            items: [
              ...get().items,
              {
                ...item,
                id: `cart-${nextId++}`,
                quantity: 1,
                notes: null,
                addons: [],
              },
            ],
          });
        }
      },

      removeItem: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) });
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.id === id ? { ...i, quantity } : i
          ),
        });
      },

      updateNotes: (id, notes) => {
        set({
          items: get().items.map((i) =>
            i.id === id ? { ...i, notes } : i
          ),
        });
      },

      addAddon: (itemId, addon) => {
        set({
          items: get().items.map((i) =>
            i.id === itemId
              ? {
                  ...i,
                  addons: [
                    ...i.addons.filter((a) => a.addon_id !== addon.addon_id),
                    addon,
                  ],
                }
              : i
          ),
        });
      },

      removeAddon: (itemId, addonId) => {
        set({
          items: get().items.map((i) =>
            i.id === itemId
              ? {
                  ...i,
                  addons: i.addons.filter((a) => a.addon_id !== addonId),
                }
              : i
          ),
        });
      },

      setOrderType: (type) => set({ orderType: type }),
      setTableNumber: (table) => set({ tableNumber: table }),

      setDiscount: (type, value) =>
        set({ discountType: type, discountValue: value }),

      clearDiscount: () => set({ discountType: null, discountValue: 0 }),

      holdOrder: () => {
        const { items, orderType, tableNumber } = get();
        if (items.length === 0) return;

        const held: HeldOrder = {
          id: `held-${Date.now()}`,
          items: [...items],
          order_type: orderType,
          table_number: tableNumber,
          customer_name: null,
          created_at: new Date().toISOString(),
        };

        set({
          heldOrders: [...get().heldOrders, held],
          items: [],
          orderType: "dine_in",
          tableNumber: null,
          discountType: null,
          discountValue: 0,
        });
      },

      resumeOrder: (id) => {
        const held = get().heldOrders.find((h) => h.id === id);
        if (!held) return;

        set({
          items: held.items,
          orderType: held.order_type,
          tableNumber: held.table_number,
          heldOrders: get().heldOrders.filter((h) => h.id !== id),
        });
      },

      deleteHeldOrder: (id) => {
        set({
          heldOrders: get().heldOrders.filter((h) => h.id !== id),
        });
      },

      clearCart: () =>
        set({
          items: [],
          orderType: "dine_in",
          tableNumber: null,
          discountType: null,
          discountValue: 0,
        }),

      getSubtotal: () => {
        return get().items.reduce((sum, item) => {
          const addonTotal = item.addons.reduce(
            (as, a) => as + a.price,
            0
          );
          return sum + (item.price + addonTotal) * item.quantity;
        }, 0);
      },

      getDiscountAmount: () => {
        const { discountType, discountValue } = get();
        const subtotal = get().getSubtotal();
        if (!discountType || discountValue <= 0) return 0;
        if (discountType === "percentage") {
          return Math.round((subtotal * discountValue) / 100);
        }
        return Math.min(discountValue, subtotal);
      },

      getTaxAmount: (taxRate) => {
        const subtotal = get().getSubtotal();
        const discount = get().getDiscountAmount();
        return Math.round(((subtotal - discount) * taxRate) / 100);
      },

      getTotal: (taxRate) => {
        const subtotal = get().getSubtotal();
        const discount = get().getDiscountAmount();
        const tax = get().getTaxAmount(taxRate);
        return subtotal - discount + tax;
      },
    }),
    {
      name: "cafe-pos-cart",
      partialize: (state) => ({
        heldOrders: state.heldOrders,
      }),
    }
  )
);
