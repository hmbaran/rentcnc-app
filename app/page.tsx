import type { Metadata } from "next";
import AnaSayfaIcerik from "./AnaSayfaIcerik";
import { anaSayfaIstatistikGetir } from "@/lib/actions/istatistik";

export const metadata: Metadata = {
  title: "RentCNCmachine — CNC Kapasite Pazaryeri",
  description:
    "Türkiye'nin CNC kapasitesini dünyaya açıyoruz. Atıl CNC kapasitesi olan fasoncu firmalar ile global alıcıları güvenli ve hızlı şekilde buluşturuyoruz.",
};

export default async function AnaSayfa() {
  const istatistik = await anaSayfaIstatistikGetir();
  return <AnaSayfaIcerik istatistik={istatistik} />;
}
