import React, { useEffect, useState } from "react";
import { ServiceHeader } from "../components/ServiceHeader";
import { api, formatIDR } from "../lib/api";
import { useApp } from "../context/AppContext";
import { t } from "../lib/i18n";
import { toast } from "sonner";

const RideForm = ({ service, title, color, lang }) => {
  const [tariff, setTariff] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "", pickup: "", destination: "", distance: 1, notes: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get(`/tariff/${service}`).then((r) => setTariff(r.data)).catch(() => {});
  }, [service]);

  const total = tariff ? Number(tariff.base_fare) + Number(tariff.per_km) * Number(form.distance || 0) : 0;

  const submit = async () => {
    if (!form.name || !form.phone || !form.pickup || !form.destination) {
      toast.error(t(lang, "fill_required"));
      return;
    }
    setLoading(true);
    const message = `Halo Admin CakJek,\nSaya ingin pesan *${title}*.\n\nNama: ${form.name}\nNo HP: ${form.phone}\nJemput: ${form.pickup}\nTujuan: ${form.destination}\nJarak: ${form.distance} km\nCatatan: ${form.notes || "-"}\n\nTotal: ${formatIDR(total)}`;
    try {
      const r = await api.post("/orders", {
        service,
        customer_name: form.name,
        customer_phone: form.phone,
        details: { pickup: form.pickup, destination: form.destination, distance: form.distance, notes: form.notes },
        total,
        message,
      });
      toast.success(t(lang, "redirect_wa"));
      window.location.href = r.data.whatsapp_url;
    } catch (e) {
      toast.error("Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-testid={`${service}-page`} className="min-h-screen">
      <ServiceHeader title={title} color={color}>
        <p className="text-white/80 text-sm mt-1">{tariff ? `${formatIDR(tariff.base_fare)} + ${formatIDR(tariff.per_km)}/km` : ""}</p>
      </ServiceHeader>
      <div className="px-5 -mt-6">
        <div className="bg-card rounded-3xl border border-black/5 dark:border-white/10 p-5 shadow-md space-y-3">
          <Field label={t(lang, "name")} value={form.name} onChange={(v) => setForm({ ...form, name: v })} testid="input-name" />
          <Field label={t(lang, "phone")} value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} testid="input-phone" />
          <Field label={t(lang, "pickup")} value={form.pickup} onChange={(v) => setForm({ ...form, pickup: v })} testid="input-pickup" />
          <Field label={t(lang, "destination")} value={form.destination} onChange={(v) => setForm({ ...form, destination: v })} testid="input-destination" />
          <Field type="number" label={t(lang, "distance")} value={form.distance} onChange={(v) => setForm({ ...form, distance: v })} testid="input-distance" />
          <Field label={t(lang, "notes")} value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} testid="input-notes" />

          <div className="flex items-center justify-between pt-3 border-t border-border">
            <span className="text-sm text-muted-foreground">{t(lang, "total")}</span>
            <span data-testid="total-amount" className="font-heading text-xl font-bold">{formatIDR(total)}</span>
          </div>
          <button
            disabled={loading}
            onClick={submit}
            data-testid="order-whatsapp-btn"
            className="w-full bg-[#25D366] hover:bg-[#1ebe57] text-white font-semibold py-3 rounded-full transition active:scale-95"
          >
            {loading ? "..." : t(lang, "order_now")}
          </button>
        </div>
      </div>
    </div>
  );
};

export const Field = ({ label, value, onChange, type = "text", testid }) => (
  <label className="block">
    <span className="text-xs font-medium text-muted-foreground">{label}</span>
    <input
      data-testid={testid}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="mt-1 w-full bg-secondary text-foreground rounded-xl px-4 py-2.5 text-sm border border-transparent focus:border-primary focus:bg-card outline-none transition"
    />
  </label>
);

export default RideForm;
