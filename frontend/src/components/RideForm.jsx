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
    name: "",
    pickup: "", pickupCoords: null,
    stops: [{ destination: "", destinationCoords: null }],
    notes: "",
  });
  const [distance, setDistance] = useState(1);
  const [calcing, setCalcing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState({ open: false, url: "" });

  useEffect(() => {
    api.get(`/tariff/${service}`).then((r) => setTariff(r.data)).catch(() => {});
  }, [service]);

  // Auto compute total distance (sum of legs: pickup→stop1→stop2…)
  useEffect(() => {
    const points = [form.pickupCoords, ...form.stops.map((s) => s.destinationCoords)].filter(Boolean);
    if (points.length < 2) return;
    setCalcing(true);
    (async () => {
      let total = 0;
      for (let i = 0; i < points.length - 1; i++) {
        const km = await routeDistanceKm(points[i], points[i + 1]);
        if (km != null) total += km;
      }
      setCalcing(false);
      setDistance(Math.round(total * 10) / 10 || 1);
    })();
  }, [form.pickupCoords, JSON.stringify(form.stops.map((s) => s.destinationCoords))]);

  const total = tariff ? Number(tariff.base_fare) + Number(tariff.per_km) * Number(distance || 0) : 0;

  const addStop = () => setForm((f) => ({ ...f, stops: [...f.stops, { destination: "", destinationCoords: null }] }));
  const removeStop = (i) => setForm((f) => ({ ...f, stops: f.stops.filter((_, idx) => idx !== i) }));
  const updateStop = (i, addr, c) => setForm((f) => ({ ...f, stops: f.stops.map((s, idx) => (idx === i ? { destination: addr, destinationCoords: c } : s)) }));

  const submit = async () => {
    if (!form.name || !form.pickup || form.stops.some((s) => !s.destination)) {
      toast.error(t(lang, "fill_required"));
      return;
    }
    setLoading(true);
    const pCoord = form.pickupCoords ? `\nPin Jemput: https://maps.google.com/?q=${form.pickupCoords.lat},${form.pickupCoords.lng}` : "";
    const stopLines = form.stops.map((s, i) => {
      const pin = s.destinationCoords ? `\n  Pin: https://maps.google.com/?q=${s.destinationCoords.lat},${s.destinationCoords.lng}` : "";
      return `Tujuan ${i + 1}: ${s.destination}${pin}`;
    }).join("\n");
    const message = `Halo Admin CakJek,\nSaya ingin pesan *${title}*.\n\nNama: ${form.name}\nJemput: ${form.pickup}${pCoord}\n${stopLines}\nJarak total: ${distance} km\nCatatan: ${form.notes || "-"}\n\nTotal: ${formatIDR(total)}`;
    try {
      const r = await api.post("/orders", {
        service,
        customer_name: form.name,
        customer_phone: "",
        details: {
          pickup: form.pickup, pickup_coords: form.pickupCoords,
          stops: form.stops, distance, notes: form.notes,
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
          {form.stops.map((s, i) => (
            <div key={i} className="relative">
              <AddressMapPicker
                label={`Tujuan ${i + 1}`}
                value={s.destination}
                coords={s.destinationCoords}
                onChange={(addr, c) => updateStop(i, addr, c)}
                testid={`destination-picker-${i}`}
              />
              {form.stops.length > 1 && (
                <button type="button" onClick={() => removeStop(i)} data-testid={`remove-stop-${i}`} className="absolute top-0 right-0 text-xs text-destructive font-semibold">Hapus</button>
              )}
            </div>
          ))}
          <button type="button" onClick={addStop} data-testid="add-stop-btn" className="w-full border border-dashed border-blue-500 text-blue-500 rounded-xl py-2 text-sm font-semibold hover:bg-blue-50 dark:hover:bg-blue-950/30 active:scale-95 transition">
            + Tambah Tujuan
          </button>

          <label className="block">
            <span className="text-xs font-medium text-muted-foreground flex items-center justify-between">
              <span>Jarak Total (km)</span>
              {calcing && <span className="text-[10px] text-primary">menghitung…</span>}
              {!calcing && form.pickupCoords && form.stops.some((s) => s.destinationCoords) && (
                <span className="text-[10px] text-emerald-600">otomatis dari rute</span>
              )}
            </span>
            <input
              data-testid="input-distance"
              type="number" step="0.1"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
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
