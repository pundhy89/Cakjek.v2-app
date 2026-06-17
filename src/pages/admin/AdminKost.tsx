import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Loader2, Building2, ToggleLeft, ToggleRight } from 'lucide-react';
import { getKosts, createKost, updateKost, deleteKost, uploadImage } from '@/lib/api';
import type { Kost } from '@/types/index';
import { toast } from 'sonner';

const EMPTY: Omit<Kost, 'id' | 'created_at'> = {
  nama: '', foto_url: '', alamat: '', deskripsi: '', fasilitas: '',
  harga_harian: 0, harga_mingguan: 0, harga_bulanan: 0,
  status: 'tersedia', active: true,
};

const AdminKost: React.FC = () => {
  const [kosts, setKosts] = useState<Kost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Kost | null>(null);
  const [form, setForm] = useState<Omit<Kost, 'id' | 'created_at'>>(EMPTY);
  const [imgTab, setImgTab] = useState<'url' | 'upload'>('url');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = () => { setLoading(true); getKosts().then(setKosts).finally(() => setLoading(false)); };
  useEffect(load, []);

  const openAdd = () => { setEditing(null); setForm(EMPTY); setImgTab('url'); setShowForm(true); };
  const openEdit = (k: Kost) => { setEditing(k); setForm({ nama: k.nama, foto_url: k.foto_url, alamat: k.alamat, deskripsi: k.deskripsi, fasilitas: k.fasilitas, harga_harian: k.harga_harian, harga_mingguan: k.harga_mingguan, harga_bulanan: k.harga_bulanan, status: k.status, active: k.active }); setImgTab('url'); setShowForm(true); };

  const handleUpload = async (file: File) => {
    setUploading(true);
    try { const url = await uploadImage(file); setForm((f) => ({ ...f, foto_url: url })); toast.success('Foto berhasil diupload'); }
    catch { toast.error('Upload gagal'); }
    finally { setUploading(false); }
  };

  const handleSave = async () => {
    if (!form.nama.trim()) { toast.error('Nama kost wajib diisi'); return; }
    if (!form.alamat.trim()) { toast.error('Alamat wajib diisi'); return; }
    setSaving(true);
    try {
      if (editing) await updateKost(editing.id, form);
      else await createKost(form);
      toast.success(editing ? 'Kost diperbarui' : 'Kost ditambahkan');
      setShowForm(false); load();
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Gagal menyimpan'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus kost ini?')) return;
    try { await deleteKost(id); toast.success('Kost dihapus'); load(); }
    catch { toast.error('Gagal menghapus'); }
  };

  const toggleStatus = async (k: Kost) => {
    const next = k.status === 'tersedia' ? 'penuh' : 'tersedia';
    try { await updateKost(k.id, { status: next }); load(); toast.success(`Status diubah: ${next}`); }
    catch { toast.error('Gagal mengubah status'); }
  };

  const toggleActive = async (k: Kost) => {
    try { await updateKost(k.id, { active: !k.active }); load(); }
    catch { toast.error('Gagal mengubah status aktif'); }
  };

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-foreground">Manajemen Kost</h1>
          <p className="text-sm text-muted-foreground">Kelola daftar kost yang tersedia</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary/90 transition">
          <Plus size={16} /> Tambah Kost
        </button>
      </div>

      {loading && <div className="flex justify-center py-12"><Loader2 size={28} className="animate-spin text-primary" /></div>}

      <div className="overflow-x-auto">
        <table className="w-full text-sm whitespace-nowrap">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="pb-2 pr-3 font-semibold text-muted-foreground">Nama</th>
              <th className="pb-2 pr-3 font-semibold text-muted-foreground">Harga/Bln</th>
              <th className="pb-2 pr-3 font-semibold text-muted-foreground">Status</th>
              <th className="pb-2 pr-3 font-semibold text-muted-foreground">Aktif</th>
              <th className="pb-2 font-semibold text-muted-foreground">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {kosts.map((k) => (
              <tr key={k.id} className="border-b border-border/50 hover:bg-muted/30">
                <td className="py-3 pr-3">
                  <div className="flex items-center gap-2">
                    {k.foto_url ? <img src={k.foto_url} alt={k.nama} className="w-8 h-8 rounded-lg object-cover shrink-0" /> : <div className="w-8 h-8 rounded-lg bg-muted grid place-items-center shrink-0"><Building2 size={14} className="text-muted-foreground" /></div>}
                    <div>
                      <p className="font-semibold text-foreground">{k.nama}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[160px]">{k.alamat}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 pr-3 text-foreground">Rp {k.harga_bulanan.toLocaleString('id-ID')}</td>
                <td className="py-3 pr-3">
                  <button onClick={() => toggleStatus(k)} className={`px-2 py-1 rounded-full text-xs font-bold ${k.status === 'tersedia' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'}`}>
                    {k.status}
                  </button>
                </td>
                <td className="py-3 pr-3">
                  <button onClick={() => toggleActive(k)} className="text-primary">
                    {k.active ? <ToggleRight size={22} /> : <ToggleLeft size={22} className="text-muted-foreground" />}
                  </button>
                </td>
                <td className="py-3">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(k)} className="p-1.5 rounded-lg hover:bg-muted transition"><Pencil size={14} /></button>
                    <button onClick={() => handleDelete(k.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && kosts.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Building2 size={36} className="mx-auto mb-2 opacity-40" />
            <p>Belum ada kost. Klik "Tambah Kost" untuk memulai.</p>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 bg-black/60">
          <div className="bg-card rounded-3xl p-5 w-full max-w-[calc(100%-2rem)] md:max-w-lg max-h-[90dvh] overflow-y-auto shadow-2xl">
            <h2 className="text-lg font-extrabold text-foreground mb-4">{editing ? 'Edit Kost' : 'Tambah Kost'}</h2>
            <div className="space-y-3">
              <Field label="Nama Kost *"><input value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} className="input-field" placeholder="Nama kost..." /></Field>
              <Field label="Alamat *"><input value={form.alamat} onChange={(e) => setForm({ ...form, alamat: e.target.value })} className="input-field" placeholder="Alamat lengkap..." /></Field>
              <Field label="Deskripsi"><textarea value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} rows={2} className="input-field resize-none" placeholder="Deskripsi singkat..." /></Field>
              <Field label="Fasilitas"><input value={form.fasilitas} onChange={(e) => setForm({ ...form, fasilitas: e.target.value })} className="input-field" placeholder="WiFi, AC, Kamar Mandi Dalam, ..." /></Field>

              <Field label="Foto Kost">
                <div className="flex gap-2 mb-2">
                  {(['url', 'upload'] as const).map((t) => (
                    <button key={t} type="button" onClick={() => setImgTab(t)} className={`px-3 py-1 rounded-lg text-xs font-semibold border ${imgTab === t ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted text-foreground border-border'}`}>
                      {t === 'url' ? 'URL' : 'Upload Foto'}
                    </button>
                  ))}
                </div>
                {imgTab === 'url'
                  ? <input value={form.foto_url} onChange={(e) => setForm({ ...form, foto_url: e.target.value })} className="input-field" placeholder="https://..." />
                  : <div className="flex items-center gap-2">
                      <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])} className="input-field text-xs" />
                      {uploading && <Loader2 size={16} className="animate-spin text-primary shrink-0" />}
                    </div>
                }
                {form.foto_url && <img src={form.foto_url} alt="preview" className="mt-2 w-full h-28 object-cover rounded-xl" />}
              </Field>

              <div className="grid grid-cols-3 gap-2">
                <Field label="Harga/Hari"><input type="number" value={form.harga_harian} onChange={(e) => setForm({ ...form, harga_harian: Number(e.target.value) })} className="input-field" /></Field>
                <Field label="Harga/Minggu"><input type="number" value={form.harga_mingguan} onChange={(e) => setForm({ ...form, harga_mingguan: Number(e.target.value) })} className="input-field" /></Field>
                <Field label="Harga/Bulan"><input type="number" value={form.harga_bulanan} onChange={(e) => setForm({ ...form, harga_bulanan: Number(e.target.value) })} className="input-field" /></Field>
              </div>

              <Field label="Status">
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as 'tersedia' | 'penuh' })} className="input-field">
                  <option value="tersedia">Tersedia</option>
                  <option value="penuh">Penuh</option>
                </select>
              </Field>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="w-4 h-4 accent-primary" />
                <span className="text-sm font-medium text-foreground">Tampilkan di aplikasi</span>
              </label>
            </div>

            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-2xl border border-border text-sm font-semibold text-foreground hover:bg-muted transition">Batal</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 rounded-2xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition disabled:opacity-60 flex items-center justify-center gap-2">
                {saving ? <Loader2 size={15} className="animate-spin" /> : null} Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <label className="text-xs font-semibold text-muted-foreground block mb-1">{label}</label>
    {children}
  </div>
);

export default AdminKost;
