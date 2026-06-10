"use client";

import { useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { fasoncuAdim1Schema, type FasoncuAdim1Data } from "@/lib/validations/auth";
import { fasoncuKayitYap } from "@/lib/actions/auth";
import { IL_ILCE_MAP } from "@/lib/data/ilceler";

// ─── Sabitler ───────────────────────────────────────────────────────────────

const IL_LISTESI = Object.keys(IL_ILCE_MAP).sort((a, b) => a.localeCompare(b, "tr"));

const PLANLAR = [
  {
    id: "ucretsiz" as const,
    etiket: "Başlangıç",
    ad: "Ücretsiz",
    aciklama: "Platforma alış",
    fiyat: "₺0",
    fiyatAlt: "Süresiz",
    badge: null,
    popular: false,
    ozellikler: [
      { var: true,  metin: "Firma profili" },
      { var: true,  metin: "3 tezgah listesi" },
      { var: true,  metin: "Aylık 5 RFQ" },
      { var: false, metin: "Doğrulama rozeti" },
      { var: false, metin: "Öncelikli görünüm" },
    ],
  },
  {
    id: "baslangic" as const,
    etiket: "Aktif",
    ad: "Başlangıç",
    aciklama: "Küçük atölye",
    fiyat: "₺1.490",
    fiyatAlt: "/ yıl · aylık ₺149",
    badge: "30 GÜN ÜCRETSİZ",
    popular: false,
    ozellikler: [
      { var: true,  metin: "Sınırsız tezgah" },
      { var: true,  metin: "Aylık 25 RFQ" },
      { var: true,  metin: "Doğrulama rozeti" },
      { var: true,  metin: "3 yetkili kullanıcı" },
      { var: false, metin: "Öncelikli görünüm" },
    ],
  },
  {
    id: "profesyonel" as const,
    etiket: "Önerilen",
    ad: "Profesyonel",
    aciklama: "Orta-büyük firma",
    fiyat: "₺3.490",
    fiyatAlt: "/ yıl · aylık ₺349",
    badge: "30 GÜN ÜCRETSİZ",
    popular: true,
    ozellikler: [
      { var: true, metin: "Sınırsız tezgah" },
      { var: true, metin: "Sınırsız RFQ" },
      { var: true, metin: "Doğrulama rozeti" },
      { var: true, metin: "Öncelikli görünüm" },
      { var: true, metin: "10 yetkili kullanıcı" },
      { var: true, metin: "Analitik raporlar" },
    ],
  },
  {
    id: "kurumsal" as const,
    etiket: "Premium",
    ad: "Kurumsal",
    aciklama: "Büyük üretici",
    fiyat: "₺7.490",
    fiyatAlt: "/ yıl · aylık ₺749",
    badge: "30 GÜN ÜCRETSİZ",
    popular: false,
    ozellikler: [
      { var: true, metin: "Profesyonel tüm özellikler" },
      { var: true, metin: "API erişimi" },
      { var: true, metin: "Sınırsız kullanıcı" },
      { var: true, metin: "Özel hesap yöneticisi" },
      { var: true, metin: "SLA garantisi" },
      { var: true, metin: "Özel entegrasyonlar" },
    ],
  },
];

const PLAN_OZET: Record<string, { ad: string; fiyat: string; deneme: string }> = {
  ucretsiz:    { ad: "Ücretsiz",     fiyat: "₺0 — Süresiz ücretsiz",          deneme: "Deneme gerekmez" },
  baslangic:   { ad: "Başlangıç",    fiyat: "₺1.490 / yıl (₺149 / ay)",       deneme: "30 gün ücretsiz, kart gerekmez" },
  profesyonel: { ad: "Profesyonel",  fiyat: "₺3.490 / yıl (₺349 / ay)",       deneme: "30 gün ücretsiz, kart gerekmez" },
  kurumsal:    { ad: "Kurumsal",     fiyat: "₺7.490 / yıl (₺749 / ay)",       deneme: "30 gün ücretsiz, kart gerekmez" },
};

// ─── Stil sabitleri ──────────────────────────────────────────────────────────

const inputCls = "w-full px-3 py-[9px] border border-[#C8D8E8] rounded-[3px] bg-white text-[#1A2535] text-[13px] outline-none focus:border-[#00529C] transition-colors duration-150";
const selectCls = inputCls;
const labelCls  = "text-[11px] text-[#4A5568] font-medium uppercase tracking-[0.3px]";

// ─── Yardımcı fonksiyon ──────────────────────────────────────────────────────

function formatTelefon(deger: string): string {
  let rakamlar = deger.replace(/\D/g, "");
  if (rakamlar.startsWith("90")) rakamlar = rakamlar.slice(2);
  if (rakamlar.startsWith("0"))  rakamlar = rakamlar.slice(1);
  rakamlar = rakamlar.slice(0, 10);
  if (!rakamlar) return "";
  let f = "+90 " + rakamlar.slice(0, 3);
  if (rakamlar.length > 3) f += " " + rakamlar.slice(3, 6);
  if (rakamlar.length > 6) f += " " + rakamlar.slice(6, 8);
  if (rakamlar.length > 8) f += " " + rakamlar.slice(8, 10);
  return f;
}

// ─── Küçük bileşenler ───────────────────────────────────────────────────────

function Alan({
  label, gerekli, hata, children,
}: {
  label: string; gerekli?: boolean; hata?: string; children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-[5px]">
      <label className={labelCls}>
        {label} {gerekli && <span className="text-[#0077CC]">*</span>}
      </label>
      {children}
      {hata && <p className="text-[10px] text-red-600 mt-[2px]">{hata}</p>}
    </div>
  );
}

function SifreGuc({ sifre }: { sifre: string }) {
  const kurallar = [
    { metin: "En az 8 karakter",     gecerli: sifre.length >= 8 },
    { metin: "En az bir harf",        gecerli: /[a-zA-ZğüşıöçĞÜŞİÖÇ]/.test(sifre) },
    { metin: "En az bir rakam",       gecerli: /[0-9]/.test(sifre) },
    { metin: "Özel karakter (!@#…)",  gecerli: /[^a-zA-ZğüşıöçĞÜŞİÖÇ0-9]/.test(sifre) },
  ];
  const puan = kurallar.filter((k) => k.gecerli).length;
  const renk = puan <= 1 ? "#B83232" : puan === 2 ? "#C05C00" : puan === 3 ? "#B07A00" : "#1A7A4A";
  const etiket = ["", "Zayıf", "Orta", "İyi", "Güçlü"][puan];
  if (!sifre) return null;
  return (
    <div className="mt-[7px] p-[10px] bg-[#F4F7FB] border border-[#DDE8F0] rounded-[3px]">
      <div className="flex gap-[3px] mb-[8px] items-center">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex-1 h-[3px] rounded-[2px] transition-all duration-200"
            style={{ backgroundColor: i <= puan ? renk : "#DDE8F0" }} />
        ))}
        <span className="text-[10px] font-semibold ml-[6px] whitespace-nowrap" style={{ color: renk }}>
          {etiket}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-[3px]">
        {kurallar.map((k) => (
          <div key={k.metin} className="flex items-center gap-[5px] text-[10px]"
            style={{ color: k.gecerli ? "#1A7A4A" : "#8A98A8" }}>
            <span className="font-bold flex-shrink-0">{k.gecerli ? "✓" : "○"}</span>
            {k.metin}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Adım 1: Firma Bilgileri ─────────────────────────────────────────────────

function Adim1({ form }: { form: ReturnType<typeof useForm<FasoncuAdim1Data>> }) {
  const { register, setValue, control, formState: { errors } } = form;
  const [sifreGoster, setSifreGoster] = useState(false);
  const [sifreTekrarGoster, setSifreTekrarGoster] = useState(false);

  const seciliIl   = useWatch({ control, name: "il",    defaultValue: "" });
  const sifreDeger = useWatch({ control, name: "sifre", defaultValue: "" });
  const ilceler    = IL_ILCE_MAP[seciliIl] ?? [];

  function vknDegisti(v: string) {
    if (v.length === 10) {
      setValue("ticariUnvan", "ÖRNEK MAKİNA SANAYİ VE TİC. LTD. ŞTİ.", { shouldValidate: false });
      setValue("il",          "Bursa",   { shouldValidate: false });
      setValue("ilce",        "Nilüfer", { shouldValidate: false });
    }
  }

  return (
    <div className="flex flex-col gap-[16px]">

      {/* Bilgi bandı */}
      <div className="bg-[#F0F7FF] border-l-[3px] border-[#00529C] px-[14px] py-[10px] rounded-[0_3px_3px_0] text-[11px] text-[#004080] leading-[1.6]">
        Vergi numaranızı girin — firma adı ve şehir bilgileri GİB kayıtlarından otomatik yüklenir.
      </div>

      {/* VKN + Ticari ünvan */}
      <div className="grid grid-cols-2 gap-[13px]">
        <Alan label="Vergi Numarası (VKN)" gerekli hata={errors.vkn?.message}>
          <input
            {...register("vkn", { onChange: (e) => vknDegisti(e.target.value) })}
            type="text" maxLength={10} placeholder="10 haneli VKN"
            className={inputCls}
          />
        </Alan>
        <Alan label="Ticari Ünvan" hata={errors.ticariUnvan?.message}>
          <div className="relative">
            <input {...register("ticariUnvan")} type="text" placeholder="GİB'ten yüklenir"
              className={inputCls} />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] bg-[#E8F5EE] text-[#1A7A4A] px-[5px] py-[1px] rounded-[2px] uppercase tracking-[0.5px]">
              Otomatik
            </span>
          </div>
        </Alan>
      </div>

      {/* İl + İlçe */}
      <div className="grid grid-cols-2 gap-[13px]">
        <Alan label="İl" gerekli hata={errors.il?.message}>
          <select
            {...register("il", { onChange: () => setValue("ilce", "", { shouldValidate: false }) })}
            className={selectCls}
          >
            <option value="">— Seçin —</option>
            {IL_LISTESI.map((il) => <option key={il}>{il}</option>)}
          </select>
        </Alan>
        <Alan label="İlçe" gerekli hata={errors.ilce?.message}>
          <select {...register("ilce")} disabled={!seciliIl} className={selectCls}>
            <option value="">{seciliIl ? "— Seçin —" : "Önce il seçin"}</option>
            {ilceler.map((ilce) => <option key={ilce}>{ilce}</option>)}
          </select>
        </Alan>
      </div>

      {/* Yetkili + Telefon */}
      <div className="grid grid-cols-2 gap-[13px]">
        <Alan label="Yetkili Kişi" gerekli hata={errors.yetkiliKisi?.message}>
          <input {...register("yetkiliKisi")} type="text" placeholder="Ad Soyad"
            autoComplete="name" className={inputCls} />
        </Alan>
        <Alan label="Cep Telefonu" gerekli hata={errors.telefon?.message}>
          <input
            {...register("telefon", {
              onChange: (e) => { e.target.value = formatTelefon(e.target.value); },
            })}
            type="tel" placeholder="+90 5__ ___ __ __"
            autoComplete="tel"
            className={inputCls}
          />
        </Alan>
      </div>

      {/* E-posta */}
      <Alan label="E-posta — giriş için kullanılacak" gerekli hata={errors.email?.message}>
        <input
          {...register("email")}
          type="email" placeholder="firma@ornek.com"
          autoComplete="email"
          className={`${inputCls} ${errors.email ? "border-red-400 bg-red-50" : ""}`}
        />
      </Alan>

      {/* Şifre + Şifre tekrar */}
      <Alan label="Şifre" gerekli hata={errors.sifre?.message}>
        <div className="relative">
          <input
            {...register("sifre")}
            type={sifreGoster ? "text" : "password"}
            placeholder="En az 8 karakter, harf ve rakam"
            autoComplete="new-password"
            className={inputCls}
          />
          <button type="button" onClick={() => setSifreGoster((v) => !v)}
            className="absolute right-[10px] top-1/2 -translate-y-1/2 text-[10px] text-[#4A5568] uppercase font-semibold tracking-[0.5px] hover:text-[#003057]">
            {sifreGoster ? "Gizle" : "Göster"}
          </button>
        </div>
        <SifreGuc sifre={sifreDeger} />
      </Alan>

      <Alan label="Şifre Tekrar" gerekli hata={errors.sifreTekrar?.message}>
        <div className="relative">
          <input
            {...register("sifreTekrar")}
            type={sifreTekrarGoster ? "text" : "password"}
            placeholder="Şifreyi tekrar girin"
            autoComplete="new-password"
            className={inputCls}
          />
          <button type="button" onClick={() => setSifreTekrarGoster((v) => !v)}
            className="absolute right-[10px] top-1/2 -translate-y-1/2 text-[10px] text-[#4A5568] uppercase font-semibold tracking-[0.5px] hover:text-[#003057]">
            {sifreTekrarGoster ? "Gizle" : "Göster"}
          </button>
        </div>
      </Alan>

    </div>
  );
}

// ─── Adım 2: Plan Seçimi ─────────────────────────────────────────────────────

function Adim2({
  seciliPlan, onPlanSec, sozlesmeOnay, onSozlesme, hata,
}: {
  seciliPlan: string;
  onPlanSec: (p: string) => void;
  sozlesmeOnay: boolean;
  onSozlesme: (v: boolean) => void;
  hata?: string | null;
}) {
  const ozet = PLAN_OZET[seciliPlan];

  return (
    <div className="flex flex-col gap-[16px]">

      {/* Bilgi bandı */}
      <div className="bg-[#F0F7FF] border-l-[3px] border-[#00529C] px-[14px] py-[10px] rounded-[0_3px_3px_0] text-[11px] text-[#004080] leading-[1.6]">
        <strong>30 gün ücretsiz deneme</strong> — Kart bilgisi gerekmez. Tezgah ve profil bilgilerini kayıt sonrası panelinizden ekleyebilirsiniz.
      </div>

      {/* Plan kartları */}
      <div className="grid grid-cols-2 gap-[10px]">
        {PLANLAR.map((p) => (
          <div
            key={p.id}
            onClick={() => onPlanSec(p.id)}
            className={`relative flex flex-col p-[16px] rounded-[3px] cursor-pointer transition-all duration-150 ${
              seciliPlan === p.id
                ? "border-2 border-[#003057] shadow-[0_2px_10px_rgba(0,48,87,0.1)]"
                : "border border-[#C8D8E8] hover:border-[#00529C]"
            }`}
          >
            {p.popular && (
              <div className="absolute -top-[10px] left-1/2 -translate-x-1/2 bg-[#003057] text-white text-[9px] px-3 py-[3px] rounded-[2px] uppercase tracking-[1.5px] font-semibold whitespace-nowrap">
                EN POPÜLER
              </div>
            )}
            {p.badge && (
              <div className="absolute top-0 right-0 bg-[#E8F5EE] text-[#1A7A4A] text-[8.5px] px-2 py-[3px] rounded-[0_3px_0_3px] uppercase tracking-[1px] font-bold">
                {p.badge}
              </div>
            )}
            <p className="text-[9px] tracking-[2px] text-[#8A98A8] uppercase font-semibold mb-1 mt-1">{p.etiket}</p>
            <p className="text-[15px] font-medium text-[#003057] mb-[2px]">{p.ad}</p>
            <p className="text-[10px] text-[#4A5568] mb-[10px]">{p.aciklama}</p>
            <p className="text-[20px] font-light text-[#003057] tracking-[-0.5px] leading-none">{p.fiyat}</p>
            <p className="text-[9.5px] text-[#8A98A8] mt-[2px] mb-[10px]">{p.fiyatAlt}</p>
            <div className="border-t border-[#DDE8F0] pt-[10px] flex flex-col gap-[5px]">
              {p.ozellikler.map((o) => (
                <p key={o.metin} className={`text-[10px] leading-[1.4] ${o.var ? "text-[#3D4E63]" : "text-[#B0BAC4] line-through"}`}>
                  {o.var ? "✓" : "–"} {o.metin}
                </p>
              ))}
            </div>
            {/* Seçili işareti */}
            {seciliPlan === p.id && (
              <div className="absolute top-[10px] left-[10px] w-[16px] h-[16px] rounded-full bg-[#003057] flex items-center justify-center">
                <span className="text-white text-[9px] font-bold">✓</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Seçilen plan özeti */}
      {ozet && (
        <div className="bg-[#F0F7FF] border border-[#C8D8E8] rounded-[3px] p-[14px]">
          <p className="text-[10px] font-semibold text-[#003057] uppercase tracking-[1px] mb-[8px]">Seçtiğiniz Plan</p>
          <div className="flex justify-between text-[12px] mb-[4px]">
            <span className="text-[#4A5568]">Plan</span>
            <span className="font-medium text-[#003057]">{ozet.ad}</span>
          </div>
          <div className="flex justify-between text-[12px] mb-[4px]">
            <span className="text-[#4A5568]">Fiyat</span>
            <span className="font-medium text-[#003057]">{ozet.fiyat}</span>
          </div>
          <div className="flex justify-between text-[12px]">
            <span className="text-[#4A5568]">Deneme</span>
            <span className="font-medium text-[#1A7A4A]">{ozet.deneme}</span>
          </div>
        </div>
      )}

      {/* Hata */}
      {hata && (
        <div className="bg-[#FEE2E2] text-[#B83232] border-l-[3px] border-[#B83232] px-[13px] py-[9px] text-[11.5px] rounded-[2px] leading-[1.45]">
          {hata}
        </div>
      )}

      {/* Sözleşme onayı */}
      <label className="flex items-start gap-[9px] p-[12px] bg-[#F4F7FB] border border-[#DDE8F0] rounded-[3px] cursor-pointer">
        <input
          type="checkbox"
          checked={sozlesmeOnay}
          onChange={(e) => onSozlesme(e.target.checked)}
          className="mt-[2px] w-[15px] h-[15px] accent-[#003057] flex-shrink-0"
        />
        <span className="text-[11.5px] text-[#3D4E63] leading-[1.6]">
          <a href="/kvkk" className="text-[#0077CC] hover:underline">KVKK</a>,{" "}
          <a href="/kullanim-kosullari" className="text-[#0077CC] hover:underline">Kullanım Koşulları</a> ve{" "}
          <a href="/abonelik-sartlari" className="text-[#0077CC] hover:underline">Abonelik Şartları</a>&apos;nı
          okudum, kabul ediyorum.
        </span>
      </label>

    </div>
  );
}

// ─── Ana Bileşen ─────────────────────────────────────────────────────────────

export function FasoncuKayitFormu() {
  const [adim, setAdim] = useState(0); // 0 = Firma, 1 = Plan
  const [isPending, startTransition] = useTransition();
  const [serverHata, setServerHata] = useState<string | null>(null);
  const [seciliPlan, setSeciliPlan] = useState("profesyonel");
  const [sozlesmeOnay, setSozlesmeOnay] = useState(false);

  const form = useForm<FasoncuAdim1Data>({
    resolver: zodResolver(fasoncuAdim1Schema),
    mode: "onBlur",
  });

  const ADIMLAR = ["Firma Bilgileri", "Plan Seçimi"];
  const yuzde   = adim === 0 ? 50 : 100;

  async function ileriGit() {
    if (adim === 0) {
      const gecerli = await form.trigger();
      if (!gecerli) return;
      setAdim(1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    // Adım 1 → kayıt
    await finalGonder();
  }

  function geriGit() {
    setAdim(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function finalGonder() {
    if (!sozlesmeOnay) {
      setServerHata("Devam etmek için KVKK ve Kullanım Koşullarını kabul etmelisiniz.");
      return;
    }
    setServerHata(null);
    const d = form.getValues();

    startTransition(async () => {
      const sonuc = await fasoncuKayitYap({
        email:         d.email,
        sifre:         d.sifre,
        vkn:           d.vkn,
        ticariUnvan:   d.ticariUnvan,
        il:            d.il,
        ilce:          d.ilce,
        adres:         d.adres ?? "",
        yetkiliKisi:   d.yetkiliKisi,
        telefon:       d.telefon,
        website:       d.website ?? "",
        kurulisYili:   d.kurulisYili ?? "",
        calisanAralik: d.calisanAralik ?? "",
        kisaTanitim:   d.kisaTanitim ?? "",
        seciliPlan,
      });

      if (sonuc?.hata) {
        const hata = sonuc.hata;
        const emailHatasi =
          hata.includes("kayıt başlatılmış") ||
          hata.includes("zaten kayıtlı") ||
          hata.includes("already registered");

        if (emailHatasi) {
          // E-posta sorunuysa 1. adıma dön, alanı kırmızı işaretle
          form.setError("email", { type: "manual", message: hata });
          setAdim(0);
          window.scrollTo({ top: 0, behavior: "smooth" });
          setTimeout(() => {
            const el = document.querySelector<HTMLInputElement>('input[type="email"]');
            el?.focus();
            el?.scrollIntoView({ behavior: "smooth", block: "center" });
          }, 100);
        } else {
          // Rate limit veya diğer sunucu hataları → 2. adımda göster
          setServerHata(hata);
        }
      }
    });
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">

      {/* İlerleme */}
      <div className="bg-white border-b border-[#DDE8F0] px-7 py-5 flex-shrink-0">
        <div className="flex justify-between items-center mb-[12px]">
          <p className="text-[15px] font-medium text-[#003057]">{ADIMLAR[adim]}</p>
          <p className="text-[11px] text-[#0077CC] font-medium tracking-[0.5px]">
            Adım {adim + 1} / 2
          </p>
        </div>
        <div className="h-[4px] bg-[#DDE8F0] rounded-[2px] overflow-hidden mb-[14px]">
          <div
            className="h-full bg-gradient-to-r from-[#00529C] to-[#0077CC] rounded-[2px] transition-[width] duration-300"
            style={{ width: `${yuzde}%` }}
          />
        </div>
        {/* Adım noktaları */}
        <div className="flex">
          {ADIMLAR.map((lbl, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 relative">
              {i < ADIMLAR.length - 1 && (
                <div className={`absolute top-[13px] left-[55%] w-[90%] h-[1px] ${i < adim ? "bg-[#00529C]" : "bg-[#DDE8F0]"}`} />
              )}
              <div className={`w-[26px] h-[26px] rounded-full border-2 flex items-center justify-center text-[10px] font-medium z-10 transition-all duration-200 ${
                i === adim ? "border-[#003057] bg-[#003057] text-white"
                : i < adim  ? "border-[#00529C] bg-[#00529C] text-white"
                : "border-[#DDE8F0] bg-white text-[#8A98A8]"
              }`}>
                {i < adim ? "✓" : i + 1}
              </div>
              <p className={`text-[9px] uppercase tracking-[0.3px] text-center ${
                i === adim ? "text-[#003057] font-medium"
                : i < adim  ? "text-[#00529C]"
                : "text-[#8A98A8]"
              }`}>{lbl}</p>
            </div>
          ))}
        </div>
      </div>

      {/* İçerik */}
      <div className="flex-1 overflow-y-auto px-7 py-6">
        {adim === 0 && <Adim1 form={form} />}
        {adim === 1 && (
          <Adim2
            seciliPlan={seciliPlan}
            onPlanSec={setSeciliPlan}
            sozlesmeOnay={sozlesmeOnay}
            onSozlesme={setSozlesmeOnay}
            hata={serverHata}
          />
        )}
      </div>

      {/* Navigasyon */}
      <div className="bg-white border-t border-[#DDE8F0] px-7 py-[14px] flex justify-between items-center flex-shrink-0">
        <button
          type="button"
          onClick={geriGit}
          disabled={adim === 0}
          className="px-6 py-[9px] border border-[#C8D8E8] rounded-[2px] bg-white text-[#3D4E63] text-[12px] uppercase tracking-[0.5px] hover:bg-[#F4F7FB] disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-150"
        >
          ← Geri
        </button>

        <button
          type="button"
          onClick={ileriGit}
          disabled={isPending}
          className={`px-6 py-[9px] rounded-[2px] text-white text-[12px] uppercase tracking-[0.5px] border-none cursor-pointer transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed ${
            adim === 1 ? "bg-[#1A7A4A] hover:bg-[#155E3A]" : "bg-[#003057] hover:bg-[#004080]"
          }`}
        >
          {isPending ? "Kaydediliyor…" : adim === 1 ? "🚀 Hesabı Oluştur" : "Devam Et →"}
        </button>
      </div>

    </div>
  );
}
