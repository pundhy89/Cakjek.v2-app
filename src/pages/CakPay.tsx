import { addNotification } from '@/lib/notifications';
import React, { useEffect, useState } from 'react';
import { Wallet, Loader2, Check } from 'lucide-react';
import ServiceHeader from '@/components/ServiceHeader';
import OrderSuccessModal from '@/components/OrderSuccessModal';
import { getMenuItems, formatIDR, createOrder } from '@/lib/api';
import { useApp } from '@/contexts/AppContext';
import type { MenuItem } from '@/types/index';
import { toast } from 'sonner';

const ICONS: Record<string, string> = {
  'Top Up': '💳',
  'Pulsa': '📱',
  'Token': '⚡',
};

const CakPay: React.FC = () => {
  const { settings } = useApp();
  const [packages, setPackages] = useState<MenuItem[]>([]);
  const [selected, setSelected] = useState<MenuItem | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);
  const [success, setSuccess] = useState(false);
  const [waUrl, setWaUrl] = useState('');

  useEffect(() => {
    getMenuItems('cakpay').then(setPackages).finally(() => setLoading(false));
    const saved = localStorage.getItem('cakjek_user_name');
    if (saved) setName(saved);
  }, []);

  const handleOrder = async () => {
    if (!name.trim()) { toast.error('Nama wajib diisi'); return; }
    if (!phone.trim()) { toast.error('Nomor HP wajib diisi'); return; }
    if (!selected) { toast.error('Pilih paket terlebih dahulu'); return; }

    const msg = `💳 *Pesanan CakPay*
Nama: ${name}
Nomor HP: ${phone}
Paket: ${selected.name}
Total: ${formatIDR(selected.price)}

Dikirim via ${settings.app_name}`;

    setOrdering(true);
    try {
      const res = await createOrder({
        service: 'cakpay', customer_name: name, customer_phone: phone,
        details: { package_id: selected.id, package_name: selected.name, phone },
        total: selected.price, message: msg, status: 'new',
      });
      if (res) { setWaUrl(res.whatsapp_url); setSuccess(true); addNotification('cakpay', 'Permintaan pembayaran berhasil dikirim ke admin'); }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal membuat pesanan');
    } finally { setOrdering(false); }
  };

  const getIcon = (name: string) => {
    for (const [key, icon] of Object.entries(ICONS)) {
      if (name.includes(key)) return icon;
    }
    return '💳';
  };

  return (
    <div>
      <ServiceHeader title="Tolong Bayar" subtitle="Top up & bantu bayar tagihan" gradientFrom="#7c3aed" gradientTo="#5b21b6" />
      <div className="-mt-8 mx-4 relative z-10 space-y-3">
        <div className="bg-card rounded-3xl p-5 shadow-sm border border-border/50">
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">Nama</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama kamu..." className="input-field" />
          </div>
          <div className="mt-4">
            <label className="text-sm font-medium text-foreground block mb-1.5">Nomor HP</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="08xx xxxx xxxx" type="tel" className="input-field" />
          </div>
        </div>

        {/* Packages */}
        <div className="bg-card rounded-3xl p-5 shadow-sm border border-border/50">
          <h3 className="font-bold text-sm mb-3">Pilih Paket</h3>
          {loading ? (
            <div className="grid grid-cols-2 gap-2">{[1, 2, 3, 4].map((i) => <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />)}</div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {packages.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelected(p)}
                  className={`p-3 rounded-2xl border-2 text-left transition ${selected?.id === p.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-lg">{getIcon(p.name)}</span>
                    {selected?.id === p.id && <Check size={14} className="text-primary" />}
                  </div>
                  <p className="text-xs font-semibold text-foreground text-balance">{p.name}</p>
                  <p className="text-sm font-bold text-primary mt-0.5">{formatIDR(p.price)}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {selected && (
          <div className="bg-card rounded-3xl p-5 shadow-sm border border-border/50">
            <div className="flex justify-between font-extrabold text-base"><span>Total</span><span className="text-primary">{formatIDR(selected.price)}</span></div>
          </div>
        )}

        <button onClick={handleOrder} disabled={ordering || !selected} className="w-full flex items-center justify-center gap-2 bg-[#128C7E] hover:bg-[#075E54] text-white font-extrabold py-4 rounded-3xl shadow-lg transition active:scale-[0.98] disabled:opacity-60 mb-4">
          {ordering ? <Loader2 size={18} className="animate-spin" /> : <Wallet size={18} />}
          Pesan via WhatsApp
        </button>
      </div>

      <OrderSuccessModal open={success} waUrl={waUrl} onClose={() => { setSuccess(false); setSelected(null); setName(''); setPhone(''); }} />
    </div>
  );
};

export default CakPay;
