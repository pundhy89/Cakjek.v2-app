import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { Toaster } from "sonner";
import { AppProvider } from "./context/AppContext";
import { MobileShell } from "./components/MobileShell";
import Home from "./pages/Home";
import Cakride from "./pages/Cakride";
import Cakcar from "./pages/Cakcar";
import Cakfood from "./pages/CakfoodList";
import CakfoodMerchant from "./pages/CakfoodMerchant";
import Caksend from "./pages/Caksend";
import Cakmart from "./pages/Cakmart";
import Cakpay from "./pages/Cakpay";
import Orders from "./pages/Orders";
import Account from "./pages/Account";
import Chat from "./pages/Chat";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminMenu from "./pages/admin/AdminMenu";
import AdminTariff from "./pages/admin/AdminTariff";
import AdminReports from "./pages/admin/AdminReports";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminBanners from "./pages/admin/AdminBanners";
import AdminMerchants from "./pages/admin/AdminMerchants";
import AdminKost from "./pages/admin/AdminKost";
import AdminRent from "./pages/admin/AdminRent";
import CakKost from "./pages/CakKost";
import CakRent from "./pages/CakRent";

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Toaster richColors position="top-center" />
        <Routes>
          <Route element={<ShellRoute />}>
            <Route path="/" element={<Home />} />
            <Route path="/cakride" element={<Cakride />} />
            <Route path="/cakcar" element={<Cakcar />} />
            <Route path="/cakfood" element={<Cakfood />} />
            <Route path="/cakfood/:mid" element={<CakfoodMerchant />} />
            <Route path="/caksend" element={<Caksend />} />
            <Route path="/cakmart" element={<Cakmart />} />
            <Route path="/cakpay" element={<Cakpay />} />
            <Route path="/cakkost" element={<CakKost />} />
            <Route path="/cakrent" element={<CakRent />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/account" element={<Account />} />
            <Route path="/chat" element={<Chat />} />
          </Route>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="food" element={<AdminMenu category="food" />} />
            <Route path="merchants" element={<AdminMerchants />} />
            <Route path="mart" element={<AdminMenu category="mart" />} />
            <Route path="cakpay" element={<AdminMenu category="cakpay" />} />
            <Route path="kost" element={<AdminKost />} />
            <Route path="rent" element={<AdminRent />} />
            <Route path="tariff" element={<AdminTariff />} />
            <Route path="banners" element={<AdminBanners />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

const ShellRoute = () => (
  <MobileShell>
    <Outlet />
  </MobileShell>
);

export default App;
