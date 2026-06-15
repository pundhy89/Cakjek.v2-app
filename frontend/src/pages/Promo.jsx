import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles, Tag, ExternalLink } from "lucide-react";
import { api } from "../lib/api";

export default function Promo() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/banners")
      .then((r) => setBanners(r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div data-testid="promo-page" className="min-h-screen bg-slate-50 dark:bg-zinc-950">
      {/* header */}
      <div className="bg-gradient-to-r from-orange-500 via-pink-500 to-rose-500 px-5 pt-5 pb-10 text-white rounded-b-[2rem] shadow-md">
        <div className="flex items-center gap-3">
          <Link to="/" data-testid="promo-back" className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 grid place-items-center backdrop-blur transition">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/80 font-bold">CakJek</p>
            <h1 className="font-heading text-2xl font-extrabold flex items-center gap-2">
              Promo <Sparkles size={18} className="text-yellow-200" fill="currentColor" />
            </h1>
          </div>
        </div>
        <p className="text-sm text-white/90 mt-2 max-w-md">Penawaran spesial & diskon terbaru untukmu. Klaim sebelum kehabisan!</p>
      </div>

      <div className="px-5 -mt-6 pb-12">
        {loading && (
          <div className="bg-card rounded-3xl p-8 text-center text-muted-foreground text-sm">Memuat promo...</div>
        )}

        {!loading && banners.length === 0 && (
          <div data-testid="promo-empty" className="bg-card rounded-3xl border border-black/5 dark:border-white/10 p-8 text-center shadow-sm">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-secondary grid place-items-center mb-3">
              <Tag size={22} className="text-muted-foreground" />
            </div>
            <p className="font-semibold text-foreground">Belum ada promo aktif</p>
            <p className="text-xs text-muted-foreground mt-1">Pantau terus halaman ini untuk penawaran menarik.</p>
          </div>
        )}

        <div className="space-y-4">
          {banners.map((b, i) => {
            const card = (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="rounded-3xl overflow-hidden shadow-md border border-black/5 dark:border-white/10 bg-card"
              >
                <div
                  className="relative p-5 text-white"
                  style={{ background: `linear-gradient(135deg, ${b.color_from}, ${b.color_to})` }}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] uppercase tracking-[0.25em] text-white/80 font-bold">Promo</p>
                      <h3 className="font-heading text-lg font-extrabold mt-1 leading-snug drop-shadow">{b.title}</h3>
                      {b.subtitle && <p className="text-xs text-white/90 mt-1">{b.subtitle}</p>}
                      {b.code && (
                        <span className="inline-block mt-2 text-[10px] bg-white/25 px-2 py-0.5 rounded font-bold tracking-wider">
                          Kode: {b.code}
                        </span>
                      )}
                    </div>
                    {b.image ? (
                      <img src={b.image} alt={b.title} className="w-20 h-20 rounded-2xl object-cover shadow-lg shrink-0" />
                    ) : (
                      <div className="w-20 h-20 rounded-2xl bg-white/25 backdrop-blur grid place-items-center shrink-0">
                        <Tag size={28} className="text-white" />
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-white/15" />
                </div>
                {(b.description || b.link) && (
                  <div className="p-4 space-y-3">
                    {b.description && (
                      <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{b.description}</p>
                    )}
                    {b.link && (
                      <a
                        href={b.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-testid={`promo-link-${b.id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
                      >
                        Lihat detail <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                )}
                {(b.start_date || b.end_date) && (
                  <div className="px-4 pb-3 text-[10px] text-muted-foreground">
                    Berlaku: {b.start_date || "…"} – {b.end_date || "…"}
                  </div>
                )}
              </motion.div>
            );
            return (
              <div key={b.id} data-testid={`promo-card-${b.id}`}>
                {card}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
