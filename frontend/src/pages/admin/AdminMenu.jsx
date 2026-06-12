import React, { useEffect, useState } from "react";
import { api, formatIDR } from "../../lib/api";
import { useApp } from "../../context/AppContext";
import { t } from "../../lib/i18n";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, X } from "lucide-react";

const empty = { name: "", price: 0, description: "", image: "", active: true, merchant_id: null };

export default function AdminMenu({ category }) {
  const { lang } = useApp();
  const [items, setItems] = useState([]);
  const [merchants, setMerchants] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);

  const load = () => api.get(`/admin/menu/${category}`).then((r) => setItems(r.data));
  useEffect(() => {
    load();
    if (category === "food") api.get("/merchants").then((r) => setMerchants(r.data));
  }, [category]);

  const openNew = () => { setEditing("new"); setForm(empty); };
  const openEdit = (it) => { setEditing(it.id); setForm({ ...it }); };
  const close = () => { setEditing(null); setForm(empty); };

  const save = async () => {
    const payload = { ...form, price: Number(form.price), category };
    try {
      if (editing === "new") await api.post("/admin/menu", payload);
      else await api.put(`/admin/menu/${editing}`, payload);
      toast.success("Saved");
      close();
      load();
    } catch (e) { toast.error("Failed"); }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete?")) return;
    await api.delete(`/admin/menu/${id}`);
    load();
  };

  const titleKey = category === "food" ? "food_menu" : category === "mart" ? "mart_items" : "cakpay_packages";

  return (
    <div data-testid={`admin-menu-${category}`}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold">{t(lang, titleKey)}</h1>
          <p className="text-muted-foreground text-sm mt-1">Tambah / ubah item.</p>
        </div>
        <button data-testid="add-item-btn" onClick={openNew} className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-full text-sm font-semibold hover:opacity-90 active:scale-95 transition">
          <Plus size={16} /> {t(lang, "add_new")}
        </button>
      </div>

      <div className="mt-6 bg-card rounded-3xl border border-black/5 dark:border-white/10 overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50">
            <tr className="text-left">
              <th className="px-4 py-3 font-semibold">Item</th>
              <th className="px-4 py-3 font-semibold">{t(lang, "price")}</th>
              <th className="px-4 py-3 font-semibold">{t(lang, "active")}</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.id} className="border-t border-border">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {i.image && <img src={i.image} alt={i.name} className="w-10 h-10 rounded-lg object-cover" />}
                    <div>
                      <p className="font-semibold">{i.name}</p>
                      <p className="text-xs text-muted-foreground">{i.description}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">{formatIDR(i.price)}</td>
                <td className="px-4 py-3">{i.active ? "✓" : "—"}</td>
                <td className="px-4 py-3 text-right">
                  <button data-testid={`edit-${i.id}`} onClick={() => openEdit(i)} className="p-2 rounded-lg hover:bg-secondary"><Edit2 size={14} /></button>
                  <button data-testid={`del-${i.id}`} onClick={() => remove(i.id)} className="p-2 rounded-lg hover:bg-secondary text-destructive"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan="4" className="px-4 py-8 text-center text-muted-foreground">No items</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={close}>
          <div onClick={(e) => e.stopPropagation()} className="bg-card rounded-3xl border border-black/10 dark:border-white/10 w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-xl font-bold">{editing === "new" ? t(lang, "add_new") : t(lang, "edit")}</h2>
              <button onClick={close}><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <FF label="Name" v={form.name} on={(v) => setForm({ ...form, name: v })} testid="form-name" />
              <FF label={t(lang, "price")} type="number" v={form.price} on={(v) => setForm({ ...form, price: v })} testid="form-price" />
              <FF label={t(lang, "description")} v={form.description} on={(v) => setForm({ ...form, description: v })} testid="form-desc" />
              <FF label={t(lang, "image_url")} v={form.image} on={(v) => setForm({ ...form, image: v })} testid="form-image" />
              {category === "food" && (
                <label className="block">
                  <span className="text-xs font-medium text-muted-foreground">Warung</span>
                  <select
                    data-testid="form-merchant"
                    value={form.merchant_id || ""}
                    onChange={(e) => setForm({ ...form, merchant_id: e.target.value || null })}
                    className="mt-1 w-full bg-secondary text-foreground rounded-xl px-3 py-2 text-sm outline-none"
                  >
                    <option value="">-- Pilih Warung --</option>
                    {merchants.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </label>
              )}
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> {t(lang, "active")}
              </label>
              <button data-testid="form-save" onClick={save} className="w-full bg-primary text-primary-foreground py-3 rounded-full font-semibold mt-2 hover:opacity-90 active:scale-95 transition">{t(lang, "save")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const FF = ({ label, v, on, type = "text", testid }) => (
  <label className="block">
    <span className="text-xs font-medium text-muted-foreground">{label}</span>
    <input data-testid={testid} type={type} value={v} onChange={(e) => on(e.target.value)} className="mt-1 w-full bg-secondary text-foreground rounded-xl px-3 py-2 text-sm border border-transparent focus:border-primary outline-none" />
  </label>
);
