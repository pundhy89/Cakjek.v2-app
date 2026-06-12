import React from "react";
import { MessageCircle } from "lucide-react";
export default function Chat() {
  const wa = "6285233962821";
  return (
    <div data-testid="chat-page" className="min-h-screen">
      <div className="bg-blue-500 text-white px-6 pt-10 pb-10 rounded-b-3xl">
        <h1 className="font-heading text-2xl font-bold">Chat Admin</h1>
        <p className="text-blue-100 text-sm mt-1">Tanya jawab via WhatsApp</p>
      </div>
      <div className="px-5 mt-6">
        <a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 bg-card rounded-2xl p-4 shadow-sm border border-black/5 dark:border-white/10 hover:bg-secondary/40 transition">
          <div className="w-12 h-12 rounded-full bg-[#25D366] grid place-items-center"><MessageCircle className="text-white" size={20} /></div>
          <div><p className="font-semibold">Admin CakJek</p><p className="text-xs text-muted-foreground">Buka percakapan di WhatsApp</p></div>
        </a>
      </div>
    </div>
  );
}
