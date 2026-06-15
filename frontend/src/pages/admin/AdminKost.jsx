import React, { useEffect, useState } from "react";
import { api, formatIDR } from "../../lib/api";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, X } from "lucide-react";
import ImageUploader from "../../components/admin/ImageUploader";

const empty = { name: "", address: "", description: "", facilities: "", price_day: 0, price_week: 0, price_month: 0, image: "", available: true, active: true };

export default function AdminKost() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);

  const load = () => api.get("/admin/kost").then((r) => setItems(r.data));
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing("new"); setForm(empty); };
  const openEdit = (it) => { setEditing(it.id); setForm({ ...empty, ...it }); };
  const close = () => { setEditing(null); setForm(empty); };

  const save = async () => {
    const payload = {
      ...form,
      price_day: Number(form.price_day || 0),
      price_week: Number(form.price_week || 0),
      price_month: Number(form.price_month || 0),
    };
    try {
      if (editing === "new") await api.post("/admin/kost", payload);
      else await api.put(`/admin/kost/${editing}`, payload);
      toast.success("Saved"); close(); load();
    } catch (e) { toast.error("Failed"); }
  };

  const remove = async (id) => {
    if (!window.confirm("Hapus kost?")) return;
    await api.delete(`/admin/kost/${id}`); load();
  };

  return (
    <div data-testid="admin-kost">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold">CakKost</h1>
          <p className="text-muted-foreground text-sm mt-1">Kelola daftar kos & kamar.</p>
        </div>
        <button data-testid="add-kost-btn" onClick={openNew} className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-full text-sm font-semibold hover:opacity-90 active:scale-95 transition">
          <Plus size={16} /> Tambah Kost
        </button>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {items.map((k) => (
          <div key={k.id} className="bg-card rounded-2xl border border-black/5 dark:border-white/10 overflow-hidden shadow-sm">
            {k.image ? <img src={k.image} alt={k.name} className="w-full h-32 object-cover" /> : <div className="w-full h-32 bg-secondary" />}
            <div className="p-4">
              <p className="font-heading font-bold">{k.name}</p>
              <p className="text-xs text-muted-foreground line-clamp-1">{k.address}</p>
              <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{k.facilities}</p>
              <div className="mt-2 space-y-0.5 text-xs">
                {k.price_day > 0 && <p className="text-emerald-600 font-semibold">{formatIDR(k.price_day)}<span className="text-muted-foreground font-normal">/hari</span></p>}
                {k.price_week > 0 && <p className="text-emerald-600 font-semibold">{formatIDR(k.price_week)}<span className="text-muted-foreground font-normal">/minggu</span></p>}
                {k.price_month > 0 && <p className="text-emerald-600 font-semibold">{formatIDR(k.price_month)}<span className="text-muted-foreground font-normal">/bulan</span></p>}
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className={`text-xs font-semibold ${k.active ? "text-emerald-600" : "text-muted-foreground"}`}>{k.active ? "Aktif" : "Nonaktif"}</span>
                <div className="flex gap-1">
                  <button data-testid={`edit-k-${k.id}`} onClick={() => openEdit(k)} className="p-2 rounded-lg hover:bg-secondary"><Edit2 size={14} /></button>
                  <button data-testid={`del-k-${k.id}`} onClick={() => remove(k.id)} className="p-2 rounded-lg hover:bg-secondary text-destructive"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-muted-foreground text-sm">Belum ada kost.</p>}
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={close}>
          <div onClick={(e) => e.stopPropagation()} className="bg-card rounded-3xl w-full max-w-md p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-xl font-bold">{editing === "new" ? "Tambah Kost" : "Edit Kost"}</h2>
              <button onClick={close}><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <F label="Nama Kost / Kamar" v={form.name} on={(v) => setForm({ ...form, name: v })} testid="kf-name" />
              <F label="Alamat" v={form.address} on={(v) => setForm({ ...form, address: v })} testid="kf-addr" />
              <F label="Fasilitas (pisahkan dengan koma)" v={form.facilities} on={(v) => setForm({ ...form, facilities: v })} testid="kf-fac" />
              <F label="Deskripsi" v={form.description} on={(v) => setForm({ ...form, description: v })} testid="kf-desc" />
              <div className="grid grid-cols-3 gap-2">
                <F label="Harga/hari" type="number" v={form.price_day} on={(v) => setForm({ ...form, price_day: v })} testid="kf-price-day" />
                <F label="Harga/minggu" type="number" v={form.price_week} on={(v) => setForm({ ...form, price_week: v })} testid="kf-price-week" />
                <F label="Harga/bulan" type="number" v={form.price_month} on={(v) => setForm({ ...form, price_month: v })} testid="kf-price-month" />
              </div>
              <p className="text-[11px] text-muted-foreground">Set 0 untuk durasi yang tidak ditawarkan.</p>
              <ImageUploader value={form.image} onChange={(v) => setForm({ ...form, image: v })} testid="kf-img" />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Aktif
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.available} onChange={(e) => setForm({ ...form, available: e.target.checked })} /> Tersedia
              </label>
              <button data-testid="kf-save" onClick={save} className="w-full bg-primary text-primary-foreground py-3 rounded-full font-semibold hover:opacity-90 active:scale-95 transition">Simpan</button>
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
