import React, { createContext, useContext, useEffect, useState } from 'react';
import { getSettings } from '@/lib/api';
import type { AppSettings } from '@/types/index';

interface AppContextValue {
  settings: AppSettings;
  reloadSettings: () => Promise<void>;
}

const DEFAULT_SETTINGS: AppSettings = {
  id: 'settings',
  app_name: 'CakJek',
  logo_url: '',
  whatsapp_number: '6285233962821',
  service_center_lat: -7.2575,
  service_center_lng: 112.7521,
  service_radius_km: 20,
  mart_delivery_fee: 7000,
  admin_username: 'admin',
  admin_password: 'admin',
};

const AppContext = createContext<AppContextValue>({
  settings: DEFAULT_SETTINGS,
  reloadSettings: async () => {},
});

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  const reloadSettings = async () => {
    const s = await getSettings();
    setSettings(s);
  };

  useEffect(() => { reloadSettings(); }, []);

  return <AppContext.Provider value={{ settings, reloadSettings }}>{children}</AppContext.Provider>;
};

export const useApp = () => useContext(AppContext);
