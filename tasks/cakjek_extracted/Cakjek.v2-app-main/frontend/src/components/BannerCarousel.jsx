import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Sparkles } from "lucide-react";
import { api } from "../lib/api";

export default function BannerCarousel() {
  const [banners, setBanners] = useState([]);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    api.get("/banners").then((r) => setBanners(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % banners.length), 4500);
    return () => clearInterval(id);
  }, [banners.length]);

  if (banners.length === 0) return null;
  const b = banners[idx];

  return (
    <div className="relative mt-6">
      <AnimatePresence mode="wait">
        <motion.div
          key={b.id}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.45 }}
          className="relative rounded-[2rem] p-5 text-white shadow-xl overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${b.color_from}, ${b.color_to})` }}
        >
          <div className="relative z-10 max-w-[60%]">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-white/80">Promo</p>
            <h3 className="font-heading text-lg font-extrabold mt-1 leading-snug drop-shadow">{b.title}</h3>
            <p className="text-xs text-white/90 mt-1">{b.subtitle}</p>
            {b.code && (
              <p className="text-[10px] text-white/90 mt-2">
                Kode: <span className="bg-white/25 px-2 py-0.5 rounded font-bold">{b.code}</span>
              </p>
            )}
          </div>
          <motion.div
            animate={{ y: [0, -6, 0], rotate: [0, -4, 4, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute right-4 top-1/2 -translate-y-1/2"
          >
            <div className="relative">
              {b.image ? (
                <img src={b.image} alt="" className="w-20 h-20 rounded-2xl object-cover shadow-lg" />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-white/25 backdrop-blur grid place-items-center shadow-lg">
                  <Package size={36} className="text-white" strokeWidth={2.4} />
                </div>
              )}
              <Sparkles size={18} className="absolute -top-2 -right-2 text-yellow-200" fill="currentColor" />
            </div>
          </motion.div>
          <div className="absolute -bottom-6 -left-4 w-24 h-24 rounded-full bg-white/15" />
          <div className="absolute top-2 right-20 w-16 h-16 rounded-full bg-white/20 blur-md" />
        </motion.div>
      </AnimatePresence>
      {banners.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-3">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`h-1.5 rounded-full transition-all ${i === idx ? "bg-primary w-6" : "bg-muted-foreground/30 w-1.5"}`}
              data-testid={`banner-dot-${i}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
