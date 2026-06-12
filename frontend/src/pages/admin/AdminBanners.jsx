import React, { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { useApp } from "../../context/AppContext";
import { t } from "../../lib/i18n";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, X } from "lucide-react";

const empty = { title: "", subtitle: "", code: "", color_from: "#fb923c", color_to: "#ec4899", image: "", order_idx: 0, active: true, start_date: "", end_date: "" };

export default function AdminBanners() {
  const { lang } = useApp();
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);

  const load = () => api.get("/admin/banners").then((r) => setItems(r.data));
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing("new"); setForm(empty); };
  const openEdit = (it) => { setEditing(it.id); setForm({ ...empty, ...it, start_date: it.start_date || "", end_date: it.end_date || "" }); };
  const close = () => { setEditing(null); setForm(empty); };

  const save = async () => {
    const payload = {
      ...form,
      order_idx: Number(form.order_idx),
      start_date: form.start_date || null,
      end_date: form.end_date || null,
    };
    try {
      if (editing === "new") await api.post("/admin/banners", payload);
      else await api.put(`/admin/banners/${editing}`, payload);
      toast.success("Saved");
      close();
      load();
    } catch (e) { toast.error("Failed"); }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete?")) return;
    await api.delete(`/admin/banners/${id}`);
    load();
  };

  return (
    <div data-testid="admin-banners">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold">Banner Promo</h1>
          <p className="text-muted-foreground text-sm mt-1">Atur slide promo di halaman utama.</p>
        </div>
        <button data-testid="add-banner-btn" onClick={openNew} className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-full text-sm font-semibold hover:opacity-90 active:scale-95 transition">
          <Plus size={16} /> {t(lang, "add_new")}
        </button>
      </div>

      <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((b) => (
          <div key={b.id} className="rounded-2xl overflow-hidden shadow-sm border border-black/5 dark:border-white/10 bg-card">
            <div className="p-4 text-white relative" style={{ background: `linear-gradient(135deg, ${b.color_from}, ${b.color_to})` }}>
              <p className="text-[10px] uppercase tracking-widest opacity-80">Promo · #{b.order_idx}</p>
              <p className="font-heading font-bold mt-1">{b.title}</p>
              <p className="text-xs opacity-90 mt-0.5">{b.subtitle}</p>
              {b.code && <span className="inline-block mt-2 text-[10px] bg-white/25 px-2 py-0.5 rounded font-bold">{b.code}</span>}
            </div>
            <div className="p-3 flex items-center justify-between gap-2">
              <div className="flex flex-col">
                <span className={`text-xs font-semibold ${b.active ? "text-emerald-600" : "text-muted-foreground"}`}>
                  {b.active ? "Aktif" : "Nonaktif"}
                </span>
                {(b.start_date || b.end_date) && (
                  <span className="text-[10px] text-muted-foreground">
                    {b.start_date || "…"} → {b.end_date || "…"}
                  </span>
                )}
              </div>
              <div className="flex gap-1">
                <button data-testid={`edit-banner-${b.id}`} onClick={() => openEdit(b)} className="p-2 rounded-lg hover:bg-secondary"><Edit2 size={14} /></button>
                <button data-testid={`del-banner-${b.id}`} onClick={() => remove(b.id)} className="p-2 rounded-lg hover:bg-secondary text-destructive"><Trash2 size={14} /></button>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-muted-foreground text-sm">Belum ada banner.</p>}
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={close}>
          <div onClick={(e) => e.stopPropagation()} className="bg-card rounded-3xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-xl font-bold">{editing === "new" ? t(lang, "add_new") : t(lang, "edit")}</h2>
              <button onClick={close}><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <F label="Title" v={form.title} on={(v) => setForm({ ...form, title: v })} testid="bf-title" />
              <F label="Subtitle" v={form.subtitle} on={(v) => setForm({ ...form, subtitle: v })} testid="bf-sub" />
              <F label="Promo Code" v={form.code} on={(v) => setForm({ ...form, code: v })} testid="bf-code" />
              <div className="grid grid-cols-2 gap-2">
                <FC label="Color From" v={form.color_from} on={(v) => setForm({ ...form, color_from: v })} testid="bf-cf" />
                <FC label="Color To" v={form.color_to} on={(v) => setForm({ ...form, color_to: v })} testid="bf-ct" />
              </div>
              <F label="Image URL (optional)" v={form.image} on={(v) => setForm({ ...form, image: v })} testid="bf-img" />
              <F label="Order Index" v={form.order_idx} on={(v) => setForm({ ...form, order_idx: v })} type="number" testid="bf-order" />
              <div className="grid grid-cols-2 gap-2">
                <F label="Tanggal Mulai (opsional)" v={form.start_date} on={(v) => setForm({ ...form, start_date: v })} type="date" testid="bf-start" />
                <F label="Tanggal Selesai (opsional)" v={form.end_date} on={(v) => setForm({ ...form, end_date: v })} type="date" testid="bf-end" />
              </div>
              <p className="text-[10px] text-muted-foreground">Kosongkan tanggal untuk tampil terus-menerus selama banner aktif.</p>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Aktif
              </label>
              <div className="rounded-2xl p-4 text-white" style={{ background: `linear-gradient(135deg, ${form.color_from}, ${form.color_to})` }}>
                <p className="text-[10px] uppercase tracking-widest opacity-80">Preview</p>
                <p className="font-heading font-bold mt-1">{form.title || "Title"}</p>
                <p className="text-xs opacity-90">{form.subtitle || "Subtitle"}</p>
              </div>
              <button data-testid="bf-save" onClick={save} className="w-full bg-primary text-primary-foreground py-3 rounded-full font-semibold hover:opacity-90 active:scale-95 transition">{t(lang, "save")}</button>
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

const FC = ({ label, v, on, testid }) => (
  <label className="block">
    <span className="text-xs font-medium text-muted-foreground">{label}</span>
    <div className="mt-1 flex items-center gap-2">
      <input data-testid={testid} type="color" value={v} onChange={(e) => on(e.target.value)} className="w-10 h-10 rounded-lg border border-border cursor-pointer" />
      <input value={v} onChange={(e) => on(e.target.value)} className="flex-1 bg-secondary rounded-xl px-3 py-2 text-sm outline-none" />
    </div>
  </label>
);
