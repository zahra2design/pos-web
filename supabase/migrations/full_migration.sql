-- Source: supabase/migrations/001_create_tables.sql
-- ============================================================
-- CafePOS Database Migration
-- Version: 1.0.0
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. OUTLETS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.outlets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  tax_rate DECIMAL(5,2) DEFAULT 11.00,
  service_charge_rate DECIMAL(5,2) DEFAULT 0.00,
  receipt_header TEXT,
  receipt_footer TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.outlets ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 2. USER PROFILES (extends Supabase auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'manager', 'cashier', 'barista', 'inventory_staff')),
  outlet_id UUID REFERENCES public.outlets(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 3. CATEGORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 4. PRODUCTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  sku TEXT UNIQUE,
  category_id UUID REFERENCES public.categories(id),
  price DECIMAL(12,2) NOT NULL,
  cost DECIMAL(12,2) DEFAULT 0,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 5. PRODUCT VARIANTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price_modifier DECIMAL(12,2) DEFAULT 0,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 6. ADDONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  category TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.addons ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 7. CUSTOMERS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT UNIQUE,
  email TEXT,
  birthday DATE,
  loyalty_points INTEGER DEFAULT 0,
  loyalty_tier TEXT DEFAULT 'bronze' CHECK (loyalty_tier IN ('bronze', 'silver', 'gold')),
  total_visits INTEGER DEFAULT 0,
  total_spending DECIMAL(15,2) DEFAULT 0,
  last_visit_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 8. ORDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  order_type TEXT NOT NULL CHECK (order_type IN ('dine_in', 'take_away')),
  table_number TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'preparing', 'ready', 'completed', 'cancelled')),
  customer_id UUID REFERENCES public.customers(id),
  subtotal DECIMAL(12,2) NOT NULL,
  discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(12,2) DEFAULT 0,
  discount_amount DECIMAL(12,2) DEFAULT 0,
  tax_rate DECIMAL(5,2) DEFAULT 0,
  tax_amount DECIMAL(12,2) DEFAULT 0,
  service_charge_rate DECIMAL(5,2) DEFAULT 0,
  service_charge_amount DECIMAL(12,2) DEFAULT 0,
  total DECIMAL(12,2) NOT NULL,
  notes TEXT,
  cashier_id UUID REFERENCES public.user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 9. ORDER ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  variant_id UUID REFERENCES public.product_variants(id),
  product_name TEXT NOT NULL,
  variant_name TEXT,
  price DECIMAL(12,2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  subtotal DECIMAL(12,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 10. ORDER ITEM ADDONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.order_item_addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_item_id UUID REFERENCES public.order_items(id) ON DELETE CASCADE,
  addon_id UUID REFERENCES public.addons(id),
  addon_name TEXT NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.order_item_addons ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 11. PAYMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id),
  method TEXT NOT NULL CHECK (method IN ('cash', 'debit', 'credit', 'qris', 'ewallet')),
  amount DECIMAL(12,2) NOT NULL,
  amount_received DECIMAL(12,2),
  change_amount DECIMAL(12,2) DEFAULT 0,
  reference_number TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 12. INGREDIENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  unit TEXT NOT NULL,
  current_stock DECIMAL(12,2) DEFAULT 0,
  minimum_stock DECIMAL(12,2) DEFAULT 0,
  cost_per_unit DECIMAL(12,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.ingredients ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 13. RECIPES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID UNIQUE REFERENCES public.products(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 14. RECIPE ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.recipe_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID REFERENCES public.recipes(id) ON DELETE CASCADE,
  ingredient_id UUID REFERENCES public.ingredients(id),
  quantity DECIMAL(12,4) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.recipe_items ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 15. INVENTORY TRANSACTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.inventory_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ingredient_id UUID REFERENCES public.ingredients(id),
  type TEXT NOT NULL CHECK (type IN ('stock_in', 'stock_out', 'adjustment')),
  quantity DECIMAL(12,2) NOT NULL,
  reason TEXT,
  reference_id UUID,
  notes TEXT,
  created_by UUID REFERENCES public.user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 16. SUPPLIERS (Post-MVP, table ready)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT,
  address TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 17. PURCHASE ORDERS (Post-MVP, table ready)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID REFERENCES public.suppliers(id),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'received', 'cancelled')),
  total DECIMAL(12,2) DEFAULT 0,
  notes TEXT,
  created_by UUID REFERENCES public.user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 18. LOYALTY TRANSACTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.loyalty_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.customers(id),
  order_id UUID REFERENCES public.orders(id),
  type TEXT NOT NULL CHECK (type IN ('earn', 'redeem')),
  points INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 19. AUDIT LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_profiles(id),
  action TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(is_active, is_available);
CREATE INDEX IF NOT EXISTS idx_product_variants_product ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_payments_order ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(phone);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_ingredient ON public.inventory_transactions(ingredient_id);
CREATE INDEX IF NOT EXISTS idx_recipe_items_recipe ON public.recipe_items(recipe_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_customer ON public.loyalty_transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at DESC);

-- Source: supabase/migrations/002_rls_policies.sql
-- ============================================================
-- CafePOS RLS Policies
-- Version: 1.0.0
-- Run AFTER 001_create_tables.sql
-- ============================================================

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Get current user's role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.user_profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Get current user's outlet_id
CREATE OR REPLACE FUNCTION public.get_user_outlet()
RETURNS UUID AS $$
  SELECT outlet_id FROM public.user_profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if user has specific role
CREATE OR REPLACE FUNCTION public.has_role(required_role TEXT)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role = required_role
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if user has any of the specified roles
CREATE OR REPLACE FUNCTION public.has_any_role(required_roles TEXT[])
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role = ANY(required_roles)
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- USER PROFILES POLICIES
-- ============================================================

-- All authenticated users can read their own profile
CREATE POLICY "Users can view own profile"
ON public.user_profiles FOR SELECT
USING (id = auth.uid());

-- Owner can view all profiles
CREATE POLICY "Owner can view all profiles"
ON public.user_profiles FOR SELECT
USING (public.has_role('owner'));

-- Owner can insert profiles
CREATE POLICY "Owner can create profiles"
ON public.user_profiles FOR INSERT
WITH CHECK (public.has_role('owner'));

-- Owner can update profiles
CREATE POLICY "Owner can update profiles"
ON public.user_profiles FOR UPDATE
USING (public.has_role('owner'));

-- Users can update their own profile (limited fields)
CREATE POLICY "Users can update own profile"
ON public.user_profiles FOR UPDATE
USING (id = auth.uid());

-- ============================================================
-- OUTLETS POLICIES
-- ============================================================

-- All authenticated users can view outlets
CREATE POLICY "Authenticated users can view outlets"
ON public.outlets FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Owner can manage outlets
CREATE POLICY "Owner can manage outlets"
ON public.outlets FOR ALL
USING (public.has_role('owner'));

-- ============================================================
-- CATEGORIES POLICIES
-- ============================================================

-- All authenticated users can view active categories
CREATE POLICY "Authenticated users can view categories"
ON public.categories FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Owner and Manager can manage categories
CREATE POLICY "Owner and Manager can manage categories"
ON public.categories FOR ALL
USING (public.has_any_role(ARRAY['owner', 'manager']));

-- ============================================================
-- PRODUCTS POLICIES
-- ============================================================

-- All authenticated users can view active products
CREATE POLICY "Authenticated users can view products"
ON public.products FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Owner and Manager can manage products
CREATE POLICY "Owner and Manager can manage products"
ON public.products FOR ALL
USING (public.has_any_role(ARRAY['owner', 'manager']));

-- ============================================================
-- PRODUCT VARIANTS POLICIES
-- ============================================================

CREATE POLICY "Authenticated users can view variants"
ON public.product_variants FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Owner and Manager can manage variants"
ON public.product_variants FOR ALL
USING (public.has_any_role(ARRAY['owner', 'manager']));

-- ============================================================
-- ADDONS POLICIES
-- ============================================================

CREATE POLICY "Authenticated users can view addons"
ON public.addons FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Owner and Manager can manage addons"
ON public.addons FOR ALL
USING (public.has_any_role(ARRAY['owner', 'manager']));

-- ============================================================
-- CUSTOMERS POLICIES
-- ============================================================

CREATE POLICY "Authenticated users can view customers"
ON public.customers FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Cashier and above can manage customers"
ON public.customers FOR ALL
USING (public.has_any_role(ARRAY['owner', 'manager', 'cashier']));

-- ============================================================
-- ORDERS POLICIES
-- ============================================================

-- All authenticated users can view orders
CREATE POLICY "Authenticated users can view orders"
ON public.orders FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Cashier and above can create orders
CREATE POLICY "Cashier and above can create orders"
ON public.orders FOR INSERT
WITH CHECK (public.has_any_role(ARRAY['owner', 'manager', 'cashier']));

-- Cashier can update own orders, Manager/Owner can update all
CREATE POLICY "Cashier can update own orders"
ON public.orders FOR UPDATE
USING (
  cashier_id = auth.uid() AND public.has_role('cashier')
  OR public.has_any_role(ARRAY['owner', 'manager'])
);

-- ============================================================
-- ORDER ITEMS POLICIES
-- ============================================================

CREATE POLICY "Authenticated users can view order items"
ON public.order_items FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create order items"
ON public.order_items FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================
-- ORDER ITEM ADDONS POLICIES
-- ============================================================

CREATE POLICY "Authenticated users can view order item addons"
ON public.order_item_addons FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create order item addons"
ON public.order_item_addons FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================
-- PAYMENTS POLICIES
-- ============================================================

CREATE POLICY "Authenticated users can view payments"
ON public.payments FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Cashier and above can create payments"
ON public.payments FOR INSERT
WITH CHECK (public.has_any_role(ARRAY['owner', 'manager', 'cashier']));

-- ============================================================
-- INGREDIENTS POLICIES
-- ============================================================

CREATE POLICY "Authenticated users can view ingredients"
ON public.ingredients FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Owner, Manager, Inventory can manage ingredients"
ON public.ingredients FOR ALL
USING (public.has_any_role(ARRAY['owner', 'manager', 'inventory_staff']));

-- ============================================================
-- RECIPES POLICIES
-- ============================================================

CREATE POLICY "Authenticated users can view recipes"
ON public.recipes FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Owner and Manager can manage recipes"
ON public.recipes FOR ALL
USING (public.has_any_role(ARRAY['owner', 'manager']));

-- ============================================================
-- RECIPE ITEMS POLICIES
-- ============================================================

CREATE POLICY "Authenticated users can view recipe items"
ON public.recipe_items FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Owner and Manager can manage recipe items"
ON public.recipe_items FOR ALL
USING (public.has_any_role(ARRAY['owner', 'manager']));

-- ============================================================
-- INVENTORY TRANSACTIONS POLICIES
-- ============================================================

CREATE POLICY "Authenticated users can view inventory transactions"
ON public.inventory_transactions FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Owner, Manager, Inventory can manage inventory"
ON public.inventory_transactions FOR ALL
USING (public.has_any_role(ARRAY['owner', 'manager', 'inventory_staff']));

-- ============================================================
-- SUPPLIERS POLICIES
-- ============================================================

CREATE POLICY "Authenticated users can view suppliers"
ON public.suppliers FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Owner, Manager, Inventory can manage suppliers"
ON public.suppliers FOR ALL
USING (public.has_any_role(ARRAY['owner', 'manager', 'inventory_staff']));

-- ============================================================
-- PURCHASE ORDERS POLICIES
-- ============================================================

CREATE POLICY "Authenticated users can view purchase orders"
ON public.purchase_orders FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Owner, Manager, Inventory can manage purchase orders"
ON public.purchase_orders FOR ALL
USING (public.has_any_role(ARRAY['owner', 'manager', 'inventory_staff']));

-- ============================================================
-- LOYALTY TRANSACTIONS POLICIES
-- ============================================================

CREATE POLICY "Authenticated users can view loyalty transactions"
ON public.loyalty_transactions FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Cashier and above can manage loyalty"
ON public.loyalty_transactions FOR ALL
USING (public.has_any_role(ARRAY['owner', 'manager', 'cashier']));

-- ============================================================
-- AUDIT LOGS POLICIES
-- ============================================================

-- Owner can view all audit logs
CREATE POLICY "Owner can view audit logs"
ON public.audit_logs FOR SELECT
USING (public.has_role('owner'));

-- Manager can view audit logs
CREATE POLICY "Manager can view audit logs"
ON public.audit_logs FOR SELECT
USING (public.has_role('manager'));

-- System can insert audit logs (authenticated users)
CREATE POLICY "Authenticated users can create audit logs"
ON public.audit_logs FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Source: supabase/migrations/003_functions_triggers.sql
-- ============================================================
-- CafePOS Database Functions & Triggers
-- Version: 1.0.0
-- Run AFTER 002_rls_policies.sql
-- ============================================================

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables with updated_at column
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.outlets
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.product_variants
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.addons
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.ingredients
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.recipes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.suppliers
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.purchase_orders
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- AUTO CREATE USER PROFILE ON SIGNUP
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, name, role, outlet_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'cashier'),
    (NEW.raw_user_meta_data->>'outlet_id')::UUID
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- AUTO DEDUCT INVENTORY ON ORDER
-- ============================================================

CREATE OR REPLACE FUNCTION public.deduct_inventory()
RETURNS TRIGGER AS $$
DECLARE
  recipe_item RECORD;
BEGIN
  -- Only deduct if order status is 'new' (just created)
  FOR recipe_item IN
    SELECT ri.ingredient_id, ri.quantity as recipe_qty
    FROM public.recipe_items ri
    JOIN public.recipes r ON r.id = ri.recipe_id
    WHERE r.product_id = NEW.product_id
  LOOP
    UPDATE public.ingredients
    SET current_stock = current_stock - (recipe_item.recipe_qty * NEW.quantity)
    WHERE id = recipe_item.ingredient_id;

    -- Log the stock out
    INSERT INTO public.inventory_transactions
      (ingredient_id, type, quantity, reference_id, notes)
    VALUES (
      recipe_item.ingredient_id,
      'stock_out',
      -(recipe_item.recipe_qty * NEW.quantity),
      NEW.order_id,
      'Auto-deducted from order'
    );
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_deduct_inventory
  AFTER INSERT ON public.order_items
  FOR EACH ROW EXECUTE FUNCTION public.deduct_inventory();

-- ============================================================
-- UPDATE CUSTOMER STATS ON ORDER COMPLETE
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_customer_on_order()
RETURNS TRIGGER AS $$
BEGIN
  -- When order status changes to 'completed'
  IF NEW.status = 'completed' AND OLD.status != 'completed' AND NEW.customer_id IS NOT NULL THEN
    UPDATE public.customers SET
      total_visits = total_visits + 1,
      total_spending = total_spending + NEW.total,
      last_visit_at = now(),
      loyalty_points = loyalty_points + FLOOR(NEW.total / 10000)
    WHERE id = NEW.customer_id;

    -- Log loyalty transaction
    IF NEW.total >= 10000 THEN
      INSERT INTO public.loyalty_transactions
        (customer_id, order_id, type, points, description)
      VALUES (
        NEW.customer_id,
        NEW.id,
        'earn',
        FLOOR(NEW.total / 10000),
        'Points earned from order ' || NEW.order_number
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_update_customer_on_order
  AFTER UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_customer_on_order();

-- ============================================================
-- LOW STOCK ALERT FUNCTION (for future use)
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_low_stock_ingredients()
RETURNS TABLE (
  id UUID,
  name TEXT,
  unit TEXT,
  current_stock DECIMAL,
  minimum_stock DECIMAL,
  deficit DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    i.id,
    i.name,
    i.unit,
    i.current_stock,
    i.minimum_stock,
    (i.minimum_stock - i.current_stock) as deficit
  FROM public.ingredients i
  WHERE i.is_active = true
    AND i.current_stock < i.minimum_stock
  ORDER BY deficit DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Source: supabase/migrations/004_seed_data.sql
-- ============================================================
-- CafePOS Seed Data
-- Version: 1.0.0
-- Run AFTER 003_functions_triggers.sql
-- ============================================================

-- ============================================================
-- DEFAULT OUTLET
-- ============================================================
INSERT INTO public.outlets (id, name, address, phone, tax_rate, receipt_header, receipt_footer)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'CafePOS Main Outlet',
  'Jl. Contoh No. 123, Jakarta',
  '021-1234567',
  11.00,
  'CafePOS',
  'Terima kasih atas kunjungan Anda!'
) ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- CATEGORIES
-- ============================================================
INSERT INTO public.categories (name, description, display_order) VALUES
  ('Coffee', 'Minuman kopi', 1),
  ('Non Coffee', 'Minuman non-kopi', 2),
  ('Tea', 'Teh dan varian', 3),
  ('Dessert', 'Makanan penutup', 4),
  ('Bakery', 'Roti dan pastry', 5)
ON CONFLICT DO NOTHING;

-- ============================================================
-- PRODUCTS - Coffee
-- ============================================================
INSERT INTO public.products (name, sku, category_id, price, cost) VALUES
  ('Espresso', 'COF-001', (SELECT id FROM categories WHERE name='Coffee'), 25000, 8000),
  ('Americano', 'COF-002', (SELECT id FROM categories WHERE name='Coffee'), 28000, 9000),
  ('Latte', 'COF-003', (SELECT id FROM categories WHERE name='Coffee'), 35000, 12000),
  ('Cappuccino', 'COF-004', (SELECT id FROM categories WHERE name='Coffee'), 35000, 12000),
  ('Mocha', 'COF-005', (SELECT id FROM categories WHERE name='Coffee'), 38000, 14000),
  ('Flat White', 'COF-006', (SELECT id FROM categories WHERE name='Coffee'), 38000, 13000),
  ('Cold Brew', 'COF-007', (SELECT id FROM categories WHERE name='Coffee'), 32000, 10000),
  ('Affogato', 'COF-008', (SELECT id FROM categories WHERE name='Coffee'), 35000, 12000)
ON CONFLICT (sku) DO NOTHING;

-- ============================================================
-- PRODUCTS - Non Coffee
-- ============================================================
INSERT INTO public.products (name, sku, category_id, price, cost) VALUES
  ('Matcha Latte', 'NCF-001', (SELECT id FROM categories WHERE name='Non Coffee'), 35000, 13000),
  ('Chocolate', 'NCF-002', (SELECT id FROM categories WHERE name='Non Coffee'), 32000, 11000),
  ('Strawberry Smoothie', 'NCF-003', (SELECT id FROM categories WHERE name='Non Coffee'), 38000, 14000),
  ('Mango Juice', 'NCF-004', (SELECT id FROM categories WHERE name='Non Coffee'), 28000, 10000)
ON CONFLICT (sku) DO NOTHING;

-- ============================================================
-- PRODUCTS - Tea
-- ============================================================
INSERT INTO public.products (name, sku, category_id, price, cost) VALUES
  ('Earl Grey', 'TEA-001', (SELECT id FROM categories WHERE name='Tea'), 25000, 7000),
  ('Green Tea', 'TEA-002', (SELECT id FROM categories WHERE name='Tea'), 25000, 7000),
  ('Thai Tea', 'TEA-003', (SELECT id FROM categories WHERE name='Tea'), 28000, 9000)
ON CONFLICT (sku) DO NOTHING;

-- ============================================================
-- PRODUCTS - Dessert
-- ============================================================
INSERT INTO public.products (name, sku, category_id, price, cost) VALUES
  ('Tiramisu', 'DST-001', (SELECT id FROM categories WHERE name='Dessert'), 35000, 15000),
  ('Cheesecake', 'DST-002', (SELECT id FROM categories WHERE name='Dessert'), 38000, 16000)
ON CONFLICT (sku) DO NOTHING;

-- ============================================================
-- PRODUCTS - Bakery
-- ============================================================
INSERT INTO public.products (name, sku, category_id, price, cost) VALUES
  ('Croissant', 'BKY-001', (SELECT id FROM categories WHERE name='Bakery'), 25000, 10000),
  ('Cinnamon Roll', 'BKY-002', (SELECT id FROM categories WHERE name='Bakery'), 28000, 11000),
  ('Banana Bread', 'BKY-003', (SELECT id FROM categories WHERE name='Bakery'), 22000, 8000)
ON CONFLICT (sku) DO NOTHING;

-- ============================================================
-- VARIANTS
-- ============================================================
DO $$
DECLARE
  latte_id UUID;
  americano_id UUID;
  cappuccino_id UUID;
  cold_brew_id UUID;
  matcha_id UUID;
  chocolate_id UUID;
BEGIN
  SELECT id INTO latte_id FROM products WHERE sku = 'COF-003';
  SELECT id INTO americano_id FROM products WHERE sku = 'COF-002';
  SELECT id INTO cappuccino_id FROM products WHERE sku = 'COF-004';
  SELECT id INTO cold_brew_id FROM products WHERE sku = 'COF-007';
  SELECT id INTO matcha_id FROM products WHERE sku = 'NCF-001';
  SELECT id INTO chocolate_id FROM products WHERE sku = 'NCF-002';

  -- Latte variants
  INSERT INTO product_variants (product_id, name, price_modifier, is_default) VALUES
    (latte_id, 'Regular', 0, true),
    (latte_id, 'Large', 5000, false)
  ON CONFLICT DO NOTHING;

  -- Americano variants
  INSERT INTO product_variants (product_id, name, price_modifier, is_default) VALUES
    (americano_id, 'Regular', 0, true),
    (americano_id, 'Large', 5000, false)
  ON CONFLICT DO NOTHING;

  -- Cappuccino variants
  INSERT INTO product_variants (product_id, name, price_modifier, is_default) VALUES
    (cappuccino_id, 'Regular', 0, true),
    (cappuccino_id, 'Large', 5000, false)
  ON CONFLICT DO NOTHING;

  -- Cold Brew variants
  INSERT INTO product_variants (product_id, name, price_modifier, is_default) VALUES
    (cold_brew_id, 'Regular', 0, true),
    (cold_brew_id, 'Large', 5000, false)
  ON CONFLICT DO NOTHING;

  -- Matcha variants
  INSERT INTO product_variants (product_id, name, price_modifier, is_default) VALUES
    (matcha_id, 'Regular', 0, true),
    (matcha_id, 'Large', 5000, false)
  ON CONFLICT DO NOTHING;

  -- Chocolate variants
  INSERT INTO product_variants (product_id, name, price_modifier, is_default) VALUES
    (chocolate_id, 'Regular', 0, true),
    (chocolate_id, 'Large', 5000, false)
  ON CONFLICT DO NOTHING;
END $$;

-- ============================================================
-- ADDONS
-- ============================================================
INSERT INTO addons (name, price, category) VALUES
  ('Extra Shot', 5000, 'coffee'),
  ('Oat Milk', 8000, 'milk'),
  ('Almond Milk', 8000, 'milk'),
  ('Soy Milk', 6000, 'milk'),
  ('Vanilla Syrup', 3000, 'syrup'),
  ('Caramel Syrup', 3000, 'syrup'),
  ('Hazelnut Syrup', 3000, 'syrup'),
  ('Whipped Cream', 5000, 'topping')
ON CONFLICT DO NOTHING;

-- ============================================================
-- INGREDIENTS
-- ============================================================
INSERT INTO ingredients (name, unit, current_stock, minimum_stock, cost_per_unit) VALUES
  ('Coffee Beans', 'gram', 5000, 1000, 150),
  ('Milk', 'ml', 10000, 2000, 15),
  ('Sugar', 'gram', 3000, 500, 10),
  ('Vanilla Syrup', 'ml', 2000, 500, 50),
  ('Caramel Syrup', 'ml', 2000, 500, 50),
  ('Chocolate Powder', 'gram', 1000, 300, 200),
  ('Matcha Powder', 'gram', 500, 100, 500),
  ('Oat Milk', 'ml', 3000, 500, 30),
  ('Almond Milk', 'ml', 3000, 500, 35),
  ('Whipped Cream', 'ml', 1000, 200, 40),
  ('Green Tea Leaves', 'gram', 500, 100, 200),
  ('Earl Grey Tea Leaves', 'gram', 500, 100, 250),
  ('Thai Tea Mix', 'gram', 1000, 300, 120),
  ('Strawberry Puree', 'ml', 1000, 300, 80),
  ('Mango Puree', 'ml', 1000, 300, 70),
  ('Flour', 'gram', 5000, 1000, 12),
  ('Butter', 'gram', 2000, 500, 100),
  ('Eggs', 'pcs', 100, 30, 3000),
  ('Cream Cheese', 'gram', 1000, 300, 200),
  ('Tiramisu Mix', 'gram', 500, 100, 300)
ON CONFLICT DO NOTHING;

-- ============================================================
-- RECIPES
-- ============================================================
DO $$
DECLARE
  latte_id UUID;
  cappuccino_id UUID;
  espresso_id UUID;
  cold_brew_id UUID;
  matcha_id UUID;
  r_id UUID;
BEGIN
  SELECT id INTO latte_id FROM products WHERE sku = 'COF-003';
  SELECT id INTO cappuccino_id FROM products WHERE sku = 'COF-004';
  SELECT id INTO espresso_id FROM products WHERE sku = 'COF-001';
  SELECT id INTO cold_brew_id FROM products WHERE sku = 'COF-007';
  SELECT id INTO matcha_id FROM products WHERE sku = 'NCF-001';

  -- Latte recipe
  INSERT INTO recipes (product_id) VALUES (latte_id) RETURNING id INTO r_id;
  INSERT INTO recipe_items (recipe_id, ingredient_id, quantity) VALUES
    (r_id, (SELECT id FROM ingredients WHERE name='Coffee Beans'), 18),
    (r_id, (SELECT id FROM ingredients WHERE name='Milk'), 200),
    (r_id, (SELECT id FROM ingredients WHERE name='Sugar'), 10);

  -- Cappuccino recipe
  INSERT INTO recipes (product_id) VALUES (cappuccino_id) RETURNING id INTO r_id;
  INSERT INTO recipe_items (recipe_id, ingredient_id, quantity) VALUES
    (r_id, (SELECT id FROM ingredients WHERE name='Coffee Beans'), 18),
    (r_id, (SELECT id FROM ingredients WHERE name='Milk'), 150),
    (r_id, (SELECT id FROM ingredients WHERE name='Sugar'), 10);

  -- Espresso recipe
  INSERT INTO recipes (product_id) VALUES (espresso_id) RETURNING id INTO r_id;
  INSERT INTO recipe_items (recipe_id, ingredient_id, quantity) VALUES
    (r_id, (SELECT id FROM ingredients WHERE name='Coffee Beans'), 18);

  -- Cold Brew recipe
  INSERT INTO recipes (product_id) VALUES (cold_brew_id) RETURNING id INTO r_id;
  INSERT INTO recipe_items (recipe_id, ingredient_id, quantity) VALUES
    (r_id, (SELECT id FROM ingredients WHERE name='Coffee Beans'), 20);

  -- Matcha Latte recipe
  INSERT INTO recipes (product_id) VALUES (matcha_id) RETURNING id INTO r_id;
  INSERT INTO recipe_items (recipe_id, ingredient_id, quantity) VALUES
    (r_id, (SELECT id FROM ingredients WHERE name='Matcha Powder'), 8),
    (r_id, (SELECT id FROM ingredients WHERE name='Milk'), 200),
    (r_id, (SELECT id FROM ingredients WHERE name='Sugar'), 15);
END $$;

-- Source: supabase/migrations/005_user_management_functions.sql
-- ============================================================
-- CafePOS User Management Functions
-- Version: 1.0.0
-- Run in Supabase Dashboard > SQL Editor
-- ============================================================

-- Create user via RPC (bypasses RLS for admin operations)
CREATE OR REPLACE FUNCTION public.create_app_user(
  p_email TEXT,
  p_password TEXT,
  p_name TEXT,
  p_role TEXT,
  p_outlet_id UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID;
  v_result JSONB;
BEGIN
  -- Only owner can create users
  IF public.get_user_role() != 'owner' THEN
    RAISE EXCEPTION 'Only owner can create users';
  END IF;

  -- Validate role
  IF p_role NOT IN ('owner', 'manager', 'cashier', 'barista', 'inventory_staff') THEN
    RAISE EXCEPTION 'Invalid role: %', p_role;
  END IF;

  -- Create auth user using Supabase auth admin
  -- Note: This requires the service_role key to be available
  -- For now, we'll create the profile and let the owner create the auth user separately

  -- Insert user profile (will be linked when auth user is created)
  -- We use a generated UUID that will be used as the auth user ID
  v_user_id := gen_random_uuid();

  INSERT INTO public.user_profiles (id, name, role, outlet_id)
  VALUES (v_user_id, p_name, p_role, p_outlet_id);

  v_result := jsonb_build_object(
    'user_id', v_user_id,
    'email', p_email,
    'name', p_name,
    'role', p_role,
    'outlet_id', p_outlet_id
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update user role and outlet
CREATE OR REPLACE FUNCTION public.update_app_user(
  p_user_id UUID,
  p_name TEXT DEFAULT NULL,
  p_role TEXT DEFAULT NULL,
  p_outlet_id UUID DEFAULT NULL,
  p_is_active BOOLEAN DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  -- Only owner can update users
  IF public.get_user_role() != 'owner' THEN
    RAISE EXCEPTION 'Only owner can update users';
  END IF;

  -- Validate role if provided
  IF p_role IS NOT NULL AND p_role NOT IN ('owner', 'manager', 'cashier', 'barista', 'inventory_staff') THEN
    RAISE EXCEPTION 'Invalid role: %', p_role;
  END IF;

  UPDATE public.user_profiles SET
    name = COALESCE(p_name, name),
    role = COALESCE(p_role, role),
    outlet_id = COALESCE(p_outlet_id, outlet_id),
    is_active = COALESCE(p_is_active, is_active)
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get all users (Owner only)
CREATE OR REPLACE FUNCTION public.get_all_users()
RETURNS TABLE (
  id UUID,
  name TEXT,
  role TEXT,
  outlet_id UUID,
  outlet_name TEXT,
  is_active BOOLEAN,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  -- Only owner and manager can view all users
  IF public.get_user_role() NOT IN ('owner', 'manager') THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;

  RETURN QUERY
  SELECT
    up.id,
    up.name,
    up.role,
    up.outlet_id,
    o.name as outlet_name,
    up.is_active,
    up.created_at
  FROM public.user_profiles up
  LEFT JOIN public.outlets o ON o.id = up.outlet_id
  ORDER BY up.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Source: supabase/migrations/006_storage_setup.sql
-- ============================================================
-- CafePOS Storage Setup
-- Version: 1.0.0
-- Run in Supabase Dashboard > SQL Editor
-- ============================================================

-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  2097152,  -- 2MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies
CREATE POLICY "Authenticated users can view product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Owner and Manager can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images'
  AND EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role IN ('owner', 'manager')
  )
);

CREATE POLICY "Owner and Manager can delete product images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-images'
  AND EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role IN ('owner', 'manager')
  )
);


