"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { yeniSifreSchema, type YeniSifreData } from "@/lib/validations/auth";
import { yeniSifreGuncelle } from "@/lib/actions/auth";

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

function hesaplaGuc(sifre: string): 0 | 1 | 2 | 3 {
  if (!sifre) return 0;
  let skor = 0;
  if (sifre.length >= 8) skor++;
  if (/[A-Z]/.test(sifre) && /[a-z]/.test(sifre)) skor++;
  if (/\d/.test(sifre) && /[^A-Za-z0-9]/.test(sifre)) skor++;
  return skor as 0 | 1 | 2 | 3;
}

const GUC_ETIKET: Record<number, { metin: string; renk: string }> = {
  0: { metin: "belirleyin", renk: "text-[#5B6770]" },
  1: { metin: "Zayıf", renk: "text-[#B83232] font-semibold" },
  2: { metin: "Orta", renk: "text-[#C77700] font-semibold" },
  3: { metin: "Güçlü", renk: "text-[#1A7A4A] font-semibold" },
};

export function YeniSifreFormu() {
  const [basarili, setBasarili] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [hata, setHata] = useState<string | null>(null);
  const [sifreGoster, setSifreGoster] = useState(false);
  const [tekrarGoster, setTekrarGoster] = useState(false);

  const { register, handleSubmit, control, formState: { errors } } = useForm<YeniSifreData>({
    resolver: zodResolver(yeniSifreSchema),
    mode: "onBlur",
  });

  const sifreDegeri = useWatch({ control, name: "yeniSifre", defaultValue: "" });
  const gucu = hesaplaGuc(sifreDegeri);
  const gucRenk = gucu === 1 ? "bg-[#B83232]" : gucu === 2 ? "bg-[#C77700]" : "bg-[#1A7A4A]";
  const gucEtiket = GUC_ETIKET[gucu];

  function onSubmit(data: YeniSifreData) {
    setHata(null);
    startTransition(async () => {
      const sonuc = await yeniSifreGuncelle(data.yeniSifre);
      if ("hata" in sonuc) {
        setHata(sonuc.hata);
      } else {
        setBasarili(true);
      }
    });
  }

  return (
    <main className="flex-1 flex items-center justify-center px-5 py-8">
      <div className="w-full max-w-[380px]">
        <div className="bg-white border border-[#D4D8DC] rounded-[2px] px-7 py-8">

          {!basarili ? (
            <>
              <div className="mb-6">
                <p className="text-[10px] tracking-[2px] uppercase text-[#5B6770] font-semibold mb-2">Adım 3 / 3</p>
                <h1 className="text-[22px] font-light text-[#003057] tracking-[-0.3px] leading-[1.25]">Yeni şifrenizi belirleyin</h1>
                <p className="text-[12px] text-[#5B6770] mt-2 tracking-[0.2px] leading-[1.55]">
                  Güvenliğiniz için en az 8 karakter, büyük/küçük harf ve rakam içermeli.
                </p>
              </div>

              <AdimCubugu durum={["done", "done", "active"]} />

              {hata && (
                <div className="bg-[#FEE2E2] text-[#B83232] border-l-[3px] border-[#B83232] px-[13px] py-[9px] text-[11.5px] rounded-[2px] mb-[14px] leading-[1.45]">
                  {hata}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-[14px]">
                  <label className="block text-[10px] font-semibold text-[#003057] uppercase tracking-[1.2px] mb-[6px]">
                    Yeni Şifre
                  </label>
                  <div className="relative">
                    <input
                      {...register("yeniSifre")}
                      type={sifreGoster ? "text" : "password"}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      className={inputCls}
                    />
                    <button
                      type="button"
                      onClick={() => setSifreGoster((v) => !v)}
                      className="absolute right-[10px] top-1/2 -translate-y-1/2 text-[10px] font-semibold uppercase tracking-[0.5px] text-[#5B6770] hover:text-[#003057]"
                    >
                      {sifreGoster ? "Gizle" : "Göster"}
                    </button>
                  </div>
                  {/* Şifre güç göstergesi */}
                  <div className="flex gap-1 mt-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className={`flex-1 h-[3px] rounded-[1px] transition-colors duration-200 ${i <= gucu ? gucRenk : "bg-[#D4D8DC]"}`} />
                    ))}
                  </div>
                  <p className="text-[10px] text-[#5B6770] mt-1">
                    Şifre gücü: <span className={gucEtiket.renk}>{gucEtiket.metin}</span>
                  </p>
                  {errors.yeniSifre && <p className="text-[10.5px] text-[#B83232] mt-1">{errors.yeniSifre.message}</p>}
                </div>

                <div className="mb-[14px]">
                  <label className="block text-[10px] font-semibold text-[#003057] uppercase tracking-[1.2px] mb-[6px]">
                    Şifreyi Tekrar Girin
                  </label>
                  <div className="relative">
                    <input
                      {...register("sifreTekrar")}
                      type={tekrarGoster ? "text" : "password"}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      className={inputCls}
                    />
                    <button
                      type="button"
                      onClick={() => setTekrarGoster((v) => !v)}
                      className="absolute right-[10px] top-1/2 -translate-y-1/2 text-[10px] font-semibold uppercase tracking-[0.5px] text-[#5B6770] hover:text-[#003057]"
                    >
                      {tekrarGoster ? "Gizle" : "Göster"}
                    </button>
                  </div>
                  <p className="text-[10.5px] text-[#5B6770] mt-1">İki şifre de aynı olmalı.</p>
                  {errors.sifreTekrar && <p className="text-[10.5px] text-[#B83232] mt-1">{errors.sifreTekrar.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full bg-[#003057] hover:bg-[#1A3A5C] text-white py-3 text-[11px] font-medium tracking-[2px] uppercase rounded-[2px] cursor-pointer transition-[background] duration-150 disabled:opacity-60 disabled:cursor-not-allowed mt-[14px]"
                >
                  {isPending ? "Güncelleniyor…" : "Şifreyi Güncelle"}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="mb-6 text-center">
                <div className="w-[54px] h-[54px] rounded-full bg-[#E8F5EE] border-2 border-[#1A7A4A] flex items-center justify-center mx-auto mb-[18px] text-[#1A7A4A] text-[26px] font-light">
                  ✓
                </div>
                <p className="text-[10px] tracking-[2px] uppercase text-[#5B6770] font-semibold mb-2">Tamamlandı</p>
                <h2 className="text-[22px] font-light text-[#003057] tracking-[-0.3px] leading-[1.25]">Şifreniz güncellendi</h2>
                <p className="text-[12px] text-[#5B6770] mt-2 tracking-[0.2px] leading-[1.55]">
                  Yeni şifrenizle giriş yapabilirsiniz. Güvenlik nedeniyle tüm aktif oturumlarınız sonlandırıldı.
                </p>
              </div>

              <AdimCubugu durum={["done", "done", "done"]} />

              <Link
                href="/giris"
                className="block w-full bg-[#003057] hover:bg-[#1A3A5C] text-white py-3 text-[11px] font-medium tracking-[2px] uppercase rounded-[2px] text-center no-underline transition-[background] duration-150 mt-[18px]"
              >
                Giriş Yap
              </Link>

              <div className="bg-[#F0F7FF] border-l-[3px] border-[#003057] px-[14px] py-[10px] text-[11px] text-[#003057] rounded-[2px] leading-[1.5] mt-[14px]">
                <strong>Güvenlik ipucu:</strong> Şifrenizi başka hiçbir platformda kullanmayın. Parola yöneticisi (1Password, Bitwarden) öneririz.
              </div>
            </>
          )}
        </div>

        {!basarili && (
          <Link
            href="/giris"
            className="block text-center mt-[14px] text-[11.5px] text-[#0077CC] no-underline tracking-[0.2px] hover:text-[#003057] hover:underline transition-colors duration-150"
          >
            ← Giriş ekranına dön
          </Link>
        )}
      </div>
    </main>
  );
}
