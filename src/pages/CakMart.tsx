import { addNotification } from '@/lib/notifications';
import React, { useEffect, useState } from 'react';
import { Plus, Minus, ShoppingCart, Loader2 } from 'lucide-react';
import ServiceHeader from '@/components/ServiceHeader';
import GoogleMapsPicker from '@/components/GoogleMapsPicker';
import OrderSuccessModal from '@/components/OrderSuccessModal';
import { getMenuItems, getTariff, formatIDR, createOrder } from '@/lib/api';
import { useApp } from '@/contexts/AppContext';
import type { MenuItem, CartItem, Coords } from '@/types/index';
import { toast } from 'sonner';

const CakMart: React.FC = () => {
  const { settings } = useApp();
  const [ongkir, setOngkir] = useState(0);
  const [products, setProducts] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [name, setName] = useState('');
  const [address, setAddress] = useState<(Coords & { address: string }) | undefined>();
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);
  const [success, setSuccess] = useState(false);
  const [waUrl, setWaUrl] = useState('');

  useEffect(() => {
    getMenuItems('mart').then(setProducts).finally(() => setLoading(false));
    getTariff('cakmart').then((t) => { if (t) setOngkir(t.base_fare); });
    const saved = localStorage.getItem('cakjek_user_name');
    if (saved) setName(saved);
  }, []);

  const adjustCart = (item: MenuItem, delta: number) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      if (!existing) { if (delta < 0) return prev; return [...prev, { id: item.id, name: item.name, price: item.price, qty: 1 }]; }
      const newQty = existing.qty + delta;
      if (newQty <= 0) return prev.filter((c) => c.id !== item.id);
      return prev.map((c) => c.id === item.id ? { ...c, qty: newQty } : c);
    });
  };

  const qtyOf = (itemId: string) => cart.find((c) => c.id === itemId)?.qty ?? 0;
  const subtotal = cart.reduce((s, c) => s + c.price * c.qty, 0);

  const total = subtotal + ongkir;

  const handleOrder = async () => {
    if (!name.trim()) { toast.error('Nama pelanggan wajib diisi'); return; }
    if (!address) { toast.error('Pilih alamat antar'); return; }
    if (cart.length === 0) { toast.error('Pilih produk terlebih dahulu'); return; }

    const itemsText = cart.map((c) => `- ${c.name} x${c.qty} = ${formatIDR(c.price * c.qty)}`).join('\n');
    const msg = `🛒 *Pesanan CakMart*
Nama: ${name}
Pesanan:
${itemsText}
Subtotal: ${formatIDR(subtotal)}
Ongkir: ${formatIDR(ongkir)}
Total: ${formatIDR(total)}
Antar ke: ${address.address}
📍 Pin: https://maps.google.com/?q=${address.lat},${address.lng}

Dikirim via ${settings.app_name}`;

    setOrdering(true);
    try {
      const res = await createOrder({
        service: 'cakmart', customer_name: name, customer_phone: '',
        details: { items: cart, address_coords: { lat: address.lat, lng: address.lng }, address: address.address, subtotal, ongkir },
        total, message: msg, status: 'new',
      });
      if (res) { setWaUrl(res.whatsapp_url); setSuccess(true); addNotification('cakmart', 'Pesanan belanja pasar berhasil dikirim ke admin'); }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal membuat pesanan');
    } finally { setOrdering(false); }
  };

  return (
    <div>
      <ServiceHeader title="Belanja Pasar" subtitle="Belanja kebutuhan sehari-hari" gradientFrom="#10b981" gradientTo="#059669" />
      <div className="-mt-8 mx-4 relative z-10 space-y-3">
        {/* Products */}
        <div className="bg-card rounded-3xl p-5 shadow-sm border border-border/50">
          <h3 className="font-bold text-sm mb-3">Produk</h3>
          {loading ? (
            <div className="space-y-2">{[1, 2].map((i) => <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />)}</div>
          ) : (
            <div className="space-y-3">
              {products.map((p) => {
                const qty = qtyOf(p.id);
                return (
                  <div key={p.id} className="flex items-center gap-3">
                    {p.image_url && <img src={p.image_url} alt={p.name} className="w-12 h-12 rounded-xl object-cover shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-balance">{p.name}</p>
                      <p className="text-sm font-bold text-primary">{formatIDR(p.price)}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {qty > 0 && (
                        <>
                          <button onClick={() => adjustCart(p, -1)} className="w-7 h-7 rounded-full bg-secondary grid place-items-center"><Minus size={12} /></button>
                          <span className="text-sm font-bold w-4 text-center">{qty}</span>
                        </>
                      )}
                      <button onClick={() => adjustCart(p, 1)} className="w-7 h-7 rounded-full bg-primary text-primary-foreground grid place-items-center"><Plus size={12} /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Form */}
        <div className="bg-card rounded-3xl p-5 shadow-sm border border-border/50 space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">Nama Pelanggan</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama kamu..." className="input-field" />
          </div>
          <GoogleMapsPicker label="Alamat Pengantaran" value={address} onChange={setAddress} />
        </div>

        {/* Summary */}
        {cart.length > 0 && (
          <div className="bg-card rounded-3xl p-5 shadow-sm border border-border/50 space-y-2">
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span className="font-medium">{formatIDR(subtotal)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Ongkir</span><span className="font-medium">{formatIDR(ongkir)}</span></div>
            <div className="flex justify-between font-extrabold text-base border-t border-border pt-2 mt-1"><span>Total</span><span className="text-primary">{formatIDR(total)}</span></div>
          </div>
        )}

        <button onClick={handleOrder} disabled={ordering || cart.length === 0} className="w-full flex items-center justify-center gap-2 bg-[#128C7E] hover:bg-[#075E54] text-white font-extrabold py-4 rounded-3xl shadow-lg transition active:scale-[0.98] disabled:opacity-60 mb-4">
          {ordering ? <Loader2 size={18} className="animate-spin" /> : <ShoppingCart size={18} />}
          Pesan via WhatsApp
        </button>
      </div>

      <OrderSuccessModal open={success} waUrl={waUrl} onClose={() => { setSuccess(false); setCart([]); setName(''); setAddress(undefined); }} />
    </div>
  );
};

export default CakMart;
