import React, { useEffect, useState } from "react";
import { api, formatIDR } from "../../lib/api";
import { useApp } from "../../context/AppContext";
import { t } from "../../lib/i18n";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, X, Star } from "lucide-react";
import ImageUploader from "../../components/admin/ImageUploader";

const empty = { name: "", image: "", address: "", description: "", delivery_fee: 5000, rating: 4.5, active: true };

export default function AdminMerchants() {
  const { lang } = useApp();
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const load = () => api.get("/admin/merchants").then((r) => setItems(r.data));
  useEffect(() => { load(); }, []);
  const openNew = () => { setEditing("new"); setForm(empty); };
  const openEdit = (it) => { setEditing(it.id); setForm({ ...empty, ...it }); };
  const close = () => { setEditing(null); setForm(empty); };
  const save = async () => {
    const payload = { ...form, delivery_fee: Number(form.delivery_fee), rating: Number(form.rating) };
    try {
      if (editing === "new") await api.post("/admin/merchants", payload);
      else await api.put(`/admin/merchants/${editing}`, payload);
      toast.success("Saved"); close(); load();
    } catch (e) { toast.error("Failed"); }
  };
  const remove = async (id) => {
    if (!window.confirm("Hapus warung?")) return;
    await api.delete(`/admin/merchants/${id}`); load();
  };

  return (
    <div data-testid="admin-merchants">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold">Warung Cakfood</h1>
          <p className="text-muted-foreground text-sm mt-1">Kelola warung & rumah makan.</p>
        </div>
        <button data-testid="add-merchant-btn" onClick={openNew} className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-full text-sm font-semibold hover:opacity-90 active:scale-95 transition">
          <Plus size={16} /> {t(lang, "add_new")}
        </button>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {items.map((m) => (
          <div key={m.id} className="bg-card rounded-2xl border border-black/5 dark:border-white/10 overflow-hidden shadow-sm">
            {m.image ? <img src={m.image} alt={m.name} className="w-full h-32 object-cover" /> : <div className="w-full h-32 bg-secondary" />}
            <div className="p-4">
              <p className="font-heading font-bold">{m.name}</p>
              <p className="text-xs text-muted-foreground line-clamp-1">{m.address}</p>
              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{m.description}</p>
              <div className="flex items-center justify-between mt-2 text-xs">
                <span className="inline-flex items-center gap-1 text-amber-500"><Star size={12} fill="currentColor" />{m.rating}</span>
                <span className="text-muted-foreground">Ongkir {formatIDR(m.delivery_fee)}</span>
              </div>
              <div className="flex items-center justify-between mt-3">
                <span className={`text-xs font-semibold ${m.active ? "text-emerald-600" : "text-muted-foreground"}`}>{m.active ? "Aktif" : "Nonaktif"}</span>
                <div className="flex gap-1">
                  <button data-testid={`edit-m-${m.id}`} onClick={() => openEdit(m)} className="p-2 rounded-lg hover:bg-secondary"><Edit2 size={14} /></button>
                  <button data-testid={`del-m-${m.id}`} onClick={() => remove(m.id)} className="p-2 rounded-lg hover:bg-secondary text-destructive"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-muted-foreground text-sm">Belum ada warung.</p>}
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={close}>
          <div onClick={(e) => e.stopPropagation()} className="bg-card rounded-3xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-xl font-bold">{editing === "new" ? "Tambah Warung" : "Edit Warung"}</h2>
              <button onClick={close}><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <F label="Nama Warung" v={form.name} on={(v) => setForm({ ...form, name: v })} testid="mf-name" />
              <F label="Deskripsi" v={form.description} on={(v) => setForm({ ...form, description: v })} testid="mf-desc" />
              <F label="Alamat" v={form.address} on={(v) => setForm({ ...form, address: v })} testid="mf-addr" />
              <ImageUploader value={form.image} onChange={(v) => setForm({ ...form, image: v })} testid="mf-img" />
              <div className="grid grid-cols-2 gap-2">
                <F label="Ongkir (Rp)" type="number" v={form.delivery_fee} on={(v) => setForm({ ...form, delivery_fee: v })} testid="mf-fee" />
                <F label="Rating" type="number" v={form.rating} on={(v) => setForm({ ...form, rating: v })} testid="mf-rating" />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Aktif
              </label>
              <button data-testid="mf-save" onClick={save} className="w-full bg-primary text-primary-foreground py-3 rounded-full font-semibold hover:opacity-90 active:scale-95 transition">{t(lang, "save")}</button>
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
