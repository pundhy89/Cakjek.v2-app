import React, { useEffect, useState, useMemo } from "react";
import { ServiceHeader } from "../components/ServiceHeader";
import OrderSuccessModal from "../components/OrderSuccessModal";
import { api, formatIDR } from "../lib/api";
import { useApp } from "../context/AppContext";
import { t } from "../lib/i18n";
import { toast } from "sonner";
import { Car, Bike, X } from "lucide-react";

export default function CakRent() {
  const { lang } = useApp();
  const [items, setItems] = useState([]);
  const [tab, setTab] = useState("mobil"); // mobil | motor
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "", start_date: "", days: 1, with_driver: false, notes: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState({ open: false, url: "" });

  useEffect(() => {
    api.get("/rent").then((r) => setItems(r.data)).catch(() => {});
  }, []);

  const filtered = useMemo(() => items.filter((i) => i.type === tab), [items, tab]);

  const open = (r) => {
    setSelected(r);
    setForm({ name: "", phone: "", start_date: new Date().toISOString().slice(0, 10), days: 1, with_driver: false, notes: "" });
  };
  const close = () => setSelected(null);

  const unitPrice = selected ? (form.with_driver && selected.allow_with_driver ? Number(selected.price_with_driver || 0) : Number(selected.price_day || 0)) : 0;
  const total = unitPrice * Math.max(1, Number(form.days || 1));

  const submit = async () => {
    if (!form.name || !form.phone || !form.start_date) {
      toast.error(t(lang, "fill_required"));
      return;
    }
    setLoading(true);
    const opt = selected.type === "mobil" ? (form.with_driver ? "Plus Sopir" : "Lepas Kunci") : "Lepas Kunci";
    const message = `Halo Admin CakJek,\nSaya mau sewa *CakRent*.\n\nNama: ${form.name}\nNo. HP: ${form.phone}\n\nKendaraan: ${selected.name} (${selected.type})\nOpsi: ${opt}\nHarga/hari: ${formatIDR(unitPrice)}\n\nTanggal mulai: ${form.start_date}\nDurasi: ${form.days} hari\nCatatan: ${form.notes || "-"}\n\nTotal: ${formatIDR(total)}`;
    try {
      const r = await api.post("/orders", {
        service: "cakrent",
        customer_name: form.name,
        customer_phone: form.phone,
        details: { rent_id: selected.id, vehicle: selected.name, type: selected.type, with_driver: !!(form.with_driver && selected.allow_with_driver), start_date: form.start_date, days: Number(form.days), notes: form.notes, unit_price: unitPrice },
        total,
        message,
      });
      toast.success(t(lang, "redirect_wa"));
      setSuccess({ open: true, url: r.data.whatsapp_url });
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Failed");
    } finally { setLoading(false); }
  };

  return (
    <div data-testid="cakrent-page" className="min-h-screen">
      <ServiceHeader title="CakRent" color="bg-amber-600" />
      <div className="px-5 -mt-6">
        <div className="bg-card rounded-3xl border border-black/5 dark:border-white/10 p-3 shadow-md">
          <div className="flex gap-2 mb-3">
            <button data-testid="rent-tab-mobil" onClick={() => setTab("mobil")} className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-semibold transition ${tab === "mobil" ? "bg-amber-500 text-white" : "bg-secondary text-foreground"}`}>
              <Car size={16} /> Mobil
            </button>
            <button data-testid="rent-tab-motor" onClick={() => setTab("motor")} className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-semibold transition ${tab === "motor" ? "bg-amber-500 text-white" : "bg-secondary text-foreground"}`}>
              <Bike size={16} /> Motor
            </button>
          </div>

          <div className="space-y-3">
            {filtered.map((r) => (
              <button
                key={r.id}
                data-testid={`rent-${r.id}`}
                onClick={() => open(r)}
                className="w-full text-left flex gap-3 p-2 rounded-2xl hover:bg-secondary/50 transition active:scale-[0.99]"
              >
                {r.image ? <img src={r.image} alt={r.name} className="w-20 h-20 rounded-xl object-cover" /> : <div className="w-20 h-20 rounded-xl bg-secondary" />}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground">{r.name}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">{r.description}</p>
                  <div className="mt-1 flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-amber-600">{formatIDR(r.price_day)}<span className="text-[10px] text-muted-foreground font-medium">/hari</span></span>
                    {r.allow_with_driver && r.price_with_driver > 0 && (
                      <span className="text-[10px] bg-amber-500/10 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full font-semibold">+sopir {formatIDR(r.price_with_driver)}</span>
                    )}
                  </div>
                </div>
              </button>
            ))}
            {filtered.length === 0 && <p className="text-center text-muted-foreground text-sm py-8">Belum ada {tab} tersedia</p>}
          </div>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={close}>
          <div onClick={(e) => e.stopPropagation()} className="bg-card rounded-t-3xl sm:rounded-3xl w-full max-w-md p-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-heading text-lg font-bold">Sewa Kendaraan</h2>
              <button onClick={close} data-testid="rent-form-close"><X size={18} /></button>
            </div>
            {selected.image && <img src={selected.image} alt={selected.name} className="w-full h-32 rounded-2xl object-cover" />}
            <h3 className="font-heading font-bold mt-3">{selected.name}</h3>
            <p className="text-xs text-muted-foreground">{selected.description}</p>

            <div className="mt-4 space-y-2.5">
              <In label="Nama Lengkap" v={form.name} on={(v) => setForm({ ...form, name: v })} testid="rent-name" />
              <In label="No. HP / WhatsApp" v={form.phone} on={(v) => setForm({ ...form, phone: v })} testid="rent-phone" />
              <In label="Tanggal Mulai Sewa" type="date" v={form.start_date} on={(v) => setForm({ ...form, start_date: v })} testid="rent-date" />
              <In label="Durasi (hari)" type="number" v={form.days} on={(v) => setForm({ ...form, days: v })} testid="rent-days" />

              {selected.type === "mobil" && selected.allow_with_driver && (
                <div>
                  <span className="text-xs font-medium text-muted-foreground">Opsi Sewa</span>
                  <div className="mt-1 grid grid-cols-2 gap-2">
                    <button type="button" data-testid="rent-opt-self" onClick={() => setForm({ ...form, with_driver: false })} className={`py-2 rounded-xl text-xs font-semibold transition ${!form.with_driver ? "bg-amber-500 text-white" : "bg-secondary text-foreground"}`}>
                      Lepas Kunci<br /><span className="text-[10px] opacity-80">{formatIDR(selected.price_day)}/hari</span>
                    </button>
                    <button type="button" data-testid="rent-opt-driver" onClick={() => setForm({ ...form, with_driver: true })} className={`py-2 rounded-xl text-xs font-semibold transition ${form.with_driver ? "bg-amber-500 text-white" : "bg-secondary text-foreground"}`}>
                      + Sopir<br /><span className="text-[10px] opacity-80">{formatIDR(selected.price_with_driver)}/hari</span>
                    </button>
                  </div>
                </div>
              )}

              <In label="Catatan" v={form.notes} on={(v) => setForm({ ...form, notes: v })} testid="rent-notes" />
            </div>

            <div className="border-t border-border mt-4 pt-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{form.days} hari × {formatIDR(unitPrice)}</p>
                <p className="font-heading text-lg font-bold" data-testid="rent-total">{formatIDR(total)}</p>
              </div>
              <button disabled={loading} onClick={submit} data-testid="rent-book-btn" className="bg-[#25D366] hover:bg-[#1ebe57] text-white font-semibold px-5 py-2.5 rounded-full transition active:scale-95 disabled:opacity-60">
                {loading ? "..." : "Sewa via WhatsApp"}
              </button>
            </div>
          </div>
        </div>
      )}
      <OrderSuccessModal open={success.open} onDone={() => { window.location.href = success.url; }} />
    </div>
  );
}

const In = ({ label, v, on, type = "text", testid }) => (
  <label className="block">
    <span className="text-xs font-medium text-muted-foreground">{label}</span>
    <input data-testid={testid} type={type} value={v} onChange={(e) => on(e.target.value)} className="mt-1 w-full bg-secondary rounded-xl px-3 py-2 text-sm outline-none border border-transparent focus:border-amber-500" />
  </label>
);
