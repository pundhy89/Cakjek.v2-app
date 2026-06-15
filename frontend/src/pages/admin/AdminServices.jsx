import React, { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { toast } from "sonner";
import { Bike, Car, Utensils, Package, ShoppingBag, Wallet, Building2, KeyRound } from "lucide-react";

const SERVICE_META = [
  { key: "cakride", label: "Cakride", desc: "Ojek motor", icon: Bike, color: "text-blue-500" },
  { key: "cakcar", label: "Cakcar", desc: "Taksi mobil", icon: Car, color: "text-blue-500" },
  { key: "cakfood", label: "Cakfood", desc: "Pesan makanan", icon: Utensils, color: "text-rose-500" },
  { key: "cakmart", label: "Cakmart", desc: "Belanja", icon: ShoppingBag, color: "text-teal-500" },
  { key: "caksend", label: "Caksend", desc: "Kirim paket", icon: Package, color: "text-violet-500" },
  { key: "cakpay", label: "Cakpay", desc: "Top-up & tagihan", icon: Wallet, color: "text-orange-500" },
  { key: "cakkost", label: "CakKost", desc: "Sewa kamar kos", icon: Building2, color: "text-emerald-500" },
  { key: "cakrent", label: "CakRent", desc: "Sewa mobil & motor", icon: KeyRound, color: "text-amber-500" },
];

export default function AdminServices() {
  const [services, setServices] = useState({});
  const [busy, setBusy] = useState(false);

  const load = () => api.get("/services").then((r) => setServices(r.data || {}));
  useEffect(() => { load(); }, []);

  const toggle = (key) => setServices((s) => ({ ...s, [key]: !s[key] }));

  const save = async () => {
    setBusy(true);
    try {
      await api.put("/admin/services", { services });
      toast.success("Pengaturan menu disimpan");
      load();
    } catch (e) {
      toast.error("Gagal menyimpan");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div data-testid="admin-services">
      <h1 className="font-heading text-3xl font-bold">Menu Layanan</h1>
      <p className="text-muted-foreground text-sm mt-1">
        Aktifkan / nonaktifkan menu yang muncul di halaman utama. Menu yang nonaktif akan menampilkan label <span className="font-semibold">Coming Soon</span> dan tidak bisa dibuka.
      </p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mt-6">
        {SERVICE_META.map((s) => {
          const Icon = s.icon;
          const on = !!services[s.key];
          return (
            <div
              key={s.key}
              data-testid={`svc-row-${s.key}`}
              className={`rounded-2xl border p-4 flex items-center gap-3 shadow-sm transition ${on ? "bg-card border-black/5 dark:border-white/10" : "bg-secondary/40 border-dashed border-black/10 dark:border-white/20"}`}
            >
              <div className={`w-11 h-11 rounded-xl bg-slate-50 dark:bg-zinc-800 grid place-items-center ${on ? "" : "grayscale opacity-60"}`}>
                <Icon className={s.color} size={22} strokeWidth={2.2} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-foreground">{s.label}</p>
                <p className="text-[11px] text-muted-foreground truncate">{s.desc}</p>
                <p className={`text-[10px] font-semibold mt-0.5 ${on ? "text-emerald-600" : "text-zinc-500"}`}>
                  {on ? "Aktif" : "Coming Soon"}
                </p>
              </div>
              <button
                data-testid={`svc-toggle-${s.key}`}
                onClick={() => toggle(s.key)}
                role="switch"
                aria-checked={on}
                className={`relative w-11 h-6 rounded-full transition ${on ? "bg-blue-600" : "bg-zinc-300 dark:bg-zinc-700"}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${on ? "translate-x-5" : ""}`} />
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-6">
        <button
          data-testid="svc-save"
          onClick={save}
          disabled={busy}
          className="bg-primary text-primary-foreground px-6 py-2.5 rounded-full text-sm font-semibold hover:opacity-90 active:scale-95 transition disabled:opacity-60"
        >
          {busy ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </div>
    </div>
  );
}
