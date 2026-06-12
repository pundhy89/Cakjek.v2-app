import React, { useEffect, useState } from "react";
import { ServiceHeader } from "../components/ServiceHeader";
import { Field } from "../components/RideForm";
import { api, formatIDR } from "../lib/api";
import { useApp } from "../context/AppContext";
import { t } from "../lib/i18n";
import { toast } from "sonner";

export default function Cakpay() {
  const { lang } = useApp();
  const [packages, setPackages] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "", target_number: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/menu/cakpay").then((r) => setPackages(r.data)).catch(() => {});
  }, []);

  const submit = async () => {
    if (!form.name || !form.phone || !form.target_number || !selected) {
      toast.error(t(lang, "fill_required"));
      return;
    }
    setLoading(true);
    const message = `Halo Admin CakApp,\nSaya ingin *${t(lang, "cakpay")}*.\n\nNama: ${form.name}\nNo HP: ${form.phone}\nNomor tujuan / ID: ${form.target_number}\nPaket: ${selected.name}\n\nTotal: ${formatIDR(selected.price)}`;
    try {
      const r = await api.post("/orders", {
        service: "cakpay",
        customer_name: form.name,
        customer_phone: form.phone,
        details: { target: form.target_number, package_id: selected.id, package_name: selected.name },
        total: selected.price,
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
    <div data-testid="cakpay-page" className="min-h-screen">
      <ServiceHeader title={t(lang, "cakpay")} color="bg-cyan-600" />
      <div className="px-5 -mt-6">
        <div className="bg-card rounded-3xl border border-black/5 dark:border-white/10 p-4 shadow-md">
          <p className="text-xs font-semibold text-muted-foreground mb-3">{t(lang, "select_package")}</p>
          <div className="grid grid-cols-2 gap-2">
            {packages.map((p) => (
              <button
                key={p.id}
                data-testid={`pkg-${p.id}`}
                onClick={() => setSelected(p)}
                className={`text-left p-3 rounded-2xl border transition ${selected?.id === p.id ? "border-primary bg-primary/5" : "border-border bg-secondary/50"}`}
              >
                <p className="text-xs font-semibold text-foreground">{p.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{p.description}</p>
                <p className="text-sm font-bold text-primary mt-1">{formatIDR(p.price)}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-3xl border border-black/5 dark:border-white/10 p-5 shadow-md space-y-3 mt-4">
          <Field label={t(lang, "name")} value={form.name} onChange={(v) => setForm({ ...form, name: v })} testid="input-name" />
          <Field label={t(lang, "phone")} value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} testid="input-phone" />
          <Field label="No Tujuan / ID Pelanggan" value={form.target_number} onChange={(v) => setForm({ ...form, target_number: v })} testid="input-target" />

          <div className="flex items-center justify-between pt-3 border-t border-border">
            <span className="text-sm text-muted-foreground">{t(lang, "total")}</span>
            <span data-testid="total-amount" className="font-heading text-xl font-bold">{formatIDR(selected?.price || 0)}</span>
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
