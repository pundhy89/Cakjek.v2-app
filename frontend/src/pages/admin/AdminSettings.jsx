import React, { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { useApp } from "../../context/AppContext";
import { t } from "../../lib/i18n";
import { toast } from "sonner";
import AddressMapPicker from "../../components/AddressMapPicker";

export default function AdminSettings() {
  const { lang } = useApp();
  const [form, setForm] = useState({
    whatsapp_number: "", app_name: "CakJek",
    service_center_lat: -7.2575, service_center_lng: 112.7521,
    service_radius_km: 20,
  });
  const [centerAddr, setCenterAddr] = useState("");

  useEffect(() => {
    api.get("/settings").then((r) => {
      setForm({
        whatsapp_number: r.data.whatsapp_number,
        app_name: r.data.app_name || "CakJek",
        service_center_lat: r.data.service_center_lat ?? -7.2575,
        service_center_lng: r.data.service_center_lng ?? 112.7521,
        service_radius_km: r.data.service_radius_km ?? 20,
        mart_delivery_fee: r.data.mart_delivery_fee ?? 7000,
      });
    });
  }, []);

  const save = async () => {
    try {
      await api.put("/admin/settings", {
        ...form,
        service_center_lat: Number(form.service_center_lat),
        service_center_lng: Number(form.service_center_lng),
        service_radius_km: Number(form.service_radius_km),
        mart_delivery_fee: Number(form.mart_delivery_fee || 0),
      });
      toast.success("Saved");
    } catch (e) { toast.error("Failed"); }
  };

  const coords = { lat: Number(form.service_center_lat), lng: Number(form.service_center_lng) };

  return (
    <div data-testid="admin-settings">
      <h1 className="font-heading text-3xl font-bold">{t(lang, "settings")}</h1>
      <p className="text-muted-foreground text-sm mt-1">{t(lang, "app_settings")}</p>

      <div className="grid lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-card rounded-3xl border border-black/5 dark:border-white/10 p-6 shadow-sm space-y-4">
          <h2 className="font-heading font-bold">Umum</h2>
          <label className="block">
            <span className="text-xs text-muted-foreground font-medium">{t(lang, "whatsapp_number")}</span>
            <input data-testid="setting-wa" value={form.whatsapp_number} onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })} className="mt-1 w-full bg-secondary rounded-xl px-3 py-2 text-sm outline-none" placeholder="6285233962821" />
            <span className="text-xs text-muted-foreground mt-1 block">Tanpa tanda +, awali dengan kode negara (cth: 62...)</span>
          </label>
          <label className="block">
            <span className="text-xs text-muted-foreground font-medium">App Name</span>
            <input data-testid="setting-appname" value={form.app_name} onChange={(e) => setForm({ ...form, app_name: e.target.value })} className="mt-1 w-full bg-secondary rounded-xl px-3 py-2 text-sm outline-none" />
          </label>
          <label className="block">
            <span className="text-xs text-muted-foreground font-medium">Ongkir Cakmart (Rp)</span>
            <input data-testid="setting-mart-fee" type="number" value={form.mart_delivery_fee || 0} onChange={(e) => setForm({ ...form, mart_delivery_fee: e.target.value })} className="mt-1 w-full bg-secondary rounded-xl px-3 py-2 text-sm outline-none" />
          </label>
        </div>
            <p className="text-xs text-muted-foreground">Order di luar radius akan otomatis ditolak.</p>
          </div>
          <AddressMapPicker
            label="Pusat area servis"
            value={centerAddr}
            coords={coords}
            onChange={(addr, c) => {
              setCenterAddr(addr);
              if (c) setForm((f) => ({ ...f, service_center_lat: c.lat, service_center_lng: c.lng }));
            }}
            testid="center-picker"
          />
          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <span className="text-xs text-muted-foreground font-medium">Latitude</span>
              <input data-testid="setting-lat" type="number" step="0.0001" value={form.service_center_lat} onChange={(e) => setForm({ ...form, service_center_lat: e.target.value })} className="mt-1 w-full bg-secondary rounded-xl px-3 py-2 text-sm outline-none" />
            </label>
            <label className="block">
              <span className="text-xs text-muted-foreground font-medium">Longitude</span>
              <input data-testid="setting-lng" type="number" step="0.0001" value={form.service_center_lng} onChange={(e) => setForm({ ...form, service_center_lng: e.target.value })} className="mt-1 w-full bg-secondary rounded-xl px-3 py-2 text-sm outline-none" />
            </label>
          </div>
          <label className="block">
            <span className="text-xs text-muted-foreground font-medium">Radius (km)</span>
            <input data-testid="setting-radius" type="number" step="0.5" value={form.service_radius_km} onChange={(e) => setForm({ ...form, service_radius_km: e.target.value })} className="mt-1 w-full bg-secondary rounded-xl px-3 py-2 text-sm outline-none" />
            <span className="text-xs text-muted-foreground mt-1 block">Set 0 untuk menonaktifkan batas area.</span>
          </label>
        </div>
      </div>

      <div className="mt-6">
        <button data-testid="setting-save" onClick={save} className="bg-primary text-primary-foreground px-6 py-2.5 rounded-full text-sm font-semibold hover:opacity-90 active:scale-95 transition">{t(lang, "save")}</button>
      </div>
    </div>
  );
}
