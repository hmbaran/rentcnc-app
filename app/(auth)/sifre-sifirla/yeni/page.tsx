import type { Metadata } from "next";
import { AuthTopbar } from "@/components/auth/auth-topbar";
import { YeniSifreFormu } from "@/components/auth/yeni-sifre-formu";

export const metadata: Metadata = { title: "Yeni Şifre Belirle" };

export default function YeniSifrePage() {
  return (
    <>
      <AuthTopbar baslik="Şifre Sıfırlama" />
      <YeniSifreFormu />
    </>
  );
}
