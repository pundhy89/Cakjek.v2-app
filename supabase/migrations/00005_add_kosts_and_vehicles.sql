
-- Tabel kosts
CREATE TABLE IF NOT EXISTS kosts (
  id BIGSERIAL PRIMARY KEY,
  nama TEXT NOT NULL,
  foto_url TEXT DEFAULT '',
  alamat TEXT NOT NULL,
  deskripsi TEXT DEFAULT '',
  fasilitas TEXT DEFAULT '',
  harga_harian NUMERIC NOT NULL DEFAULT 0,
  harga_mingguan NUMERIC NOT NULL DEFAULT 0,
  harga_bulanan NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'tersedia' CHECK (status IN ('tersedia','penuh')),
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE kosts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "kosts_select" ON kosts FOR SELECT USING (true);
CREATE POLICY "kosts_insert" ON kosts FOR INSERT WITH CHECK (true);
CREATE POLICY "kosts_update" ON kosts FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "kosts_delete" ON kosts FOR DELETE USING (true);

-- Tabel vehicles
CREATE TABLE IF NOT EXISTS vehicles (
  id BIGSERIAL PRIMARY KEY,
  nama TEXT NOT NULL,
  jenis TEXT NOT NULL DEFAULT 'motor' CHECK (jenis IN ('motor','mobil')),
  foto_url TEXT DEFAULT '',
  deskripsi TEXT DEFAULT '',
  harga_harian NUMERIC NOT NULL DEFAULT 0,
  harga_mingguan NUMERIC NOT NULL DEFAULT 0,
  harga_bulanan NUMERIC NOT NULL DEFAULT 0,
  biaya_sopir_harian NUMERIC DEFAULT NULL,
  status TEXT NOT NULL DEFAULT 'tersedia' CHECK (status IN ('tersedia','disewa')),
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vehicles_select" ON vehicles FOR SELECT USING (true);
CREATE POLICY "vehicles_insert" ON vehicles FOR INSERT WITH CHECK (true);
CREATE POLICY "vehicles_update" ON vehicles FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "vehicles_delete" ON vehicles FOR DELETE USING (true);

-- Seed kosts
INSERT INTO kosts (nama, foto_url, alamat, deskripsi, fasilitas, harga_harian, harga_mingguan, harga_bulanan, status) VALUES
('Kost Melati Indah', 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400', 'Jl. Melati No. 12, Surabaya', 'Kost nyaman dan bersih dekat pusat kota', 'WiFi, AC, Kamar Mandi Dalam, Parkir Motor', 80000, 450000, 1200000, 'tersedia'),
('Kost Anggrek Residence', 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 'Jl. Anggrek Raya No. 5, Surabaya', 'Kost eksklusif dengan fasilitas lengkap', 'WiFi, AC, Kamar Mandi Dalam, TV, Kulkas', 120000, 700000, 1800000, 'tersedia'),
('Kost Sejahtera Putra', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400', 'Jl. Raya Darmo No. 33, Surabaya', 'Kost putra strategis dekat kampus', 'WiFi, Kipas Angin, Kamar Mandi Luar', 50000, 280000, 700000, 'penuh'),
('Kost Mawar Premium', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400', 'Jl. Mawar No. 8, Surabaya', 'Kost premium dengan keamanan 24 jam', 'WiFi, AC, Kamar Mandi Dalam, CCTV, Laundry', 150000, 900000, 2200000, 'tersedia');

-- Seed vehicles
INSERT INTO vehicles (nama, jenis, foto_url, deskripsi, harga_harian, harga_mingguan, harga_bulanan, biaya_sopir_harian, status) VALUES
('Honda Beat 2022', 'motor', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', 'Motor matic irit bahan bakar, kondisi prima', 75000, 420000, 1200000, NULL, 'tersedia'),
('Yamaha NMAX 2023', 'motor', 'https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?w=400', 'Motor matic premium, nyaman untuk perjalanan jauh', 100000, 600000, 1500000, NULL, 'tersedia'),
('Toyota Avanza 2021', 'mobil', 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400', 'Mobil keluarga 7 penumpang, terawat dan bersih', 350000, 2000000, 5500000, 150000, 'tersedia'),
('Honda Brio 2022', 'mobil', 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=400', 'City car lincah dan irit, cocok untuk dalam kota', 280000, 1600000, 4200000, 150000, 'tersedia'),
('Daihatsu Xenia 2020', 'mobil', 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=400', 'Mobil MPV nyaman untuk keluarga atau rombongan', 320000, 1800000, 5000000, 150000, 'tersedia');
