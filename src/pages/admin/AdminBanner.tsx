import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Loader2 } from 'lucide-react';
import ImageInput from '@/components/ImageInput';
import { adminGetBanners, createBanner, updateBanner, deleteBanner } from '@/lib/api';
import type { Banner } from '@/types/index';
import { toast } from 'sonner';

type BannerForm = Omit<Banner, 'id' | 'created_at'>;
const EMPTY: BannerForm = {
  title: '', subtitle: '', code: '', color_from: '#6366f1', color_to: '#8b5cf6',
  image_url: '', order_idx: 1, active: true, start_date: null, end_date: null,
};

const AdminBanner: React.FC = () => {
  const [items, setItems] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [form, setForm] = useState<BannerForm>(EMPTY);

  const load = () => { setLoading(true); adminGetBanners().then(setItems).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm(EMPTY); setModal(true); };
  const openEdit = (b: Banner) => { setEditing(b); setForm({ title: b.title, subtitle: b.subtitle, code: b.code, color_from: b.color_from, color_to: b.color_to, image_url: b.image_url, order_idx: b.order_idx, active: b.active, start_date: b.start_date, end_date: b.end_date }); setModal(true); };
  const closeModal = () => { setModal(false); setEditing(null); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Judul wajib diisi'); return; }
    setSaving(true);
    try {
      if (editing) { await updateBanner(editing.id, form); toast.success('Banner diperbarui'); }
      else { await createBanner(form); toast.success('Banner ditambahkan'); }
      closeModal(); load();
    } catch { toast.error('Gagal menyimpan'); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus banner ini?')) return;
    try { await deleteBanner(id); toast.success('Banner dihapus'); load(); } catch { toast.error('Gagal menghapus'); }
  };

  const f = form;
  const setF = <K extends keyof BannerForm>(key: K, val: BannerForm[K]) => setForm((p) => ({ ...p, [key]: val }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h2 className="text-lg font-extrabold">Manajemen Banner</h2><p className="text-sm text-muted-foreground">{items.length} banner</p></div>
        <button onClick={openAdd} className="flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary/90 transition shrink-0"><Plus size={15} /> Tambah</button>
      </div>

      {/* Preview cards */}
      <div className="space-y-3">
        {loading ? ([...Array(2)].map((_, i) => <div key={i} className="h-20 bg-muted rounded-2xl animate-pulse" />))
          : items.length === 0 ? (<p className="text-center text-muted-foreground py-10 text-sm">Belum ada banner</p>)
          : items.map((b) => (
          <div key={b.id} className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
            <div className="flex items-center gap-0">
              <div className="w-16 h-20 shrink-0" style={{ background: `linear-gradient(135deg, ${b.color_from}, ${b.color_to})` }}>
                {b.image_url && <img src={b.image_url} alt={b.title} className="w-full h-full object-cover opacity-80" />}
              </div>
              <div className="flex-1 min-w-0 px-4 py-3">
                <p className="text-sm font-bold truncate">{b.title}</p>
                <p className="text-xs text-muted-foreground truncate">{b.subtitle}</p>
                <div className="flex items-center gap-2 mt-1">
                  {b.code && <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-md font-bold">{b.code}</span>}
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${b.active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-muted text-muted-foreground'}`}>{b.active ? 'Aktif' : 'Nonaktif'}</span>
                  <span className="text-[10px] text-muted-foreground">#{b.order_idx}</span>
                </div>
              </div>
              <div className="flex flex-col gap-1.5 pr-3">
                <button onClick={() => openEdit(b)} className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 grid place-items-center hover:bg-blue-200 transition dark:bg-blue-900/30 dark:text-blue-400"><Pencil size={13} /></button>
                <button onClick={() => handleDelete(b.id)} className="w-8 h-8 rounded-lg bg-red-100 text-destructive grid place-items-center hover:bg-red-200 transition dark:bg-red-900/30"><Trash2 size={13} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-card rounded-3xl shadow-2xl w-full max-w-[calc(100%-2rem)] md:max-w-lg max-h-[90dvh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="font-bold">{editing ? 'Edit Banner' : 'Tambah Banner'}</h3>
              <button onClick={closeModal} className="w-8 h-8 rounded-full bg-muted grid place-items-center"><X size={15} /></button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <ImageInput label="Foto Banner" value={f.image_url} onChange={(url) => setF('image_url', url)} />
              <FF label="Judul"><input value={f.title} onChange={(e) => setF('title', e.target.value)} placeholder="Judul banner..." className="input-field" required /></FF>
              <FF label="Subjudul"><input value={f.subtitle} onChange={(e) => setF('subtitle', e.target.value)} placeholder="Deskripsi singkat..." className="input-field" /></FF>
              <FF label="Kode Promo"><input value={f.code} onChange={(e) => setF('code', e.target.value)} placeholder="PROMO10" className="input-field" /></FF>
              <div className="grid grid-cols-2 gap-3">
                <FF label="Warna Dari">
                  <div className="flex items-center gap-2">
                    <input type="color" value={f.color_from} onChange={(e) => setF('color_from', e.target.value)} className="w-10 h-10 rounded-lg border border-border cursor-pointer" />
                    <input value={f.color_from} onChange={(e) => setF('color_from', e.target.value)} className="input-field flex-1 text-xs" />
                  </div>
                </FF>
                <FF label="Warna Ke">
                  <div className="flex items-center gap-2">
                    <input type="color" value={f.color_to} onChange={(e) => setF('color_to', e.target.value)} className="w-10 h-10 rounded-lg border border-border cursor-pointer" />
                    <input value={f.color_to} onChange={(e) => setF('color_to', e.target.value)} className="input-field flex-1 text-xs" />
                  </div>
                </FF>
              </div>
              {/* Preview */}
              <div className="h-14 rounded-xl" style={{ background: `linear-gradient(135deg, ${f.color_from}, ${f.color_to})` }}>
                <div className="h-full px-4 flex items-center">
                  <p className="text-white font-bold text-sm">{f.title || 'Preview Banner'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FF label="Urutan"><input type="number" value={f.order_idx} onChange={(e) => setF('order_idx', Number(e.target.value))} className="input-field" /></FF>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FF label="Mulai (opsional)"><input type="date" value={f.start_date ?? ''} onChange={(e) => setF('start_date', e.target.value || null)} className="input-field" /></FF>
                <FF label="Selesai (opsional)"><input type="date" value={f.end_date ?? ''} onChange={(e) => setF('end_date', e.target.value || null)} className="input-field" /></FF>
              </div>
              <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={f.active} onChange={(e) => setF('active', e.target.checked)} className="w-4 h-4 accent-primary" /><span className="text-sm font-medium">Aktif</span></label>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={closeModal} className="flex-1 py-3 rounded-2xl bg-secondary text-secondary-foreground font-semibold text-sm hover:bg-secondary/80 transition">Batal</button>
                <button type="submit" disabled={saving} className="flex-1 py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition disabled:opacity-60 flex items-center justify-center gap-1.5">{saving && <Loader2 size={14} className="animate-spin" />} Simpan</button>
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

export default AdminBanner;
