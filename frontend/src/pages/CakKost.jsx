import React, { useEffect, useMemo, useState } from "react";
import { ServiceHeader } from "../components/ServiceHeader";
import OrderSuccessModal from "../components/OrderSuccessModal";
import { api, formatIDR } from "../lib/api";
import { useApp } from "../context/AppContext";
import { t } from "../lib/i18n";
import { toast } from "sonner";
import { MapPin, CheckCircle2, X } from "lucide-react";

const DUR_LABELS = { day: "Harian", week: "Mingguan", month: "Bulanan" };
const DUR_UNIT = { day: "hari", week: "minggu", month: "bulan" };
const priceKey = (d) => ({ day: "price_day", week: "price_week", month: "price_month" }[d]);

export default function CakKost() {
  const { lang } = useApp();
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "", start_date: "", duration: "month", qty: 1, notes: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState({ open: false, url: "" });

  useEffect(() => {
    api.get("/kost").then((r) => setItems(r.data)).catch(() => {});
  }, []);

  const availableDurations = useMemo(() => {
    if (!selected) return [];
    return ["day", "week", "month"].filter((d) => Number(selected[priceKey(d)] || 0) > 0);
  }, [selected]);

  const open = (k) => {
    const firstDur = ["month", "week", "day"].find((d) => Number(k[priceKey(d)] || 0) > 0) || "month";
    setSelected(k);
    setForm({ name: "", phone: "", start_date: new Date().toISOString().slice(0, 10), duration: firstDur, qty: 1, notes: "" });
  };
  const close = () => setSelected(null);

  const unitPrice = selected ? Number(selected[priceKey(form.duration)] || 0) : 0;
  const total = unitPrice * Math.max(1, Number(form.qty || 1));

  const submit = async () => {
    if (!form.name || !form.phone || !form.start_date) {
      toast.error(t(lang, "fill_required"));
      return;
    }
    if (unitPrice <= 0) {
      toast.error("Pilih durasi yang tersedia");
      return;
    }
    setLoading(true);
    const durLabel = DUR_LABELS[form.duration];
    const unit = DUR_UNIT[form.duration];
    const message = `Halo Admin CakJek,\nSaya mau booking *CakKost*.\n\nNama: ${form.name}\nNo. HP: ${form.phone}\n\nKost: ${selected.name}\nAlamat: ${selected.address}\nFasilitas: ${selected.facilities}\n\nTarif: ${durLabel} - ${formatIDR(unitPrice)}/${unit}\nMulai sewa: ${form.start_date}\nDurasi: ${form.qty} ${unit}\nCatatan: ${form.notes || "-"}\n\nTotal: ${formatIDR(total)}`;
    try {
      const r = await api.post("/orders", {
        service: "cakkost",
        customer_name: form.name,
        customer_phone: form.phone,
        details: { kost_id: selected.id, kost_name: selected.name, start_date: form.start_date, duration: form.duration, qty: Number(form.qty), notes: form.notes, unit_price: unitPrice },
        total,
        message,
      });
      toast.success(t(lang, "redirect_wa"));
      setSuccess({ open: true, url: r.data.whatsapp_url });
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Failed");
    } finally { setLoading(false); }
  };

  // teaser price for card (cheapest available)
  const teaser = (k) => {
    if (k.price_day > 0) return { v: k.price_day, u: "hari" };
    if (k.price_week > 0) return { v: k.price_week, u: "minggu" };
    if (k.price_month > 0) return { v: k.price_month, u: "bulan" };
    return null;
  };

  return (
    <div data-testid="cakkost-page" className="min-h-screen">
      <ServiceHeader title="CakKost" color="bg-emerald-600" />
      <div className="px-5 -mt-6">
        <div className="bg-card rounded-3xl border border-black/5 dark:border-white/10 p-3 shadow-md space-y-3">
          {items.map((k) => {
            const t0 = teaser(k);
            return (
              <button
                key={k.id}
                data-testid={`kost-${k.id}`}
                onClick={() => open(k)}
                className="w-full text-left flex gap-3 p-2 rounded-2xl hover:bg-secondary/50 transition active:scale-[0.99]"
              >
                {k.image ? <img src={k.image} alt={k.name} className="w-20 h-20 rounded-xl object-cover" /> : <div className="w-20 h-20 rounded-xl bg-secondary" />}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground">{k.name}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><MapPin size={11} /> <span className="truncate">{k.address}</span></p>
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{k.facilities}</p>
                  {t0 && (
                    <p className="text-sm font-bold text-emerald-600 mt-1">
                      Mulai {formatIDR(t0.v)}<span className="text-[10px] text-muted-foreground font-medium">/{t0.u}</span>
                    </p>
                  )}
                </div>
              </button>
            );
          })}
          {items.length === 0 && <p className="text-center text-muted-foreground text-sm py-8">Belum ada kost tersedia</p>}
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={close}>
          <div onClick={(e) => e.stopPropagation()} className="bg-card rounded-t-3xl sm:rounded-3xl w-full max-w-md p-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-heading text-lg font-bold">Booking Kost</h2>
              <button onClick={close} data-testid="kost-form-close"><X size={18} /></button>
            </div>
            {selected.image && <img src={selected.image} alt={selected.name} className="w-full h-32 rounded-2xl object-cover" />}
            <h3 className="font-heading font-bold mt-3">{selected.name}</h3>
            <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin size={11} /> {selected.address}</p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {(selected.facilities || "").split(",").map((f, i) => f.trim() && (
                <span key={i} className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full text-[10px] font-medium">
                  <CheckCircle2 size={10} /> {f.trim()}
                </span>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">{selected.description}</p>

            {/* Duration tabs */}
            <div className="mt-4">
              <span className="text-xs font-medium text-muted-foreground">Pilih Durasi</span>
              <div className="mt-1 grid grid-cols-3 gap-2">
                {["day", "week", "month"].map((d) => {
                  const price = Number(selected[priceKey(d)] || 0);
                  const disabled = price <= 0;
                  return (
                    <button
                      key={d}
                      type="button"
                      disabled={disabled}
                      data-testid={`kost-dur-${d}`}
                      onClick={() => setForm({ ...form, duration: d, qty: 1 })}
                      className={`py-2 rounded-xl text-xs font-semibold transition ${form.duration === d ? "bg-emerald-500 text-white" : "bg-secondary text-foreground"} disabled:opacity-40 disabled:line-through disabled:cursor-not-allowed`}
                    >
                      {DUR_LABELS[d]}
                      {!disabled && <div className="text-[10px] opacity-80 mt-0.5">{formatIDR(price)}</div>}
                      {disabled && <div className="text-[10px] opacity-80 mt-0.5">N/A</div>}
                    </button>
                  );
                })}
              </div>
              {availableDurations.length === 0 && <p className="text-xs text-destructive mt-1">Harga belum diatur untuk kost ini.</p>}
            </div>

            <div className="mt-3 space-y-2.5">
              <In label="Nama Lengkap" v={form.name} on={(v) => setForm({ ...form, name: v })} testid="kost-name" />
              <In label="No. HP / WhatsApp" v={form.phone} on={(v) => setForm({ ...form, phone: v })} testid="kost-phone" />
              <In label="Tanggal Mulai Sewa" type="date" v={form.start_date} on={(v) => setForm({ ...form, start_date: v })} testid="kost-date" />
              <In label={`Jumlah ${DUR_UNIT[form.duration]}`} type="number" v={form.qty} on={(v) => setForm({ ...form, qty: v })} testid="kost-qty" />
              <In label="Catatan" v={form.notes} on={(v) => setForm({ ...form, notes: v })} testid="kost-notes" />
            </div>

            <div className="border-t border-border mt-4 pt-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{form.qty} {DUR_UNIT[form.duration]} × {formatIDR(unitPrice)}</p>
                <p className="font-heading text-lg font-bold" data-testid="kost-total">{formatIDR(total)}</p>
              </div>
              <button disabled={loading} onClick={submit} data-testid="kost-book-btn" className="bg-[#25D366] hover:bg-[#1ebe57] text-white font-semibold px-5 py-2.5 rounded-full transition active:scale-95 disabled:opacity-60">
                {loading ? "..." : "Booking via WhatsApp"}
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
    <input data-testid={testid} type={type} value={v} onChange={(e) => on(e.target.value)} className="mt-1 w-full bg-secondary rounded-xl px-3 py-2 text-sm outline-none border border-transparent focus:border-emerald-500" />
  </label>
);
