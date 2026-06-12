import React from "react";
import CategoryPage from "../components/CategoryPage";
import { useApp } from "../context/AppContext";
import { t } from "../lib/i18n";

export default function Cakmart() {
  const { lang } = useApp();
  return <CategoryPage service="cakmart" category="mart" title={t(lang, "cakmart")} color="bg-pink-600" />;
}
