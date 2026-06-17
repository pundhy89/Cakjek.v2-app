import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { AppProvider } from '@/contexts/AppContext';
import MobileShell from '@/components/MobileShell';

import Home from '@/pages/Home';
import CakRide from '@/pages/CakRide';
import CakCar from '@/pages/CakCar';
import CakSend from '@/pages/CakSend';
import CakFood from '@/pages/CakFood';
import CakFoodMerchant from '@/pages/CakFoodMerchant';
import CakMart from '@/pages/CakMart';
import CakPay from '@/pages/CakPay';
import CakKost from '@/pages/CakKost';
import CakRent from '@/pages/CakRent';
import CakLangganan from '@/pages/CakLangganan';
import Notifications from '@/pages/Notifications';
import Aktivitas from '@/pages/Aktivitas';
import Chat from '@/pages/Chat';
import Akun from '@/pages/Akun';

import AdminLogin from '@/pages/admin/AdminLogin';
import AdminLayout from '@/pages/admin/AdminLayout';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminOrders from '@/pages/admin/AdminOrders';
import AdminMenuFood from '@/pages/admin/AdminMenuFood';
import AdminMenuMart from '@/pages/admin/AdminMenuMart';
import AdminMenuCakpay from '@/pages/admin/AdminMenuCakpay';
import AdminMerchant from '@/pages/admin/AdminMerchant';
import AdminTariff from '@/pages/admin/AdminTariff';
import AdminBanner from '@/pages/admin/AdminBanner';
import AdminReports from '@/pages/admin/AdminReports';
import AdminSettings from '@/pages/admin/AdminSettings';
import AdminServices from '@/pages/admin/AdminServices';
import AdminKost from '@/pages/admin/AdminKost';
import AdminVehicle from '@/pages/admin/AdminVehicle';

const ShellRoute: React.FC = () => (
  <MobileShell>
    <Outlet />
  </MobileShell>
);

const App: React.FC = () => {
  return (
    <AppProvider>
      <Router>
        <Toaster richColors position="top-center" />
        <Routes>
          {/* User routes wrapped in MobileShell */}
          <Route element={<ShellRoute />}>
            <Route path="/" element={<Home />} />
            <Route path="/cakride" element={<CakRide />} />
            <Route path="/cakcar" element={<CakCar />} />
            <Route path="/caksend" element={<CakSend />} />
            <Route path="/cakfood" element={<CakFood />} />
            <Route path="/cakfood/:id" element={<CakFoodMerchant />} />
            <Route path="/cakmart" element={<CakMart />} />
            <Route path="/cakpay" element={<CakPay />} />
            <Route path="/cakkost" element={<CakKost />} />
            <Route path="/cakrent" element={<CakRent />} />
            <Route path="/caklangganan" element={<CakLangganan />} />
            <Route path="/notifikasi" element={<Notifications />} />
            <Route path="/aktivitas" element={<Aktivitas />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/akun" element={<Akun />} />
          </Route>
          {/* Admin routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="pesanan" element={<AdminOrders />} />
            <Route path="menu/food" element={<AdminMenuFood />} />
            <Route path="menu/mart" element={<AdminMenuMart />} />
            <Route path="menu/cakpay" element={<AdminMenuCakpay />} />
            <Route path="merchant" element={<AdminMerchant />} />
            <Route path="tarif" element={<AdminTariff />} />
            <Route path="banner" element={<AdminBanner />} />
            <Route path="layanan" element={<AdminServices />} />
            <Route path="kost" element={<AdminKost />} />
            <Route path="kendaraan" element={<AdminVehicle />} />
            <Route path="laporan" element={<AdminReports />} />
            <Route path="pengaturan" element={<AdminSettings />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AppProvider>
  );
};

export default App;
