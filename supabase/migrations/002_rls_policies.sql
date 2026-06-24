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
