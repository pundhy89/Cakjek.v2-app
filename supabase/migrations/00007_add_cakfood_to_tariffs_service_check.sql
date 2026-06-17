
-- Drop old check constraint and add new one with cakfood
ALTER TABLE tariffs DROP CONSTRAINT IF EXISTS tariffs_service_check;
ALTER TABLE tariffs ADD CONSTRAINT tariffs_service_check
  CHECK (service IN ('cakride','cakcar','caksend','cakmart','caklangganan','cakfood'));

-- Ensure unique constraint on service for upsert
ALTER TABLE tariffs DROP CONSTRAINT IF EXISTS tariffs_service_key;
ALTER TABLE tariffs ADD CONSTRAINT tariffs_service_key UNIQUE (service);
