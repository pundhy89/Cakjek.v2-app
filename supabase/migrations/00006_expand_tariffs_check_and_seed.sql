
-- Drop the old check constraint and recreate with expanded list
ALTER TABLE tariffs DROP CONSTRAINT IF EXISTS tariffs_service_check;
ALTER TABLE tariffs ADD CONSTRAINT tariffs_service_check
  CHECK (service IN ('cakride','cakcar','caksend','cakmart','caklangganan'));

-- Seed cakmart ongkir
INSERT INTO tariffs (service, base_fare, per_km, label)
VALUES ('cakmart', 5000, 0, 'Ongkir CakMart')
ON CONFLICT (service) DO NOTHING;

-- Seed caklangganan tarif bulanan
INSERT INTO tariffs (service, base_fare, per_km, label)
VALUES ('caklangganan', 500000, 0, 'Paket Antar Jemput Bulanan')
ON CONFLICT (service) DO NOTHING;

-- Seed service caklangganan
INSERT INTO services (id, label, active, order_idx)
VALUES ('caklangganan', 'Antar Jemput', true, 9)
ON CONFLICT (id) DO NOTHING;
