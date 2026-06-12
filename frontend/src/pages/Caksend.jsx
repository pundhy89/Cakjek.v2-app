import React, { useEffect, useState } from "react";
import { ServiceHeader } from "../components/ServiceHeader";
import { Field } from "../components/RideForm";
import AddressMapPicker from "../components/AddressMapPicker";
import { api, formatIDR } from "../lib/api";
import { routeDistanceKm } from "../lib/maps";
import { useApp } from "../context/AppContext";
import { t } from "../lib/i18n";
import { toast } from "sonner";

export default function Caksend() {
  const { lang } = useApp();
  const [tariff, setTariff] = useState(null);
  const [form, setForm] = useState({
    name: "", phone: "",
    pickup: "", pickupCoords: null,
    destination: "", destinationCoords: null,
    distance: 1, receiver: "", package: "",
  });
  const [calcing, setCalcing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/tariff/caksend").then((r) => setTariff(r.data)).catch(() => {});
  }, []);

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
    if (!form.name || !form.phone || !form.pickup || !form.destination || !form.receiver) {
      toast.error(t(lang, "fill_required"));
      return;
    }
    setLoading(true);
    const pCoord = form.pickupCoords ? `\nPin Jemput: https://maps.google.com/?q=${form.pickupCoords.lat},${form.pickupCoords.lng}` : "";
    const dCoord = form.destinationCoords ? `\nPin Tujuan: https://maps.google.com/?q=${form.destinationCoords.lat},${form.destinationCoords.lng}` : "";
    const message = `Halo Admin CakJek,\nSaya ingin *${t(lang, "caksend")}*.\n\nPengirim: ${form.name}\nNo HP: ${form.phone}\nAlamat jemput: ${form.pickup}${pCoord}\n\nPenerima: ${form.receiver}\nAlamat tujuan: ${form.destination}${dCoord}\nJarak: ${form.distance} km\nIsi paket: ${form.package || "-"}\n\nTotal: ${formatIDR(total)}`;
    try {
      const r = await api.post("/orders", {
        service: "caksend",
        customer_name: form.name,
        customer_phone: form.phone,
        details: form,
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
    <div data-testid="caksend-page" className="min-h-screen">
      <ServiceHeader title={t(lang, "caksend")} color="bg-violet-600">
        <p className="text-white/80 text-sm mt-1">{tariff ? `${formatIDR(tariff.base_fare)} + ${formatIDR(tariff.per_km)}/km` : ""}</p>
      </ServiceHeader>
      <div className="px-5 -mt-6">
        <div className="bg-card rounded-3xl border border-black/5 dark:border-white/10 p-5 shadow-md space-y-3">
          <Field label={t(lang, "name")} value={form.name} onChange={(v) => setForm({ ...form, name: v })} testid="input-name" />
          <Field label={t(lang, "phone")} value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} testid="input-phone" />

          <AddressMapPicker
            label={t(lang, "pickup")}
            value={form.pickup}
            coords={form.pickupCoords}
            onChange={(addr, c) => setForm((f) => ({ ...f, pickup: addr, pickupCoords: c }))}
            testid="pickup-picker"
          />
          <Field label={t(lang, "receiver")} value={form.receiver} onChange={(v) => setForm({ ...form, receiver: v })} testid="input-receiver" />
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

          <Field label={t(lang, "package")} value={form.package} onChange={(v) => setForm({ ...form, package: v })} testid="input-package" />

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
}
