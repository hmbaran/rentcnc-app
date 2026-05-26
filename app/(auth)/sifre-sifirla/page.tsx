import type { Metadata } from "next";
import { AuthTopbar } from "@/components/auth/auth-topbar";
import { SifreSifirlaFormu } from "@/components/auth/sifre-sifirla-formu";

export const metadata: Metadata = { title: "Şifre Sıfırlama" };

export default function SifreSifirlaPage() {
  return (
    <>
      <AuthTopbar baslik="Şifre Sıfırlama" />
      <SifreSifirlaFormu />
    </>
  );
}
