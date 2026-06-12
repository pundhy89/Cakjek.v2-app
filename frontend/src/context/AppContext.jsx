import React, { createContext, useContext, useEffect, useState } from "react";

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [lang, setLang] = useState(() => localStorage.getItem("cak_lang") || "id");
  const [theme, setTheme] = useState(() => localStorage.getItem("cak_theme") || "light");
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem("cak_admin_token") || "");

  useEffect(() => {
    localStorage.setItem("cak_lang", lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem("cak_theme", theme);
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [theme]);

  const setAdmin = (tok) => {
    if (tok) localStorage.setItem("cak_admin_token", tok);
    else localStorage.removeItem("cak_admin_token");
    setAdminToken(tok || "");
  };

  return (
    <AppContext.Provider value={{ lang, setLang, theme, setTheme, adminToken, setAdmin }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
