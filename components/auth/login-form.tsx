"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { girisSchema, type GirisFormData } from "@/lib/validations/auth";
import { girisYap } from "@/lib/actions/auth";

export function LoginForm() {
  const [serverHata, setServerHata] = useState<string | null>(null);
  const [sifreGoster, setSifreGoster] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GirisFormData>({
    resolver: zodResolver(girisSchema),
    defaultValues: { beniHatirla: true },
  });

  function onSubmit(data: GirisFormData) {
    setServerHata(null);
    startTransition(async () => {
      const sonuc = await girisYap({ email: data.email, sifre: data.sifre });
      if (sonuc?.hata) setServerHata(sonuc.hata);
    });
  }

  return (
    <div className="w-full max-w-[380px] bg-white border border-[#D4D8DC] rounded-[2px] px-7 py-8">
      {/* Başlık */}
      <div className="text-center mb-6">
        <p className="text-[10px] font-semibold uppercase tracking-[2px] text-[#5B6770] mb-2">
          Hesap Girişi
        </p>
        <h1 className="text-[22px] font-light text-[#003057] tracking-[-0.3px] leading-tight">
          Tekrar hoş geldiniz
        </h1>
        <p className="text-[12px] text-[#5B6770] mt-[6px] tracking-[0.2px]">
          Fasoncu paneli ve alıcı arama için giriş yapın
        </p>
      </div>

      {/* Sunucu hatası */}
      {serverHata && (
        <div className="bg-[#FEE2E2] text-[#B83232] border-l-[3px] border-[#B83232] px-[13px] py-[9px] text-[11.5px] rounded-[2px] mb-[14px] leading-[1.45]">
          {serverHata}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* E-posta */}
        <div className="mb-[14px]">
          <label className="block text-[10px] font-semibold text-[#003057] uppercase tracking-[1.2px] mb-[6px]">
            E-posta
          </label>
          <input
            {...register("email")}
            type="email"
            placeholder="ornek@firmaniz.com"
            autoComplete="email"
            className="w-full px-3 py-[11px] text-[13px] border border-[#D4D8DC] rounded-[2px] bg-white text-[#1B2E40] placeholder:text-[#8B97A4] placeholder:text-[12px] focus:outline-none focus:border-[#003057] focus:shadow-[0_0_0_3px_rgba(0,48,87,0.08)] transition-[border-color,box-shadow] duration-150"
          />
          {errors.email && (
            <p className="text-[11px] text-[#B83232] mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Şifre */}
        <div className="mb-[14px]">
          <label className="block text-[10px] font-semibold text-[#003057] uppercase tracking-[1.2px] mb-[6px]">
            Şifre
          </label>
          <div className="relative">
            <input
              {...register("sifre")}
              type={sifreGoster ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="current-password"
              className="w-full px-3 py-[11px] text-[13px] border border-[#D4D8DC] rounded-[2px] bg-white text-[#1B2E40] placeholder:text-[#8B97A4] placeholder:text-[12px] focus:outline-none focus:border-[#003057] focus:shadow-[0_0_0_3px_rgba(0,48,87,0.08)] transition-[border-color,box-shadow] duration-150"
            />
            <button
              type="button"
              onClick={() => setSifreGoster((v) => !v)}
              className="absolute right-[10px] top-1/2 -translate-y-1/2 bg-transparent border-none text-[#5B6770] text-[10px] cursor-pointer tracking-[0.5px] px-[6px] py-1 uppercase font-semibold hover:text-[#003057] transition-colors duration-150"
            >
              {sifreGoster ? "Gizle" : "Göster"}
            </button>
          </div>
          {errors.sifre && (
            <p className="text-[11px] text-[#B83232] mt-1">{errors.sifre.message}</p>
          )}
        </div>

        {/* Beni hatırla + Şifremi unuttum */}
        <div className="flex justify-between items-center mt-4 mb-[18px]">
          <label className="flex items-center gap-[7px] text-[11.5px] text-[#3D4E63] cursor-pointer select-none">
            <input
              {...register("beniHatirla")}
              type="checkbox"
              className="w-[14px] h-[14px] accent-[#003057] cursor-pointer"
            />
            <span>Beni hatırla</span>
          </label>
          <Link
            href="/sifre-sifirla"
            className="text-[11.5px] text-[#0077CC] no-underline tracking-[0.2px] hover:underline hover:text-[#003057] transition-colors duration-150"
          >
            Şifremi unuttum
          </Link>
        </div>

        {/* Giriş Yap butonu */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-[#003057] text-white border-none py-3 px-5 text-[11px] font-medium tracking-[2px] uppercase rounded-[2px] cursor-pointer transition-[background] duration-150 hover:bg-[#1A3A5C] active:bg-[#003057] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isPending ? "Giriş yapılıyor…" : "Giriş Yap"}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-[1px] bg-[#D4D8DC]" />
        <span className="text-[#8B97A4] text-[10px] tracking-[1px] uppercase">veya</span>
        <div className="flex-1 h-[1px] bg-[#D4D8DC]" />
      </div>

      {/* Kayıt butonları */}
      <div className="grid grid-cols-2 gap-2 mb-[18px]">
        {[
          { href: "/kayit/fasoncu", baslik: "Fasoncu Kaydı", alt: "CNC firması olarak başla" },
          { href: "/kayit/alici", baslik: "Alıcı Kaydı", alt: "Ücretsiz iş bul" },
        ].map(({ href, baslik, alt }) => (
          <Link
            key={href}
            href={href}
            className="block text-center px-3 py-[11px] text-[10px] font-semibold tracking-[1.5px] uppercase border border-[#D4D8DC] rounded-[2px] text-[#003057] bg-white no-underline transition-all duration-150 hover:border-[#003057] hover:bg-[#F0F7FF]"
          >
            {baslik}
            <span className="block text-[9px] font-normal text-[#5B6770] mt-[3px] tracking-[0.5px] normal-case">
              {alt}
            </span>
          </Link>
        ))}
      </div>

      {/* Bilgi çubuğu */}
      <div className="bg-[#F0F7FF] border-l-[3px] border-[#003057] px-[14px] py-[10px] text-[11px] text-[#003057] rounded-[2px] leading-[1.5]">
        <strong>Yeni misiniz?</strong> Fasoncu firmalar için 30 gün ücretsiz deneme —
        kart bilgisi gerekmez.
      </div>
    </div>
  );
}
