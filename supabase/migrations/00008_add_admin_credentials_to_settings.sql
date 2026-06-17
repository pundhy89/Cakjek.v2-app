
ALTER TABLE settings
  ADD COLUMN IF NOT EXISTS admin_username TEXT NOT NULL DEFAULT 'admin',
  ADD COLUMN IF NOT EXISTS admin_password TEXT NOT NULL DEFAULT 'admin';

UPDATE settings SET admin_username = 'admin', admin_password = 'admin' WHERE id = 'settings';
