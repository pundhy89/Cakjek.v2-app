import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Bike, Car, Utensils, Package, ShoppingBag, Wallet,
  Shield, Smartphone, MapPin, Sparkles, PartyPopper, Heart,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { t } from "../lib/i18n";

const services = [
  { key: "cakride", path: "/cakride", icon: Bike, gradient: "from-emerald-400 via-emerald-500 to-teal-600", ring: "ring-emerald-300" },
  { key: "cakcar", path: "/cakcar", icon: Car, gradient: "from-sky-400 via-blue-500 to-indigo-600", ring: "ring-sky-300" },
  { key: "cakfood", path: "/cakfood", icon: Utensils, gradient: "from-amber-400 via-orange-500 to-rose-500", ring: "ring-orange-300" },
  { key: "caksend", path: "/caksend", icon: Package, gradient: "from-violet-400 via-purple-500 to-fuchsia-600", ring: "ring-violet-300" },
  { key: "cakmart", path: "/cakmart", icon: ShoppingBag, gradient: "from-pink-400 via-rose-500 to-red-500", ring: "ring-pink-300" },
  { key: "cakpay", path: "/cakpay", icon: Wallet, gradient: "from-cyan-400 via-teal-500 to-emerald-500", ring: "ring-cyan-300" },
];

// Animated floating decorations in header
const FloatingDeco = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
    <motion.div
      className="absolute -top-2 right-6 text-yellow-300"
      animate={{ y: [0, -10, 0], rotate: [0, 8, -6, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    >
      <Sparkles size={28} fill="currentColor" />
    </motion.div>
    <motion.div
      className="absolute top-16 right-20 text-white/80"
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
    >
      <Smartphone size={22} />
    </motion.div>
    <motion.div
      className="absolute top-8 left-6 text-pink-200"
      animate={{ rotate: [0, 12, -8, 0], scale: [1, 1.1, 1] }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
    >
      <Heart size={20} fill="currentColor" />
    </motion.div>
    <motion.div
      className="absolute bottom-6 left-10 text-emerald-200"
      animate={{ y: [0, 6, 0], rotate: [0, -10, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
    >
      <MapPin size={24} fill="currentColor" />
    </motion.div>
    <motion.div
      className="absolute -bottom-3 right-12 text-amber-200"
      animate={{ y: [0, -6, 0], rotate: [0, 15, 0] }}
      transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
    >
      <PartyPopper size={26} />
    </motion.div>
    {/* big translucent blobs */}
    <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-pink-400/40 blur-2xl" />
    <div className="absolute -bottom-16 -left-12 w-52 h-52 rounded-full bg-amber-300/30 blur-3xl" />
    <div className="absolute top-10 left-1/2 w-32 h-32 rounded-full bg-cyan-300/30 blur-2xl" />
  </div>
);

const tileVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.92 },
  show: (i) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { delay: i * 0.06, type: "spring", stiffness: 220, damping: 18 },
  }),
};

export default function Home() {
  const { lang } = useApp();
  return (
    <div data-testid="home-page" className="min-h-screen">
      {/* HEADER */}
      <div className="relative bg-gradient-to-br from-fuchsia-600 via-purple-600 to-indigo-700 text-white px-6 pt-10 pb-20 rounded-b-[2.5rem] overflow-hidden">
        <FloatingDeco />
        <div className="relative flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ rotate: [0, -8, 8, 0] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                className="w-9 h-9 rounded-2xl bg-white text-purple-600 grid place-items-center font-heading font-extrabold shadow-lg shadow-fuchsia-900/30"
              >
                C
              </motion.div>
              <p className="text-sm font-extrabold uppercase tracking-[0.25em] text-pink-100">CakJek</p>
            </div>
            <h1 className="font-heading text-3xl font-extrabold mt-3 leading-tight drop-shadow-sm">
              Halo, <span className="text-yellow-200">Cak!</span> 👋
            </h1>
            <p className="text-pink-100/90 text-sm mt-1 max-w-[16rem]">
              {t(lang, "your_local_super_app")} — {t(lang, "tagline")}
            </p>
          </motion.div>
          <Link
            to="/admin/login"
            data-testid="admin-link"
            title={t(lang, "admin")}
            className="relative p-2.5 rounded-full bg-white/15 backdrop-blur hover:bg-white/25 transition active:scale-95"
          >
            <Shield size={18} />
          </Link>
        </div>

        {/* mini stats */}
        <div className="relative mt-6 flex gap-2">
          {[
            { icon: Smartphone, label: "100% online" },
            { icon: MapPin, label: "Sekitarmu" },
            { icon: Sparkles, label: "Promo tiap hari" },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-1.5 bg-white/15 backdrop-blur px-3 py-1.5 rounded-full text-[10px] font-semibold"
              >
                <Icon size={12} /> {s.label}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* SERVICES */}
      <div className="px-5 -mt-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, type: "spring", stiffness: 180, damping: 20 }}
          className="bg-card rounded-[2rem] shadow-xl shadow-purple-900/10 border border-black/5 dark:border-white/10 p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-base font-extrabold text-foreground">
              {t(lang, "services")}
            </h2>
            <motion.span
              animate={{ rotate: [0, 12, -12, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="text-amber-500"
            >
              <Sparkles size={16} />
            </motion.span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {services.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={s.key}
                  variants={tileVariants}
                  custom={i}
                  initial="hidden"
                  animate="show"
                >
                  <Link
                    to={s.path}
                    data-testid={`service-${s.key}`}
                    className="group flex flex-col items-center gap-2 p-3 rounded-2xl bg-card hover:bg-secondary/40 transition active:scale-95"
                  >
                    <motion.div
                      whileHover={{ scale: 1.08, rotate: -4 }}
                      whileTap={{ scale: 0.92 }}
                      className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${s.gradient} grid place-items-center shadow-lg shadow-black/10 ring-2 ring-white dark:ring-zinc-900`}
                    >
                      <Icon className="text-white drop-shadow" size={26} strokeWidth={2.4} />
                      <motion.span
                        className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-white border border-black/10"
                        animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                        transition={{ duration: 1.6, repeat: Infinity }}
                      />
                    </motion.div>
                    <div className="text-center">
                      <p className="text-xs font-bold text-foreground">{t(lang, s.key)}</p>
                      <p className="text-[10px] text-muted-foreground">{t(lang, s.key + "_desc")}</p>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* PROMO CARD - playful illustration */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, type: "spring" }}
          className="relative mt-6 rounded-[2rem] bg-gradient-to-br from-orange-400 via-pink-500 to-rose-500 p-5 text-white shadow-xl shadow-pink-500/20 overflow-hidden"
        >
          <div className="relative z-10 max-w-[60%]">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-yellow-100">Promo</p>
            <h3 className="font-heading text-xl font-extrabold mt-1 leading-snug">
              Diskon 40% <br /> semua layanan!
            </h3>
            <p className="text-xs text-white/90 mt-1">Pakai kode: <span className="bg-white/25 px-2 py-0.5 rounded font-bold">CAKJEK</span></p>
          </div>
          {/* animated package icon receiver */}
          <motion.div
            animate={{ y: [0, -6, 0], rotate: [0, -4, 4, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute right-4 top-1/2 -translate-y-1/2"
          >
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-yellow-300 grid place-items-center shadow-lg shadow-rose-700/30">
                <Package size={36} className="text-orange-700" strokeWidth={2.4} />
              </div>
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 1.6, repeat: Infinity }}
                className="absolute -top-2 -right-2 bg-white text-rose-500 text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow"
              >
                NEW
              </motion.div>
            </div>
          </motion.div>
          {/* decorative dots */}
          <div className="absolute -bottom-6 -left-4 w-24 h-24 rounded-full bg-white/15" />
          <div className="absolute top-2 right-20 w-16 h-16 rounded-full bg-yellow-200/30 blur-md" />
        </motion.div>

        {/* Why CakJek strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-6 grid grid-cols-3 gap-3"
        >
          {[
            { color: "from-cyan-400 to-blue-500", icon: Smartphone, label: "Pesan via HP" },
            { color: "from-emerald-400 to-teal-500", icon: MapPin, label: "Lokasi presisi" },
            { color: "from-amber-400 to-orange-500", icon: Package, label: "Cepat sampai" },
          ].map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={i}
                whileHover={{ y: -3 }}
                className="bg-card rounded-2xl p-3 text-center border border-black/5 dark:border-white/10 shadow-sm"
              >
                <div className={`w-10 h-10 mx-auto rounded-xl bg-gradient-to-br ${f.color} grid place-items-center mb-1.5`}>
                  <Icon size={18} className="text-white" />
                </div>
                <p className="text-[10px] font-semibold text-foreground leading-tight">{f.label}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
