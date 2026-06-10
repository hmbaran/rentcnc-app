"use client";

import { useState } from "react";
import Link from "next/link";
import type { AnaSayfaIstatistik } from "@/lib/actions/istatistik";

const KATEGORILER = [
  "CNC Freze (3–5 Eksen)", "CNC Torna", "5 Eksen İşleme", "Tel Erozyon (EDM)",
  "Dalma Erozyon", "Kayar Otomat", "Silindirik Taşlama", "Yüzey Taşlama",
  "Fiber Lazer Kesim", "CNC Abkant", "Turn-Mill", "Gantry Freze",
  "Koordinat Taşlama", "Honlama",
];

const GUVEN = [
  { baslik: "Doğrulanmış profiller", aciklama: "ISO 9001, IATF 16949, AS9100 sertifikaları doğrulanır" },
  { baslik: "Güvenli iletişim", aciklama: "İletişim bilgileri anlaşmaya kadar gizli tutulur" },
  { baslik: "Çok dilli destek", aciklama: "TR, EN, DE — otomatik çeviri" },
  { baslik: "Teknik filtreler", aciklama: "Tezgah tipi, eksen, boyut, malzeme, sertifika, şehir" },
  { baslik: "Gerçek değerlendirmeler", aciklama: "Tamamlanan her iş sonrası alıcı puanı ve yorumu" },
  { baslik: "Alıcıya ücretsiz", aciklama: "Arama ve iletişim alıcılar için tamamen ücretsiz" },
];

const ULKELER = [
  "Almanya", "İtalya", "Fransa", "İngiltere", "ABD", "Hollanda",
  "İsveç", "Japonya", "Kore", "İsviçre", "Avusturya", "Belçika",
];

type Dil = "TR" | "EN" | "DE";

const T: Record<Dil, Record<string, string>> = {
  TR: {
    fabrikaBul: "Fabrika Bul", kapasiteListele: "Kapasite Listele",
    nasilCalisir: "Nasıl Çalışır", fiyatlar: "Fiyatlar",
    girisYap: "Giriş Yap", ucretsizKayit: "Ücretsiz Kayıt",
    eyebrow: "CNC Kapasite Pazaryeri",
    heroBaslik: "Türkiye'nin CNC kapasitesini",
    heroVurgu: "dünyaya açıyoruz",
    heroAlt: "Atıl CNC kapasitesi olan fasoncu firmalar ile dünyanın dört bir yanından iş arayan alıcıları güvenli ve hızlı şekilde buluşturuyoruz.",
    btn1: "Kapasitemi Listele", btn2: "CNC Fabrika Bul",
    stat1: "Kayıtlı Fasoncu", stat2: "Aktif Alıcı", stat3: "Kayıtlı Tezgah", stat4: "Ülke",
    fasoncuEyebrow: "Üretici · Tedarikçi",
    fasoncuBaslik: "Atıl CNC kapasitenizi gelire dönüştürün",
    fasoncuAlt: "Tezgahlarınız boş dururken Almanya'dan, İtalya'dan, Japonya'dan alıcılar sizi arıyor.",
    fasoncuStep1: "Tezgah parkurunu ve sertifikaları 15 dakikada girin",
    fasoncuStep2: "Global alıcılardan RFQ talepleri alın",
    fasoncuStep3: "Platform üzerinden görüşün, anlaşın, işi alın",
    fasoncuCta: "30 gün ücretsiz dene",
    aliciEyebrow: "Sipariş Veren · Proje Sahibi",
    aliciBaslik: "Türkiye'nin en iyi CNC tezgah parkuru olan üreticilerine ulaşın",
    aliciAlt: "ISO sertifikalı, 5 eksen kabiliyetli fasoncu firmalar — detaylı profiller ve gerçek değerlendirmelerle.",
    aliciStep1: "Tezgah tipi, malzeme, sertifika ile filtreleyin",
    aliciStep2: "Profilleri inceleyin, RFQ gönderin",
    aliciStep3: "Platform üzerinden iletişim — ücretsiz",
    aliciCta: "Ücretsiz ara",
    surecEyebrow: "Süreç", surecBaslik: "Nasıl çalışır?",
    katEyebrow: "Tezgah Kategorileri", katBaslik: "Tüm CNC kategorileri",
    nedenEyebrow: "Neden Biz", nedenBaslik: "Platform güvencesi",
    ulkeEyebrow: "Global Erişim", ulkeBaslik: "Alıcı ülkeler",
    ctaEyebrow: "Hemen Başlayın", ctaBaslik: "İlk 30 gün tamamen ücretsiz",
    ctaAlt: "Fasoncu iseniz kapasitenizi listeleyin ve global alıcılara görünür olun.\nAlıcıysanız Türkiye'nin en iyi CNC fabrikalarını ücretsiz arayın.",
    ctaBtn1: "Fasoncu Kaydı", ctaBtn2: "Alıcı Girişi",
  },
  EN: {
    fabrikaBul: "Find Supplier", kapasiteListele: "List Capacity",
    nasilCalisir: "How It Works", fiyatlar: "Pricing",
    girisYap: "Log In", ucretsizKayit: "Free Sign Up",
    eyebrow: "CNC Capacity Marketplace",
    heroBaslik: "Connecting global buyers with",
    heroVurgu: "Turkey's CNC capacity",
    heroAlt: "We match manufacturers with idle CNC capacity to global buyers looking for precision machining.",
    btn1: "List My Capacity", btn2: "Find CNC Factory",
    stat1: "Registered Suppliers", stat2: "Active Buyers", stat3: "Registered Machines", stat4: "Countries",
    fasoncuEyebrow: "CNC Supplier",
    fasoncuBaslik: "Turn idle CNC capacity into revenue",
    fasoncuAlt: "While your machines sit idle, buyers in Germany and Italy are looking for you.",
    fasoncuStep1: "Enter machine park and certifications in 15 min",
    fasoncuStep2: "Receive RFQ requests from global buyers",
    fasoncuStep3: "Communicate, agree and win the job",
    fasoncuCta: "Try free for 30 days",
    aliciEyebrow: "Buyer",
    aliciBaslik: "Access Turkey's best CNC factories",
    aliciAlt: "ISO-certified, 5-axis capable Turkish suppliers — detailed profiles and verified reviews.",
    aliciStep1: "Filter by machine type, material, certification",
    aliciStep2: "Review profiles, send RFQ requests",
    aliciStep3: "Communicate through platform — free",
    aliciCta: "Search for free",
    surecEyebrow: "Process", surecBaslik: "How it works",
    katEyebrow: "Machine Categories", katBaslik: "All CNC categories",
    nedenEyebrow: "Why Us", nedenBaslik: "Platform guarantee",
    ulkeEyebrow: "Global Reach", ulkeBaslik: "Buyer countries",
    ctaEyebrow: "Get Started", ctaBaslik: "First 30 days completely free",
    ctaAlt: "Suppliers: list your capacity and become visible to global buyers.\nBuyers: search Turkey's best CNC factories for free.",
    ctaBtn1: "Supplier Registration", ctaBtn2: "Buyer Login",
  },
  DE: {
    fabrikaBul: "Hersteller finden", kapasiteListele: "Kapazität listen",
    nasilCalisir: "Wie funktioniert es", fiyatlar: "Preise",
    girisYap: "Anmelden", ucretsizKayit: "Kostenlos registrieren",
    eyebrow: "CNC-Kapazitäts-Marktplatz",
    heroBaslik: "CNC-Kapazitäten der Türkei",
    heroVurgu: "weltweit verfügbar",
    heroAlt: "Wir verbinden Lohnfertiger mit freier CNC-Kapazität in der Türkei mit globalen Einkäufern.",
    btn1: "Kapazität listen", btn2: "CNC-Fabrik finden",
    stat1: "Registrierte Lohnfertiger", stat2: "Aktive Einkäufer", stat3: "Registrierte Maschinen", stat4: "Länder",
    fasoncuEyebrow: "CNC-Lohnfertiger",
    fasoncuBaslik: "Freie CNC-Kapazität in Umsatz verwandeln",
    fasoncuAlt: "Während Ihre Maschinen stillstehen, suchen Einkäufer aus Deutschland nach Ihnen.",
    fasoncuStep1: "Maschinenpark und Zertifikate in 15 Min anlegen",
    fasoncuStep2: "RFQ-Anfragen von globalen Einkäufern erhalten",
    fasoncuStep3: "Kommunizieren, einigen und Auftrag gewinnen",
    fasoncuCta: "30 Tage kostenlos testen",
    aliciEyebrow: "Einkäufer",
    aliciBaslik: "Zugang zu Türkeis besten CNC-Fabriken",
    aliciAlt: "ISO-zertifizierte, 5-Achs-fähige türkische Lohnfertiger — detaillierte Profile und echte Bewertungen.",
    aliciStep1: "Nach Maschinentyp, Material, Zertifikat filtern",
    aliciStep2: "Profile prüfen, RFQ-Anfragen senden",
    aliciStep3: "Über Plattform kommunizieren — kostenlos",
    aliciCta: "Kostenlos suchen",
    surecEyebrow: "Prozess", surecBaslik: "Wie funktioniert es?",
    katEyebrow: "Maschinenkategorien", katBaslik: "Alle CNC-Kategorien",
    nedenEyebrow: "Warum Wir", nedenBaslik: "Plattform-Garantie",
    ulkeEyebrow: "Globale Reichweite", ulkeBaslik: "Einkäuferländer",
    ctaEyebrow: "Jetzt Starten", ctaBaslik: "Erste 30 Tage kostenlos",
    ctaAlt: "Lohnfertiger: Kapazität listen und für globale Einkäufer sichtbar werden.\nEinkäufer: Türkeis beste CNC-Fabriken kostenlos durchsuchen.",
    ctaBtn1: "Lohnfertiger-Registrierung", ctaBtn2: "Einkäufer-Login",
  },
};

export default function AnaSayfaIcerik({ istatistik }: { istatistik: AnaSayfaIstatistik }) {
  const [dil, setDil] = useState<Dil>("TR");
  const t = T[dil];

  return (
    <div className="min-h-screen bg-white text-[#1A2535] font-sans text-[14px] leading-relaxed">

      {/* Topbar */}
      <header className="bg-[#003057] px-8 h-[60px] flex items-center gap-6 sticky top-0 z-50">
        <div className="text-[14px] font-light tracking-[3px] text-white uppercase flex-shrink-0">
          RENT<span className="font-semibold text-[#7ABFFF]">CNC</span>MACHINE
        </div>
        <nav className="hidden md:flex gap-7 ml-7">
          <Link href="/ara" className="text-[12px] text-white/60 tracking-[0.5px] hover:text-white transition-colors no-underline">{t.fabrikaBul}</Link>
          <Link href="/kayit/fasoncu" className="text-[12px] text-white/60 tracking-[0.5px] hover:text-white transition-colors no-underline">{t.kapasiteListele}</Link>
          <a href="#nasil-calisir" className="text-[12px] text-white/60 tracking-[0.5px] hover:text-white transition-colors no-underline">{t.nasilCalisir}</a>
          <span className="text-[12px] text-white/40 tracking-[0.5px] cursor-not-allowed select-none">{t.fiyatlar}</span>
        </nav>
        <div className="ml-auto flex gap-[10px] items-center">
          {/* Dil toggle */}
          <div className="hidden md:flex border border-white/20 rounded-[2px] overflow-hidden mr-1">
            {(["TR","EN","DE"] as Dil[]).map((d) => (
              <button key={d} onClick={() => setDil(d)}
                className={`px-[10px] py-[5px] text-[10px] tracking-[1px] font-medium transition-colors ${
                  dil === d ? "bg-[#0077CC] text-white" : "text-white/50 hover:text-white hover:bg-white/10"
                }`}>
                {d}
              </button>
            ))}
          </div>
          <Link href="/giris"
            className="hidden md:inline-block text-[12px] text-white/85 border border-white/30 rounded-[2px] px-5 py-2 hover:border-white hover:text-white transition-colors no-underline">
            {t.girisYap}
          </Link>
          <Link href="/kayit/fasoncu"
            className="text-[12px] bg-[#0077CC] text-white rounded-[2px] px-5 py-2 hover:bg-[#0066B0] transition-colors no-underline">
            {t.ucretsizKayit}
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#003057] via-[#004080] to-[#0077CC] px-8 pt-[72px] pb-0">
        <div className="max-w-[640px]">
          <div className="text-[10px] tracking-[4px] uppercase text-white/50 mb-[18px]">{t.eyebrow}</div>
          <h1 className="text-[34px] font-light leading-[1.2] text-white mb-[18px]">
            {t.heroBaslik}{" "}
            <strong className="font-medium text-[#7ABFFF]">{t.heroVurgu}</strong>
          </h1>
          <p className="text-[14px] text-white/70 max-w-[520px] leading-[1.8] mb-[40px]">{t.heroAlt}</p>
          <div className="flex flex-wrap gap-3 mb-[56px]">
            <Link href="/kayit/fasoncu"
              className="px-8 py-[13px] bg-white text-[#003057] rounded-[2px] text-[12px] tracking-[1px] uppercase font-medium hover:bg-[#E8F2FA] transition-colors no-underline">
              {t.btn1}
            </Link>
            <Link href="/ara"
              className="px-8 py-[13px] bg-transparent text-white border border-white/40 rounded-[2px] text-[12px] tracking-[1px] uppercase hover:border-white transition-colors no-underline">
              {t.btn2}
            </Link>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="bg-white border-b border-[#DDE8F0] grid grid-cols-2 md:grid-cols-4">
        {[
          { n: istatistik.fasoncuSayisi > 0 ? `${istatistik.fasoncuSayisi}+` : "—", l: t.stat1 },
          { n: istatistik.aliciSayisi > 0 ? String(istatistik.aliciSayisi) : "—", l: t.stat2 },
          { n: istatistik.tezgahSayisi > 0 ? istatistik.tezgahSayisi.toLocaleString("tr-TR") : "—", l: t.stat3 },
          { n: String(istatistik.ulkeSayisi), l: t.stat4 },
        ].map((s, i) => (
          <div key={i} className={`px-8 py-6 border-[#DDE8F0] ${i < 3 ? "border-r" : ""} ${i < 2 ? "border-b md:border-b-0" : ""}`}>
            <div className="text-[26px] font-light text-[#003057] tracking-[-0.5px]"><span className="text-[#0077CC]">{s.n}</span></div>
            <div className="text-[10px] text-[#8A98A8] tracking-[0.5px] uppercase mt-[2px]">{s.l}</div>
          </div>
        ))}
      </section>

      {/* Audience — İki Yol */}
      <section className="grid grid-cols-1 md:grid-cols-2 border-b border-[#DDE8F0]">

        {/* Üretici — koyu, navy */}
        <Link href="/kayit/fasoncu"
          className="group relative px-10 py-14 bg-[#003057] no-underline overflow-hidden transition-all duration-300 hover:bg-[#004080] cursor-pointer block">
          {/* Dekoratif arka plan çizgi */}
          <div className="absolute right-0 top-0 bottom-0 w-[3px] bg-[#0077CC] opacity-60 group-hover:opacity-100 transition-opacity" />
          <div className="absolute bottom-8 right-8 text-[80px] font-extralight text-white/5 leading-none select-none group-hover:text-white/10 transition-all">U</div>

          <div className="text-[13px] tracking-[2px] uppercase text-[#7ABFFF] mb-4 font-bold">
            {t.fasoncuEyebrow}
          </div>
          <h2 className="text-[19px] font-medium text-white leading-[1.35] mb-3 max-w-[340px]">
            {t.fasoncuBaslik}
          </h2>
          <p className="text-[13px] text-white/60 leading-[1.8] mb-8 max-w-[340px]">
            {t.fasoncuAlt}
          </p>

          <div className="flex flex-col gap-3 mb-10">
            {[t.fasoncuStep1, t.fasoncuStep2, t.fasoncuStep3].map((step, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="w-[20px] h-[20px] rounded-full border border-[#7ABFFF]/50 text-[#7ABFFF] flex items-center justify-center text-[9px] font-semibold flex-shrink-0 mt-[2px] group-hover:border-[#7ABFFF] transition-colors">
                  {i + 1}
                </div>
                <div className="text-[12px] text-white/70 leading-[1.6]">{step}</div>
              </div>
            ))}
          </div>

          <div className="inline-flex items-center gap-3 px-6 py-3 bg-white text-[#003057] rounded-[2px] text-[11px] font-semibold tracking-[1.5px] uppercase group-hover:bg-[#7ABFFF] transition-colors">
            {t.fasoncuCta}
            <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
          </div>
        </Link>

        {/* Sipariş Veren — açık, güçlü hover */}
        <Link href="/kayit/alici"
          className="group relative px-10 py-14 bg-[#F7FAFC] no-underline overflow-hidden transition-all duration-300 hover:bg-[#E0F0E8] cursor-pointer block border-t md:border-t-0 md:border-l border-[#DDE8F0]">
          {/* Dekoratif sol çizgi — hover'da kalınlaşır */}
          <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#1A7A4A] opacity-50 group-hover:opacity-100 group-hover:w-[6px] transition-all duration-300" />
          <div className="absolute bottom-8 right-8 text-[80px] font-extralight text-[#1A7A4A]/5 leading-none select-none group-hover:text-[#1A7A4A]/15 transition-all">S</div>

          <div className="text-[13px] tracking-[2px] uppercase text-[#1A7A4A] mb-4 font-bold">
            {t.aliciEyebrow}
          </div>
          <h2 className="text-[19px] font-medium text-[#003057] leading-[1.35] mb-3 max-w-[340px] group-hover:text-[#1A7A4A] transition-colors">
            {t.aliciBaslik}
          </h2>
          <p className="text-[13px] text-[#3D4E63] leading-[1.8] mb-8 max-w-[340px]">
            {t.aliciAlt}
          </p>

          <div className="flex flex-col gap-3 mb-10">
            {[t.aliciStep1, t.aliciStep2, t.aliciStep3].map((step, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="w-[22px] h-[22px] rounded-full bg-[#1A7A4A]/10 border border-[#1A7A4A]/50 text-[#1A7A4A] flex items-center justify-center text-[9px] font-bold flex-shrink-0 mt-[2px] group-hover:bg-[#1A7A4A] group-hover:text-white group-hover:border-[#1A7A4A] transition-all">
                  {i + 1}
                </div>
                <div className="text-[12px] text-[#4A5568] leading-[1.6] group-hover:text-[#1A2535] transition-colors">{step}</div>
              </div>
            ))}
          </div>

          <div className="inline-flex items-center gap-3 px-6 py-3 bg-[#1A7A4A] text-white rounded-[2px] text-[11px] font-semibold tracking-[1.5px] uppercase group-hover:bg-[#0f5c34] transition-colors shadow-sm">
            {t.aliciCta}
            <span className="group-hover:translate-x-2 transition-transform duration-200 inline-block">→</span>
          </div>
        </Link>

      </section>

      {/* Nasıl çalışır */}
      <section id="nasil-calisir" className="px-8 py-[60px] bg-[#F0F7FF] border-b border-[#DDE8F0]">
        <div className="text-[10px] tracking-[4px] uppercase text-[#0077CC] mb-2">{t.surecEyebrow}</div>
        <div className="text-[22px] font-light text-[#1A2535] mb-[44px]">{t.surecBaslik}</div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0">
          {[
            { n: "01", t: dil === "TR" ? "Kayıt & Profil" : dil === "EN" ? "Register & Profile" : "Registrierung", d: dil === "TR" ? "Firma ve tezgah bilgilerini gir" : dil === "EN" ? "Enter your machines and certifications" : "Maschinen und Zertifikate eingeben" },
            { n: "02", t: dil === "TR" ? "Eşleşme" : dil === "EN" ? "Matching" : "Matching", d: dil === "TR" ? "Alıcı arar, uygun firmalar sıralanır" : dil === "EN" ? "Buyer searches, matched suppliers listed" : "Einkäufer sucht, Anbieter gelistet" },
            { n: "03", t: dil === "TR" ? "İletişim" : dil === "EN" ? "Communication" : "Kommunikation", d: dil === "TR" ? "Güvenli mesajlaşma ve RFQ süreci" : dil === "EN" ? "Secure messaging and RFQ process" : "Sicheres Messaging und RFQ" },
            { n: "04", t: dil === "TR" ? "İş" : dil === "EN" ? "Business" : "Auftrag", d: dil === "TR" ? "Üretim ve teslimat dışarıda yürür" : dil === "EN" ? "Production and delivery outside platform" : "Produktion außerhalb der Plattform" },
          ].map((h, i) => (
            <div key={h.n} className={`py-5 lg:py-0 ${i < 3 ? "lg:pr-7 lg:border-r border-[#DDE8F0]" : ""} ${i > 0 ? "lg:pl-7" : ""} ${i < 3 ? "border-b lg:border-b-0 border-[#DDE8F0]" : ""}`}>
              <div className="text-[40px] font-extralight text-[#C8D8E8] mb-[14px] leading-none">{h.n}</div>
              <div className="text-[12px] font-medium text-[#003057] tracking-[0.5px] uppercase mb-2">{h.t}</div>
              <div className="text-[12px] text-[#4A5568] leading-[1.7]">{h.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Tezgah kategorileri */}
      <section className="px-8 py-[52px] border-b border-[#DDE8F0]">
        <div className="text-[10px] tracking-[4px] uppercase text-[#0077CC] mb-2">{t.katEyebrow}</div>
        <div className="text-[22px] font-light text-[#1A2535] mb-7">{t.katBaslik}</div>
        <div className="flex flex-wrap gap-2">
          {KATEGORILER.map((k) => (
            <Link key={k} href={`/ara?kategori=${encodeURIComponent(k)}`}
              className="px-[18px] py-2 border border-[#C8D8E8] rounded-[2px] text-[12px] text-[#4A5568] tracking-[0.3px] bg-white hover:border-[#00529C] hover:text-[#00529C] hover:bg-[#F0F7FF] transition-all no-underline">
              {k}
            </Link>
          ))}
        </div>
      </section>

      {/* Platform güvencesi */}
      <section className="px-8 py-[60px] bg-[#003057] border-b border-[#004080]">
        <div className="text-[10px] tracking-[4px] uppercase text-white/40 mb-2">{t.nedenEyebrow}</div>
        <div className="text-[22px] font-light text-white mb-9">{t.nedenBaslik}</div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0">
          {GUVEN.map((g, i) => (
            <div key={g.baslik} className={["py-7", i % 3 !== 2 ? "lg:border-r border-white/10" : "", i % 3 === 0 ? "lg:pr-7" : i % 3 === 2 ? "lg:pl-7" : "lg:px-7", i >= 3 ? "border-t border-white/10" : ""].filter(Boolean).join(" ")}>
              <div className="w-6 h-[2px] bg-[#0077CC] mb-[14px]" />
              <div className="text-[12px] font-medium text-white tracking-[0.5px] uppercase mb-[6px]">{g.baslik}</div>
              <div className="text-[12px] text-white/55 leading-[1.7]">{g.aciklama}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Alıcı ülkeler */}
      <section className="px-8 py-12 bg-[#F0F7FF] border-b border-[#DDE8F0]">
        <div className="text-[10px] tracking-[4px] uppercase text-[#0077CC] mb-2">{t.ulkeEyebrow}</div>
        <div className="text-[22px] font-light text-[#1A2535] mb-6">{t.ulkeBaslik}</div>
        <div className="flex flex-wrap border border-[#DDE8F0] rounded-[2px] overflow-hidden">
          {ULKELER.map((u) => (
            <div key={u} className="flex items-center gap-2 px-5 py-3 text-[12px] text-[#3D4E63] border-r border-b border-[#DDE8F0] bg-white tracking-[0.3px] w-1/2 md:w-auto hover:bg-[#E8F2FA] hover:text-[#003057] transition-colors cursor-default">
              <span className="w-[5px] h-[5px] rounded-full bg-[#0077CC] flex-shrink-0" />
              {u}
            </div>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="px-8 py-[72px] text-center bg-gradient-to-br from-[#003057] to-[#00529C]">
        <div className="text-[10px] tracking-[4px] uppercase text-white/40 mb-3">{t.ctaEyebrow}</div>
        <div className="text-[28px] font-light text-white mb-[10px]">{t.ctaBaslik}</div>
        <p className="text-[13px] text-white/60 mb-10 leading-[1.8] whitespace-pre-line">{t.ctaAlt}</p>
        <div className="flex gap-[14px] justify-center flex-wrap">
          <Link href="/kayit/fasoncu"
            className="px-8 py-[13px] bg-white text-[#003057] rounded-[2px] text-[12px] tracking-[1px] uppercase font-medium hover:bg-[#E8F2FA] transition-colors no-underline">
            {t.ctaBtn1}
          </Link>
          <Link href="/giris"
            className="px-8 py-[13px] bg-transparent text-white border border-white/40 rounded-[2px] text-[12px] tracking-[1px] uppercase hover:border-white transition-colors no-underline">
            {t.ctaBtn2}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-8 py-5 bg-[#003057] border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="text-[12px] tracking-[2px] text-white/40 uppercase">
          RENT<span className="text-[#7ABFFF]">CNC</span>MACHINE
        </div>
        <nav className="flex flex-wrap gap-6 justify-center">
          <Link href="/kvkk" className="text-[11px] text-white/30 hover:text-white/70 tracking-[0.3px] transition-colors no-underline">KVKK</Link>
          <Link href="/kullanim-kosullari" className="text-[11px] text-white/30 hover:text-white/70 tracking-[0.3px] transition-colors no-underline">{dil === "DE" ? "AGB" : dil === "EN" ? "Terms" : "Kullanım Koşulları"}</Link>
          <Link href="/abonelik-sartlari" className="text-[11px] text-white/30 hover:text-white/70 tracking-[0.3px] transition-colors no-underline">{dil === "DE" ? "Abonnement" : dil === "EN" ? "Subscription" : "Abonelik"}</Link>
          <span className="text-[11px] text-white/30 tracking-[0.3px]">© 2026</span>
        </nav>
      </footer>
    </div>
  );
}
