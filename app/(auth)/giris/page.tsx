import type { Metadata } from "next";
import { AuthTopbar } from "@/components/auth/auth-topbar";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Giriş",
};

export default function GirisPage() {
  return (
    <>
      <AuthTopbar baslik="Giriş" />
      <main className="flex-1 flex items-center justify-center px-5 py-8">
        <LoginForm />
      </main>
    </>
  );
}
