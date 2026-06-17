import React from 'react';
import { CheckCircle2, ExternalLink, ArrowLeft } from 'lucide-react';

interface OrderSuccessModalProps {
  open: boolean;
  waUrl: string;
  onClose: () => void;
}

const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({ open, waUrl, onClose }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-card rounded-3xl shadow-2xl w-full max-w-sm p-7 flex flex-col items-center text-center gap-5">
        <div className="w-20 h-20 rounded-full bg-[hsl(var(--success)/0.12)] grid place-items-center">
          <CheckCircle2 size={44} className="text-[hsl(var(--success))]" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-foreground text-balance">Pesanan Dibuat!</h2>
          <p className="text-sm text-muted-foreground mt-1 text-pretty">
            Lanjutkan konfirmasi pesanan kamu via WhatsApp ya.
          </p>
        </div>
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 bg-[#128C7E] hover:bg-[#075E54] text-white font-bold py-3.5 rounded-2xl transition active:scale-95"
        >
          <ExternalLink size={18} /> Buka WhatsApp
        </a>
        <button
          onClick={onClose}
          className="w-full flex items-center justify-center gap-2 bg-secondary text-secondary-foreground font-semibold py-3.5 rounded-2xl transition hover:bg-secondary/80 active:scale-95"
        >
          <ArrowLeft size={16} /> Kembali
        </button>
      </div>
    </div>
  );
};

export default OrderSuccessModal;
