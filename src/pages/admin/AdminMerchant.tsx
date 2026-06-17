import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Loader2, Store } from 'lucide-react';
import ImageInput from '@/components/ImageInput';
import { adminGetMerchants, createMerchant, updateMerchant, deleteMerchant, formatIDR } from '@/lib/api';
import type { Merchant } from '@/types/index';
import { toast } from 'sonner';

const EMPTY: Omit<Merchant, 'id' | 'created_at'> = { name: '', image_url: '', address: '', description: '', delivery_fee: 5000, rating: 4.5, active: true };

const AdminMerchant: React.FC = () => {
  const [items, setItems] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Merchant | null>(null);
  const [form, setForm] = useState(EMPTY);

  const load = () => { setLoading(true); adminGetMerchants().then(setItems).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm(EMPTY); setModal(true); };
  const openEdit = (m: Merchant) => { setEditing(m); setForm({ name: m.name, image_url: m.image_url, address: m.address, description: m.description, delivery_fee: m.delivery_fee, rating: m.rating, active: m.active }); setModal(true); };
  const closeModal = () => { setModal(false); setEditing(null); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Nama wajib diisi'); return; }
    setSaving(true);
    try {
      if (editing) { await updateMerchant(editing.id, form); toast.success('Merchant diperbarui'); }
      else { await createMerchant(form); toast.success('Merchant ditambahkan'); }
      closeModal(); load();
    } catch { toast.error('Gagal menyimpan'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus merchant ini?')) return;
    try { await deleteMerchant(id); toast.success('Merchant dihapus'); load(); } catch { toast.error('Gagal menghapus'); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold">Manajemen Merchant</h2>
          <p className="text-sm text-muted-foreground">{items.length} merchant</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary/90 transition shrink-0">
          <Plus size={15} /> Tambah
        </button>
      </div>

      <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-max">
            <thead className="border-b border-border bg-muted/50">
              <tr className="text-xs text-muted-foreground">
                <th className="text-left p-3 font-medium whitespace-nowrap">Merchant</th>
                <th className="text-left p-3 font-medium whitespace-nowrap">Alamat</th>
                <th className="text-right p-3 font-medium whitespace-nowrap">Ongkir</th>
                <th className="text-center p-3 font-medium whitespace-nowrap">Aktif</th>
                <th className="text-center p-3 font-medium whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(3)].map((_, i) => <tr key={i}><td colSpan={5} className="p-3"><div className="h-8 bg-muted rounded animate-pulse" /></td></tr>)
              ) : items.length === 0 ? (
                <tr><td colSpan={5} className="text-center text-muted-foreground py-10 text-sm">Belum ada merchant</td></tr>
              ) : items.map((m) => (
                <tr key={m.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition">
                  <td className="p-3 whitespace-nowrap">
                    <div className="flex items-center gap-2.5">
                      {m.image_url ? <img src={m.image_url} alt={m.name} className="w-9 h-9 rounded-xl object-cover shrink-0" /> : <div className="w-9 h-9 rounded-xl bg-muted grid place-items-center shrink-0"><Store size={16} /></div>}
                      <span className="text-sm font-semibold">{m.name}</span>
                    </div>
                  </td>
                  <td className="p-3 text-sm text-muted-foreground max-w-[160px] truncate whitespace-nowrap">{m.address}</td>
                  <td className="p-3 text-sm font-medium text-right whitespace-nowrap">{formatIDR(m.delivery_fee)}</td>
                  <td className="p-3 text-center whitespace-nowrap"><span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${m.active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-muted text-muted-foreground'}`}>{m.active ? 'Ya' : 'Tidak'}</span></td>
                  <td className="p-3 whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1.5">
                      <button onClick={() => openEdit(m)} className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 grid place-items-center hover:bg-blue-200 transition dark:bg-blue-900/30 dark:text-blue-400"><Pencil size={13} /></button>
                      <button onClick={() => handleDelete(m.id)} className="w-8 h-8 rounded-lg bg-red-100 text-destructive grid place-items-center hover:bg-red-200 transition dark:bg-red-900/30"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-card rounded-3xl shadow-2xl w-full max-w-[calc(100%-2rem)] md:max-w-lg max-h-[90dvh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="font-bold text-base">{editing ? 'Edit Merchant' : 'Tambah Merchant'}</h3>
              <button onClick={closeModal} className="w-8 h-8 rounded-full bg-muted grid place-items-center"><X size={15} /></button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <ImageInput label="Foto Merchant" value={form.image_url} onChange={(url) => setForm((f) => ({ ...f, image_url: url }))} />
              <FormField label="Nama Merchant"><input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Nama restoran..." className="input-field" required /></FormField>
              <FormField label="Alamat"><input value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} placeholder="Alamat lengkap..." className="input-field" /></FormField>
              <FormField label="Deskripsi"><textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={2} placeholder="Deskripsi singkat..." className="input-field resize-none" /></FormField>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Ongkir (Rp)"><input type="number" value={form.delivery_fee} onChange={(e) => setForm((f) => ({ ...f, delivery_fee: Number(e.target.value) }))} className="input-field" /></FormField>
                <FormField label="Rating"><input type="number" step="0.1" min="0" max="5" value={form.rating} onChange={(e) => setForm((f) => ({ ...f, rating: Number(e.target.value) }))} className="input-field" /></FormField>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} className="w-4 h-4 accent-primary" />
                <span className="text-sm font-medium">Aktif</span>
              </label>
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

const FormField: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div><label className="text-sm font-medium text-foreground block mb-1.5">{label}</label>{children}</div>
);

export default AdminMerchant;
