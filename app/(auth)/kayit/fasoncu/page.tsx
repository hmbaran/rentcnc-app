import type { Metadata } from "next";
import { AuthTopbar } from "@/components/auth/auth-topbar";
import { FasoncuKayitFormu } from "@/components/auth/fasoncu-kayit-formu";

export const metadata: Metadata = { title: "Fasoncu Firma Kaydı" };

export default function FasoncuKayitPage() {
  return (
    <>
      <AuthTopbar baslik="Fasoncu Firma Kaydı" girisLinki />
      <FasoncuKayitFormu />
    </>
  );
}
