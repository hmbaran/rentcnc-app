"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { sifreSifirlamaSchema, type SifreSifirlamaData } from "@/lib/validations/auth";
import { sifreSifirlamaIste } from "@/lib/actions/auth";

const inputCls = "w-full px-3 py-[11px] text-[13px] border border-[#D4D8DC] rounded-[2px] bg-white text-[#1B2E40] focus:outline-none focus:border-[#003057] focus:shadow-[0_0_0_3px_rgba(0,48,87,0.08)] transition-all duration-150 placeholder:text-[#8B97A4] placeholder:text-[12px]";

function AdimCubugu({ durum }: { durum: Array<"active" | "done" | "pending"> }) {
  const renkler = { active: "bg-[#003057]", done: "bg-[#1A7A4A]", pending: "bg-[#D4D8DC]" };
  return (
    <div className="flex gap-[6px] mb-[22px]">
      {durum.map((d, i) => (
        <div key={i} className={`flex-1 h-[3px] rounded-[1px] ${renkler[d]}`} />
      ))}
    </div>
  );
}

export function SifreSifirlaFormu() {
  const [adim, setAdim] = useState<1 | 2>(1);
  const [gonderilen, setGonderilen] = useState("");
  const [isPending, startTransition] = useTransition();

  const { register, handleSubmit, formState: { errors } } = useForm<SifreSifirlamaData>({
    resolver: zodResolver(sifreSifirlamaSchema),
    mode: "onBlur",
  });

  function onSubmit(data: SifreSifirlamaData) {
    startTransition(async () => {
      await sifreSifirlamaIste(data.email);
      setGonderilen(data.email);
      setAdim(2);
    });
  }

  return (
    <main className="flex-1 flex items-center justify-center px-5 py-8">
      <div className="w-full max-w-[380px]">
        <div className="bg-white border border-[#D4D8DC] rounded-[2px] px-7 py-8">

          {adim === 1 && (
            <>
              <div className="mb-6">
                <p className="text-[10px] tracking-[2px] uppercase text-[#5B6770] font-semibold mb-2">Adım 1 / 3</p>
                <h1 className="text-[22px] font-light text-[#003057] tracking-[-0.3px] leading-[1.25]">Şifrenizi mi unuttunuz?</h1>
                <p className="text-[12px] text-[#5B6770] mt-2 tracking-[0.2px] leading-[1.55]">
                  Endişelenmeyin. Hesabınıza bağlı e-postayı girin, size sıfırlama bağlantısı gönderelim.
                </p>
              </div>

              <AdimCubugu durum={["active", "pending", "pending"]} />

              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-[14px]">
                  <label className="block text-[10px] font-semibold text-[#003057] uppercase tracking-[1.2px] mb-[6px]">
                    E-posta adresiniz
                  </label>
                  <input
                    {...register("email")}
                    type="email"
                    placeholder="ornek@firmaniz.com"
                    autoComplete="email"
                    className={inputCls}
                  />
                  <p className="text-[10.5px] text-[#5B6770] mt-1">Kayıt sırasında kullandığınız e-posta adresini girin.</p>
                  {errors.email && <p className="text-[10.5px] text-[#B83232] mt-1">{errors.email.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full bg-[#003057] hover:bg-[#1A3A5C] text-white py-3 text-[11px] font-medium tracking-[2px] uppercase rounded-[2px] cursor-pointer transition-[background] duration-150 disabled:opacity-60 disabled:cursor-not-allowed mt-[14px]"
                >
                  {isPending ? "Gönderiliyor…" : "Sıfırlama Bağlantısı Gönder"}
                </button>
              </form>
            </>
          )}

          {adim === 2 && (
            <>
              <div className="mb-6 text-center">
                <div className="w-[54px] h-[54px] rounded-full bg-[#E8F5EE] border-2 border-[#1A7A4A] flex items-center justify-center mx-auto mb-[18px] text-[#1A7A4A] text-[26px] font-light">
                  ✓
                </div>
                <p className="text-[10px] tracking-[2px] uppercase text-[#5B6770] font-semibold mb-2">Adım 2 / 3</p>
                <h2 className="text-[22px] font-light text-[#003057] tracking-[-0.3px] leading-[1.25]">E-postanızı kontrol edin</h2>
                <p className="text-[12px] text-[#5B6770] mt-2 tracking-[0.2px] leading-[1.55]">
                  Sıfırlama bağlantısı şu adrese gönderildi:
                </p>
              </div>

              <AdimCubugu durum={["done", "active", "pending"]} />

              <div className="bg-[#F0F7FF] border border-[#D4D8DC] border-l-[3px] border-l-[#003057] px-[14px] py-[10px] text-[12.5px] text-[#003057] rounded-[2px] font-medium break-all mb-[18px]">
                {gonderilen}
              </div>

              <div className="border-t border-[#D4D8DC]">
                {[
                  "Gelen kutunuzu kontrol edin. Bağlantı 30 dakika içinde geçerli.",
                  "Gelmediyse spam / istenmeyen klasörünüze bakın.",
                  "E-postadaki \"Şifremi Sıfırla\" butonuna tıklayın, yeni şifrenizi belirleyin.",
                ].map((tip, i) => (
                  <div key={i} className="flex gap-[10px] py-2 border-b border-[#D4D8DC] last:border-b-0 text-[11.5px] text-[#3D4E63] leading-[1.55]">
                    <span className="flex-shrink-0 w-[18px] h-[18px] bg-[#003057] text-white rounded-[2px] flex items-center justify-center text-[10px] font-semibold mt-[1px]">
                      {i + 1}
                    </span>
                    {tip}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <Link
          href="/giris"
          className="block text-center mt-[14px] text-[11.5px] text-[#0077CC] no-underline tracking-[0.2px] hover:text-[#003057] hover:underline transition-colors duration-150"
        >
          ← Giriş ekranına dön
        </Link>
      </div>
    </main>
  );
}
