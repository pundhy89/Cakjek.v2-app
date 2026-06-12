import React, { useEffect, useState } from "react";
import { api, formatIDR } from "../../lib/api";
import { useApp } from "../../context/AppContext";
import { t } from "../../lib/i18n";
import { toast } from "sonner";

export default function AdminTariff() {
  const { lang } = useApp();
  const [tariffs, setTariffs] = useState([]);

  const load = () => api.get("/tariff").then((r) => setTariffs(r.data));
  useEffect(() => { load(); }, []);

  const save = async (svc, base, per) => {
    try {
      await api.put(`/admin/tariff/${svc}`, { base_fare: Number(base), per_km: Number(per) });
      toast.success("Saved");
      load();
    } catch (e) { toast.error("Failed"); }
  };

  return (
    <div data-testid="admin-tariff">
      <h1 className="font-heading text-3xl font-bold">{t(lang, "tariff")}</h1>
      <p className="text-muted-foreground text-sm mt-1">Atur tarif dasar dan per km untuk Cakride, Cakcar, Caksend.</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {tariffs.map((t1) => (
          <TariffCard key={t1.service} t={t1} onSave={save} lang={lang} />
        ))}
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
