import React, { useRef, useState } from "react";
import { Upload, X, Image as ImgIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

/**
 * ImageUploader — pilih file lokal → resize via canvas → base64 data URI.
 * Tetap kompatibel kalau `value` berupa URL biasa (preview tetap muncul).
 *
 * Props:
 *  - value: string (data URI atau URL)
 *  - onChange: (val: string) => void
 *  - maxWidth: number (default 800)
 *  - quality: number (default 0.82) — JPEG quality
 *  - testid?: string
 */
export default function ImageUploader({ value, onChange, maxWidth = 800, quality = 0.82, testid }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);

  const pick = () => inputRef.current && inputRef.current.click();

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Ukuran gambar maksimal 8MB");
      return;
    }
    setBusy(true);
    try {
      const dataUrl = await resizeImage(file, maxWidth, quality);
      onChange(dataUrl);
    } catch (e) {
      console.error(e);
      toast.error("Gagal memproses gambar");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="block">
      <span className="text-xs font-medium text-muted-foreground">Foto</span>
      <div className="mt-1 flex items-center gap-3">
        <div className="w-20 h-20 rounded-xl bg-secondary border border-border overflow-hidden flex items-center justify-center shrink-0">
          {value ? (
            <img src={value} alt="preview" className="w-full h-full object-cover" />
          ) : (
            <ImgIcon className="text-muted-foreground" size={22} />
          )}
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex gap-2">
            <button
              type="button"
              data-testid={testid ? `${testid}-pick` : "img-pick"}
              onClick={pick}
              disabled={busy}
              className="inline-flex items-center gap-1.5 bg-secondary hover:bg-secondary/70 text-foreground px-3 py-2 rounded-xl text-xs font-semibold transition disabled:opacity-60"
            >
              {busy ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
              {busy ? "Memproses..." : value ? "Ganti Foto" : "Unggah Foto"}
            </button>
            {value && (
              <button
                type="button"
                data-testid={testid ? `${testid}-clear` : "img-clear"}
                onClick={() => onChange("")}
                className="inline-flex items-center gap-1.5 text-destructive hover:bg-destructive/10 px-3 py-2 rounded-xl text-xs font-semibold transition"
              >
                <X size={14} /> Hapus
              </button>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground">JPG / PNG / WEBP, maks 8MB. Otomatis di-resize.</p>
        </div>
      </div>
      <input
        ref={inputRef}
        data-testid={testid || "img-file"}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files && e.target.files[0])}
      />
    </div>
  );
}

// Resize via canvas → returns base64 (JPEG, kecuali PNG transparan tetap PNG)
function resizeImage(file, maxWidth, quality) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read fail"));
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const ratio = img.width > maxWidth ? maxWidth / img.width : 1;
        const w = Math.round(img.width * ratio);
        const h = Math.round(img.height * ratio);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);
        const isPng = file.type === "image/png";
        const mime = isPng ? "image/png" : "image/jpeg";
        try {
          const url = canvas.toDataURL(mime, quality);
          resolve(url);
        } catch (e) { reject(e); }
      };
      img.onerror = () => reject(new Error("image load fail"));
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });
}
