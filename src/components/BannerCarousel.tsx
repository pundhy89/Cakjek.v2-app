import React, { useEffect, useState } from 'react';
import { Package, Sparkles, ChevronRight } from 'lucide-react';
import { getBanners } from '@/lib/api';
import type { Banner } from '@/types/index';

interface BannerCarouselProps {
  fullBleed?: boolean;
}

const BannerCarousel: React.FC<BannerCarouselProps> = ({ fullBleed = false }) => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    getBanners().then(setBanners).catch(() => {});
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % banners.length), 4500);
    return () => clearInterval(id);
  }, [banners.length]);

  if (banners.length === 0) {
    // Full bleed placeholder when no banners yet
    if (fullBleed) {
      return <div className="w-full h-44 bg-gradient-to-br from-primary/30 to-primary/10" />;
    }
    return null;
  }

  const b = banners[idx];

  if (fullBleed) {
    return (
      <div className="relative w-full">
        <div
          className="relative w-full h-52 overflow-hidden transition-all duration-500"
          style={{ background: `linear-gradient(135deg, ${b.color_from}, ${b.color_to})` }}
        >
          {/* Decorative */}
          <div className="absolute -bottom-10 -left-8 w-36 h-36 rounded-full bg-white/10" />
          <div className="absolute top-4 right-28 w-16 h-16 rounded-full bg-white/15 blur-md" />
          <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/10 blur-xl" />

          <div className="relative z-10 max-w-[60%] pt-8 pl-5">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-white/80">Promo</p>
            <h3 className="text-xl font-extrabold mt-1 leading-snug drop-shadow text-balance text-white">{b.title}</h3>
            <p className="text-xs text-white/90 mt-1 text-pretty">{b.subtitle}</p>
            {b.code && (
              <span className="inline-block mt-2 text-[10px] bg-white/25 px-2 py-0.5 rounded-md font-bold text-white">{b.code}</span>
            )}
            <button className="mt-3 flex items-center gap-1 text-xs font-semibold bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full transition active:scale-95 text-white">
              Pakai Sekarang <ChevronRight size={12} />
            </button>
          </div>

          <div className="absolute right-5 top-1/2 -translate-y-1/2 animate-[bounce_3s_ease-in-out_infinite]">
            {b.image_url ? (
              <img src={b.image_url} alt={b.title} className="w-24 h-24 rounded-2xl object-cover shadow-xl" />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-white/25 backdrop-blur grid place-items-center shadow-xl">
                <Package size={40} className="text-white" strokeWidth={2} />
              </div>
            )}
            <Sparkles size={18} className="absolute -top-2 -right-2 text-yellow-200" fill="currentColor" />
          </div>
        </div>

        {/* Dots */}
        {banners.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {banners.map((_, i) => (
              <button key={i} onClick={() => setIdx(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === idx ? 'bg-white w-5' : 'bg-white/50 w-1.5'}`}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Original padded style (used elsewhere)
  return (
    <div className="relative px-5 mt-5">
      <div
        className="relative rounded-3xl p-5 text-white shadow-lg overflow-hidden transition-all duration-500"
        style={{ background: `linear-gradient(135deg, ${b.color_from}, ${b.color_to})` }}
      >
        <div className="absolute -bottom-8 -left-6 w-28 h-28 rounded-full bg-white/10" />
        <div className="absolute top-3 right-24 w-14 h-14 rounded-full bg-white/15 blur-md" />

        <div className="relative z-10 max-w-[60%]">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-white/80">Promo</p>
          <h3 className="text-lg font-extrabold mt-1 leading-snug drop-shadow text-balance">{b.title}</h3>
          <p className="text-xs text-white/90 mt-1 text-pretty">{b.subtitle}</p>
          {b.code && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-[10px] bg-white/25 px-2 py-0.5 rounded-md font-bold">{b.code}</span>
            </div>
          )}
          <button className="mt-3 flex items-center gap-1 text-xs font-semibold bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full transition active:scale-95">
            Pakai Sekarang <ChevronRight size={12} />
          </button>
        </div>

        <div className="absolute right-4 top-1/2 -translate-y-1/2 animate-[bounce_3s_ease-in-out_infinite]">
          {b.image_url ? (
            <img src={b.image_url} alt={b.title} className="w-20 h-20 rounded-2xl object-cover shadow-lg" />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-white/25 backdrop-blur grid place-items-center shadow-lg">
              <Package size={36} className="text-white" strokeWidth={2} />
            </div>
          )}
          <Sparkles size={18} className="absolute -top-2 -right-2 text-yellow-200" fill="currentColor" />
        </div>
      </div>

      {banners.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-3">
          {banners.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === idx ? 'bg-primary w-6' : 'bg-muted-foreground/30 w-1.5'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BannerCarousel;
