"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { aliciKayitSchema, type AliciKayitData } from "@/lib/validations/auth";
import { aliciKayitYap } from "@/lib/actions/auth";

// ─── Sabitler ───────────────────────────────────────────────────────────────

const SEKTORLER = [
  "Havacılık & Uzay", "Otomotiv", "Savunma", "Medikal",
  "Enerji & Petrokimya", "Endüstriyel Makine", "Beyaz Eşya",
  "Elektronik", "Demir-Çelik / Metal", "Diğer",
];

const ULKELER = [
  "Almanya", "İtalya", "ABD", "Fransa", "İngiltere", "İspanya",
  "Hollanda", "Türkiye", "İsviçre", "Avusturya", "Polonya", "Diğer",
];

const CALISAN_SECENEKLERI = ["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"];

const TEZGAH_TIPLERI = [
  "CNC Freze", "CNC Torna", "5 Eksen", "Swiss Otomat",
  "Tel Erozyon", "Dalma Erozyon", "Lazer Kesim", "Sac Büküm",
  "Taşlama", "Honlama", "Dişli Kesim", "Additive (DED)", "Henüz emin değilim",
];

const MALZEMELER = [
  "Çelik", "Paslanmaz", "Alüminyum", "Titanyum", "Inconel / Süper Alaşım",
  "Bakır / Pirinç", "Magnezyum", "Kompozit (CFRP/GFRP)",
  "Seramik / Teknik Seramik", "Plastik / PEEK", "Dökme Demir", "Takım Çeliği",
];

const SERTIFIKALAR_LISTESI = [
  "ISO 9001", "IATF 16949", "AS9100", "ISO 13485",
  "NADCAP", "ITAR", "ISO 14001", "DIN 6701",
];

const ACILIYET_SECENEKLERI = [
  { value: "acil", baslik: "Acil iş", aciklama: "Önümüzdeki 4 hafta içinde teklif almam lazım" },
  { value: "uc_ay", baslik: "Önümüzdeki 3 ay", aciklama: "Yakında somut iş için aktif arama" },
  { value: "arastirma", baslik: "Genel araştırma", aciklama: "Tedarikçi havuzunu öğreniyorum" },
  { value: "surekli", baslik: "Sürekli tedarik", aciklama: "Yıllık tekrarlayan iş için partner arıyorum" },
];

const HACIM_SECENEKLERI = ["0 - 50K €", "50K - 250K €", "250K - 1M €", "1M - 5M €", "5M+ €"];

// ─── CSS yardımcıları ────────────────────────────────────────────────────────

const inputCls = "w-full px-3 py-[11px] text-[13px] border border-[#D4D8DC] rounded-[2px] bg-white text-[#1B2E40] focus:outline-none focus:border-[#003057] focus:shadow-[0_0_0_3px_rgba(0,48,87,0.08)] transition-all duration-150 placeholder:text-[#8B97A4] placeholder:text-[12px]";
const selectCls = inputCls + " cursor-pointer pr-8";

function hesaplaGuc(sifre: string): 0 | 1 | 2 | 3 {
  if (!sifre) return 0;
  let skor = 0;
  if (sifre.length >= 8) skor++;
  if (/[A-Z]/.test(sifre) && /[a-z]/.test(sifre)) skor++;
  if (/\d/.test(sifre) && /[^A-Za-z0-9]/.test(sifre)) skor++;
  return skor as 0 | 1 | 2 | 3;
}

function BolumBaslik({ numara, baslik }: { numara: number; baslik: string }) {
  return (
    <div className="text-[10px] font-semibold text-[#5B6770] uppercase tracking-[2px] mb-[14px] flex items-center gap-2">
      <span className="w-[18px] h-[18px] bg-[#003057] text-white rounded-[2px] flex items-center justify-center text-[10px] font-semibold flex-shrink-0">
        {numara}
      </span>
      {baslik}
    </div>
  );
}

function Alan({ label, gerekli, ipucu, hata, opsiyonel, children }: {
  label: string; gerekli?: boolean; ipucu?: string; hata?: string; opsiyonel?: boolean; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[10px] font-semibold text-[#003057] uppercase tracking-[1.2px] mb-[6px]">
        {label}
        {gerekli && <span className="text-[#B83232] ml-[3px]">*</span>}
        {opsiyonel && <span className="text-[#8B97A4] font-normal normal-case tracking-normal ml-[6px] text-[10px]">(opsiyonel)</span>}
      </label>
      {children}
      {ipucu && <p className="text-[10.5px] text-[#5B6770] mt-1 leading-[1.45]">{ipucu}</p>}
      {hata && <p className="text-[10.5px] text-[#B83232] mt-1">{hata}</p>}
    </div>
  );
}

// ─── Ana Bileşen ─────────────────────────────────────────────────────────────

export function AliciKayitFormu() {
  const [isPending, startTransition] = useTransition();
  const [serverHata, setServerHata] = useState<string | null>(null);
  const [tezgahHata, setTezgahHata] = useState<string | null>(null);
  const [aciliyetHata, setAciliyetHata] = useState<string | null>(null);

  const [seciliTezgahlar, setSeciliTezgahlar] = useState<Set<string>>(new Set());
  const [seciliMalzemeler, setSeciliMalzemeler] = useState<Set<string>>(new Set());
  const [seciliSertifikalar, setSeciliSertifikalar] = useState<Set<string>>(new Set());
  const [seciliAciliyet, setSeciliAciliyet] = useState<string>("");

  const [kvkkOnay, setKvkkOnay] = useState(false);
  const [termsOnay, setTermsOnay] = useState(false);
  const [bultenOnay, setBultenOnay] = useState(false);
  const [sifreGoster, setSifreGoster] = useState(false);

  const { register, handleSubmit, control, formState: { errors } } = useForm<AliciKayitData>({
    resolver: zodResolver(aliciKayitSchema),
    mode: "onBlur",
    defaultValues: { dilTercihi: "en" },
  });

  const sifreDegeri = useWatch({ control, name: "sifre", defaultValue: "" });
  const gucu = hesaplaGuc(sifreDegeri);
  const gucRenk = gucu === 1 ? "bg-[#B83232]" : gucu === 2 ? "bg-[#C77700]" : "bg-[#1A7A4A]";

  function chipToggle(setter: React.Dispatch<React.SetStateAction<Set<string>>>, v: string) {
    setter((prev) => {
      const s = new Set(prev);
      if (s.has(v)) { s.delete(v); } else { s.add(v); }
      return s;
    });
  }

  async function onSubmit(data: AliciKayitData) {
    let gecerli = true;

    if (seciliTezgahlar.size === 0) {
      setTezgahHata("En az bir tezgah tipi seçin");
      gecerli = false;
    } else {
      setTezgahHata(null);
    }

    if (!seciliAciliyet) {
      setAciliyetHata("Aciliyet durumu seçin");
      gecerli = false;
    } else {
      setAciliyetHata(null);
    }

    if (!kvkkOnay || !termsOnay) {
      setServerHata("KVKK ve Kullanım Koşulları onayları zorunludur.");
      return;
    }

    if (!gecerli) return;
    setServerHata(null);

    startTransition(async () => {
      const sonuc = await aliciKayitYap({
        ...data,
        aciliyet: seciliAciliyet,
        arananTezgahTipleri: [...seciliTezgahlar],
        arananMalzemeler: [...seciliMalzemeler],
        arananSertifikalar: [...seciliSertifikalar],
        kvkkOnay,
        bultenOnay,
      });
      if (sonuc?.hata) setServerHata(sonuc.hata);
    });
  }

  return (
    <main className="flex-1 flex justify-center px-5 py-6">
      <div className="w-full max-w-[640px]">
        <div className="bg-white border border-[#D4D8DC] rounded-[2px] px-7 py-8">

          {/* Başlık */}
          <div className="mb-[22px]">
            <p className="text-[10px] tracking-[2px] uppercase text-[#5B6770] font-semibold mb-2">Hesap Aç — Ücretsiz</p>
            <h1 className="text-[22px] font-light text-[#003057] tracking-[-0.3px] leading-[1.2]">
              CNC fabrika arayan alıcı mısınız?
            </h1>
            <p className="text-[12px] text-[#5B6770] mt-2 tracking-[0.2px] leading-[1.55]">
              2 dakikada kaydolun, Türkiye&apos;nin doğrulanmış CNC fasoncu havuzuna erişin. Arama, mesajlaşma, RFQ — tamamen ücretsiz.
            </p>
          </div>

          {/* Fayda çubuğu */}
          <div className="bg-[#F0F7FF] border-l-[3px] border-[#003057] px-[14px] py-[11px] rounded-[2px] mb-6 flex gap-[18px] items-center flex-wrap">
            {["Ücretsiz arama", "Doğrulanmış firmalar", "Kart bilgisi gerekmez"].map((b) => (
              <div key={b} className="flex items-center gap-[6px] text-[11px] text-[#003057] font-medium">
                <span className="w-[14px] h-[14px] bg-[#003057] text-white rounded-[2px] flex items-center justify-center text-[10px] font-bold flex-shrink-0">✓</span>
                {b}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>

            {/* ── Bölüm 1: Firma Bilgileri ── */}
            <div className="mb-6 pb-[18px] border-b border-[#D4D8DC]">
              <BolumBaslik numara={1} baslik="Firma Bilgileri" />

              <div className="mb-[13px]">
                <Alan label="Firma Adı" gerekli hata={errors.firmaAdi?.message}>
                  <input {...register("firmaAdi")} type="text" placeholder="örn. Bosch GmbH" className={inputCls} />
                </Alan>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-[13px]">
                <Alan label="Sektör" gerekli hata={errors.sektor?.message}>
                  <select {...register("sektor")} className={selectCls}>
                    <option value="">Seçin...</option>
                    {SEKTORLER.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </Alan>
                <Alan label="Ülke" gerekli hata={errors.ulke?.message}>
                  <select {...register("ulke")} className={selectCls}>
                    <option value="">Seçin...</option>
                    {ULKELER.map((u) => <option key={u}>{u}</option>)}
                  </select>
                </Alan>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-[13px]">
                <Alan label="VAT / Vergi No" opsiyonel>
                  <input {...register("vatNo")} type="text" placeholder="DE123456789" className={inputCls} />
                </Alan>
                <Alan label="Web Sitesi" opsiyonel>
                  <input {...register("website")} type="url" placeholder="https://..." className={inputCls} />
                </Alan>
              </div>

              <Alan label="Çalışan Sayısı">
                <select {...register("calisanSayisi")} className={selectCls}>
                  <option value="">Seçin...</option>
                  {CALISAN_SECENEKLERI.map((c) => <option key={c}>{c}</option>)}
                </select>
              </Alan>
            </div>

            {/* ── Bölüm 2: İletişim & Hesap ── */}
            <div className="mb-6 pb-[18px] border-b border-[#D4D8DC]">
              <BolumBaslik numara={2} baslik="İletişim & Hesap" />

              <div className="grid grid-cols-2 gap-3 mb-[13px]">
                <Alan label="Ad" gerekli hata={errors.ad?.message}>
                  <input {...register("ad")} type="text" placeholder="Adınız" autoComplete="given-name" className={inputCls} />
                </Alan>
                <Alan label="Soyad" gerekli hata={errors.soyad?.message}>
                  <input {...register("soyad")} type="text" placeholder="Soyadınız" autoComplete="family-name" className={inputCls} />
                </Alan>
              </div>

              <div className="mb-[13px]">
                <Alan label="Pozisyon / Görev" opsiyonel>
                  <input {...register("pozisyon")} type="text" placeholder="Satın Alma Müdürü, Tedarik Uzmanı vb." className={inputCls} />
                </Alan>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-[13px]">
                <Alan label="İş E-postası" gerekli ipucu="Bu e-posta giriş için kullanılacak." hata={errors.email?.message}>
                  <input {...register("email")} type="email" placeholder="ad@firmaniz.com" autoComplete="email" className={inputCls} />
                </Alan>
                <Alan label="Telefon" opsiyonel>
                  <input {...register("telefon")} type="tel" placeholder="+49 ..." autoComplete="tel" className={inputCls} />
                </Alan>
              </div>

              <div className="mb-[13px]">
                <Alan label="Şifre" gerekli ipucu="En az 8 karakter, büyük/küçük harf ve rakam içermeli." hata={errors.sifre?.message}>
                  <div className="relative">
                    <input
                      {...register("sifre")}
                      type={sifreGoster ? "text" : "password"}
                      placeholder="En az 8 karakter"
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
                  <div className="flex gap-1 mt-[6px]">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className={`flex-1 h-[3px] rounded-[1px] transition-colors duration-200 ${i <= gucu ? gucRenk : "bg-[#D4D8DC]"}`} />
                    ))}
                  </div>
                </Alan>
              </div>

              <Alan label="Tercih Ettiğiniz Dil" ipucu="Platform arayüzü ve e-postalar bu dilde olacak.">
                <select {...register("dilTercihi")} className={selectCls}>
                  <option value="tr">Türkçe</option>
                  <option value="en">English</option>
                  <option value="de">Deutsch</option>
                </select>
              </Alan>
            </div>

            {/* ── Bölüm 3: Aradığınız İş ── */}
            <div className="mb-6 pb-[18px] border-b border-[#D4D8DC]">
              <BolumBaslik numara={3} baslik="Aradığınız İş" />

              {/* Tezgah tipleri */}
              <div className="mb-[13px]">
                <label className="block text-[10px] font-semibold text-[#003057] uppercase tracking-[1.2px] mb-[6px]">
                  Hangi Tezgah Tipleri İlginizi Çekiyor? <span className="text-[#B83232]">*</span>
                </label>
                <div className="flex flex-wrap gap-[6px]">
                  {TEZGAH_TIPLERI.map((t) => (
                    <button key={t} type="button" onClick={() => chipToggle(setSeciliTezgahlar, t)}
                      className={`inline-flex items-center gap-[6px] px-3 py-[7px] text-[11.5px] border rounded-[2px] transition-all duration-150 tracking-[0.2px] ${
                        seciliTezgahlar.has(t)
                          ? "bg-[#003057] border-[#003057] text-white"
                          : "bg-white border-[#D4D8DC] text-[#3D4E63] hover:border-[#003057] hover:text-[#003057]"
                      }`}>
                      {seciliTezgahlar.has(t) && <span className="text-[10px] font-bold">✓</span>}
                      {t}
                    </button>
                  ))}
                </div>
                <p className="text-[10.5px] text-[#5B6770] mt-1">Birden fazla seçebilirsiniz.</p>
                {tezgahHata && <p className="text-[10.5px] text-[#B83232] mt-1">{tezgahHata}</p>}
              </div>

              {/* Malzeme */}
              <div className="mb-[13px]">
                <label className="block text-[10px] font-semibold text-[#003057] uppercase tracking-[1.2px] mb-[6px]">
                  Hangi Malzemeleri İşletmek İstiyorsunuz?
                </label>
                <div className="flex flex-wrap gap-[6px]">
                  {MALZEMELER.map((m) => (
                    <button key={m} type="button" onClick={() => chipToggle(setSeciliMalzemeler, m)}
                      className={`inline-flex items-center gap-[6px] px-3 py-[7px] text-[11.5px] border rounded-[2px] transition-all duration-150 tracking-[0.2px] ${
                        seciliMalzemeler.has(m)
                          ? "bg-[#003057] border-[#003057] text-white"
                          : "bg-white border-[#D4D8DC] text-[#3D4E63] hover:border-[#003057] hover:text-[#003057]"
                      }`}>
                      {seciliMalzemeler.has(m) && <span className="text-[10px] font-bold">✓</span>}
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sertifikalar */}
              <div className="mb-[13px]">
                <label className="block text-[10px] font-semibold text-[#003057] uppercase tracking-[1.2px] mb-[6px]">
                  Aradığınız Sertifikalar
                  <span className="text-[#8B97A4] font-normal normal-case tracking-normal ml-[6px] text-[10px]">(opsiyonel)</span>
                </label>
                <div className="flex flex-wrap gap-[6px]">
                  {SERTIFIKALAR_LISTESI.map((s) => (
                    <button key={s} type="button" onClick={() => chipToggle(setSeciliSertifikalar, s)}
                      className={`inline-flex items-center gap-[6px] px-3 py-[7px] text-[11.5px] border rounded-[2px] transition-all duration-150 tracking-[0.2px] ${
                        seciliSertifikalar.has(s)
                          ? "bg-[#003057] border-[#003057] text-white"
                          : "bg-white border-[#D4D8DC] text-[#3D4E63] hover:border-[#003057] hover:text-[#003057]"
                      }`}>
                      {seciliSertifikalar.has(s) && <span className="text-[10px] font-bold">✓</span>}
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Aciliyet — radio kartlar */}
              <div className="mb-[13px]">
                <label className="block text-[10px] font-semibold text-[#003057] uppercase tracking-[1.2px] mb-[6px]">
                  Aciliyet Durumu <span className="text-[#B83232]">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {ACILIYET_SECENEKLERI.map((a) => (
                    <label
                      key={a.value}
                      className={`flex items-start gap-[9px] px-[13px] py-[11px] border rounded-[2px] cursor-pointer transition-all duration-150 ${
                        seciliAciliyet === a.value
                          ? "border-[#003057] bg-[#F0F7FF]"
                          : "border-[#D4D8DC] bg-white hover:border-[#003057]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="aciliyet"
                        value={a.value}
                        checked={seciliAciliyet === a.value}
                        onChange={() => { setSeciliAciliyet(a.value); setAciliyetHata(null); }}
                        className="mt-[2px] accent-[#003057] cursor-pointer flex-shrink-0"
                      />
                      <div>
                        <p className="text-[12px] font-semibold text-[#003057] mb-[3px]">{a.baslik}</p>
                        <p className="text-[10.5px] text-[#5B6770] leading-[1.45]">{a.aciklama}</p>
                      </div>
                    </label>
                  ))}
                </div>
                {aciliyetHata && <p className="text-[10.5px] text-[#B83232] mt-1">{aciliyetHata}</p>}
              </div>

              {/* Yıllık hacim */}
              <div className="mb-[13px]">
                <Alan
                  label="Yıllık Tahmini İş Hacmi"
                  opsiyonel
                  ipucu="Fasoncu firmalara gösterilmez — sadece eşleştirme kalitesi için kullanılır."
                >
                  <select {...register("yillikHacim")} className={selectCls}>
                    <option value="">Belirtmek istemiyorum</option>
                    {HACIM_SECENEKLERI.map((h) => <option key={h}>{h}</option>)}
                  </select>
                </Alan>
              </div>

              {/* Notlar */}
              <Alan label="Özel Notlar" opsiyonel>
                <textarea
                  {...register("notlar")}
                  placeholder="Aradığınız spesifik kabiliyet veya proje detayları..."
                  className={`${inputCls} resize-y min-h-[80px] leading-[1.55]`}
                />
              </Alan>
            </div>

            {/* ── Bölüm 4: Yasal Onaylar ── */}
            <div className="mb-6">
              <BolumBaslik numara={4} baslik="Yasal Onaylar" />

              <label className="flex items-start gap-[9px] py-[9px] text-[11.5px] text-[#3D4E63] cursor-pointer leading-[1.55]">
                <input
                  type="checkbox"
                  checked={kvkkOnay}
                  onChange={(e) => setKvkkOnay(e.target.checked)}
                  className="mt-[2px] w-[14px] h-[14px] accent-[#003057] cursor-pointer flex-shrink-0"
                />
                <span>
                  <a href="/kvkk" target="_blank" rel="noopener noreferrer" className="text-[#0077CC] hover:underline">KVKK Aydınlatma Metni</a>&apos;ni
                  {" "}okudum ve kişisel verilerimin işlenmesini kabul ediyorum.<span className="text-[#B83232] ml-[2px]">*</span>
                </span>
              </label>

              <label className="flex items-start gap-[9px] py-[9px] text-[11.5px] text-[#3D4E63] cursor-pointer leading-[1.55]">
                <input
                  type="checkbox"
                  checked={termsOnay}
                  onChange={(e) => setTermsOnay(e.target.checked)}
                  className="mt-[2px] w-[14px] h-[14px] accent-[#003057] cursor-pointer flex-shrink-0"
                />
                <span>
                  <a href="/kullanim-kosullari" target="_blank" rel="noopener noreferrer" className="text-[#0077CC] hover:underline">Kullanım Koşulları</a>
                  {" "}ve{" "}
                  <a href="/gizlilik" target="_blank" rel="noopener noreferrer" className="text-[#0077CC] hover:underline">Gizlilik Politikası</a>&apos;nı
                  {" "}kabul ediyorum.<span className="text-[#B83232] ml-[2px]">*</span>
                </span>
              </label>

              <label className="flex items-start gap-[9px] py-[9px] text-[11.5px] text-[#3D4E63] cursor-pointer leading-[1.55]">
                <input
                  type="checkbox"
                  checked={bultenOnay}
                  onChange={(e) => setBultenOnay(e.target.checked)}
                  className="mt-[2px] w-[14px] h-[14px] accent-[#003057] cursor-pointer flex-shrink-0"
                />
                <span>
                  Platform güncellemeleri, yeni özellikler ve sektörel raporlar için e-posta bülteni almak istiyorum (haftada en fazla 1 e-posta).
                </span>
              </label>
            </div>

            {serverHata && (
              <div className="bg-[#FEE2E2] text-[#B83232] border-l-[3px] border-[#B83232] px-[13px] py-[9px] text-[11.5px] rounded-[2px] mb-4 leading-[1.45]">
                {serverHata}
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-[#003057] hover:bg-[#1A3A5C] text-white py-[13px] text-[11px] font-medium tracking-[2px] uppercase rounded-[2px] cursor-pointer transition-[background] duration-150 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {isPending ? "Kaydediliyor…" : "Hesap Oluştur — Ücretsiz"}
            </button>
          </form>
        </div>

        <Link
          href="/giris"
          className="block text-center mt-[14px] text-[11.5px] text-[#0077CC] no-underline tracking-[0.2px] hover:text-[#003057] hover:underline transition-colors duration-150"
        >
          Zaten hesabınız var mı? Giriş yapın
        </Link>
      </div>
    </main>
  );
}
