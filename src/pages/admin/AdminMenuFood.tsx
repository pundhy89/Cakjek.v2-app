import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Loader2 } from 'lucide-react';
import ImageInput from '@/components/ImageInput';
import { adminGetMenuItems, adminGetMerchants, createMenuItem, updateMenuItem, deleteMenuItem, formatIDR } from '@/lib/api';
import type { MenuItem, Merchant } from '@/types/index';
import { toast } from 'sonner';

type FoodForm = Omit<MenuItem, 'id' | 'created_at'>;
const EMPTY: FoodForm = { name: '', price: 10000, description: '', image_url: '', category: 'food', merchant_id: '', active: true };

const AdminMenuFood: React.FC = () => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [form, setForm] = useState<FoodForm>(EMPTY);

  const load = () => {
    setLoading(true);
    Promise.all([adminGetMenuItems('food'), adminGetMerchants()])
      .then(([items, merchants]) => { setItems(items); setMerchants(merchants); })
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm({ ...EMPTY, merchant_id: merchants[0]?.id ?? '' }); setModal(true); };
  const openEdit = (m: MenuItem) => { setEditing(m); setForm({ name: m.name, price: m.price, description: m.description, image_url: m.image_url, category: 'food', merchant_id: m.merchant_id ?? '', active: m.active }); setModal(true); };
  const closeModal = () => { setModal(false); setEditing(null); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Nama wajib diisi'); return; }
    setSaving(true);
    try {
      if (editing) { await updateMenuItem(editing.id, form); toast.success('Menu diperbarui'); }
      else { await createMenuItem(form); toast.success('Menu ditambahkan'); }
      closeModal(); load();
    } catch { toast.error('Gagal menyimpan'); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus item ini?')) return;
    try { await deleteMenuItem(id); toast.success('Menu dihapus'); load(); } catch { toast.error('Gagal menghapus'); }
  };

  const merchantName = (id: string | null) => merchants.find((m) => m.id === id)?.name ?? '-';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h2 className="text-lg font-extrabold">Menu Makanan</h2><p className="text-sm text-muted-foreground">{items.length} item</p></div>
        <button onClick={openAdd} className="flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary/90 transition shrink-0"><Plus size={15} /> Tambah</button>
      </div>

      <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-max">
            <thead className="border-b border-border bg-muted/50">
              <tr className="text-xs text-muted-foreground">
                <th className="text-left p-3 font-medium whitespace-nowrap">Menu</th>
                <th className="text-left p-3 font-medium whitespace-nowrap">Merchant</th>
                <th className="text-right p-3 font-medium whitespace-nowrap">Harga</th>
                <th className="text-center p-3 font-medium whitespace-nowrap">Aktif</th>
                <th className="text-center p-3 font-medium whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(3)].map((_, i) => <tr key={i}><td colSpan={5} className="p-3"><div className="h-8 bg-muted rounded animate-pulse" /></td></tr>)
              ) : items.length === 0 ? (
                <tr><td colSpan={5} className="text-center text-muted-foreground py-10 text-sm">Belum ada menu</td></tr>
              ) : items.map((item) => (
                <tr key={item.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition">
                  <td className="p-3 whitespace-nowrap">
                    <div className="flex items-center gap-2.5">
                      {item.image_url ? <img src={item.image_url} alt={item.name} className="w-9 h-9 rounded-xl object-cover shrink-0" /> : <div className="w-9 h-9 rounded-xl bg-muted grid place-items-center shrink-0"><span>🍽️</span></div>}
                      <span className="text-sm font-semibold">{item.name}</span>
                    </div>
                  </td>
                  <td className="p-3 text-sm text-muted-foreground whitespace-nowrap">{merchantName(item.merchant_id)}</td>
                  <td className="p-3 text-sm font-bold text-right whitespace-nowrap">{formatIDR(item.price)}</td>
                  <td className="p-3 text-center whitespace-nowrap"><span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${item.active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-muted text-muted-foreground'}`}>{item.active ? 'Ya' : 'Tidak'}</span></td>
                  <td className="p-3 whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1.5">
                      <button onClick={() => openEdit(item)} className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 grid place-items-center hover:bg-blue-200 transition dark:bg-blue-900/30 dark:text-blue-400"><Pencil size={13} /></button>
                      <button onClick={() => handleDelete(item.id)} className="w-8 h-8 rounded-lg bg-red-100 text-destructive grid place-items-center hover:bg-red-200 transition dark:bg-red-900/30"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-card rounded-3xl shadow-2xl w-full max-w-[calc(100%-2rem)] md:max-w-lg max-h-[90dvh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="font-bold text-base">{editing ? 'Edit Menu' : 'Tambah Menu'}</h3>
              <button onClick={closeModal} className="w-8 h-8 rounded-full bg-muted grid place-items-center"><X size={15} /></button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <ImageInput label="Foto Menu" value={form.image_url} onChange={(url) => setForm((f) => ({ ...f, image_url: url }))} />
              <FF label="Nama Menu"><input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Nama menu..." className="input-field" required /></FF>
              <FF label="Harga (Rp)"><input type="number" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))} className="input-field" /></FF>
              <FF label="Deskripsi"><textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={2} placeholder="Deskripsi singkat..." className="input-field resize-none" /></FF>
              <FF label="Merchant">
                <select value={form.merchant_id ?? ''} onChange={(e) => setForm((f) => ({ ...f, merchant_id: e.target.value }))} className="input-field">
                  <option value="">-- Pilih Merchant --</option>
                  {merchants.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </FF>
              <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} className="w-4 h-4 accent-primary" /><span className="text-sm font-medium">Aktif</span></label>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={closeModal} className="flex-1 py-3 rounded-2xl bg-secondary text-secondary-foreground font-semibold text-sm hover:bg-secondary/80 transition">Batal</button>
                <button type="submit" disabled={saving} className="flex-1 py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition disabled:opacity-60 flex items-center justify-center gap-1.5">
                  {saving && <Loader2 size={14} className="animate-spin" />} Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const FF: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div><label className="text-sm font-medium text-foreground block mb-1.5">{label}</label>{children}</div>
);

export default AdminMenuFood;
