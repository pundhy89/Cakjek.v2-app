import React from "react";
import { Link } from "react-router-dom";
import { Moon, Sun, Globe, Shield } from "lucide-react";
import { useApp } from "../context/AppContext";
import { t } from "../lib/i18n";

export default function Account() {
  const { lang, setLang, theme, setTheme } = useApp();
  return (
    <div data-testid="account-page" className="min-h-screen">
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white px-6 pt-10 pb-10 rounded-b-3xl">
        <h1 className="font-heading text-2xl font-bold">{t(lang, "account")}</h1>
        <p className="text-blue-100 text-sm mt-1">{t(lang, "welcome_back")}</p>
      </div>
      <div className="px-5 mt-6 space-y-3">
        <div className="bg-card rounded-2xl border border-black/5 dark:border-white/10 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center"><Globe className="text-blue-600 dark:text-blue-400" size={18} /></div>
              <div>
                <p className="text-sm font-semibold">{t(lang, "language")}</p>
                <p className="text-xs text-muted-foreground">{lang === "id" ? "Bahasa Indonesia" : "English"}</p>
              </div>
            </div>
            <div className="flex gap-1 bg-secondary p-1 rounded-full">
              <button data-testid="lang-id" onClick={() => setLang("id")} className={`px-3 py-1 text-xs font-semibold rounded-full ${lang === "id" ? "bg-card shadow text-foreground" : "text-muted-foreground"}`}>ID</button>
              <button data-testid="lang-en" onClick={() => setLang("en")} className={`px-3 py-1 text-xs font-semibold rounded-full ${lang === "en" ? "bg-card shadow text-foreground" : "text-muted-foreground"}`}>EN</button>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-black/5 dark:border-white/10 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                {theme === "dark" ? <Moon className="text-amber-500" size={18} /> : <Sun className="text-amber-500" size={18} />}
              </div>
              <div>
                <p className="text-sm font-semibold">{t(lang, "theme")}</p>
                <p className="text-xs text-muted-foreground">{theme === "dark" ? t(lang, "dark") : t(lang, "light")}</p>
              </div>
            </div>
            <div className="flex gap-1 bg-secondary p-1 rounded-full">
              <button data-testid="theme-light" onClick={() => setTheme("light")} className={`px-3 py-1 text-xs font-semibold rounded-full ${theme === "light" ? "bg-card shadow text-foreground" : "text-muted-foreground"}`}>{t(lang, "light")}</button>
              <button data-testid="theme-dark" onClick={() => setTheme("dark")} className={`px-3 py-1 text-xs font-semibold rounded-full ${theme === "dark" ? "bg-card shadow text-foreground" : "text-muted-foreground"}`}>{t(lang, "dark")}</button>
            </div>
          </div>
        </div>

        <Link to="/admin/login" data-testid="admin-panel-link" className="block bg-card rounded-2xl border border-black/5 dark:border-white/10 p-4 shadow-sm hover:bg-secondary/30 transition">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center"><Shield size={18} /></div>
            <div className="flex-1">
              <p className="text-sm font-semibold">{t(lang, "admin")}</p>
              <p className="text-xs text-muted-foreground">{t(lang, "open_admin")}</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
