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
