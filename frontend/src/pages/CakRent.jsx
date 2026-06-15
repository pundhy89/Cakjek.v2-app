import React, { useEffect, useState, useMemo } from "react";
import { ServiceHeader } from "../components/ServiceHeader";
import OrderSuccessModal from "../components/OrderSuccessModal";
import { api, formatIDR } from "../lib/api";
import { useApp } from "../context/AppContext";
import { t } from "../lib/i18n";
import { toast } from "sonner";
import { Car, Bike, X } from "lucide-react";

const DUR_LABELS = { day: "Harian", week: "Mingguan", month: "Bulanan" };
const DUR_UNIT = { day: "hari", week: "minggu", month: "bulan" };
const priceKey = (d, drv) => drv
  ? ({ day: "price_with_driver_day", week: "price_with_driver_week", month: "price_with_driver_month" }[d])
  : ({ day: "price_day", week: "price_week", month: "price_month" }[d]);

export default function CakRent() {
  const { lang } = useApp();
  const [items, setItems] = useState([]);
  const [tab, setTab] = useState("mobil"); // mobil | motor
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "", start_date: "", duration: "day", qty: 1, with_driver: false, notes: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState({ open: false, url: "" });

  useEffect(() => {
    api.get("/rent").then((r) => setItems(r.data)).catch(() => {});
  }, []);

  const filtered = useMemo(() => items.filter((i) => i.type === tab), [items, tab]);

  const open = (r) => {
    const firstDur = ["day", "week", "month"].find((d) => Number(r[priceKey(d, false)] || 0) > 0) || "day";
    setSelected(r);
    setForm({ name: "", phone: "", start_date: new Date().toISOString().slice(0, 10), duration: firstDur, qty: 1, with_driver: false, notes: "" });
  };
  const close = () => setSelected(null);

  const useDriver = selected ? !!(form.with_driver && selected.allow_with_driver) : false;
  const unitPrice = selected ? Number(selected[priceKey(form.duration, useDriver)] || 0) : 0;
  const total = unitPrice * Math.max(1, Number(form.qty || 1));

  const submit = async () => {
    if (!form.name || !form.phone || !form.start_date) {
      toast.error(t(lang, "fill_required"));
      return;
    }
    if (unitPrice <= 0) {
      toast.error("Tarif untuk pilihan ini belum diatur");
      return;
    }
    setLoading(true);
    const opt = selected.type === "mobil" ? (useDriver ? "Plus Sopir" : "Lepas Kunci") : "Lepas Kunci";
    const durLabel = DUR_LABELS[form.duration];
    const unit = DUR_UNIT[form.duration];
    const message = `Halo Admin CakJek,\nSaya mau sewa *CakRent*.\n\nNama: ${form.name}\nNo. HP: ${form.phone}\n\nKendaraan: ${selected.name} (${selected.type})\nOpsi: ${opt}\nTarif: ${durLabel} - ${formatIDR(unitPrice)}/${unit}\n\nTanggal mulai: ${form.start_date}\nDurasi: ${form.qty} ${unit}\nCatatan: ${form.notes || "-"}\n\nTotal: ${formatIDR(total)}`;
    try {
      const r = await api.post("/orders", {
        service: "cakrent",
        customer_name: form.name,
        customer_phone: form.phone,
        details: { rent_id: selected.id, vehicle: selected.name, type: selected.type, with_driver: useDriver, duration: form.duration, qty: Number(form.qty), start_date: form.start_date, notes: form.notes, unit_price: unitPrice },
        total,
        message,
      });
      toast.success(t(lang, "redirect_wa"));
      setSuccess({ open: true, url: r.data.whatsapp_url });
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Failed");
    } finally { setLoading(false); }
  };

  const teaser = (r) => {
    if (r.price_day > 0) return { v: r.price_day, u: "hari" };
    if (r.price_week > 0) return { v: r.price_week, u: "minggu" };
    if (r.price_month > 0) return { v: r.price_month, u: "bulan" };
    return null;
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
            {filtered.map((r) => {
              const t0 = teaser(r);
              return (
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
                      {t0 && <span className="text-sm font-bold text-amber-600">Mulai {formatIDR(t0.v)}<span className="text-[10px] text-muted-foreground font-medium">/{t0.u}</span></span>}
                      {r.allow_with_driver && <span className="text-[10px] bg-amber-500/10 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full font-semibold">+sopir</span>}
                    </div>
                  </div>
                </button>
              );
            })}
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

            {selected.type === "mobil" && selected.allow_with_driver && (
              <div className="mt-4">
                <span className="text-xs font-medium text-muted-foreground">Opsi Sewa</span>
                <div className="mt-1 grid grid-cols-2 gap-2">
                  <button type="button" data-testid="rent-opt-self" onClick={() => setForm({ ...form, with_driver: false })} className={`py-2 rounded-xl text-xs font-semibold transition ${!form.with_driver ? "bg-amber-500 text-white" : "bg-secondary text-foreground"}`}>
                    Lepas Kunci
                  </button>
                  <button type="button" data-testid="rent-opt-driver" onClick={() => setForm({ ...form, with_driver: true })} className={`py-2 rounded-xl text-xs font-semibold transition ${form.with_driver ? "bg-amber-500 text-white" : "bg-secondary text-foreground"}`}>
                    + Sopir
                  </button>
                </div>
              </div>
            )}

            {/* Duration tabs */}
            <div className="mt-4">
              <span className="text-xs font-medium text-muted-foreground">Pilih Durasi</span>
              <div className="mt-1 grid grid-cols-3 gap-2">
                {["day", "week", "month"].map((d) => {
                  const price = Number(selected[priceKey(d, useDriver)] || 0);
                  const disabled = price <= 0;
                  return (
                    <button
                      key={d}
                      type="button"
                      disabled={disabled}
                      data-testid={`rent-dur-${d}`}
                      onClick={() => setForm({ ...form, duration: d, qty: 1 })}
                      className={`py-2 rounded-xl text-xs font-semibold transition ${form.duration === d ? "bg-amber-500 text-white" : "bg-secondary text-foreground"} disabled:opacity-40 disabled:line-through disabled:cursor-not-allowed`}
                    >
                      {DUR_LABELS[d]}
                      {!disabled && <div className="text-[10px] opacity-80 mt-0.5">{formatIDR(price)}</div>}
                      {disabled && <div className="text-[10px] opacity-80 mt-0.5">N/A</div>}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-3 space-y-2.5">
              <In label="Nama Lengkap" v={form.name} on={(v) => setForm({ ...form, name: v })} testid="rent-name" />
              <In label="No. HP / WhatsApp" v={form.phone} on={(v) => setForm({ ...form, phone: v })} testid="rent-phone" />
              <In label="Tanggal Mulai Sewa" type="date" v={form.start_date} on={(v) => setForm({ ...form, start_date: v })} testid="rent-date" />
              <In label={`Jumlah ${DUR_UNIT[form.duration]}`} type="number" v={form.qty} on={(v) => setForm({ ...form, qty: v })} testid="rent-qty" />
              <In label="Catatan" v={form.notes} on={(v) => setForm({ ...form, notes: v })} testid="rent-notes" />
            </div>

            <div className="border-t border-border mt-4 pt-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{form.qty} {DUR_UNIT[form.duration]} × {formatIDR(unitPrice)}</p>
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
