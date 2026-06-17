
-- Tabel services untuk manajemen layanan aktif/nonaktif
CREATE TABLE IF NOT EXISTS services (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  order_idx INTEGER NOT NULL DEFAULT 1
);

-- RLS
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "services_select" ON services FOR SELECT USING (true);
CREATE POLICY "services_insert" ON services FOR INSERT WITH CHECK (true);
CREATE POLICY "services_update" ON services FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "services_delete" ON services FOR DELETE USING (true);

-- Seed data
INSERT INTO services (id, label, active, order_idx) VALUES
  ('cakride', 'Ojek Online', true, 1),
  ('cakcar', 'Taxi Online', true, 2),
  ('cakfood', 'Pesan Makan', true, 3),
  ('caksend', 'Kirim Barang', true, 4),
  ('cakmart', 'Belanja Pasar', true, 5),
  ('cakpay', 'Tolong Bayar', true, 6),
  ('cakkost', 'Sewa Kost', true, 7),
  ('cakrent', 'Rental Kendaraan', true, 8)
ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, order_idx = EXCLUDED.order_idx;
