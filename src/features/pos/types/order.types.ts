export interface CreateOrderInput {
  order_type: "dine_in" | "take_away";
  table_number: string | null;
  customer_id: string | null;
  items: CreateOrderItemInput[];
  discount_type: "percentage" | "fixed" | null;
  discount_value: number;
  notes: string | null;
}

export interface CreateOrderItemInput {
  product_id: string;
  variant_id: string | null;
  product_name: string;
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

export interface CreatePaymentInput {
  order_id: string;
  method: "cash";
  amount: number;
  amount_received: number;
  change_amount: number;
}
