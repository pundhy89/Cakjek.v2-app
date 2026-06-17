import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Loader2, Car, ToggleLeft, ToggleRight } from 'lucide-react';
import { getVehicles, createVehicle, updateVehicle, deleteVehicle, uploadImage } from '@/lib/api';
import type { Vehicle } from '@/types/index';
import { toast } from 'sonner';

const EMPTY: Omit<Vehicle, 'id' | 'created_at'> = {
  nama: '', jenis: 'motor', foto_url: '', deskripsi: '',
  harga_harian: 0, harga_mingguan: 0, harga_bulanan: 0,
  biaya_sopir_harian: null, status: 'tersedia', active: true,
};

const AdminVehicle: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [form, setForm] = useState<Omit<Vehicle, 'id' | 'created_at'>>(EMPTY);
  const [imgTab, setImgTab] = useState<'url' | 'upload'>('url');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = () => { setLoading(true); getVehicles().then(setVehicles).finally(() => setLoading(false)); };
  useEffect(load, []);

  const openAdd = () => { setEditing(null); setForm(EMPTY); setImgTab('url'); setShowForm(true); };
  const openEdit = (v: Vehicle) => {
    setEditing(v);
    setForm({ nama: v.nama, jenis: v.jenis, foto_url: v.foto_url, deskripsi: v.deskripsi, harga_harian: v.harga_harian, harga_mingguan: v.harga_mingguan, harga_bulanan: v.harga_bulanan, biaya_sopir_harian: v.biaya_sopir_harian, status: v.status, active: v.active });
    setImgTab('url'); setShowForm(true);
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    try { const url = await uploadImage(file); setForm((f) => ({ ...f, foto_url: url })); toast.success('Foto berhasil diupload'); }
    catch { toast.error('Upload gagal'); }
    finally { setUploading(false); }
  };

  const handleSave = async () => {
    if (!form.nama.trim()) { toast.error('Nama kendaraan wajib diisi'); return; }
    setSaving(true);
    try {
      const payload = { ...form, biaya_sopir_harian: form.jenis === 'mobil' ? (form.biaya_sopir_harian ?? null) : null };
      if (editing) await updateVehicle(editing.id, payload);
      else await createVehicle(payload);
      toast.success(editing ? 'Kendaraan diperbarui' : 'Kendaraan ditambahkan');
      setShowForm(false); load();
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Gagal menyimpan'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus kendaraan ini?')) return;
    try { await deleteVehicle(id); toast.success('Kendaraan dihapus'); load(); }
    catch { toast.error('Gagal menghapus'); }
  };

  const toggleStatus = async (v: Vehicle) => {
    const next = v.status === 'tersedia' ? 'disewa' : 'tersedia';
    try { await updateVehicle(v.id, { status: next }); load(); toast.success(`Status: ${next}`); }
    catch { toast.error('Gagal mengubah status'); }
  };

  const toggleActive = async (v: Vehicle) => {
    try { await updateVehicle(v.id, { active: !v.active }); load(); }
    catch { toast.error('Gagal mengubah status aktif'); }
  };

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-foreground">Manajemen Rental Kendaraan</h1>
          <p className="text-sm text-muted-foreground">Kelola daftar kendaraan yang tersedia untuk disewa</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary/90 transition">
          <Plus size={16} /> Tambah Kendaraan
        </button>
      </div>

      {loading && <div className="flex justify-center py-12"><Loader2 size={28} className="animate-spin text-primary" /></div>}

      <div className="overflow-x-auto">
        <table className="w-full text-sm whitespace-nowrap">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="pb-2 pr-3 font-semibold text-muted-foreground">Kendaraan</th>
              <th className="pb-2 pr-3 font-semibold text-muted-foreground">Jenis</th>
              <th className="pb-2 pr-3 font-semibold text-muted-foreground">Harga/Hari</th>
              <th className="pb-2 pr-3 font-semibold text-muted-foreground">Status</th>
              <th className="pb-2 pr-3 font-semibold text-muted-foreground">Aktif</th>
              <th className="pb-2 font-semibold text-muted-foreground">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((v) => (
              <tr key={v.id} className="border-b border-border/50 hover:bg-muted/30">
                <td className="py-3 pr-3">
                  <div className="flex items-center gap-2">
                    {v.foto_url ? <img src={v.foto_url} alt={v.nama} className="w-8 h-8 rounded-lg object-cover shrink-0" /> : <div className="w-8 h-8 rounded-lg bg-muted grid place-items-center shrink-0"><Car size={14} className="text-muted-foreground" /></div>}
                    <p className="font-semibold text-foreground">{v.nama}</p>
                  </div>
                </td>
                <td className="py-3 pr-3">
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary capitalize">{v.jenis}</span>
                </td>
                <td className="py-3 pr-3 text-foreground">Rp {v.harga_harian.toLocaleString('id-ID')}</td>
                <td className="py-3 pr-3">
                  <button onClick={() => toggleStatus(v)} className={`px-2 py-1 rounded-full text-xs font-bold ${v.status === 'tersedia' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400'}`}>
                    {v.status}
                  </button>
                </td>
                <td className="py-3 pr-3">
                  <button onClick={() => toggleActive(v)} className="text-primary">
                    {v.active ? <ToggleRight size={22} /> : <ToggleLeft size={22} className="text-muted-foreground" />}
                  </button>
                </td>
                <td className="py-3">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(v)} className="p-1.5 rounded-lg hover:bg-muted transition"><Pencil size={14} /></button>
                    <button onClick={() => handleDelete(v.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && vehicles.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Car size={36} className="mx-auto mb-2 opacity-40" />
            <p>Belum ada kendaraan. Klik "Tambah Kendaraan" untuk memulai.</p>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 bg-black/60">
          <div className="bg-card rounded-3xl p-5 w-full max-w-[calc(100%-2rem)] md:max-w-lg max-h-[90dvh] overflow-y-auto shadow-2xl">
            <h2 className="text-lg font-extrabold text-foreground mb-4">{editing ? 'Edit Kendaraan' : 'Tambah Kendaraan'}</h2>
            <div className="space-y-3">
              <Field label="Nama Kendaraan *"><input value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} className="input-field" placeholder="Contoh: Honda Beat 2022" /></Field>

              <Field label="Jenis Kendaraan">
                <select value={form.jenis} onChange={(e) => setForm({ ...form, jenis: e.target.value as 'motor' | 'mobil', biaya_sopir_harian: e.target.value === 'motor' ? null : form.biaya_sopir_harian })} className="input-field">
                  <option value="motor">Motor</option>
                  <option value="mobil">Mobil</option>
                </select>
              </Field>

              <Field label="Deskripsi"><textarea value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} rows={2} className="input-field resize-none" placeholder="Deskripsi singkat kendaraan..." /></Field>

              <Field label="Foto Kendaraan">
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

              {form.jenis === 'mobil' && (
                <Field label="Biaya Sopir/Hari (kosongkan jika tidak ada sopir)">
                  <input type="number" value={form.biaya_sopir_harian ?? ''} onChange={(e) => setForm({ ...form, biaya_sopir_harian: e.target.value ? Number(e.target.value) : null })} className="input-field" placeholder="Contoh: 150000" />
                </Field>
              )}

              <Field label="Status">
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as 'tersedia' | 'disewa' })} className="input-field">
                  <option value="tersedia">Tersedia</option>
                  <option value="disewa">Sedang Disewa</option>
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

export default AdminVehicle;
