import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export const ServiceHeader = ({ title, color = "bg-primary", children }) => {
  const nav = useNavigate();
  return (
    <div className={`relative ${color} text-white px-5 pt-6 pb-12 rounded-b-[2rem] overflow-hidden`}>
      {/* decorative blobs */}
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
      <div className="absolute -bottom-12 -left-8 w-32 h-32 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
      <motion.div
        aria-hidden="true"
        animate={{ rotate: [0, 12, -8, 0], y: [0, -4, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-4 right-6 text-yellow-200"
      >
        <Sparkles size={22} fill="currentColor" />
      </motion.div>

      <button
        onClick={() => nav(-1)}
        data-testid="back-btn"
        className="relative mb-4 inline-flex items-center gap-1 text-sm bg-white/20 backdrop-blur px-3 py-1.5 rounded-full hover:bg-white/30 transition active:scale-95"
      >
        <ArrowLeft size={16} /> Back
      </button>
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative font-heading text-3xl font-extrabold drop-shadow-sm"
      >
        {title}
      </motion.h1>
      <div className="relative">{children}</div>
    </div>
  );
};
