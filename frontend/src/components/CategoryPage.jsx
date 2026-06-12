import React, { useEffect, useState } from "react";
import { ServiceHeader } from "../components/ServiceHeader";
import { Field } from "../components/RideForm";
import { api, formatIDR } from "../lib/api";
import { useApp } from "../context/AppContext";
import { t } from "../lib/i18n";
import { toast } from "sonner";
import { Plus, Minus } from "lucide-react";

const CategoryPage = ({ category, title, color, service }) => {
  const { lang } = useApp();
  const [items, setItems] = useState([]);
  const [cart, setCart] = useState({});
  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get(`/menu/${category}`).then((r) => setItems(r.data)).catch(() => {});
  }, [category]);

  const add = (id) => setCart({ ...cart, [id]: (cart[id] || 0) + 1 });
  const sub = (id) => {
    const c = { ...cart };
    if (!c[id]) return;
    c[id] -= 1;
    if (c[id] <= 0) delete c[id];
    setCart(c);
  };

  const cartItems = items.filter((i) => cart[i.id]);
  const total = cartItems.reduce((s, i) => s + i.price * cart[i.id], 0);

  const submit = async () => {
    if (!form.name || !form.phone || !form.address) {
      toast.error(t(lang, "fill_required"));
      return;
    }
    if (cartItems.length === 0) {
      toast.error(t(lang, "cart"));
      return;
    }
    setLoading(true);
    const lines = cartItems.map((i) => `- ${i.name} x${cart[i.id]} = ${formatIDR(i.price * cart[i.id])}`).join("\n");
    const message = `Halo Admin CakJek,\nSaya ingin pesan *${title}*.\n\nNama: ${form.name}\nNo HP: ${form.phone}\nAlamat: ${form.address}\n\nPesanan:\n${lines}\n\nTotal: ${formatIDR(total)}`;
    try {
      const r = await api.post("/orders", {
        service,
        customer_name: form.name,
        customer_phone: form.phone,
        details: { address: form.address, items: cartItems.map((i) => ({ id: i.id, name: i.name, qty: cart[i.id], price: i.price })) },
        total,
        message,
      });
      toast.success(t(lang, "redirect_wa"));
      window.location.href = r.data.whatsapp_url;
    } catch (e) {
      toast.error("Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-testid={`${service}-page`} className="min-h-screen">
      <ServiceHeader title={title} color={color} />
      <div className="px-5 -mt-6">
        <div className="bg-card rounded-3xl border border-black/5 dark:border-white/10 p-4 shadow-md space-y-3">
          {items.map((i) => (
            <div key={i.id} data-testid={`item-${i.id}`} className="flex items-center gap-3 p-2 rounded-2xl hover:bg-secondary/50">
              {i.image && <img src={i.image} alt={i.name} className="w-16 h-16 rounded-xl object-cover" />}
              <div className="flex-1">
                <p className="font-semibold text-sm text-foreground">{i.name}</p>
                <p className="text-xs text-muted-foreground line-clamp-1">{i.description}</p>
                <p className="text-sm font-bold text-primary mt-1">{formatIDR(i.price)}</p>
              </div>
              <div className="flex items-center gap-2">
                {cart[i.id] ? (
                  <>
                    <button data-testid={`sub-${i.id}`} onClick={() => sub(i.id)} className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center"><Minus size={14} /></button>
                    <span className="text-sm font-semibold w-5 text-center">{cart[i.id]}</span>
                  </>
                ) : null}
                <button data-testid={`add-${i.id}`} onClick={() => add(i.id)} className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center"><Plus size={14} /></button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-card rounded-3xl border border-black/5 dark:border-white/10 p-5 shadow-md space-y-3 mt-4">
          <Field label={t(lang, "name")} value={form.name} onChange={(v) => setForm({ ...form, name: v })} testid="input-name" />
          <Field label={t(lang, "phone")} value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} testid="input-phone" />
          <Field label={t(lang, "address")} value={form.address} onChange={(v) => setForm({ ...form, address: v })} testid="input-address" />

          <div className="flex items-center justify-between pt-3 border-t border-border">
            <span className="text-sm text-muted-foreground">{t(lang, "total")}</span>
            <span data-testid="total-amount" className="font-heading text-xl font-bold">{formatIDR(total)}</span>
          </div>
          <button
            disabled={loading}
            onClick={submit}
            data-testid="order-whatsapp-btn"
            className="w-full bg-[#25D366] hover:bg-[#1ebe57] text-white font-semibold py-3 rounded-full transition active:scale-95"
          >
            {loading ? "..." : t(lang, "order_now")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
