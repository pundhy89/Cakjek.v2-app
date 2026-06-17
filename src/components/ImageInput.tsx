import React, { useRef, useState } from 'react';
import { Link2, Upload, Loader2, Image as ImageIcon } from 'lucide-react';
import { uploadImage } from '@/lib/api';
import { toast } from 'sonner';

interface ImageInputProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

const ImageInput: React.FC<ImageInputProps> = ({ value, onChange, label = 'Foto' }) => {
  const [tab, setTab] = useState<'url' | 'upload'>('url');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Ukuran file maksimal 5 MB'); return; }
    setUploading(true);
    try {
      const url = await uploadImage(file);
      onChange(url);
      toast.success('Foto berhasil diupload');
    } catch (err) {
      toast.error(`Gagal upload: ${err instanceof Error ? err.message : 'Coba lagi'}`);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div>
      {label && <label className="text-sm font-medium text-foreground block mb-1.5">{label}</label>}

      {/* Tabs */}
      <div className="flex gap-1 mb-2 p-1 bg-muted rounded-xl">
        <TabBtn active={tab === 'url'} onClick={() => setTab('url')}>
          <Link2 size={13} /> URL
        </TabBtn>
        <TabBtn active={tab === 'upload'} onClick={() => setTab('upload')}>
          <Upload size={13} /> Upload Foto
        </TabBtn>
      </div>

      {tab === 'url' ? (
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://contoh.com/gambar.jpg"
          className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      ) : (
        <div>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 text-primary text-sm font-medium hover:bg-primary/10 transition disabled:opacity-60"
          >
            {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            {uploading ? 'Mengupload...' : 'Pilih Foto dari Perangkat'}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleUpload}
          />
          <p className="text-xs text-muted-foreground mt-1">Format: JPG, PNG, WEBP · Maks 5 MB</p>
        </div>
      )}

      {/* Preview */}
      {value && (
        <div className="mt-2 flex items-center gap-2">
          <div className="w-12 h-12 rounded-lg overflow-hidden border border-border shrink-0">
            <img src={value} alt="preview" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground truncate">{value}</p>
          </div>
          {!value && <ImageIcon size={24} className="text-muted-foreground" />}
        </div>
      )}
    </div>
  );
};

const TabBtn: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition ${
      active ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
    }`}
  >
    {children}
  </button>
);

export default ImageInput;
