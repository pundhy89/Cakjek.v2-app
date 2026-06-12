import React from "react";
import CategoryPage from "../components/CategoryPage";
import { useApp } from "../context/AppContext";
import { t } from "../lib/i18n";

export default function Cakfood() {
  const { lang } = useApp();
  return <CategoryPage service="cakfood" category="food" title={t(lang, "cakfood")} color="bg-orange-500" />;
}
