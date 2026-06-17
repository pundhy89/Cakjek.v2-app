
-- Settings table
CREATE TABLE settings (
  id text PRIMARY KEY DEFAULT 'settings',
  app_name text NOT NULL DEFAULT 'CakJek',
  logo_url text NOT NULL DEFAULT '',
  whatsapp_number text NOT NULL DEFAULT '6285233962821',
  service_center_lat float8 NOT NULL DEFAULT -7.2575,
  service_center_lng float8 NOT NULL DEFAULT 112.7521,
  service_radius_km float8 NOT NULL DEFAULT 20.0,
  mart_delivery_fee float8 NOT NULL DEFAULT 7000.0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Banners table
CREATE TABLE banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subtitle text NOT NULL DEFAULT '',
  code text NOT NULL DEFAULT '',
  color_from text NOT NULL DEFAULT '#fb923c',
  color_to text NOT NULL DEFAULT '#ec4899',
  image_url text NOT NULL DEFAULT '',
  order_idx int NOT NULL DEFAULT 0,
  active bool NOT NULL DEFAULT true,
  start_date date,
  end_date date,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Merchants table
CREATE TABLE merchants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  image_url text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  delivery_fee float8 NOT NULL DEFAULT 5000,
  rating float8 NOT NULL DEFAULT 4.5,
  active bool NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Menu items table
CREATE TABLE menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price float8 NOT NULL DEFAULT 0,
  description text NOT NULL DEFAULT '',
  image_url text NOT NULL DEFAULT '',
  category text NOT NULL CHECK (category IN ('food','mart','cakpay')),
  merchant_id uuid REFERENCES merchants(id) ON DELETE SET NULL,
  active bool NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Tariffs table
CREATE TABLE tariffs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service text NOT NULL UNIQUE CHECK (service IN ('cakride','cakcar','caksend')),
  base_fare float8 NOT NULL DEFAULT 5000,
  per_km float8 NOT NULL DEFAULT 2500,
  label text NOT NULL DEFAULT ''
);

-- Orders table
CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service text NOT NULL,
  customer_name text NOT NULL,
  customer_phone text NOT NULL DEFAULT '',
  details jsonb NOT NULL DEFAULT '{}',
  total float8 NOT NULL DEFAULT 0,
  message text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new','process','done','cancel')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE tariffs ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies: settings (public read, service_role write)
CREATE POLICY "settings_select_all" ON settings FOR SELECT USING (true);
CREATE POLICY "settings_all_service" ON settings FOR ALL TO service_role USING (true) WITH CHECK (true);

-- RLS Policies: banners (public read, service_role write)
CREATE POLICY "banners_select_all" ON banners FOR SELECT USING (true);
CREATE POLICY "banners_all_service" ON banners FOR ALL TO service_role USING (true) WITH CHECK (true);

-- RLS Policies: merchants (public read, service_role write)
CREATE POLICY "merchants_select_all" ON merchants FOR SELECT USING (true);
CREATE POLICY "merchants_all_service" ON merchants FOR ALL TO service_role USING (true) WITH CHECK (true);

-- RLS Policies: menu_items (public read, service_role write)
CREATE POLICY "menu_items_select_all" ON menu_items FOR SELECT USING (true);
CREATE POLICY "menu_items_all_service" ON menu_items FOR ALL TO service_role USING (true) WITH CHECK (true);

-- RLS Policies: tariffs (public read, service_role write)
CREATE POLICY "tariffs_select_all" ON tariffs FOR SELECT USING (true);
CREATE POLICY "tariffs_all_service" ON tariffs FOR ALL TO service_role USING (true) WITH CHECK (true);

-- RLS Policies: orders (public insert+select own, service_role all)
CREATE POLICY "orders_insert_all" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "orders_select_all" ON orders FOR SELECT USING (true);
CREATE POLICY "orders_all_service" ON orders FOR ALL TO service_role USING (true) WITH CHECK (true);
