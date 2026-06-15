# PRD — CakApp (Gojek-like Super App)

## Original Problem Statement
"Buatkan mobile apps berbasis web, aplikasi mirip gojek tetapi lebih simple.
Layanan: Cakride, Cakcar, Cakfood, Caksend, Cakmart, Cakpay.
Kasih pilihan bahasa (ID/EN), pilihan mode (gelap/terang).
Halaman admin untuk menambahkan/edit, laporan harian dan bulanan.
Setiap pemesanan langsung masuk ke WhatsApp admin otomatis terketik pilihannya."

## Architecture
- Frontend: React 19, Tailwind CSS + shadcn/lucide, Sonner toasts, Recharts. Mobile-first shell (`max-w-md mx-auto`) with bottom nav.
- Backend: FastAPI + MongoDB (motor). Routes under `/api`. Token-based admin auth (`secrets.token_urlsafe`).
- WhatsApp: Click-to-Chat via `wa.me/<number>?text=<encoded>`.
- i18n via in-memory dictionary (ID/EN). Theme via `dark` class on `<html>`.

## User Personas
- End-user (no login): orders services on mobile web.
- Admin: manages menus, tariffs, settings, views reports.

## Implemented (2026-02-16)
- **Home: CakPay balance hardcoded to "Rp 0"** (data-testid `cakpay-balance`).
- **Home: % button now navigates to `/promo`** (data-testid `home-promo-btn`).
- **Promo Page (`/promo`)** — public page listing banner/promo as cards. Shows title, subtitle, description, kode, link tujuan, gambar, gradient color, date range. Empty state if no banners.
- **Banner schema extended** with `description` + `link` fields; AdminBanners form updated (data-testid `bf-desc`, `bf-link`).
- **Service Toggles (Menu Aktif/Nonaktif)** — `GET /api/services` (public) returns toggle map; `PUT /api/admin/services` (admin) updates. Stored in `app_config` doc id=`service_toggles`. Default all true.
- **AdminServices page (`/admin/services`)** — toggle UI for 8 service menus. Saved toggles drive Home rendering.
- **Home menu grid** is 4 cols × 2 rows; deactivated services rendered with grayscale icon, muted label, "Coming Soon" badge, and are non-clickable (rendered as `<div>` with `pointer-events-none`).
- AdminLayout nav: added "Menu Layanan" entry pointing to `/admin/services`.

## Implemented (2026-02-15)
- Admin Tariff: tambah field "Cakmart (Flat)" delivery fee.
- ImageUploader (Base64, client-side resize max 800px) terintegrasi di Admin Merchants (Cakfood) dan Admin Menu (Cakfood/Cakmart/Cakpay) menggantikan input URL.
- **Admin Credentials Change** — endpoint `PUT /api/admin/credentials` + form di `/admin/settings`. Username/password admin sekarang di-persist di MongoDB (`admin_creds`).
- **Admin Login Back Button** — tombol "Beranda" di kiri-atas halaman login admin.
- **CakKost** — service baru: list kost (level 1, no parent), booking dengan tanggal mulai sewa + durasi bulan, checkout WhatsApp. Admin CRUD di `/admin/kost`. Endpoint: `/api/kost`, `/api/admin/kost`.
- **CakRent** — service baru: sewa mobil/motor per hari, mobil punya opsi "lepas kunci" atau "+sopir" (harga berbeda). Tab filter mobil/motor. Booking dengan tanggal mulai + durasi hari. Admin CRUD di `/admin/rent`. Endpoint: `/api/rent`, `/api/admin/rent`.
- Home grid sekarang 8 layanan (CakKost + CakRent ditambahkan).

## Implemented (2026-02-12)
- Home with 6 services + promo banner.
- Cakride, Cakcar (km tariff). Caksend (km tariff + receiver/package).
- Cakfood, Cakmart (catalog + cart). Cakpay (top-up/pulsa packages).
- WhatsApp checkout: order is saved to DB then user redirected to wa.me with pre-typed message.
- Account page: ID/EN toggle, light/dark toggle, admin shortcut.
- Admin: login, dashboard, orders list, menu CRUD (food/mart/cakpay), tariff editor, daily+monthly reports with Recharts bar charts, settings (WA number).
- Seed defaults for tariffs, food, mart, cakpay packages, and settings.

## Backlog
- P1: Order history per phone number on the user side (currently empty placeholder).
- P1: Order status workflow (in-progress/done) and admin notification updates.
- P2: Image upload (object storage) for admin menu items.
- P2: Per-service hero illustrations + onboarding.
- P2: Push real-time notifications to admin (Twilio WhatsApp API).

## Next Actions
- Optional: connect to Twilio for true server-side WhatsApp sending.
- Optional: add per-user OTP login for order history.
