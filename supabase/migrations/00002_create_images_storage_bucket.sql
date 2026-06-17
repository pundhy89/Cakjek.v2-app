
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('cakjek-images', 'cakjek-images', true, 5242880, ARRAY['image/jpeg','image/png','image/webp','image/gif'])
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "cakjek_images_select" ON storage.objects FOR SELECT USING (bucket_id = 'cakjek-images');
CREATE POLICY "cakjek_images_insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'cakjek-images');
CREATE POLICY "cakjek_images_delete" ON storage.objects FOR DELETE USING (bucket_id = 'cakjek-images');
