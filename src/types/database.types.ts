export interface Outlet {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  is_active: boolean;
  tax_rate: number;
  service_charge_rate: number;
  receipt_header: string | null;
  receipt_footer: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  name: string;
  role: "owner" | "manager" | "cashier" | "barista" | "inventory_staff";
  outlet_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string | null;
  category_id: string | null;
  price: number;
  cost: number;
  image_url: string | null;
  is_active: boolean;
  is_available: boolean;
  created_at: string;
  updated_at: string;
  category?: Category;
  variants?: ProductVariant[];
}

export interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  price_modifier: number;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface Addon {
  id: string;
  name: string;
  price: number;
  category: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  birthday: string | null;
  loyalty_points: number;
  loyalty_tier: "bronze" | "silver" | "gold";
  total_visits: number;
  total_spending: number;
  last_visit_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  order_type: "dine_in" | "take_away";
  table_number: string | null;
  status: "new" | "preparing" | "ready" | "completed" | "cancelled";
  customer_id: string | null;
  subtotal: number;
  discount_type: "percentage" | "fixed" | null;
  discount_value: number;
  discount_amount: number;
  tax_rate: number;
  tax_amount: number;
  service_charge_rate: number;
  service_charge_amount: number;
  total: number;
  notes: string | null;
  cashier_id: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  customer?: Customer;
  payments?: Payment[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  variant_id: string | null;
  product_name: string;
  variant_name: string | null;
  price: number;
  quantity: number;
  subtotal: number;
  notes: string | null;
  created_at: string;
  addons?: OrderItemAddon[];
}

export interface OrderItemAddon {
  id: string;
  order_item_id: string;
  addon_id: string | null;
  addon_name: string;
  price: number;
  created_at: string;
}

export interface Payment {
  id: string;
  order_id: string;
  method: "cash" | "debit" | "credit" | "qris" | "ewallet";
  amount: number;
  amount_received: number | null;
  change_amount: number;
  reference_number: string | null;
  created_at: string;
}

export interface Ingredient {
  id: string;
  name: string;
  unit: string;
  current_stock: number;
  minimum_stock: number;
  cost_per_unit: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Recipe {
  id: string;
  product_id: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  items?: RecipeItem[];
}

export interface RecipeItem {
  id: string;
  recipe_id: string;
  ingredient_id: string;
  quantity: number;
  created_at: string;
  ingredient?: Ingredient;
}

export interface InventoryTransaction {
  id: string;
  ingredient_id: string;
  type: "stock_in" | "stock_out" | "adjustment";
  quantity: number;
  reason: string | null;
  reference_id: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  ingredient?: Ingredient;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  table_name: string | null;
  record_id: string | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  created_at: string;
}
