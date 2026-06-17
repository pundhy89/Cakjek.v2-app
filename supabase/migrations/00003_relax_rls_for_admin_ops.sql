
-- Allow anon to perform writes (admin UI controls access via login page)
CREATE POLICY "banners_insert_anon" ON banners FOR INSERT WITH CHECK (true);
CREATE POLICY "banners_update_anon" ON banners FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "banners_delete_anon" ON banners FOR DELETE USING (true);

CREATE POLICY "merchants_insert_anon" ON merchants FOR INSERT WITH CHECK (true);
CREATE POLICY "merchants_update_anon" ON merchants FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "merchants_delete_anon" ON merchants FOR DELETE USING (true);

CREATE POLICY "menu_items_insert_anon" ON menu_items FOR INSERT WITH CHECK (true);
CREATE POLICY "menu_items_update_anon" ON menu_items FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "menu_items_delete_anon" ON menu_items FOR DELETE USING (true);

CREATE POLICY "tariffs_insert_anon" ON tariffs FOR INSERT WITH CHECK (true);
CREATE POLICY "tariffs_update_anon" ON tariffs FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "tariffs_delete_anon" ON tariffs FOR DELETE USING (true);

CREATE POLICY "settings_insert_anon" ON settings FOR INSERT WITH CHECK (true);
CREATE POLICY "settings_update_anon" ON settings FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "orders_update_anon" ON orders FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "orders_delete_anon" ON orders FOR DELETE USING (true);
