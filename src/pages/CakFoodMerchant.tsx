import { addNotification } from '@/lib/notifications';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Minus, ShoppingBag, Loader2, Star, MapPin, Bike } from 'lucide-react';
import ServiceHeader from '@/components/ServiceHeader';
import GoogleMapsPicker from '@/components/GoogleMapsPicker';
import OrderSuccessModal from '@/components/OrderSuccessModal';
import { getMerchant, getMenuItems, formatIDR, createOrder } from '@/lib/api';
import { useApp } from '@/contexts/AppContext';
import type { Merchant, MenuItem, CartItem, Coords } from '@/types/index';
import { toast } from 'sonner';

const CakFoodMerchant: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { settings } = useApp();
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [name, setName] = useState('');
  const [address, setAddress] = useState<(Coords & { address: string }) | undefined>();
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);
  const [success, setSuccess] = useState(false);
  const [waUrl, setWaUrl] = useState('');

  useEffect(() => {
    if (!id) return;
    Promise.all([getMerchant(id), getMenuItems('food', id)])
      .then(([m, items]) => { setMerchant(m); setMenuItems(items); })
      .finally(() => setLoading(false));
    const saved = localStorage.getItem('cakjek_user_name');
    if (saved) setName(saved);
  }, [id]);

  const adjustCart = (item: MenuItem, delta: number) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      if (!existing) {
        if (delta < 0) return prev;
        return [...prev, { id: item.id, name: item.name, price: item.price, qty: 1 }];
      }
      const newQty = existing.qty + delta;
      if (newQty <= 0) return prev.filter((c) => c.id !== item.id);
      return prev.map((c) => c.id === item.id ? { ...c, qty: newQty } : c);
    });
  };

  const qtyOf = (itemId: string) => cart.find((c) => c.id === itemId)?.qty ?? 0;
  const subtotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const ongkir = merchant?.delivery_fee ?? 0;
  const total = subtotal + ongkir;

  const handleOrder = async () => {
    if (!name.trim()) { toast.error('Nama pelanggan wajib diisi'); return; }
    if (!address) { toast.error('Pilih alamat antar'); return; }
    if (cart.length === 0) { toast.error('Pilih menu terlebih dahulu'); return; }
    if (!merchant) return;

    const itemsText = cart.map((c) => `- ${c.name} x${c.qty} = ${formatIDR(c.price * c.qty)}`).join('\n');
    const msg = `🍴 *Pesanan CakFood*
Nama: ${name}
Restoran: ${merchant.name}
Pesanan:
${itemsText}
Subtotal: ${formatIDR(subtotal)}
Ongkir: ${formatIDR(ongkir)}
Total: ${formatIDR(total)}
Antar ke: ${address.address}
📍 Pin Tujuan: https://maps.google.com/?q=${address.lat},${address.lng}

Dikirim via ${settings.app_name}`;

    setOrdering(true);
    try {
      const res = await createOrder({
        service: 'cakfood', customer_name: name, customer_phone: '',
        details: { merchant_id: merchant.id, merchant_name: merchant.name, items: cart, address_coords: { lat: address.lat, lng: address.lng }, address: address.address, subtotal, ongkir },
        total, message: msg, status: 'new',
      });
      if (res) { setWaUrl(res.whatsapp_url); setSuccess(true); addNotification('cakfood', 'Pesanan makanan berhasil dikirim ke admin'); }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal membuat pesanan');
    } finally { setOrdering(false); }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground text-sm">Memuat...</div>;
  if (!merchant) return <div className="p-8 text-center text-muted-foreground text-sm">Restoran tidak ditemukan</div>;

  return (
    <div>
      <ServiceHeader title={merchant.name} gradientFrom="#f43f5e" gradientTo="#e11d48">
        <div className="flex items-center gap-3 mt-2 text-white/80 text-xs">
          <span className="flex items-center gap-1"><MapPin size={11} /> {merchant.address}</span>
          <span className="flex items-center gap-1"><Star size={11} fill="white" /> {merchant.rating.toFixed(1)}</span>
          <span className="flex items-center gap-1"><Bike size={11} /> {formatIDR(merchant.delivery_fee)}</span>
        </div>
      </ServiceHeader>

      <div className="-mt-8 mx-4 relative z-10 space-y-3">
        {/* Menu */}
        <div className="bg-card rounded-3xl p-5 shadow-sm border border-border/50">
          <h3 className="font-bold text-sm mb-3">Menu</h3>
          <div className="space-y-3">
            {menuItems.map((item) => {
              const qty = qtyOf(item.id);
              return (
                <div key={item.id} className="flex items-center gap-3">
                  {item.image_url && (
                    <img src={item.image_url} alt={item.name} className="w-14 h-14 rounded-xl object-cover shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground text-balance">{item.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                    <p className="text-sm font-bold text-primary mt-0.5">{formatIDR(item.price)}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {qty > 0 ? (
                      <>
                        <button onClick={() => adjustCart(item, -1)} className="w-7 h-7 rounded-full bg-secondary grid place-items-center"><Minus size={12} /></button>
                        <span className="text-sm font-bold w-4 text-center">{qty}</span>
                      </>
                    ) : null}
                    <button onClick={() => adjustCart(item, 1)} className="w-7 h-7 rounded-full bg-primary text-primary-foreground grid place-items-center"><Plus size={12} /></button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Delivery form */}
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
            <h3 className="font-bold text-sm">Ringkasan</h3>
            {cart.map((c) => (
              <div key={c.id} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{c.name} ×{c.qty}</span>
                <span className="font-medium">{formatIDR(c.price * c.qty)}</span>
              </div>
            ))}
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Ongkir</span><span className="font-medium">{formatIDR(ongkir)}</span></div>
            <div className="flex justify-between font-extrabold text-base border-t border-border pt-2 mt-1"><span>Total</span><span className="text-primary">{formatIDR(total)}</span></div>
          </div>
        )}

        <button onClick={handleOrder} disabled={ordering || cart.length === 0} className="w-full flex items-center justify-center gap-2 bg-[#128C7E] hover:bg-[#075E54] text-white font-extrabold py-4 rounded-3xl shadow-lg transition active:scale-[0.98] disabled:opacity-60">
          {ordering ? <Loader2 size={18} className="animate-spin" /> : <ShoppingBag size={18} />}
          Pesan via WhatsApp
        </button>
      </div>

      <OrderSuccessModal open={success} waUrl={waUrl} onClose={() => { setSuccess(false); setCart([]); setName(''); setAddress(undefined); }} />
    </div>
  );
};

export default CakFoodMerchant;
