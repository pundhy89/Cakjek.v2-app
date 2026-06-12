import React, { useEffect, useState } from "react";
import { api, formatIDR } from "../../lib/api";
import { useApp } from "../../context/AppContext";
import { t } from "../../lib/i18n";
import { toast } from "sonner";

export default function AdminTariff() {
  const { lang } = useApp();
  const [tariffs, setTariffs] = useState([]);
  const [martFee, setMartFee] = useState(7000);
  const [martFeeSaving, setMartFeeSaving] = useState(false);

  const loadTariffs = () => api.get("/tariff").then((r) => setTariffs(r.data));
  const loadSettings = () =>
    api.get("/settings").then((r) => setMartFee(r.data.mart_delivery_fee ?? 7000));

  useEffect(() => {
    loadTariffs();
    loadSettings();
  }, []);

  const save = async (svc, base, per) => {
    try {
      await api.put(`/admin/tariff/${svc}`, { base_fare: Number(base), per_km: Number(per) });
      toast.success("Saved");
      loadTariffs();
    } catch (e) { toast.error("Failed"); }
  };

  const saveMartFee = async () => {
    setMartFeeSaving(true);
    try {
      // settings endpoint requires all fields, so fetch latest first to avoid overwriting
      const cur = await api.get("/settings").then((r) => r.data);
      await api.put("/admin/settings", {
        whatsapp_number: cur.whatsapp_number,
        app_name: cur.app_name,
        service_center_lat: cur.service_center_lat,
        service_center_lng: cur.service_center_lng,
        service_radius_km: cur.service_radius_km,
        mart_delivery_fee: Number(martFee || 0),
      });
      toast.success("Saved");
      loadSettings();
    } catch (e) {
      toast.error("Failed");
    } finally {
      setMartFeeSaving(false);
    }
  };

  return (
    <div data-testid="admin-tariff">
      <h1 className="font-heading text-3xl font-bold">{t(lang, "tariff")}</h1>
      <p className="text-muted-foreground text-sm mt-1">Atur tarif dasar dan per km untuk Cakride, Cakcar, Caksend, serta ongkir flat Cakmart.</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {tariffs.map((t1) => (
          <TariffCard key={t1.service} t={t1} onSave={save} lang={lang} />
        ))}

        {/* Cakmart flat delivery fee card */}
        <div className="bg-card rounded-3xl border border-black/5 dark:border-white/10 p-5 shadow-sm" data-testid="tariff-card-cakmart">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">cakmart</p>
          <h3 className="font-heading text-lg font-bold mt-1">Belanja (Flat)</h3>
          <label className="block mt-3">
            <span className="text-xs text-muted-foreground font-medium">Ongkir Cakmart (Rp)</span>
            <input
              data-testid="mart-delivery-fee"
              type="number"
              min="0"
              value={martFee}
              onChange={(e) => setMartFee(e.target.value)}
              className="mt-1 w-full bg-secondary rounded-xl px-3 py-2 text-sm outline-none"
              placeholder="7000"
            />
          </label>
          <p className="text-xs text-muted-foreground mt-2">Preview: {formatIDR(Number(martFee || 0))}</p>
          <p className="text-[11px] text-muted-foreground mt-1">Cakmart memakai tarif flat (tidak bergantung jarak).</p>
          <button
            data-testid="save-cakmart-fee"
            onClick={saveMartFee}
            disabled={martFeeSaving}
            className="mt-3 w-full bg-primary text-primary-foreground py-2 rounded-full text-sm font-semibold hover:opacity-90 active:scale-95 transition disabled:opacity-60"
          >
            {martFeeSaving ? "..." : t(lang, "save")}
          </button>
        </div>
      </div>
    </div>
  );
}

const TariffCard = ({ t: tar, onSave, lang }) => {
  const [base, setBase] = useState(tar.base_fare);
  const [per, setPer] = useState(tar.per_km);
  useEffect(() => { setBase(tar.base_fare); setPer(tar.per_km); }, [tar]);
  return (
    <div className="bg-card rounded-3xl border border-black/5 dark:border-white/10 p-5 shadow-sm">
      <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{tar.service}</p>
      <h3 className="font-heading text-lg font-bold mt-1">{tar.label || tar.service}</h3>
      <label className="block mt-3">
        <span className="text-xs text-muted-foreground font-medium">{t(lang, "base_fare")}</span>
        <input data-testid={`base-${tar.service}`} type="number" value={base} onChange={(e) => setBase(e.target.value)} className="mt-1 w-full bg-secondary rounded-xl px-3 py-2 text-sm outline-none" />
      </label>
      <label className="block mt-2">
        <span className="text-xs text-muted-foreground font-medium">{t(lang, "per_km")}</span>
        <input data-testid={`perkm-${tar.service}`} type="number" value={per} onChange={(e) => setPer(e.target.value)} className="mt-1 w-full bg-secondary rounded-xl px-3 py-2 text-sm outline-none" />
      </label>
      <p className="text-xs text-muted-foreground mt-2">Preview 5km: {formatIDR(Number(base) + Number(per) * 5)}</p>
      <button data-testid={`save-${tar.service}`} onClick={() => onSave(tar.service, base, per)} className="mt-3 w-full bg-primary text-primary-foreground py-2 rounded-full text-sm font-semibold hover:opacity-90 active:scale-95 transition">{t(lang, "save")}</button>
    </div>
  );
};
