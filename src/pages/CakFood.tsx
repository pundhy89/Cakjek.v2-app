import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Bike, ChevronRight, Search } from 'lucide-react';
import { getMerchants, formatIDR } from '@/lib/api';
import type { Merchant } from '@/types/index';
import ServiceHeader from '@/components/ServiceHeader';

const CakFood: React.FC = () => {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');

  useEffect(() => {
    getMerchants().then(setMerchants).finally(() => setLoading(false));
  }, []);

  const filtered = merchants.filter((m) => m.name.toLowerCase().includes(q.toLowerCase()) || m.address.toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <ServiceHeader title="Pesan Makan" subtitle="Pesan makanan favoritmu" gradientFrom="#f43f5e" gradientTo="#e11d48" />
      <div className="-mt-8 mx-4 relative z-10">
        {/* Search */}
        <div className="bg-card rounded-2xl flex items-center gap-2 px-4 py-3 shadow-sm border border-border/50 mb-4">
          <Search size={16} className="text-muted-foreground shrink-0" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari restoran..." className="flex-1 text-sm bg-transparent outline-none" />
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card rounded-2xl h-32 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-muted-foreground py-16 text-sm">Tidak ada restoran ditemukan</div>
        ) : (
          <div className="space-y-3">
            {filtered.map((m) => (
              <Link key={m.id} to={`/cakfood/${m.id}`} className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border/50 flex active:scale-[0.98] transition h-full">
                <div className="w-28 shrink-0">
                  {m.image_url ? (
                    <img src={m.image_url} alt={m.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-rose-100 dark:bg-rose-900/20 grid place-items-center">
                      <span className="text-2xl">🍽️</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0 p-4">
                  <h3 className="font-bold text-sm text-foreground text-balance">{m.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate flex items-center gap-1">
                    <MapPin size={10} /> {m.address}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="flex items-center gap-1 text-xs text-amber-500 font-semibold">
                      <Star size={11} fill="currentColor" /> {m.rating.toFixed(1)}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Bike size={10} /> {formatIDR(m.delivery_fee)}
                    </span>
                  </div>
                </div>
                <div className="p-4 grid place-items-center">
                  <ChevronRight size={16} className="text-muted-foreground" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CakFood;
