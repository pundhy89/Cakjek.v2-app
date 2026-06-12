import React from "react";
import RideForm from "../components/RideForm";
import { useApp } from "../context/AppContext";
import { t } from "../lib/i18n";

export default function Cakcar() {
  const { lang } = useApp();
  return <RideForm service="cakcar" title={t(lang, "cakcar")} color="bg-blue-600" lang={lang} />;
}
