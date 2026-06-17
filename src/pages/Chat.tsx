import React from 'react';
import { MessageCircle, ExternalLink, HelpCircle, Phone } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

const Chat: React.FC = () => {
  const { settings } = useApp();
  const waUrl = `https://wa.me/${settings.whatsapp_number}?text=${encodeURIComponent('Halo, saya butuh bantuan dari CakJek')}`;

  return (
    <div className="min-h-dvh">
      {/* Header */}
      <div className="px-5 pt-10 pb-6" style={{ background: 'linear-gradient(135deg, #128C7E, #075E54)' }}>
        <div className="flex items-center gap-3 text-white">
          <div className="w-10 h-10 rounded-2xl bg-white/20 grid place-items-center">
            <MessageCircle size={20} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold">Chat</h1>
            <p className="text-xs text-white/70">Hubungi kami via WhatsApp</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-4">
        {/* Main CTA */}
        <div className="bg-card rounded-3xl p-6 shadow-sm border border-border/50 flex flex-col items-center gap-4 text-center">
          <div className="w-20 h-20 rounded-3xl bg-[#128C7E]/10 grid place-items-center">
            <MessageCircle size={36} className="text-[#128C7E]" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-foreground text-balance">Butuh Bantuan?</h2>
            <p className="text-sm text-muted-foreground mt-1 text-pretty">
              Tim kami siap membantu kamu. Chat langsung via WhatsApp sekarang!
            </p>
          </div>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 bg-[#128C7E] hover:bg-[#075E54] text-white font-bold py-4 rounded-2xl transition active:scale-[0.98]"
          >
            <ExternalLink size={18} /> Buka WhatsApp
          </a>
        </div>

        {/* FAQ */}
        <div className="bg-card rounded-3xl p-5 shadow-sm border border-border/50 space-y-3">
          <h3 className="font-bold text-sm flex items-center gap-2"><HelpCircle size={16} className="text-primary" /> Pertanyaan Umum</h3>
          {[
            { q: 'Bagaimana cara memesan?', a: 'Pilih layanan yang kamu butuhkan, isi form, lalu kirim pesanan via WhatsApp.' },
            { q: 'Berapa lama pengiriman?', a: 'Rata-rata 15-30 menit tergantung jarak dan kondisi lalu lintas.' },
            { q: 'Bagaimana cara pembayaran?', a: 'Pembayaran dilakukan langsung kepada driver/kurir atau via transfer.' },
          ].map((faq, i) => (
            <div key={i} className="border-b border-border last:border-0 pb-3 last:pb-0">
              <p className="text-sm font-semibold text-foreground">{faq.q}</p>
              <p className="text-xs text-muted-foreground mt-1">{faq.a}</p>
            </div>
          ))}
        </div>

        {/* Contact */}
        <div className="bg-card rounded-2xl p-4 shadow-sm border border-border/50 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#128C7E]/10 grid place-items-center shrink-0">
            <Phone size={18} className="text-[#128C7E]" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Nomor WhatsApp</p>
            <p className="text-sm font-bold text-foreground">+{settings.whatsapp_number}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
