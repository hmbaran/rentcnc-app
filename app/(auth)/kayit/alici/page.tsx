import type { Metadata } from "next";
import { AuthTopbar } from "@/components/auth/auth-topbar";
import { AliciKayitFormu } from "@/components/auth/alici-kayit-formu";

export const metadata: Metadata = { title: "Alıcı Kaydı" };

export default function AliciKayitPage() {
  return (
    <>
      <AuthTopbar baslik="Alıcı Kaydı" girisLinki />
      <AliciKayitFormu />
    </>
  );
}
