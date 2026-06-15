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

## Implemented (2026-02-15)
- Admin Tariff: tambah field "Cakmart (Flat)" delivery fee.
- ImageUploader (Base64, client-side resize max 800px) terintegrasi di Admin Merchants (Cakfood) dan Admin Menu (Cakfood/Cakmart/Cakpay) menggantikan input URL.

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
