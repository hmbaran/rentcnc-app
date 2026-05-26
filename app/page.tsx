import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "RentCNCmachine — CNC Kapasite Pazaryeri",
  description:
    "Türkiye'nin CNC kapasitesini dünyaya açıyoruz. Atıl CNC kapasitesi olan fasoncu firmalar ile global alıcıları güvenli ve hızlı şekilde buluşturuyoruz.",
};

const KATEGORILER = [
  "CNC Freze (3–5 Eksen)", "CNC Torna", "5 Eksen İşleme", "Tel Erozyon (EDM)",
  "Dalma Erozyon", "Kayar Otomat", "Silindirik Taşlama", "Yüzey Taşlama",
  "Fiber Lazer Kesim", "CNC Abkant", "Turn-Mill", "Gantry Freze",
  "Koordinat Taşlama", "Honlama",
];

const GUVEN = [
  { baslik: "Doğrulanmış profiller", aciklama: "ISO 9001, IATF 16949, AS9100 sertifikaları doğrulanır" },
  { baslik: "Güvenli iletişim", aciklama: "İletişim bilgileri anlaşmaya kadar gizli tutulur" },
  { baslik: "Çok dilli destek", aciklama: "TR, EN, DE, FR, IT, ES — otomatik çeviri" },
  { baslik: "Teknik filtreler", aciklama: "Tezgah tipi, eksen, boyut, malzeme, sertifika, şehir" },
  { baslik: "Gerçek değerlendirmeler", aciklama: "Tamamlanan her iş sonrası alıcı puanı ve yorumu" },
  { baslik: "Alıcıya ücretsiz", aciklama: "Arama ve iletişim alıcılar için tamamen ücretsiz" },
];

const ULKELER = [
  "Almanya", "İtalya", "Fransa", "İngiltere", "ABD", "Hollanda",
  "İsveç", "Japonya", "Kore", "İsviçre", "Avusturya", "Belçika",
];

export default function AnaSayfa() {
  return (
    <div className="min-h-screen bg-white text-[#1A2535] font-sans text-[14px] leading-relaxed">

      {/* Topbar */}
      <header className="bg-[#003057] px-8 h-[60px] flex items-center gap-6 sticky top-0 z-50">
        <div className="text-[14px] font-light tracking-[3px] text-white uppercase flex-shrink-0">
          RENT<span className="font-semibold text-[#7ABFFF]">CNC</span>MACHINE
        </div>
        <nav className="hidden md:flex gap-7 ml-7">
          <span className="text-[12px] text-white/40 tracking-[0.5px] cursor-not-allowed select-none">Fabrika Bul</span>
          <Link href="/kayit/fasoncu" className="text-[12px] text-white/60 tracking-[0.5px] hover:text-white transition-colors no-underline">Kapasite Listele</Link>
          <a href="#nasil-calisir" className="text-[12px] text-white/60 tracking-[0.5px] hover:text-white transition-colors no-underline">Nasıl Çalışır</a>
          <span className="text-[12px] text-white/40 tracking-[0.5px] cursor-not-allowed select-none">Fiyatlar</span>
        </nav>
        <div className="ml-auto flex gap-[10px] items-center">
          <Link
            href="/giris"
            className="hidden md:inline-block text-[12px] text-white/85 border border-white/30 rounded-[2px] px-5 py-2 hover:border-white hover:text-white transition-colors no-underline"
          >
            Giriş Yap
          </Link>
          <Link
            href="/kayit/fasoncu"
            className="text-[12px] bg-[#0077CC] text-white rounded-[2px] px-5 py-2 hover:bg-[#0066B0] transition-colors no-underline"
          >
            Ücretsiz Kayıt
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#003057] via-[#004080] to-[#0077CC] px-8 pt-[72px] pb-0 md:px-8">
        <div className="max-w-[640px]">
          <div className="text-[10px] tracking-[4px] uppercase text-white/50 mb-[18px]">
            CNC Kapasite Pazaryeri
          </div>
          <h1 className="text-[34px] md:text-[34px] text-[24px] font-light leading-[1.2] text-white mb-[18px]">
            Türkiye&apos;nin CNC kapasitesini{" "}
            <strong className="font-medium text-[#7ABFFF]">dünyaya açıyoruz</strong>
          </h1>
          <p className="text-[14px] text-white/70 max-w-[520px] leading-[1.8] mb-[40px]">
            Atıl CNC kapasitesi olan fasoncu firmalar ile dünyanın dört bir yanından iş arayan alıcıları güvenli ve hızlı şekilde buluşturuyoruz.
          </p>
          <div className="flex flex-wrap gap-3 mb-[56px]">
            <Link
              href="/kayit/fasoncu"
              className="px-8 py-[13px] bg-white text-[#003057] rounded-[2px] text-[12px] tracking-[1px] uppercase font-medium hover:bg-[#E8F2FA] transition-colors no-underline"
            >
              Kapasitemi Listele
            </Link>
            <span className="px-8 py-[13px] bg-transparent text-white border border-white/40 rounded-[2px] text-[12px] tracking-[1px] uppercase cursor-not-allowed opacity-60 select-none">
              CNC Fabrika Bul
            </span>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="bg-white border-b border-[#DDE8F0] grid grid-cols-2 md:grid-cols-4">
        {[
          { n: "247+", l: "Kayıtlı Fasoncu" },
          { n: "89", l: "Aktif Alıcı" },
          { n: "1.840", l: "Kayıtlı Tezgah" },
          { n: "23", l: "Ülke" },
        ].map((s, i) => (
          <div
            key={s.l}
            className={`px-8 py-6 border-[#DDE8F0] ${i < 3 ? "border-r" : ""} ${i < 2 ? "border-b md:border-b-0" : ""}`}
          >
            <div className="text-[26px] font-light text-[#003057] tracking-[-0.5px]">
              <span className="text-[#0077CC]">{s.n}</span>
            </div>
            <div className="text-[10px] text-[#8A98A8] tracking-[0.5px] uppercase mt-[2px]">{s.l}</div>
          </div>
        ))}
      </section>

      {/* Audience */}
      <section className="grid grid-cols-1 md:grid-cols-2 border-b border-[#DDE8F0]">
        {/* Fasoncu */}
        <div className="px-8 py-12 border-b md:border-b-0 md:border-r border-[#DDE8F0] hover:bg-[#F7F9FC] transition-colors">
          <div className="text-[10px] tracking-[3px] uppercase text-[#00529C] mb-[14px]">Fasoncu Firma</div>
          <h2 className="text-[20px] font-light text-[#1A2535] leading-[1.3] mb-[10px] max-w-[300px]">
            Atıl CNC kapasitenizi gelire dönüştürün
          </h2>
          <p className="text-[13px] text-[#3D4E63] leading-[1.8] mb-[26px]">
            Tezgahlarınız boş dururken Almanya&apos;dan, İtalya&apos;dan, Japonya&apos;dan alıcılar sizi arıyor.
          </p>
          <div className="flex flex-col gap-[10px] mb-[28px]">
            {[
              "Tezgah parkurunu ve sertifikaları 15 dakikada girin",
              "Global alıcılardan RFQ talepleri alın",
              "Platform üzerinden görüşün, anlaşın, işi alın",
            ].map((step, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="w-[22px] h-[22px] rounded-full border border-[#00529C] text-[#00529C] flex items-center justify-center text-[10px] font-medium flex-shrink-0 mt-[1px]">
                  {i + 1}
                </div>
                <div className="text-[12px] text-[#3D4E63] leading-[1.6]">{step}</div>
              </div>
            ))}
          </div>
          <Link
            href="/kayit/fasoncu"
            className="text-[11px] tracking-[2px] uppercase text-[#00529C] no-underline hover:tracking-[14px] transition-all duration-200 inline-flex items-center gap-2 after:content-['→']"
          >
            30 gün ücretsiz dene
          </Link>
        </div>

        {/* Alıcı */}
        <div className="px-8 py-12 bg-[#F0F7FF] hover:bg-[#E8F2FA] transition-colors">
          <div className="text-[10px] tracking-[3px] uppercase text-[#1A7A4A] mb-[14px]">Alıcı Firma</div>
          <h2 className="text-[20px] font-light text-[#1A2535] leading-[1.3] mb-[10px] max-w-[300px]">
            Türkiye&apos;nin en iyi CNC fabrikalarına ulaşın
          </h2>
          <p className="text-[13px] text-[#3D4E63] leading-[1.8] mb-[26px]">
            ISO sertifikalı, 5 eksen kabiliyetli fasoncu firmalar — detaylı profiller ve gerçek değerlendirmelerle.
          </p>
          <div className="flex flex-col gap-[10px] mb-[28px]">
            {[
              "Tezgah tipi, malzeme, sertifika ile filtreleyin",
              "Profilleri inceleyin, RFQ gönderin",
              "Platform üzerinden iletişim — ücretsiz",
            ].map((step, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="w-[22px] h-[22px] rounded-full border border-[#1A7A4A] text-[#1A7A4A] flex items-center justify-center text-[10px] font-medium flex-shrink-0 mt-[1px]">
                  {i + 1}
                </div>
                <div className="text-[12px] text-[#3D4E63] leading-[1.6]">{step}</div>
              </div>
            ))}
          </div>
          <Link
            href="/kayit/alici"
            className="text-[11px] tracking-[2px] uppercase text-[#1A7A4A] no-underline hover:tracking-[14px] transition-all duration-200 inline-flex items-center gap-2 after:content-['→']"
          >
            Ücretsiz ara
          </Link>
        </div>
      </section>

      {/* Nasıl çalışır */}
      <section id="nasil-calisir" className="px-8 py-[60px] bg-[#F0F7FF] border-b border-[#DDE8F0]">
        <div className="text-[10px] tracking-[4px] uppercase text-[#0077CC] mb-2">Süreç</div>
        <div className="text-[22px] font-light text-[#1A2535] mb-[44px]">Nasıl çalışır?</div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0">
          {[
            { n: "01", t: "Kayıt & Profil", d: "Firma ve tezgah bilgilerini gir" },
            { n: "02", t: "Eşleşme", d: "Alıcı arar, uygun firmalar sıralanır" },
            { n: "03", t: "İletişim", d: "Güvenli mesajlaşma ve RFQ süreci" },
            { n: "04", t: "İş", d: "Üretim ve teslimat dışarıda yürür" },
          ].map((h, i) => (
            <div
              key={h.n}
              className={`py-5 lg:py-0 ${i < 3 ? "lg:pr-7 lg:border-r border-[#DDE8F0]" : ""} ${i > 0 ? "lg:pl-7" : ""} ${i < 3 ? "border-b lg:border-b-0 border-[#DDE8F0]" : ""}`}
            >
              <div className="text-[40px] font-extralight text-[#C8D8E8] mb-[14px] leading-none">{h.n}</div>
              <div className="text-[12px] font-medium text-[#003057] tracking-[0.5px] uppercase mb-2">{h.t}</div>
              <div className="text-[12px] text-[#4A5568] leading-[1.7]">{h.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Tezgah kategorileri */}
      <section className="px-8 py-[52px] border-b border-[#DDE8F0]">
        <div className="text-[10px] tracking-[4px] uppercase text-[#0077CC] mb-2">Tezgah Kategorileri</div>
        <div className="text-[22px] font-light text-[#1A2535] mb-7">Tüm CNC kategorileri</div>
        <div className="flex flex-wrap gap-2">
          {KATEGORILER.map((k) => (
            <span
              key={k}
              className="px-[18px] py-2 border border-[#C8D8E8] rounded-[2px] text-[12px] text-[#4A5568] tracking-[0.3px] bg-white cursor-default"
            >
              {k}
            </span>
          ))}
        </div>
      </section>

      {/* Platform güvencesi */}
      <section className="px-8 py-[60px] bg-[#003057] border-b border-[#004080]">
        <div className="text-[10px] tracking-[4px] uppercase text-white/40 mb-2">Neden Biz</div>
        <div className="text-[22px] font-light text-white mb-9">Platform güvencesi</div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0">
          {GUVEN.map((g, i) => (
            <div
              key={g.baslik}
              className={[
                "py-7",
                i % 3 !== 2 ? "lg:border-r border-white/10" : "",
                i % 3 === 0 ? "lg:pr-7" : i % 3 === 2 ? "lg:pl-7" : "lg:px-7",
                i >= 3 ? "border-t border-white/10" : "",
                i < 3 ? "" : "",
                i < (GUVEN.length - (GUVEN.length % 3 || 3)) ? "" : "",
              ].filter(Boolean).join(" ")}
            >
              <div className="w-6 h-[2px] bg-[#0077CC] mb-[14px]" />
              <div className="text-[12px] font-medium text-white tracking-[0.5px] uppercase mb-[6px]">{g.baslik}</div>
              <div className="text-[12px] text-white/55 leading-[1.7]">{g.aciklama}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Alıcı ülkeler */}
      <section className="px-8 py-12 bg-[#F0F7FF] border-b border-[#DDE8F0]">
        <div className="text-[10px] tracking-[4px] uppercase text-[#0077CC] mb-2">Global Erişim</div>
        <div className="text-[22px] font-light text-[#1A2535] mb-6">Alıcı ülkeler</div>
        <div className="flex flex-wrap border border-[#DDE8F0] rounded-[2px] overflow-hidden">
          {ULKELER.map((u) => (
            <div
              key={u}
              className="flex items-center gap-2 px-5 py-3 text-[12px] text-[#3D4E63] border-r border-b border-[#DDE8F0] bg-white tracking-[0.3px] w-1/2 md:w-auto"
            >
              <span className="w-[5px] h-[5px] rounded-full bg-[#0077CC] flex-shrink-0" />
              {u}
            </div>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="px-8 py-[72px] text-center bg-gradient-to-br from-[#003057] to-[#00529C]">
        <div className="text-[10px] tracking-[4px] uppercase text-white/40 mb-3">Hemen Başlayın</div>
        <div className="text-[28px] font-light text-white mb-[10px]">İlk 30 gün tamamen ücretsiz</div>
        <p className="text-[13px] text-white/60 mb-10 leading-[1.8]">
          Fasoncu iseniz kapasitenizi listeleyin ve global alıcılara görünür olun.<br />
          Alıcıysanız Türkiye&apos;nin en iyi CNC fabrikalarını ücretsiz arayın.
        </p>
        <div className="flex gap-[14px] justify-center flex-wrap">
          <Link
            href="/kayit/fasoncu"
            className="px-8 py-[13px] bg-white text-[#003057] rounded-[2px] text-[12px] tracking-[1px] uppercase font-medium hover:bg-[#E8F2FA] transition-colors no-underline"
          >
            Fasoncu Kaydı
          </Link>
          <Link
            href="/giris"
            className="px-8 py-[13px] bg-transparent text-white border border-white/40 rounded-[2px] text-[12px] tracking-[1px] uppercase hover:border-white transition-colors no-underline"
          >
            Alıcı Girişi
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-8 py-5 bg-[#003057] border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="text-[12px] tracking-[2px] text-white/40 uppercase">
          RENT<span className="text-[#7ABFFF]">CNC</span>MACHINE
        </div>
        <nav className="flex flex-wrap gap-6 justify-center">
          {[
            { label: "KVKK", href: "#kvkk" },
            { label: "Gizlilik", href: "#gizlilik" },
            { label: "İletişim", href: "#iletisim" },
            { label: "© 2025", href: "#" },
          ].map((l) => (
            <a key={l.label} href={l.href} className="text-[11px] text-white/30 hover:text-white/70 tracking-[0.3px] transition-colors no-underline">
              {l.label}
            </a>
          ))}
        </nav>
      </footer>
    </div>
  );
}
