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
