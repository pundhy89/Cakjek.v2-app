import React, { useEffect, useState } from "react";
import { ServiceHeader } from "../components/ServiceHeader";
import AddressMapPicker from "../components/AddressMapPicker";
import OrderSuccessModal from "../components/OrderSuccessModal";
import { api, formatIDR } from "../lib/api";
import { routeDistanceKm } from "../lib/maps";
import { useApp } from "../context/AppContext";
import { t } from "../lib/i18n";
import { toast } from "sonner";

const RideForm = ({ service, title, color, lang }) => {
  const [tariff, setTariff] = useState(null);
  const [form, setForm] = useState({
    name: "", phone: "",
    pickup: "", pickupCoords: null,
    destination: "", destinationCoords: null,
    distance: 1, notes: "",
  });
  const [calcing, setCalcing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState({ open: false, url: "" });

  useEffect(() => {
    api.get(`/tariff/${service}`).then((r) => setTariff(r.data)).catch(() => {});
  }, [service]);

  // Auto compute distance whenever both coords change
  useEffect(() => {
    const { pickupCoords, destinationCoords } = form;
    if (pickupCoords && destinationCoords) {
      setCalcing(true);
      routeDistanceKm(pickupCoords, destinationCoords).then((km) => {
        setCalcing(false);
        if (km != null) setForm((f) => ({ ...f, distance: km }));
      });
    }
  }, [form.pickupCoords, form.destinationCoords]);

  const total = tariff ? Number(tariff.base_fare) + Number(tariff.per_km) * Number(form.distance || 0) : 0;

  const submit = async () => {
    if (!form.name || !form.pickup || !form.destination) {
      toast.error(t(lang, "fill_required"));
      return;
    }
    setLoading(true);
    const pCoord = form.pickupCoords ? `\nPin Jemput: https://maps.google.com/?q=${form.pickupCoords.lat},${form.pickupCoords.lng}` : "";
    const dCoord = form.destinationCoords ? `\nPin Tujuan: https://maps.google.com/?q=${form.destinationCoords.lat},${form.destinationCoords.lng}` : "";
    const message = `Halo Admin CakJek,\nSaya ingin pesan *${title}*.\n\nNama: ${form.name}\nJemput: ${form.pickup}${pCoord}\nTujuan: ${form.destination}${dCoord}\nJarak: ${form.distance} km\nCatatan: ${form.notes || "-"}\n\nTotal: ${formatIDR(total)}`;
    try {
      const r = await api.post("/orders", {
        service,
        customer_name: form.name,
        customer_phone: "",
        details: {
          pickup: form.pickup, pickup_coords: form.pickupCoords,
          destination: form.destination, destination_coords: form.destinationCoords,
          distance: form.distance, notes: form.notes,
        },
        total,
        message,
      });
      toast.success(t(lang, "redirect_wa"));
      setSuccess({ open: true, url: r.data.whatsapp_url });
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Failed");
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

          <AddressMapPicker
            label={t(lang, "pickup")}
            value={form.pickup}
            coords={form.pickupCoords}
            onChange={(addr, c) => setForm((f) => ({ ...f, pickup: addr, pickupCoords: c }))}
            testid="pickup-picker"
          />
          <AddressMapPicker
            label={t(lang, "destination")}
            value={form.destination}
            coords={form.destinationCoords}
            onChange={(addr, c) => setForm((f) => ({ ...f, destination: addr, destinationCoords: c }))}
            testid="destination-picker"
          />

          <label className="block">
            <span className="text-xs font-medium text-muted-foreground flex items-center justify-between">
              <span>{t(lang, "distance")}</span>
              {calcing && <span className="text-[10px] text-primary">menghitung rute…</span>}
              {!calcing && form.pickupCoords && form.destinationCoords && (
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400">otomatis dari rute jalan</span>
              )}
            </span>
            <input
              data-testid="input-distance"
              type="number"
              step="0.1"
              value={form.distance}
              onChange={(e) => setForm({ ...form, distance: e.target.value })}
              className="mt-1 w-full bg-secondary text-foreground rounded-xl px-4 py-2.5 text-sm border border-transparent focus:border-primary focus:bg-card outline-none transition"
            />
          </label>

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
      <OrderSuccessModal open={success.open} onDone={() => { window.location.href = success.url; }} />
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
