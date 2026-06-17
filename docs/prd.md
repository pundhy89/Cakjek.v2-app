# Dokumen Persyaratan

## 1. Ringkasan Aplikasi

### 1.1 Nama Aplikasi
CakJek

### 1.2 Deskripsi
CakJek adalah aplikasi super app ojek online lokal berbasis web dengan tampilan mobile-first (max-width 480px). Aplikasi ini menyediakan berbagai layanan transportasi, pengiriman makanan, kurir paket, belanja kebutuhan, pembayaran digital, sewa kost, rental kendaraan, dan antar jemput berlangganan. Semua pesanan diteruskan melalui WhatsApp ke nomor 6285233962821.

## 2. Pengguna dan Skenario Penggunaan

### 2.1 Pengguna Target
- Pelanggan umum: pengguna yang membutuhkan layanan transportasi, pesan makanan, kirim paket, belanja kebutuhan, top up pulsa/token, sewa kost, rental kendaraan, atau antar jemput berlangganan
- Administrator: pengelola aplikasi yang mengatur konten, tarif, pesanan, layanan, dan konfigurasi sistem

### 2.2 Skenario Penggunaan Utama
- Pelanggan memesan layanan transportasi (motor/mobil) dengan menentukan lokasi jemput dan tujuan
- Pelanggan memesan makanan dari merchant terdaftar
- Pelanggan mengirim paket melalui layanan kurir
- Pelanggan berbelanja produk kebutuhan sehari-hari
- Pelanggan melakukan top up pulsa/token listrik
- Pelanggan melihat katalog kost tersedia dan memesan kost
- Pelanggan melihat katalog kendaraan tersedia dan menyewa kendaraan
- Pelanggan memesan paket antar jemput berlangganan bulanan
- Pelanggan mencari merchant, menu makanan, atau produk mart melalui fitur search
- Pelanggan melihat notifikasi pesanan yang telah dikirim
- Administrator mengelola pesanan, menu, merchant, tarif, banner promo, layanan, data kost, data kendaraan, dan pengaturan aplikasi

## 3. Struktur Halaman dan Fungsi

### 3.1 Struktur Halaman

```
CakJek (Frontend)
├── Halaman Beranda
├── Halaman Search Results
├── Halaman Notifikasi
├── Halaman CakRide (Ojek Online)
├── Halaman CakCar (Taxi Online)
├── Halaman CakFood (Pesan Makan)
│   └── Detail Merchant
├── Halaman CakSend (Kirim Barang)
├── Halaman CakMart (Belanja Pasar)
├── Halaman CakPay (Tolong Bayar)
├── Halaman CakKost (Sewa Kost)
│   └── Form Pemesanan Kost
├── Halaman CakRent (Rental Kendaraan)
│   └── Form Pemesanan Kendaraan
├── Halaman CakLangganan (Antar Jemput Berlangganan)
├── Halaman Aktivitas
├── Halaman Chat
├── Halaman Akun
└── Modal Order Success

CakJek (Admin)
├── Login Admin
├── Dashboard Admin
├── Manajemen Pesanan
├── Manajemen Menu Makanan
├── Manajemen Merchant
├── Manajemen CakMart
├── Manajemen CakPay
├── Manajemen CakKost
├── Manajemen CakRent
├── Manajemen Tarif
├── Manajemen Banner/Promo
├── Manajemen Layanan
├── Laporan
└── Pengaturan (Settings)
```

### 3.2 Halaman Frontend

#### 3.2.1 Halaman Beranda
- Menampilkan header dengan nama aplikasi (dapat dikustomisasi dari admin) dan logo (dapat dikustomisasi dari admin)
- Menampilkan tombol search di header yang membuka input pencarian
- Menampilkan tombol lonceng (notifikasi) di header dengan badge merah jika ada notifikasi belum dibaca
- Menampilkan banner carousel promo dengan animasi slide otomatis, data diambil dari database
- Menampilkan grid menu layanan dengan 9 item:
  - CakRide dengan label (dapat diubah dari admin, default「Ojek Online」)
  - CakCar dengan label (dapat diubah dari admin, default「Taxi Online」)
  - CakFood dengan label (dapat diubah dari admin, default「Pesan Makan」)
  - CakSend dengan label (dapat diubah dari admin, default「Kirim Barang」)
  - CakMart dengan label (dapat diubah dari admin, default「Belanja Pasar」)
  - CakPay dengan label (dapat diubah dari admin, default「Tolong Bayar」)
  - CakKost dengan label (dapat diubah dari admin, default「Sewa Kost」)
  - CakRent dengan label (dapat diubah dari admin, default「Rental Kendaraan」)
  - CakLangganan dengan label (dapat diubah dari admin, default「Antar Jemput」)
- Setiap menu layanan menampilkan ikon dan warna berbeda
- Layanan yang nonaktif ditampilkan dengan warna abu-abu (grayscale) dan badge「Coming Soon」, tidak dapat diklik
- Layanan yang aktif dapat diklik untuk membuka halaman layanan terkait
- Menampilkan section「Produk Terbaru」di bawah grid layanan:
  - Mengambil 6 produk terbaru dari tabel menu_items (semua kategori: food, mart, cakpay) dengan active=true
  - Diurutkan berdasarkan created_at DESC
  - Ditampilkan dalam grid card horizontal scroll atau grid 2 kolom
  - Setiap card menampilkan: foto, nama, harga, badge kategori
- Menampilkan bottom navigation bar dengan container/wrapper yang memiliki border rounded, background transparan 80%, dan shadow
- Bottom navigation bar sticky di bawah layar (tidak ikut scroll)
- Menu bottom navigation: Home, Aktivitas, FAB CakFood (tengah), Chat, Akun

#### 3.2.2 Halaman Search Results
- Muncul saat pengguna mengetik di input search di header beranda
- Melakukan pencarian dari: nama merchant, nama menu_items (kategori food), nama produk (kategori mart)
- Menampilkan hasil pencarian sebagai list overlay/panel di bawah search bar
- Setiap hasil menampilkan: nama, kategori, gambar
- Klik hasil:
  - Jika merchant → navigate ke /food/{id}
  - Jika menu item food → navigate ke /food/{merchant_id}
  - Jika produk mart → navigate ke /mart

#### 3.2.3 Halaman Notifikasi
- Muncul saat pengguna klik tombol lonceng di header beranda
- Menampilkan list notifikasi dari localStorage key cakjek_notifications
- Setiap notifikasi menampilkan: icon layanan, pesan singkat, waktu
- Notifikasi dibuat setiap kali pesanan berhasil dikirim ke WhatsApp (setelah user tap「Pesan via WhatsApp」)
- Data notifikasi berformat: { id, service, message, timestamp, read }
- Menyediakan tombol「Tandai Semua Dibaca」untuk mengubah status read semua notifikasi menjadi true
- Badge merah di ikon lonceng muncul jika ada notifikasi dengan read=false

#### 3.2.4 Halaman CakRide (Ojek Online)
- Menampilkan header berwarna gradient orange dengan title「Ojek Online」
- Menampilkan tarif: base fare dan per km
- Menyediakan form input:
  - Nama pelanggan (diisi otomatis dari localStorage key cakjek_user_name)
  - Lokasi Jemput dengan Google Maps picker, search alamat, dan tombol「Lokasi Saya」
  - Lokasi Tujuan dengan Google Maps picker dan search alamat
  - Tombol「+ Tambah Tujuan」untuk menambah multi-stop
  - Jarak Total (km) yang dihitung otomatis dari rute Google Maps Directions API
  - Catatan
- Menampilkan Total biaya (base_fare + per_km × jarak)
- Menyediakan tombol「Pesan via WhatsApp」(hijau) yang membuka wa.me/6285233962821 dengan teks otomatis berisi detail pesanan

#### 3.2.5 Halaman CakCar (Taxi Online)
- Fungsi sama dengan Halaman CakRide tetapi untuk layanan mobil
- Menggunakan tarif berbeda untuk mobil
- Header berwarna biru dengan title「Taxi Online」
- Nama pelanggan diisi otomatis dari localStorage key cakjek_user_name

#### 3.2.6 Halaman CakFood (Pesan Makan)
- Menampilkan list merchant/restoran dengan informasi: gambar, nama, rating, alamat, ongkir
- Klik merchant membuka halaman detail merchant
- Detail merchant menampilkan:
  - Header dengan gambar merchant
  - List menu makanan dengan tombol +/- untuk menambah/mengurangi jumlah
  - Form: nama pelanggan (diisi otomatis dari localStorage key cakjek_user_name), alamat tujuan antar dengan Google Maps picker
  - Kalkulasi subtotal + ongkir merchant = total
  - Tombol「Pesan via WhatsApp」yang membuka wa.me/6285233962821

#### 3.2.7 Halaman CakSend (Kirim Barang)
- Menyediakan form:
  - Nama pengirim (diisi otomatis dari localStorage key cakjek_user_name)
  - Lokasi pickup dengan Google Maps picker
  - Lokasi tujuan dengan Google Maps picker
  - Deskripsi paket
  - Catatan
- Menghitung jarak dan tarif kurir
- Menyediakan tombol「Pesan via WhatsApp」yang membuka wa.me/6285233962821

#### 3.2.8 Halaman CakMart (Belanja Pasar)
- Menampilkan list produk dengan gambar, nama, harga, tombol +/-
- Menyediakan form: nama pelanggan (diisi otomatis dari localStorage key cakjek_user_name), alamat antar dengan Google Maps picker
- Menghitung subtotal + ongkir mart (dari tabel tariffs layanan cakmart) = total
- Menyediakan tombol「Pesan via WhatsApp」yang membuka wa.me/6285233962821

#### 3.2.9 Halaman CakPay (Tolong Bayar)
- Menampilkan list paket top up/pulsa/token listrik
- Menyediakan form: nama (diisi otomatis dari localStorage key cakjek_user_name), nomor HP
- Menampilkan total
- Menyediakan tombol「Pesan via WhatsApp」yang membuka wa.me/6285233962821

#### 3.2.10 Halaman CakKost (Sewa Kost)
- Menampilkan header dengan title「Sewa Kost」
- Menampilkan daftar kost tersedia dari database
- Setiap kartu kost menampilkan: foto, nama kost, alamat, harga per hari/minggu/bulan, fasilitas singkat, status (Tersedia/Penuh)
- Kost berstatus「Penuh」tetap tampil dengan overlay/badge「Penuh」dan tidak dapat dipesan
- Kost berstatus「Tersedia」menampilkan tombol pilih
- Klik tombol pilih membuka form pemesanan kost:
  - Nama pemesan (diisi otomatis dari localStorage key cakjek_user_name)
  - Pilihan durasi sewa: Harian, Mingguan, Bulanan
  - Tanggal mulai
  - Catatan
  - Total harga dihitung otomatis berdasarkan durasi × harga
  - Tombol「Pesan via WhatsApp」yang membuka wa.me/6285233962821 dengan teks otomatis berisi detail pemesanan kost

#### 3.2.11 Halaman CakRent (Rental Kendaraan)
- Menampilkan header dengan title「Rental Kendaraan」
- Menampilkan filter: Semua, Motor, Mobil
- Menampilkan daftar kendaraan tersedia dari database
- Setiap kartu kendaraan menampilkan: foto, nama kendaraan, jenis (Motor/Mobil), harga per hari/minggu/bulan, status (Tersedia/Disewa)
- Kendaraan berstatus「Disewa」tidak dapat dipilih
- Kendaraan berstatus「Tersedia」menampilkan tombol pilih
- Klik tombol pilih membuka form pemesanan kendaraan:
  - Nama pemesan (diisi otomatis dari localStorage key cakjek_user_name)
  - Tanggal mulai
  - Tanggal selesai (otomatis hitung durasi)
  - Pilihan durasi: Harian, Mingguan, Bulanan
  - Khusus jenis Mobil: pilihan「Lepas Kunci」atau「Dengan Sopir」(harga berbeda, sopir dikenakan biaya tambahan per hari)
  - Catatan
  - Total harga dihitung otomatis
  - Tombol「Pesan via WhatsApp」yang membuka wa.me/6285233962821 dengan teks otomatis berisi detail rental kendaraan

#### 3.2.12 Halaman CakLangganan (Antar Jemput Berlangganan)
- Menampilkan header dengan title「Antar Jemput Berlangganan」
- Menyediakan form input:
  - Nama pelanggan (diisi otomatis dari localStorage key cakjek_user_name)
  - Alamat Jemput dengan Google Maps picker
  - Alamat Tujuan dengan Google Maps picker
  - Pilihan Paket: Sekolah, Kantor, Kustom
  - Catatan
- Menampilkan harga paket bulanan (dari tabel tariffs layanan caklangganan)
- Menyediakan tombol「Pesan via WhatsApp」yang membuka wa.me/6285233962821 dengan teks otomatis berisi detail pemesanan paket berlangganan

#### 3.2.13 Halaman Aktivitas
- Menampilkan list riwayat pesanan dari localStorage
- Setiap pesanan menampilkan: status, layanan, total, waktu

#### 3.2.14 Halaman Chat
- Menyediakan tombol langsung ke WhatsApp +6285233962821

#### 3.2.15 Halaman Akun
- Menampilkan info profil sederhana (nama)
- Data profil disimpan di localStorage key cakjek_user_name
- Menyediakan tombol「Admin Panel」yang mengarahkan ke /admin/login

#### 3.2.16 Modal Order Success
- Muncul setelah pesanan berhasil dibuat
- Menyediakan tombol「Buka WhatsApp」dan「Kembali」

### 3.3 Halaman Admin

#### 3.3.1 Login Admin
- Menyediakan form login dengan username dan password
- Username: admin, Password: admin
- Token login disimpan di localStorage

#### 3.3.2 Dashboard Admin
- Menampilkan statistik: total pesanan hari ini, total pendapatan, pesanan per layanan
- Menampilkan grafik sederhana

#### 3.3.3 Manajemen Pesanan
- Menampilkan tabel semua pesanan dengan kolom: nama, layanan, total, status, waktu
- Menyediakan fungsi update status pesanan (new, process, done, cancel)

#### 3.3.4 Manajemen Menu Makanan
- Menyediakan fungsi CRUD item menu dengan kategori「food」
- Field: nama, harga, deskripsi, gambar (dengan dua pilihan input), merchant_id, aktif
- Input gambar menyediakan tab/toggle pilihan:
  - Tab「URL」: input teks untuk URL gambar
  - Tab「Upload Foto」: upload foto langsung dari perangkat menggunakan Supabase Storage

#### 3.3.5 Manajemen Merchant
- Menyediakan fungsi CRUD restoran/merchant
- Field: nama, gambar (dengan dua pilihan input), alamat, deskripsi, ongkir, rating, aktif
- Input gambar menyediakan tab/toggle pilihan:
  - Tab「URL」: input teks untuk URL gambar
  - Tab「Upload Foto」: upload foto langsung dari perangkat menggunakan Supabase Storage

#### 3.3.6 Manajemen CakMart
- Menyediakan fungsi CRUD produk mart dengan kategori「mart」
- Field: nama, harga, deskripsi, gambar (dengan dua pilihan input), aktif
- Input gambar menyediakan tab/toggle pilihan:
  - Tab「URL」: input teks untuk URL gambar
  - Tab「Upload Foto」: upload foto langsung dari perangkat menggunakan Supabase Storage

#### 3.3.7 Manajemen CakPay
- Menyediakan fungsi CRUD paket top up dengan kategori「cakpay」
- Field: nama, harga, deskripsi, aktif

#### 3.3.8 Manajemen CakKost
- Menyediakan fungsi CRUD data kost
- Field: nama kost, foto (dengan dua pilihan input), alamat, deskripsi, fasilitas, harga_harian, harga_mingguan, harga_bulanan, status (tersedia/penuh), aktif
- Input foto menyediakan tab/toggle pilihan:
  - Tab「URL」: input teks untuk URL gambar
  - Tab「Upload Foto」: upload foto langsung dari perangkat menggunakan Supabase Storage
- Menyediakan toggle untuk mengubah status tersedia/penuh per kost

#### 3.3.9 Manajemen CakRent
- Menyediakan fungsi CRUD data kendaraan
- Field: nama kendaraan, foto (dengan dua pilihan input), jenis (motor/mobil), deskripsi, harga_harian, harga_mingguan, harga_bulanan, biaya_sopir_harian (khusus mobil), status (tersedia/disewa), aktif
- Input foto menyediakan tab/toggle pilihan:
  - Tab「URL」: input teks untuk URL gambar
  - Tab「Upload Foto」: upload foto langsung dari perangkat menggunakan Supabase Storage

#### 3.3.10 Manajemen Tarif
- Menyediakan fungsi edit tarif untuk CakRide, CakCar, CakSend, CakMart, CakLangganan
- Field untuk CakRide/CakCar/CakSend: base_fare (tarif dasar), per_km (tarif per km), label
- Field untuk CakMart: base_fare (sebagai ongkir flat), label
- Field untuk CakLangganan: base_fare (sebagai harga paket bulanan), label

#### 3.3.11 Manajemen Banner/Promo
- Menyediakan fungsi CRUD banner promo carousel
- Field: judul, subjudul, kode promo, warna gradient (from/to), gambar (dengan dua pilihan input), urutan, aktif, tanggal mulai, tanggal selesai
- Input gambar menyediakan tab/toggle pilihan:
  - Tab「URL」: input teks untuk URL gambar
  - Tab「Upload Foto」: upload foto langsung dari perangkat menggunakan Supabase Storage

#### 3.3.12 Manajemen Layanan
- Menampilkan daftar semua 9 layanan:
  - CakRide (default label: Ojek Online)
  - CakCar (default label: Taxi Online)
  - CakFood (default label: Pesan Makan)
  - CakSend (default label: Kirim Barang)
  - CakMart (default label: Belanja Pasar)
  - CakPay (default label: Tolong Bayar)
  - CakKost (default label: Sewa Kost)
  - CakRent (default label: Rental Kendaraan)
  - CakLangganan (default label: Antar Jemput)
- Setiap layanan menampilkan:
  - ID layanan
  - Field input untuk mengubah label/nama tampilan (inline edit)
  - Toggle switch untuk mengaktifkan/menonaktifkan layanan
  - Urutan tampilan (order_idx)
- Perubahan label dapat dilakukan dengan klik nama layanan → menjadi input field → simpan otomatis atau tombol simpan per baris
- Perubahan status aktif/nonaktif dan label langsung disimpan ke database tabel services
- Menyediakan fungsi drag-and-drop atau input number untuk mengubah urutan tampilan layanan

#### 3.3.13 Laporan
- Laporan harian: memilih tanggal, menampilkan total pesanan dan pendapatan per layanan
- Laporan bulanan: memilih bulan/tahun, menampilkan chart per hari

#### 3.3.14 Pengaturan (Settings)
- Menyediakan konfigurasi:
  - Nama Aplikasi: dapat diubah (default: CakJek), tampil di header beranda
  - Logo Aplikasi: dengan dua pilihan input (tab/toggle pilihan「URL」atau「Upload Foto」), upload foto menggunakan Supabase Storage, tampil di header beranda
  - Nomor WhatsApp: nomor tujuan WA (default: 6285233962821)
  - Pusat Layanan: koordinat lat/lng pusat area servis
  - Radius Servis (km): pesanan di luar radius ditolak

## 4. Aturan Bisnis dan Logika

### 4.1 Integrasi Google Maps
- Semua peta menggunakan Google Maps JavaScript API
- Fitur yang tersedia:
  - Search alamat menggunakan Places Autocomplete
  - Klik peta untuk memilih koordinat
  - Drag marker untuk mengubah posisi
  - Reverse geocoding (koordinat → nama alamat)
  - Kalkulasi jarak rute menggunakan Directions API / Distance Matrix
- Google Maps API Key disimpan sebagai environment variable

### 4.2 Integrasi WhatsApp
- Semua tombol「Pesan」mengarah ke: https://wa.me/6285233962821?text=[pesan_otomatis]
- Teks pesan otomatis berisi: nama layanan, nama pelanggan, detail order, koordinat pin Google Maps (jika ada), total harga (jika ada)

### 4.3 Kalkulasi Tarif
- CakRide/CakCar: Total = base_fare + (per_km × jarak)
- CakFood: Total = subtotal menu + ongkir merchant
- CakSend: Total = base_fare + (per_km × jarak)
- CakMart: Total = subtotal produk + ongkir mart (dari tabel tariffs layanan cakmart, field base_fare)
- CakPay: Total = harga paket yang dipilih
- CakKost: Total = harga per durasi × jumlah durasi (harian/mingguan/bulanan)
- CakRent: Total = harga per durasi × jumlah durasi + (biaya_sopir_harian × jumlah hari jika pilih「Dengan Sopir」)
- CakLangganan: Total = harga paket bulanan (dari tabel tariffs layanan caklangganan, field base_fare)

### 4.4 Validasi Radius Servis
- Sistem memeriksa jarak antara lokasi pesanan dengan pusat layanan
- Jika jarak melebihi radius servis yang ditentukan di settings, pesanan ditolak

### 4.5 Penyimpanan Data
- Data pesanan disimpan di database Supabase (tabel orders)
- Riwayat pesanan pengguna disimpan di localStorage untuk akses cepat
- Data profil pengguna (nama) disimpan di localStorage key cakjek_user_name
- Token login admin disimpan di localStorage
- File foto yang diupload disimpan di Supabase Storage
- Status aktif/nonaktif layanan dan label layanan disimpan di tabel services
- Data kost disimpan di tabel kosts
- Data kendaraan disimpan di tabel vehicles
- Data notifikasi disimpan di localStorage key cakjek_notifications sebagai array: { id, service, message, timestamp, read }

### 4.6 Status Pesanan
- Status pesanan: new, process, done, cancel
- Admin dapat mengubah status pesanan melalui halaman Manajemen Pesanan

### 4.7 Input Gambar pada Form Admin
- Setiap field input gambar menyediakan dua pilihan dengan tab/toggle:
  - Tab「URL」: admin memasukkan URL gambar dalam format teks
  - Tab「Upload Foto」: admin memilih file foto dari perangkat, file diupload ke Supabase Storage, URL hasil upload disimpan ke database
- Berlaku untuk form: tambah/edit merchant, tambah/edit menu item, tambah/edit banner, tambah/edit kost, tambah/edit kendaraan, pengaturan logo aplikasi

### 4.8 Manajemen Status Layanan
- Admin dapat mengaktifkan/menonaktifkan layanan melalui halaman Manajemen Layanan
- Layanan yang nonaktif:
  - Tetap ditampilkan di beranda dengan warna abu-abu (grayscale)
  - Menampilkan badge「Coming Soon」
  - Tidak dapat diklik atau dipesan oleh pengguna
- Layanan yang aktif:
  - Ditampilkan dengan warna normal
  - Dapat diklik untuk membuka halaman layanan

### 4.9 Auto-fill Nama Pemesan
- Saat pengguna mengisi nama di halaman Akun, nama tersimpan di localStorage key cakjek_user_name
- Di semua halaman layanan (CakRide, CakCar, CakSend, CakFood, CakMart, CakPay, CakKost, CakRent, CakLangganan), field nama pemesan/pengirim/penyewa diisi otomatis dari localStorage cakjek_user_name saat halaman pertama kali dibuka
- Pengguna tetap dapat mengubah nama di form masing-masing halaman

### 4.10 Status Kost dan Kendaraan
- Kost berstatus「Penuh」tetap ditampilkan di list dengan overlay/badge「Penuh」dan tidak dapat dipesan
- Kendaraan berstatus「Disewa」tidak dapat dipilih untuk pemesanan
- Admin dapat mengubah status kost (tersedia/penuh) dan kendaraan (tersedia/disewa) melalui halaman manajemen

### 4.11 Fitur Search
- Tombol search di header beranda membuka input pencarian
- Saat pengguna mengetik, sistem melakukan pencarian dari:
  - Nama merchant (tabel merchants)
  - Nama menu_items dengan kategori food (tabel menu_items)
  - Nama produk dengan kategori mart (tabel menu_items)
- Hasil pencarian ditampilkan sebagai list overlay/panel di bawah search bar
- Setiap hasil menampilkan: nama, kategori, gambar
- Klik hasil:
  - Jika merchant → navigate ke /food/{id}
  - Jika menu item food → navigate ke /food/{merchant_id}
  - Jika produk mart → navigate ke /mart

### 4.12 Sistem Notifikasi
- Notifikasi dibuat setiap kali pesanan berhasil dikirim ke WhatsApp (setelah user tap「Pesan via WhatsApp」)
- Data notifikasi disimpan di localStorage key cakjek_notifications sebagai array
- Format data notifikasi: { id, service, message, timestamp, read }
- Badge merah muncul di ikon lonceng jika ada notifikasi dengan read=false
- Tombol「Tandai Semua Dibaca」mengubah status read semua notifikasi menjadi true

### 4.13 Edit Label Layanan
- Admin dapat mengubah label/nama tampilan layanan melalui halaman Manajemen Layanan
- Perubahan label tersimpan ke kolom label di tabel services
- Nama yang sudah diubah langsung tercermin di beranda yang fetch data dari database

## 5. Pengecualian dan Kondisi Batas

| Kondisi | Penanganan |
|---------|------------|
| Lokasi di luar radius servis | Tampilkan pesan error, pesanan tidak dapat dilanjutkan |
| Google Maps API gagal dimuat | Tampilkan pesan error, minta pengguna refresh halaman |
| Merchant tidak aktif | Tidak ditampilkan di list merchant |
| Menu item tidak aktif | Tidak ditampilkan di list menu |
| Banner promo tidak aktif atau di luar tanggal berlaku | Tidak ditampilkan di carousel |
| Jarak tidak dapat dihitung (Google Maps API error) | Tampilkan pesan error, minta pengguna coba lagi |
| Form input tidak lengkap | Tampilkan validasi error pada field yang kosong |
| Login admin gagal (username/password salah) | Tampilkan pesan error login |
| Token admin tidak valid/expired | Redirect ke halaman login |
| Koneksi WhatsApp gagal | Tampilkan pesan error, minta pengguna coba lagi |
| Upload foto gagal (Supabase Storage error) | Tampilkan pesan error, minta admin coba lagi |
| File foto tidak valid (format/ukuran) | Tampilkan pesan error validasi |
| Layanan nonaktif diklik | Tidak ada aksi, layanan tidak dapat dibuka |
| Kost berstatus Penuh dipilih | Tidak ada aksi, tombol tidak dapat diklik |
| Kendaraan berstatus Disewa dipilih | Tidak ada aksi, kendaraan tidak dapat dipilih |
| localStorage cakjek_user_name kosong | Field nama tetap kosong, pengguna harus mengisi manual |
| Search query kosong | Tidak menampilkan hasil pencarian |
| Tidak ada hasil pencarian | Tampilkan pesan「Tidak ada hasil ditemukan」|
| localStorage cakjek_notifications kosong | Halaman notifikasi menampilkan pesan「Belum ada notifikasi」|

## 6. Kriteria Penerimaan

1. Pengguna membuka aplikasi CakJek dan melihat halaman beranda dengan banner promo, grid 9 menu layanan dengan label yang dapat diubah dari admin, section「Produk Terbaru」, dan bottom navigation dengan container rounded dan shadow
2. Pengguna mengisi nama di halaman Akun, nama tersimpan di localStorage key cakjek_user_name
3. Pengguna klik tombol search di header beranda, input pencarian muncul, pengguna mengetik nama merchant/menu/produk, hasil pencarian ditampilkan, pengguna klik hasil dan diarahkan ke halaman terkait
4. Pengguna klik tombol lonceng di header beranda, halaman notifikasi terbuka menampilkan list notifikasi pesanan yang telah dikirim
5. Pengguna membuka halaman CakLangganan, mengisi form pemesanan paket berlangganan dengan nama terisi otomatis, memilih paket, mengisi alamat jemput dan tujuan dengan Google Maps picker, menekan tombol「Pesan via WhatsApp」, aplikasi membuka WhatsApp dengan teks pesanan otomatis
6. Pengguna melihat section「Produk Terbaru」di beranda menampilkan 6 produk terbaru dari semua kategori (food, mart, cakpay) dengan foto, nama, harga, dan badge kategori
7. Administrator login ke halaman admin, membuka halaman Manajemen Layanan, mengubah label layanan CakRide menjadi「Ojek Motor」, perubahan tersimpan ke database
8. Administrator membuka halaman Manajemen Tarif, melihat tarif CakMart (ongkir flat) dan CakLangganan (harga paket bulanan), melakukan edit tarif
9. Pengguna membuka halaman beranda, melihat label layanan CakRide sudah berubah menjadi「Ojek Motor」sesuai perubahan admin
10. Pengguna memesan layanan CakMart, sistem menghitung total dengan ongkir dari tabel tariffs layanan cakmart
11. Pengguna menekan tombol「Pesan via WhatsApp」di salah satu layanan, notifikasi baru ditambahkan ke localStorage cakjek_notifications, badge merah muncul di ikon lonceng
12. Pengguna membuka halaman notifikasi, menekan tombol「Tandai Semua Dibaca」, badge merah di ikon lonceng hilang

## 7. Fitur yang Tidak Diimplementasikan Periode Ini

- Sistem pembayaran online (payment gateway)
- Tracking real-time posisi driver
- Rating dan review dari pelanggan
- Notifikasi push
- Sistem poin/reward pelanggan
- Integrasi dengan aplikasi mobile native (iOS/Android)
- Fitur chat in-app antara pelanggan dan driver
- Sistem voucher/diskon otomatis
- Laporan keuangan detail (profit/loss, komisi driver)
- Manajemen driver/mitra
- Verifikasi OTP untuk registrasi
- Multi-bahasa (hanya Bahasa Indonesia)
- Export laporan ke PDF/Excel
- Integrasi dengan sistem ERP/accounting
- Fitur booking/jadwal pesanan di masa depan
- Validasi format file foto (tipe, ukuran)
- Crop/resize foto otomatis
- Preview foto sebelum upload
- Sistem booking/reservasi otomatis untuk kost atau kendaraan
- Kalender ketersediaan kost/kendaraan
- Konfirmasi pemesanan otomatis
- Filter lanjutan untuk pencarian produk
- Sorting hasil pencarian
- History pencarian
- Notifikasi push untuk pesanan baru
- Integrasi email notification

## 8. Struktur Database (Supabase)

### 8.1 Tabel settings
- app_name: nama aplikasi
- logo_url: URL logo aplikasi
- whatsapp_number: nomor WhatsApp tujuan
- service_center_lat: latitude pusat layanan
- service_center_lng: longitude pusat layanan
- service_radius_km: radius servis dalam km

### 8.2 Tabel banners
- judul: judul banner
- subjudul: subjudul banner
- kode_promo: kode promo
- gradient_from: warna gradient awal
- gradient_to: warna gradient akhir
- gambar_url: URL gambar banner
- urutan: urutan tampil
- aktif: status aktif/nonaktif
- tanggal_mulai: tanggal mulai berlaku
- tanggal_selesai: tanggal selesai berlaku

### 8.3 Tabel merchants
- nama: nama merchant
- gambar_url: URL gambar merchant
- alamat: alamat merchant
- deskripsi: deskripsi merchant
- ongkir: biaya ongkir
- rating: rating merchant
- aktif: status aktif/nonaktif

### 8.4 Tabel menu_items
- nama: nama item
- harga: harga item
- deskripsi: deskripsi item
- gambar_url: URL gambar item
- kategori: kategori (food/mart/cakpay)
- merchant_id: ID merchant (untuk kategori food)
- aktif: status aktif/nonaktif
- created_at: timestamp

### 8.5 Tabel tariffs
- layanan: nama layanan (ride/car/send/cakmart/caklangganan)
- base_fare: tarif dasar (untuk ride/car/send) atau ongkir flat (untuk cakmart) atau harga paket bulanan (untuk caklangganan)
- per_km: tarif per km (untuk ride/car/send, nullable untuk cakmart/caklangganan)
- label: label tarif

### 8.6 Tabel orders
- nama_pelanggan: nama pelanggan
- layanan: jenis layanan
- detail_pesanan: detail pesanan (JSON)
- total: total biaya
- status: status pesanan (new/process/done/cancel)
- waktu: waktu pesanan dibuat

### 8.7 Tabel services
- id: string (cakride/cakcar/cakfood/caksend/cakmart/cakpay/cakkost/cakrent/caklangganan)
- label: string (dapat diubah dari admin)
- active: boolean
- order_idx: integer

**Seed data awal tabel services:**
- cakride, Ojek Online, true, 1
- cakcar, Taxi Online, true, 2
- cakfood, Pesan Makan, true, 3
- caksend, Kirim Barang, true, 4
- cakmart, Belanja Pasar, true, 5
- cakpay, Tolong Bayar, true, 6
- cakkost, Sewa Kost, true, 7
- cakrent, Rental Kendaraan, true, 8
- caklangganan, Antar Jemput, true, 9

### 8.8 Tabel kosts
- id: integer (primary key)
- nama: string (nama kost)
- foto_url: string (URL foto kost)
- alamat: string (alamat kost)
- deskripsi: text (deskripsi kost)
- fasilitas: text (fasilitas kost)
- harga_harian: numeric (harga per hari)
- harga_mingguan: numeric (harga per minggu)
- harga_bulanan: numeric (harga per bulan)
- status: string (tersedia/penuh)
- aktif: boolean (status aktif/nonaktif)
- created_at: timestamp

### 8.9 Tabel vehicles
- id: integer (primary key)
- nama: string (nama kendaraan)
- jenis: string (motor/mobil)
- foto_url: string (URL foto kendaraan)
- deskripsi: text (deskripsi kendaraan)
- harga_harian: numeric (harga per hari)
- harga_mingguan: numeric (harga per minggu)
- harga_bulanan: numeric (harga per bulan)
- biaya_sopir_harian: numeric (nullable, hanya untuk mobil)
- status: string (tersedia/disewa)
- aktif: boolean (status aktif/nonaktif)
- created_at: timestamp