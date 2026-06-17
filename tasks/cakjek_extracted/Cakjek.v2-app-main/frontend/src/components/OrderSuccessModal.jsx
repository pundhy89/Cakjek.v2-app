import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Check, Send } from "lucide-react";

export default function OrderSuccessModal({ open, onDone, redirectMs = 1800 }) {
  useEffect(() => {
    if (!open) return;
    const id = setTimeout(() => onDone && onDone(), redirectMs);
    return () => clearTimeout(id);
  }, [open, onDone, redirectMs]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[999] bg-black/60 backdrop-blur flex items-center justify-center p-6"
          data-testid="order-success-modal"
        >
          <motion.div
            initial={{ scale: 0.85, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.85, y: 30 }}
            transition={{ type: "spring", stiffness: 220, damping: 20 }}
            className="relative bg-card rounded-[2rem] border border-black/5 dark:border-white/10 px-8 py-10 w-full max-w-xs text-center shadow-2xl overflow-hidden"
          >
            {/* expanding rings */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {[0, 0.2, 0.4].map((d, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, opacity: 0.6 }}
                  animate={{ scale: 2.4, opacity: 0 }}
                  transition={{ delay: d, duration: 1.4, repeat: Infinity }}
                  className="absolute w-24 h-24 rounded-full bg-emerald-400/30"
                />
              ))}
            </div>

            {/* package flying */}
            <motion.div
              className="relative mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 grid place-items-center shadow-xl shadow-emerald-500/40"
              initial={{ y: 0, rotate: 0 }}
              animate={{ y: [-2, -10, -2], rotate: [-4, 6, -4] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            >
              <Package size={38} className="text-white" strokeWidth={2.4} />
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: "spring", stiffness: 260 }}
                className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-white grid place-items-center shadow"
              >
                <Check size={16} className="text-emerald-600" strokeWidth={3} />
              </motion.div>
            </motion.div>

            {/* trailing send icon */}
            <motion.div
              className="absolute right-6 top-10 text-emerald-300"
              animate={{ x: [-20, 10, -20], y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.4, repeat: Infinity }}
            >
              <Send size={16} />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="font-heading text-xl font-extrabold mt-5"
            >
              Pesanan Terkirim! 🎉
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="text-xs text-muted-foreground mt-1.5"
            >
              Mengarahkan ke WhatsApp admin...
            </motion.p>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: redirectMs / 1000, ease: "linear" }}
              className="mt-4 h-1 bg-emerald-500 rounded-full"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
