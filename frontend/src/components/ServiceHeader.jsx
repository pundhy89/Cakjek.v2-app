import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export const ServiceHeader = ({ title, color = "bg-primary", children }) => {
  const nav = useNavigate();
  return (
    <div className={`${color} text-white px-5 pt-6 pb-10 rounded-b-3xl`}>
      <button
        onClick={() => nav(-1)}
        data-testid="back-btn"
        className="mb-4 inline-flex items-center gap-1 text-sm bg-white/15 backdrop-blur px-3 py-1.5 rounded-full hover:bg-white/25 transition"
      >
        <ArrowLeft size={16} /> Back
      </button>
      <h1 className="font-heading text-3xl font-bold">{title}</h1>
      {children}
    </div>
  );
};
