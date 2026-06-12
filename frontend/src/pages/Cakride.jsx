import React from "react";
import RideForm from "../components/RideForm";
import { useApp } from "../context/AppContext";
import { t } from "../lib/i18n";

export default function Cakride() {
  const { lang } = useApp();
  return <RideForm service="cakride" title={t(lang, "cakride")} color="bg-emerald-600" lang={lang} />;
}
