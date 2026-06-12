import React, { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { useApp } from "../../context/AppContext";
import { t } from "../../lib/i18n";
import { toast } from "sonner";

export default function AdminSettings() {
  const { lang } = useApp();
  const [form, setForm] = useState({ whatsapp_number: "", app_name: "CakJek" });

  useEffect(() => {
    api.get("/settings").then((r) => setForm({ whatsapp_number: r.data.whatsapp_number, app_name: r.data.app_name || "CakJek" }));
  }, []);

  const save = async () => {
    try {
      await api.put("/admin/settings", form);
      toast.success("Saved");
    } catch (e) { toast.error("Failed"); }
  };

  return (
    <div data-testid="admin-settings">
      <h1 className="font-heading text-3xl font-bold">{t(lang, "settings")}</h1>
      <p className="text-muted-foreground text-sm mt-1">{t(lang, "app_settings")}</p>

      <div className="mt-6 bg-card rounded-3xl border border-black/5 dark:border-white/10 p-6 shadow-sm max-w-lg space-y-4">
        <label className="block">
          <span className="text-xs text-muted-foreground font-medium">{t(lang, "whatsapp_number")}</span>
          <input data-testid="setting-wa" value={form.whatsapp_number} onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })} className="mt-1 w-full bg-secondary rounded-xl px-3 py-2 text-sm outline-none" placeholder="6285233962821" />
          <span className="text-xs text-muted-foreground mt-1 block">Tanpa tanda +, awali dengan kode negara (cth: 62...)</span>
        </label>
        <label className="block">
          <span className="text-xs text-muted-foreground font-medium">App Name</span>
          <input data-testid="setting-appname" value={form.app_name} onChange={(e) => setForm({ ...form, app_name: e.target.value })} className="mt-1 w-full bg-secondary rounded-xl px-3 py-2 text-sm outline-none" />
        </label>
        <button data-testid="setting-save" onClick={save} className="bg-primary text-primary-foreground px-5 py-2.5 rounded-full text-sm font-semibold hover:opacity-90 active:scale-95 transition">{t(lang, "save")}</button>
      </div>
    </div>
  );
}
