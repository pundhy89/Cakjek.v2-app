import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';

interface ServiceHeaderProps {
  title: string;
  subtitle?: string;
  gradientFrom: string;
  gradientTo: string;
  children?: React.ReactNode;
  onBack?: () => void;
}

const ServiceHeader: React.FC<ServiceHeaderProps> = ({ title, subtitle, gradientFrom, gradientTo, children, onBack }) => {
  const nav = useNavigate();

  return (
    <div
      className="relative text-white px-5 pt-6 pb-14 rounded-b-[2rem] overflow-hidden"
      style={{ background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})` }}
    >
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -bottom-12 -left-8 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute top-4 right-6 text-yellow-200 animate-[spin_4s_linear_infinite_alternate]">
        <Sparkles size={20} fill="currentColor" />
      </div>

      <button
        onClick={() => onBack ? onBack() : nav(-1)}
        className="relative mb-3 inline-flex items-center gap-1.5 text-sm bg-white/20 hover:bg-white/30 backdrop-blur px-3 py-1.5 rounded-full transition active:scale-95"
      >
        <ArrowLeft size={15} /> Kembali
      </button>
      <h1 className="relative text-3xl font-extrabold drop-shadow-sm text-balance">{title}</h1>
      {subtitle && <p className="relative text-sm text-white/80 mt-1">{subtitle}</p>}
      <div className="relative">{children}</div>
    </div>
  );
};

export default ServiceHeader;
