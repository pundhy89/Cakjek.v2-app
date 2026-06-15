import React, { useEffect, useState } from "react";
import { api, formatIDR } from "../../lib/api";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, X } from "lucide-react";
import ImageUploader from "../../components/admin/ImageUploader";

const empty = { name: "", type: "mobil", description: "", image: "", price_day: 0, price_week: 0, price_month: 0, allow_with_driver: false, price_with_driver_day: 0, price_with_driver_week: 0, price_with_driver_month: 0, available: true, active: true };

export default function AdminRent() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);

  const load = () => api.get("/admin/rent").then((r) => setItems(r.data));
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing("new"); setForm(empty); };
  const openEdit = (it) => { setEditing(it.id); setForm({ ...empty, ...it }); };
  const close = () => { setEditing(null); setForm(empty); };

  const save = async () => {
    const isMobil = form.type === "mobil";
    const payload = {
      ...form,
      price_day: Number(form.price_day || 0),
      price_week: Number(form.price_week || 0),
      price_month: Number(form.price_month || 0),
      allow_with_driver: isMobil ? !!form.allow_with_driver : false,
      price_with_driver_day: isMobil && form.allow_with_driver ? Number(form.price_with_driver_day || 0) : 0,
      price_with_driver_week: isMobil && form.allow_with_driver ? Number(form.price_with_driver_week || 0) : 0,
      price_with_driver_month: isMobil && form.allow_with_driver ? Number(form.price_with_driver_month || 0) : 0,
    };
    try {
      if (editing === "new") await api.post("/admin/rent", payload);
      else await api.put(`/admin/rent/${editing}`, payload);
      toast.success("Saved"); close(); load();
    } catch (e) { toast.error("Failed"); }
  };

  const remove = async (id) => {
    if (!window.confirm("Hapus kendaraan?")) return;
    await api.delete(`/admin/rent/${id}`); load();
  };

  return (
    <div data-testid="admin-rent">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold">CakRent</h1>
          <p className="text-muted-foreground text-sm mt-1">Kelola sewa mobil & motor.</p>
        </div>
        <button data-testid="add-rent-btn" onClick={openNew} className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-full text-sm font-semibold hover:opacity-90 active:scale-95 transition">
          <Plus size={16} /> Tambah Kendaraan
        </button>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {items.map((r) => (
          <div key={r.id} className="bg-card rounded-2xl border border-black/5 dark:border-white/10 overflow-hidden shadow-sm">
            {r.image ? <img src={r.image} alt={r.name} className="w-full h-32 object-cover" /> : <div className="w-full h-32 bg-secondary" />}
            <div className="p-4">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${r.type === "mobil" ? "bg-amber-500/10 text-amber-700" : "bg-blue-500/10 text-blue-700"}`}>{r.type}</span>
                {r.allow_with_driver && <span className="text-[10px] bg-emerald-500/10 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">+sopir</span>}
              </div>
              <p className="font-heading font-bold mt-1">{r.name}</p>
              <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{r.description}</p>
              <div className="mt-2 text-xs space-y-0.5">
                {r.price_day > 0 && <p className="text-amber-600 font-semibold">{formatIDR(r.price_day)}<span className="text-muted-foreground font-normal">/hari</span></p>}
                {r.price_week > 0 && <p className="text-amber-600 font-semibold">{formatIDR(r.price_week)}<span className="text-muted-foreground font-normal">/minggu</span></p>}
                {r.price_month > 0 && <p className="text-amber-600 font-semibold">{formatIDR(r.price_month)}<span className="text-muted-foreground font-normal">/bulan</span></p>}
              </div>
              {r.allow_with_driver && (
                <div className="mt-1 text-[10px] text-muted-foreground">
                  +sopir: {[r.price_with_driver_day && `${formatIDR(r.price_with_driver_day)}/hr`, r.price_with_driver_week && `${formatIDR(r.price_with_driver_week)}/mg`, r.price_with_driver_month && `${formatIDR(r.price_with_driver_month)}/bl`].filter(Boolean).join(" · ")}
                </div>
              )}
              <div className="flex items-center justify-between mt-2">
                <span className={`text-xs font-semibold ${r.active ? "text-emerald-600" : "text-muted-foreground"}`}>{r.active ? "Aktif" : "Nonaktif"}</span>
                <div className="flex gap-1">
                  <button data-testid={`edit-r-${r.id}`} onClick={() => openEdit(r)} className="p-2 rounded-lg hover:bg-secondary"><Edit2 size={14} /></button>
                  <button data-testid={`del-r-${r.id}`} onClick={() => remove(r.id)} className="p-2 rounded-lg hover:bg-secondary text-destructive"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-muted-foreground text-sm">Belum ada kendaraan.</p>}
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={close}>
          <div onClick={(e) => e.stopPropagation()} className="bg-card rounded-3xl w-full max-w-md p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-xl font-bold">{editing === "new" ? "Tambah Kendaraan" : "Edit Kendaraan"}</h2>
              <button onClick={close}><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <F label="Nama Kendaraan" v={form.name} on={(v) => setForm({ ...form, name: v })} testid="rf-name" />
              <label className="block">
                <span className="text-xs font-medium text-muted-foreground">Tipe</span>
                <select data-testid="rf-type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="mt-1 w-full bg-secondary rounded-xl px-3 py-2 text-sm outline-none">
                  <option value="mobil">Mobil</option>
                  <option value="motor">Motor</option>
                </select>
              </label>
              <F label="Deskripsi" v={form.description} on={(v) => setForm({ ...form, description: v })} testid="rf-desc" />
              <p className="text-xs font-medium text-muted-foreground mt-1">Tarif Lepas Kunci</p>
              <div className="grid grid-cols-3 gap-2">
                <F label="Per hari" type="number" v={form.price_day} on={(v) => setForm({ ...form, price_day: v })} testid="rf-price-day" />
                <F label="Per minggu" type="number" v={form.price_week} on={(v) => setForm({ ...form, price_week: v })} testid="rf-price-week" />
                <F label="Per bulan" type="number" v={form.price_month} on={(v) => setForm({ ...form, price_month: v })} testid="rf-price-month" />
              </div>
              {form.type === "mobil" && (
                <>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" data-testid="rf-driver-toggle" checked={!!form.allow_with_driver} onChange={(e) => setForm({ ...form, allow_with_driver: e.target.checked })} /> Sediakan opsi + Sopir
                  </label>
                  {form.allow_with_driver && (
                    <>
                      <p className="text-xs font-medium text-muted-foreground mt-1">Tarif Plus Sopir</p>
                      <div className="grid grid-cols-3 gap-2">
                        <F label="Per hari" type="number" v={form.price_with_driver_day} on={(v) => setForm({ ...form, price_with_driver_day: v })} testid="rf-pwd-day" />
                        <F label="Per minggu" type="number" v={form.price_with_driver_week} on={(v) => setForm({ ...form, price_with_driver_week: v })} testid="rf-pwd-week" />
                        <F label="Per bulan" type="number" v={form.price_with_driver_month} on={(v) => setForm({ ...form, price_with_driver_month: v })} testid="rf-pwd-month" />
                      </div>
                    </>
                  )}
                </>
              )}
              <p className="text-[11px] text-muted-foreground">Set 0 untuk durasi yang tidak ditawarkan.</p>
              <ImageUploader value={form.image} onChange={(v) => setForm({ ...form, image: v })} testid="rf-img" />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Aktif
              </label>
              <button data-testid="rf-save" onClick={save} className="w-full bg-primary text-primary-foreground py-3 rounded-full font-semibold hover:opacity-90 active:scale-95 transition">Simpan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const F = ({ label, v, on, type = "text", testid }) => (
  <label className="block">
    <span className="text-xs font-medium text-muted-foreground">{label}</span>
    <input data-testid={testid} type={type} value={v} onChange={(e) => on(e.target.value)} className="mt-1 w-full bg-secondary rounded-xl px-3 py-2 text-sm outline-none" />
  </label>
);
