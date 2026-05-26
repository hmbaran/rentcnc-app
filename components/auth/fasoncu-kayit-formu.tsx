"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { fasoncuAdim1Schema, type FasoncuAdim1Data } from "@/lib/validations/auth";
import { fasoncuKayitYap } from "@/lib/actions/auth";
import { tezgahHiyerarsisi, TEZGAH_TIP_SECENEKLERI, KONTROL_SISTEMLERI } from "@/lib/data/tezgah-hiyerarsisi";

// ─── Sabitler ───────────────────────────────────────────────────────────────

const ADIM_BASLIKLARI = ["Firma Bilgileri", "Tezgah Parkuru", "Yetenekler", "Kalite", "Kapasite", "Görseller", "Plan Seçimi"];
const ADIM_KISA = ["Firma", "Tezgah", "Yetenekler", "Kalite", "Kapasite", "Görseller", "Plan"];
const ADIM_YUZDELERI = [14, 28, 42, 57, 71, 86, 100];

const IL_LISTESI = ["İstanbul", "Ankara", "İzmir", "Bursa", "Kocaeli", "Konya", "Gaziantep", "Denizli", "Diğer"];
const KURULUS_YILLARI = ["2024", "2023", "2022", "2020", "2015", "2010", "2005", "2000", "1995", "1990", "Daha önce"];
const CALISAN_ARALIK = ["1–10 kişi", "11–50 kişi", "51–200 kişi", "200+ kişi"];

const ISLEME_TURLERI = ["Frezeleme", "Tornalama", "Taşlama", "EDM (erozyon)", "Tel erozyon", "Honlama", "Delik delme", "Diş çekme", "Lazer kesim", "Abkant bükme", "Kaynak"];
const MALZEME_UZMANLIGI = ["Çelik", "Paslanmaz çelik", "Alüminyum", "Titanyum", "Bakır / Pirinç", "Takım çeliği", "Dökme demir", "Plastik / PEEK", "Inconel"];
const OZEL_YETENEKLER = ["Prototip üretimi", "Seri üretim", "Tight tolerance ±0.01mm", "Yüzey işleme", "CAD/CAM desteği", "Tersine mühendislik", "Montaj"];
const SERTIFIKALAR = ["ISO 9001:2015", "ISO 14001", "IATF 16949", "AS9100D", "ISO 13485", "CE belgesi", "TSE belgesi", "Henüz yok"];
const OLCUM_EKIPMANLARI = ["CMM (3B ölçüm)", "Koordinat ölçüm", "Yüzey pürüzlülük", "Dijital kumpas", "Optik ölçüm", "Sertlik ölçer"];

const PLANLAR = [
  { id: "ucretsiz" as const, etiket: "Başlangıç", ad: "Ücretsiz", aciklama: "Platforma alış", fiyat: "₺0", fiyatAlt: "Süresiz", badge: null, popular: false, ozellikler: [{ var: true, metin: "Firma profili" }, { var: true, metin: "3 tezgah listesi" }, { var: true, metin: "Aylık 5 RFQ" }, { var: false, metin: "Doğrulama rozeti" }, { var: false, metin: "Öncelikli görünüm" }] },
  { id: "baslangic" as const, etiket: "Aktif", ad: "Başlangıç", aciklama: "Küçük atölye", fiyat: "₺1.490", fiyatAlt: "/ yıl · aylık ₺149", badge: "30 GÜN ÜCRETSİZ", popular: false, ozellikler: [{ var: true, metin: "Sınırsız tezgah" }, { var: true, metin: "Aylık 25 RFQ" }, { var: true, metin: "Doğrulama rozeti" }, { var: true, metin: "3 yetkili kullanıcı" }, { var: false, metin: "Öncelikli görünüm" }] },
  { id: "profesyonel" as const, etiket: "Önerilen", ad: "Profesyonel", aciklama: "Orta-büyük firma", fiyat: "₺3.490", fiyatAlt: "/ yıl · aylık ₺349", badge: "30 GÜN ÜCRETSİZ", popular: true, ozellikler: [{ var: true, metin: "Sınırsız tezgah" }, { var: true, metin: "Sınırsız RFQ" }, { var: true, metin: "Doğrulama rozeti" }, { var: true, metin: "Öncelikli görünüm" }, { var: true, metin: "10 yetkili kullanıcı" }, { var: true, metin: "Analitik raporlar" }] },
  { id: "kurumsal" as const, etiket: "Premium", ad: "Kurumsal", aciklama: "Büyük üretici", fiyat: "₺7.490", fiyatAlt: "/ yıl · aylık ₺749", badge: "30 GÜN ÜCRETSİZ", popular: false, ozellikler: [{ var: true, metin: "Profesyonel tüm özellikler" }, { var: true, metin: "API erişimi" }, { var: true, metin: "Sınırsız kullanıcı" }, { var: true, metin: "Özel hesap yöneticisi" }, { var: true, metin: "SLA garantisi" }, { var: true, metin: "Özel entegrasyonlar" }] },
];

const PLAN_OZET: Record<string, { ad: string; fiyat: string; deneme: string; ilkOdeme: string }> = {
  ucretsiz: { ad: "Ücretsiz", fiyat: "₺0 (süresiz)", deneme: "Deneme gerekmez", ilkOdeme: "—" },
  baslangic: { ad: "Başlangıç", fiyat: "₺1.490 / yıl (₺149/ay)", deneme: "30 gün ücretsiz", ilkOdeme: "17 Haziran 2026" },
  profesyonel: { ad: "Profesyonel", fiyat: "₺3.490 / yıl (₺349/ay)", deneme: "30 gün ücretsiz", ilkOdeme: "17 Haziran 2026" },
  kurumsal: { ad: "Kurumsal", fiyat: "₺7.490 / yıl (₺749/ay)", deneme: "30 gün ücretsiz", ilkOdeme: "17 Haziran 2026" },
};

// ─── Tipler ─────────────────────────────────────────────────────────────────

type AktifTezgah = {
  tip: string; alt: string; eksen: string; marka: string; markaManuel: string;
  model: string; bagX: string; bagY: string; bagZ: string; maxRpm: string;
  yapimYili: string; kontrolSistemi: string; durum: string;
};

type KaydedilenTezgah = { id: number; label: string; veri: AktifTezgah };

type SecimSet = Set<string>;

const BOŞ_TEZGAH: AktifTezgah = {
  tip: "", alt: "", eksen: "", marka: "", markaManuel: "",
  model: "", bagX: "", bagY: "", bagZ: "", maxRpm: "",
  yapimYili: "", kontrolSistemi: "", durum: "",
};

// ─── Küçük yardımcı bileşenler ──────────────────────────────────────────────

function ChipSecici({ degerler, secili, onToggle }: { degerler: string[]; secili: SecimSet; onToggle: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-[6px] mt-1">
      {degerler.map((d) => (
        <button key={d} type="button" onClick={() => onToggle(d)}
          className={`px-3 py-[6px] border rounded-[2px] text-[11px] cursor-pointer transition-all duration-150 tracking-[0.2px] ${secili.has(d) ? "bg-[#003057] border-[#003057] text-white" : "bg-white border-[#C8D8E8] text-[#4A5568] hover:border-[#00529C] hover:text-[#00529C]"}`}>
          {d}
        </button>
      ))}
    </div>
  );
}

function Kart({ baslik, children }: { baslik: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-[#DDE8F0] rounded-[4px] p-5 mb-[14px]">
      <div className="text-[12px] font-medium text-[#003057] uppercase tracking-[0.3px] mb-[14px] pb-[10px] border-b border-[#DDE8F0]">
        {baslik}
      </div>
      {children}
    </div>
  );
}

function FormField({ label, required, hint, hata, children }: { label: React.ReactNode; required?: boolean; hint?: string; hata?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-[5px]">
      <label className="text-[11px] text-[#4A5568] font-medium uppercase tracking-[0.3px]">
        {label} {required && <span className="text-[#0077CC]">*</span>}
      </label>
      {children}
      {hint && <p className="text-[10px] text-[#8A98A8] tracking-[0.2px]">{hint}</p>}
      {hata && <p className="text-[10px] text-red-600">{hata}</p>}
    </div>
  );
}

const inputCls = "w-full px-3 py-[9px] border border-[#C8D8E8] rounded-[3px] bg-white text-[#1A2535] text-[13px] outline-none focus:border-[#00529C] transition-colors duration-150";
const selectCls = inputCls;
const textareaCls = `${inputCls} resize-y min-h-[80px]`;

// ─── Adım Panelleri ─────────────────────────────────────────────────────────

function Adim1({ form }: { form: ReturnType<typeof useForm<FasoncuAdim1Data>> }) {
  const { register, setValue, formState: { errors } } = form;
  const [sifreGoster, setSifreGoster] = useState(false);
  const [sifreTekrarGoster, setSifreTekrarGoster] = useState(false);

  // Simüle GİB autofill
  function vknDegisti(v: string) {
    if (v.length === 10) {
      setValue("ticariUnvan", "ÖRNEK MAKİNA SANAYİ VE TİC. LTD. ŞTİ.", { shouldValidate: false });
      setValue("il", "Bursa", { shouldValidate: false });
      setValue("ilce", "Nilüfer", { shouldValidate: false });
      setValue("adres", "Organize Sanayi Bölgesi, Makina Cad. No:42, 16140 Nilüfer / Bursa", { shouldValidate: false });
    }
  }

  return (
    <div>
      <p className="text-[9px] tracking-[3px] uppercase text-[#0077CC] mb-[6px]">Adım 1</p>
      <h2 className="text-[14px] font-medium text-[#003057] mb-4">Temel Firma Bilgileri</h2>

      <div className="bg-[#F0F7FF] border-l-[3px] border-[#00529C] px-[14px] py-[10px] rounded-[0_3px_3px_0] text-[11px] text-[#004080] mb-[14px] leading-[1.6] tracking-[0.2px]">
        Vergi numaranızı girin — firma adı ve adres bilgileri GİB kayıtlarından otomatik yüklenir.
      </div>

      <Kart baslik="Kimlik Bilgileri">
        <div className="grid grid-cols-2 gap-[14px] mb-[14px]">
          <FormField label="Vergi Numarası" required hint="VKN — 10 haneli" hata={errors.vkn?.message}>
            <input {...register("vkn", { onChange: (e) => vknDegisti(e.target.value) })}
              type="text" maxLength={10} placeholder="10 haneli VKN" className={inputCls} />
          </FormField>
          <FormField label={<>Ticari Ünvan <span className="text-[9px] bg-[#E8F5EE] text-[#1A7A4A] px-[6px] py-[1px] rounded-[2px] ml-[6px] uppercase tracking-[0.5px]">Otomatik</span></>} hata={errors.ticariUnvan?.message}>
            <input {...register("ticariUnvan")} type="text" placeholder="GİB'ten yüklenir" className={inputCls} />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-[14px] mb-[14px]">
          <FormField label="İl" required hata={errors.il?.message}>
            <select {...register("il")} className={selectCls}>
              <option value="">Seçin...</option>
              {IL_LISTESI.map((il) => <option key={il}>{il}</option>)}
            </select>
          </FormField>
          <FormField label="İlçe" required hata={errors.ilce?.message}>
            <input {...register("ilce")} type="text" placeholder="İlçe adı" className={inputCls} />
          </FormField>
        </div>
        <FormField label="Tam Adres" required hata={errors.adres?.message}>
          <textarea {...register("adres")} placeholder="Mahalle, cadde, sokak, bina no..." className={textareaCls} />
        </FormField>
      </Kart>

      <Kart baslik="İletişim & Hesap Bilgileri">
        <div className="grid grid-cols-2 gap-[14px] mb-[14px]">
          <FormField label="Yetkili Kişi" required hata={errors.yetkiliKisi?.message}>
            <input {...register("yetkiliKisi")} type="text" placeholder="Ad Soyad" className={inputCls} />
          </FormField>
          <FormField label="Telefon" required hata={errors.telefon?.message}>
            <input {...register("telefon")} type="text" placeholder="+90 5__ ___ __ __" className={inputCls} />
          </FormField>
        </div>

        <FormField label="E-posta (Giriş için kullanılacak)" required hata={errors.email?.message}>
          <input {...register("email")} type="email" placeholder="firma@ornek.com" autoComplete="email" className={inputCls} />
        </FormField>

        <div className="grid grid-cols-2 gap-[14px] mt-[14px] mb-[14px]">
          <FormField label="Şifre" required hata={errors.sifre?.message}>
            <div className="relative">
              <input {...register("sifre")} type={sifreGoster ? "text" : "password"} placeholder="En az 8 karakter" autoComplete="new-password" className={inputCls} />
              <button type="button" onClick={() => setSifreGoster((v) => !v)}
                className="absolute right-[10px] top-1/2 -translate-y-1/2 text-[10px] text-[#4A5568] uppercase font-semibold tracking-[0.5px] hover:text-[#003057]">
                {sifreGoster ? "Gizle" : "Göster"}
              </button>
            </div>
          </FormField>
          <FormField label="Şifre Tekrar" required hata={errors.sifreTekrar?.message}>
            <div className="relative">
              <input {...register("sifreTekrar")} type={sifreTekrarGoster ? "text" : "password"} placeholder="Şifreyi tekrar girin" autoComplete="new-password" className={inputCls} />
              <button type="button" onClick={() => setSifreTekrarGoster((v) => !v)}
                className="absolute right-[10px] top-1/2 -translate-y-1/2 text-[10px] text-[#4A5568] uppercase font-semibold tracking-[0.5px] hover:text-[#003057]">
                {sifreTekrarGoster ? "Gizle" : "Göster"}
              </button>
            </div>
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-[14px] mb-[14px]">
          <FormField label="Web Sitesi" hata={errors.website?.message}>
            <input {...register("website")} type="url" placeholder="https://..." className={inputCls} />
          </FormField>
          <div /> {/* boş hücre */}
        </div>

        <div className="grid grid-cols-2 gap-[14px] mb-[14px]">
          <FormField label="Kuruluş Yılı" required hata={errors.kurulisYili?.message}>
            <select {...register("kurulisYili")} className={selectCls}>
              <option value="">Seçin...</option>
              {KURULUS_YILLARI.map((y) => <option key={y}>{y}</option>)}
            </select>
          </FormField>
          <FormField label="Çalışan Sayısı" required hata={errors.calisanAralik?.message}>
            <select {...register("calisanAralik")} className={selectCls}>
              <option value="">Seçin...</option>
              {CALISAN_ARALIK.map((c) => <option key={c}>{c}</option>)}
            </select>
          </FormField>
        </div>

        <FormField label="Kısa Tanıtım" hint="Maks. 300 karakter" hata={errors.kisaTanitim?.message}>
          <textarea {...register("kisaTanitim")} placeholder="Firmanızı 2–3 cümle ile tanıtın..." maxLength={300} className={textareaCls} />
        </FormField>
      </Kart>
    </div>
  );
}

function Adim2({ tezgahlar, onKaydet, onKaldir }: { tezgahlar: KaydedilenTezgah[]; onKaydet: (t: KaydedilenTezgah) => void; onKaldir: (id: number) => void }) {
  const [aktif, setAktif] = useState<AktifTezgah>({ ...BOŞ_TEZGAH });
  const [sayac, setSayac] = useState(tezgahlar.length + 1);

  const tipVeri = aktif.tip ? tezgahHiyerarsisi[aktif.tip] : null;
  const altSecenekler = tipVeri ? Object.entries(tipVeri.alts).map(([k, v]) => ({ key: k, label: v.label })) : [];
  const eksenSecenekler = tipVeri && aktif.alt ? tipVeri.alts[aktif.alt]?.eksenler ?? [] : [];
  const markaSecenekler = tipVeri ? tipVeri.markalar : [];

  function guncelle(alan: keyof AktifTezgah, deger: string) {
    setAktif((prev) => {
      const sonraki = { ...prev, [alan]: deger };
      if (alan === "tip") { sonraki.alt = ""; sonraki.eksen = ""; sonraki.marka = ""; sonraki.markaManuel = ""; }
      if (alan === "alt") { sonraki.eksen = ""; }
      if (alan === "marka" && deger !== "Diğer / Manuel Giriş") { sonraki.markaManuel = ""; }
      return sonraki;
    });
  }

  function kaydet() {
    const markaLabel = aktif.marka === "Diğer / Manuel Giriş" ? aktif.markaManuel : aktif.marka;
    const tipLabel = tipVeri?.label ?? aktif.tip;
    const altLabel = tipVeri?.alts[aktif.alt]?.label ?? aktif.alt;
    const label = [tipLabel, altLabel, aktif.eksen, markaLabel, aktif.model].filter(Boolean).join(" › ");
    onKaydet({ id: sayac, label, veri: { ...aktif } });
    setSayac((n) => n + 1);
    setAktif({ ...BOŞ_TEZGAH });
  }

  const kaydetHazir = !!(aktif.tip && aktif.alt && (aktif.marka && aktif.marka !== "Diğer / Manuel Giriş" ? true : aktif.markaManuel.trim()));

  return (
    <div>
      <p className="text-[9px] tracking-[3px] uppercase text-[#0077CC] mb-[6px]">Adım 2</p>
      <h2 className="text-[14px] font-medium text-[#003057] mb-4">Tezgah Parkuru</h2>

      <div className="bg-[#F0F7FF] border-l-[3px] border-[#00529C] px-[14px] py-[10px] rounded-[0_3px_3px_0] text-[11px] text-[#004080] mb-[14px] leading-[1.6]">
        Tezgah tipini seçtikçe alt kategoriler otomatik güncellenir. Marka listede yoksa <strong>Diğer / Manuel Giriş</strong> seçin.
      </div>

      {/* Aktif tezgah giriş formu */}
      <div className="bg-white border border-[#DDE8F0] rounded-[4px] p-5 mb-[14px]">
        <div className="text-[12px] font-medium text-[#003057] uppercase tracking-[0.3px] mb-[14px] pb-[10px] border-b border-[#DDE8F0] flex items-center gap-2">
          Tezgah #{sayac}
          <span className="text-[9px] bg-[#FEF0E6] text-[#C05C00] px-2 py-[2px] rounded-[2px] font-semibold tracking-[0.5px]">YENİ</span>
        </div>

        <div className="flex flex-col gap-[5px] mb-[13px]">
          <label className="text-[11px] text-[#4A5568] font-medium uppercase tracking-[0.3px]">1. Tezgah Tipi <span className="text-[#0077CC]">*</span></label>
          <select value={aktif.tip} onChange={(e) => guncelle("tip", e.target.value)} className={selectCls}>
            <option value="">— Seçin —</option>
            {TEZGAH_TIP_SECENEKLERI.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        {altSecenekler.length > 0 && (
          <div className="flex flex-col gap-[5px] mb-[13px]">
            <label className="text-[11px] text-[#4A5568] font-medium uppercase tracking-[0.3px]">2. Alt Kategori <span className="text-[#0077CC]">*</span></label>
            <select value={aktif.alt} onChange={(e) => guncelle("alt", e.target.value)} className={selectCls}>
              <option value="">— Seçin —</option>
              {altSecenekler.map((a) => <option key={a.key} value={a.key}>{a.label}</option>)}
            </select>
          </div>
        )}

        {eksenSecenekler.length > 0 && (
          <div className="flex flex-col gap-[5px] mb-[13px]">
            <label className="text-[11px] text-[#4A5568] font-medium uppercase tracking-[0.3px]">3. Eksen / Özellik <span className="text-[#0077CC]">*</span></label>
            <select value={aktif.eksen} onChange={(e) => guncelle("eksen", e.target.value)} className={selectCls}>
              <option value="">— Seçin —</option>
              {eksenSecenekler.map((e) => <option key={e}>{e}</option>)}
            </select>
          </div>
        )}

        {markaSecenekler.length > 0 && (
          <div className="flex flex-col gap-[5px] mb-[13px]">
            <label className="text-[11px] text-[#4A5568] font-medium uppercase tracking-[0.3px]">4. Marka <span className="text-[#0077CC]">*</span></label>
            <select value={aktif.marka} onChange={(e) => guncelle("marka", e.target.value)} className={selectCls}>
              <option value="">— Seçin —</option>
              {markaSecenekler.map((m) => <option key={m}>{m}</option>)}
            </select>
            {aktif.marka === "Diğer / Manuel Giriş" && (
              <div className="bg-[#FEF0E6] border border-[#C05C00] rounded-[3px] p-[10px] mt-[6px]">
                <p className="text-[10px] font-semibold text-[#C05C00] uppercase tracking-[0.8px] mb-[6px]">✏ Marka Adını Yazın</p>
                <input type="text" value={aktif.markaManuel} onChange={(e) => guncelle("markaManuel", e.target.value)}
                  placeholder="Örn: Bodor, Ermaksan, HSG Laser..." className={inputCls} />
                <p className="text-[10px] text-[#C05C00] mt-1">Admin onayı sonrası sisteme eklenecek</p>
              </div>
            )}
          </div>
        )}

        {aktif.alt && (
          <>
            <div className="flex flex-col gap-[5px] mb-[13px]">
              <label className="text-[11px] text-[#4A5568] font-medium uppercase tracking-[0.3px]">5. Model <span className="text-[9px] text-[#8A98A8] normal-case font-normal tracking-0">(İsteğe bağlı)</span></label>
              <input type="text" value={aktif.model} onChange={(e) => guncelle("model", e.target.value)}
                placeholder="Örn: VCN-700 SmoothG, NLX 2500SY..." className={inputCls} />
            </div>

            <div className="grid grid-cols-3 gap-[14px] mb-[13px]">
              {[["Bağlama X (mm)", "bagX", "800"], ["Bağlama Y (mm)", "bagY", "500"], ["Bağlama Z (mm)", "bagZ", "400"]].map(([lbl, alan, ph]) => (
                <div key={alan} className="flex flex-col gap-[5px]">
                  <label className="text-[11px] text-[#4A5568] font-medium uppercase tracking-[0.3px]">{lbl}</label>
                  <input type="number" value={aktif[alan as keyof AktifTezgah]} onChange={(e) => guncelle(alan as keyof AktifTezgah, e.target.value)} placeholder={ph} className={inputCls} />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-[14px] mb-[13px]">
              <div className="flex flex-col gap-[5px]">
                <label className="text-[11px] text-[#4A5568] font-medium uppercase tracking-[0.3px]">Max Devir (RPM)</label>
                <input type="number" value={aktif.maxRpm} onChange={(e) => guncelle("maxRpm", e.target.value)} placeholder="12000" className={inputCls} />
              </div>
              <div className="flex flex-col gap-[5px]">
                <label className="text-[11px] text-[#4A5568] font-medium uppercase tracking-[0.3px]">Yapım Yılı</label>
                <input type="number" value={aktif.yapimYili} onChange={(e) => guncelle("yapimYili", e.target.value)} placeholder="2019" min="1980" max="2025" className={inputCls} />
              </div>
            </div>

            <div className="flex flex-col gap-[5px] mb-[13px]">
              <label className="text-[11px] text-[#4A5568] font-medium uppercase tracking-[0.3px]">Kontrol Sistemi</label>
              <select value={aktif.kontrolSistemi} onChange={(e) => guncelle("kontrolSistemi", e.target.value)} className={selectCls}>
                <option value="">— Seçin —</option>
                {KONTROL_SISTEMLERI.map((k) => <option key={k}>{k}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-[5px] mb-[13px]">
              <label className="text-[11px] text-[#4A5568] font-medium uppercase tracking-[0.3px]">Durum <span className="text-[#0077CC]">*</span></label>
              <select value={aktif.durum} onChange={(e) => guncelle("durum", e.target.value)} className={selectCls}>
                <option value="">— Seçin —</option>
                <option>Aktif — Tam Kapasitede</option>
                <option>Kısmen Müsait</option>
                <option>Bakımda</option>
              </select>
            </div>
          </>
        )}

        <div className="flex gap-[10px] mt-[14px] flex-wrap">
          <button type="button" onClick={() => setAktif({ ...BOŞ_TEZGAH })}
            className="px-6 py-[9px] border border-[#C8D8E8] rounded-[2px] bg-white text-[#3D4E63] text-[12px] uppercase tracking-[0.5px] hover:bg-[#F4F7FB] transition-colors duration-150">
            ↺ Temizle
          </button>
          {kaydetHazir && (
            <button type="button" onClick={kaydet}
              className="px-6 py-[9px] bg-[#003057] text-white border border-[#003057] rounded-[2px] text-[12px] uppercase tracking-[0.5px] hover:bg-[#004080] transition-colors duration-150">
              ✓ Bu Tezgahı Kaydet
            </button>
          )}
        </div>
      </div>

      {/* Kaydedilen tezgahlar */}
      {tezgahlar.map((tz) => (
        <div key={tz.id} className="bg-[#F0F7FF] border-l-[4px] border-[#00529C] border border-[#DDE8F0] rounded-[3px] p-[14px] mb-[10px] flex justify-between items-center">
          <div>
            <p className="text-[10px] text-[#8A98A8] uppercase tracking-[0.5px] mb-[2px]">TEZGAH #{tz.id}</p>
            <p className="text-[12px] font-medium text-[#003057]">{tz.label}</p>
          </div>
          <button type="button" onClick={() => onKaldir(tz.id)}
            className="px-[10px] py-1 border border-[#DDE8F0] rounded-[2px] bg-white text-[11px] text-[#4A5568] hover:text-red-600 hover:border-red-300 transition-colors duration-150">
            Kaldır
          </button>
        </div>
      ))}

      <button type="button" onClick={() => setAktif({ ...BOŞ_TEZGAH })}
        className="w-full py-[10px] border border-dashed border-[#C8D8E8] rounded-[3px] bg-white text-[#4A5568] text-[12px] uppercase tracking-[0.5px] mt-1 hover:border-[#00529C] hover:text-[#00529C] hover:bg-[#F0F7FF] transition-all duration-150">
        + Başka Tezgah Ekle
      </button>
    </div>
  );
}

function Adim3({ secili, onToggle }: { secili: { islemeTurleri: SecimSet; malzemeUzmanligi: SecimSet; ozelYetenekler: SecimSet }; onToggle: (kategori: string, v: string) => void }) {
  return (
    <div>
      <p className="text-[9px] tracking-[3px] uppercase text-[#0077CC] mb-[6px]">Adım 3</p>
      <h2 className="text-[14px] font-medium text-[#003057] mb-4">İşleme Yetenekleri & Malzemeler</h2>
      <Kart baslik="İşleme Türleri"><ChipSecici degerler={ISLEME_TURLERI} secili={secili.islemeTurleri} onToggle={(v) => onToggle("islemeTurleri", v)} /></Kart>
      <Kart baslik="Malzeme Uzmanlığı"><ChipSecici degerler={MALZEME_UZMANLIGI} secili={secili.malzemeUzmanligi} onToggle={(v) => onToggle("malzemeUzmanligi", v)} /></Kart>
      <Kart baslik="Özel Yetenekler"><ChipSecici degerler={OZEL_YETENEKLER} secili={secili.ozelYetenekler} onToggle={(v) => onToggle("ozelYetenekler", v)} /></Kart>
    </div>
  );
}

function Adim4({ secili, onToggle }: { secili: { sertifikalar: SecimSet; olcumEkipmanlari: SecimSet }; onToggle: (kategori: string, v: string) => void }) {
  return (
    <div>
      <p className="text-[9px] tracking-[3px] uppercase text-[#0077CC] mb-[6px]">Adım 4</p>
      <h2 className="text-[14px] font-medium text-[#003057] mb-4">Kalite & Sertifikalar</h2>
      <div className="bg-[#F0F7FF] border-l-[3px] border-[#00529C] px-[14px] py-[10px] rounded-[0_3px_3px_0] text-[11px] text-[#004080] mb-[14px] leading-[1.6]">
        Sertifikalı firmalar arama sonuçlarında önce çıkar ve &quot;Doğrulanmış&quot; rozeti alır.
      </div>
      <Kart baslik="Sertifikalar"><ChipSecici degerler={SERTIFIKALAR} secili={secili.sertifikalar} onToggle={(v) => onToggle("sertifikalar", v)} /></Kart>
      <Kart baslik="Ölçüm Ekipmanları"><ChipSecici degerler={OLCUM_EKIPMANLARI} secili={secili.olcumEkipmanlari} onToggle={(v) => onToggle("olcumEkipmanlari", v)} /></Kart>
      <Kart baslik="Belge Yükle">
        <div className="border border-dashed border-[#C8D8E8] rounded-[3px] p-6 text-center bg-white hover:border-[#00529C] hover:bg-[#F0F7FF] transition-all duration-150 cursor-pointer">
          <p className="text-[12px] text-[#4A5568] tracking-[0.3px]">PDF veya JPG belgeyi buraya sürükleyin</p>
          <p className="text-[10px] text-[#8A98A8] mt-1">Maks. 10 MB · İsteğe bağlı</p>
        </div>
      </Kart>
    </div>
  );
}

function Adim5() {
  return (
    <div>
      <p className="text-[9px] tracking-[3px] uppercase text-[#0077CC] mb-[6px]">Adım 5</p>
      <h2 className="text-[14px] font-medium text-[#003057] mb-4">Kapasite & Fiyatlandırma</h2>
      <Kart baslik="Üretim Kapasitesi">
        <div className="grid grid-cols-2 gap-[14px] mb-[14px]">
          <div className="flex flex-col gap-[5px]"><label className="text-[11px] text-[#4A5568] font-medium uppercase tracking-[0.3px]">Min. Sipariş Adedi</label><select className={selectCls}><option>1 adet</option><option>5 adet</option><option>10 adet</option><option>50 adet</option><option>100+ adet</option></select></div>
          <div className="flex flex-col gap-[5px]"><label className="text-[11px] text-[#4A5568] font-medium uppercase tracking-[0.3px]">Vardiya Sistemi</label><select className={selectCls}><option>Tek vardiya</option><option>Çift vardiya</option><option>Üç vardiya</option></select></div>
        </div>
        <div className="grid grid-cols-2 gap-[14px]">
          <div className="flex flex-col gap-[5px]"><label className="text-[11px] text-[#4A5568] font-medium uppercase tracking-[0.3px]">Teslim Süresi</label><select className={selectCls}><option>1–3 gün</option><option>1 hafta</option><option>2–4 hafta</option><option>1+ ay</option></select></div>
          <div className="flex flex-col gap-[5px]"><label className="text-[11px] text-[#4A5568] font-medium uppercase tracking-[0.3px]">Acil İş</label><select className={selectCls}><option>Var</option><option>Yok</option><option>Görüşülür</option></select></div>
        </div>
      </Kart>
      <Kart baslik="Fiyatlandırma & İhracat">
        <div className="grid grid-cols-2 gap-[14px] mb-[14px]">
          <div className="flex flex-col gap-[5px]"><label className="text-[11px] text-[#4A5568] font-medium uppercase tracking-[0.3px]">İhracat</label><select className={selectCls}><option>Evet, ihracat yapıyoruz</option><option>Hayır, yurt içi</option><option>İlk kez deneyeceğiz</option></select></div>
          <div className="flex flex-col gap-[5px]"><label className="text-[11px] text-[#4A5568] font-medium uppercase tracking-[0.3px]">Ödeme Koşulları</label><select className={selectCls}><option>Peşin</option><option>Net 30</option><option>Net 60</option><option>Görüşülür</option></select></div>
        </div>
      </Kart>
    </div>
  );
}

function Adim6({ fotografSayisi, onFotografEkle }: { fotografSayisi: number; onFotografEkle: () => void }) {
  return (
    <div>
      <p className="text-[9px] tracking-[3px] uppercase text-[#0077CC] mb-[6px]">Adım 6</p>
      <h2 className="text-[14px] font-medium text-[#003057] mb-4">Görseller & Yayın</h2>
      <Kart baslik="Fabrika & Tezgah Fotoğrafları">
        <div onClick={onFotografEkle} className="border border-dashed border-[#C8D8E8] rounded-[3px] p-6 text-center cursor-pointer hover:border-[#00529C] hover:bg-[#F0F7FF] transition-all duration-150">
          <p className="text-[12px] text-[#4A5568]">Fotoğraf yüklemek için tıklayın</p>
          <p className="text-[10px] text-[#8A98A8] mt-1">JPG veya PNG · Maks. 5 MB · En fazla 10 fotoğraf</p>
        </div>
        {fotografSayisi > 0 && (
          <div className="grid grid-cols-4 gap-2 mt-[10px]">
            {Array.from({ length: fotografSayisi }).map((_, i) => (
              <div key={i} className="aspect-square bg-[#F0F7FF] rounded-[3px] border border-[#DDE8F0] flex items-center justify-center text-[10px] text-[#8A98A8]">
                Görsel {i + 1}
              </div>
            ))}
          </div>
        )}
      </Kart>
      <Kart baslik="Profil Durumu">
        {[
          { lbl: "Firma bilgileri", val: "✓ Tamamlandı", renk: "#1A7A4A" },
          { lbl: "Tezgah parkuru", val: "Devam ediyor", renk: "#C05C00" },
          { lbl: "İşleme yetenekleri", val: "Devam ediyor", renk: "#C05C00" },
          { lbl: "Sertifikalar", val: "Opsiyonel", renk: "#C05C00" },
          { lbl: "Görseller", val: fotografSayisi > 0 ? `${fotografSayisi} görsel` : "Henüz yok", renk: fotografSayisi > 0 ? "#1A7A4A" : "#C05C00" },
        ].map(({ lbl, val, renk }) => (
          <div key={lbl} className="flex justify-between py-2 border-b border-[#DDE8F0] text-[12px] last:border-b-0">
            <span className="text-[#4A5568]">{lbl}</span>
            <span style={{ color: renk }} className="font-medium">{val}</span>
          </div>
        ))}
      </Kart>
    </div>
  );
}

function Adim7({ seciliPlan, onPlanSec, sozlesmeOnay, onSozlesme, hata }: { seciliPlan: string; onPlanSec: (p: string) => void; sozlesmeOnay: boolean; onSozlesme: (v: boolean) => void; hata?: string | null }) {
  const ozet = PLAN_OZET[seciliPlan];
  return (
    <div>
      <p className="text-[9px] tracking-[3px] uppercase text-[#0077CC] mb-[6px]">Adım 7 — Son</p>
      <h2 className="text-[14px] font-medium text-[#003057] mb-4">Plan Seçimi</h2>

      <div className="bg-[#F0F7FF] border-l-[3px] border-[#00529C] px-4 py-3 rounded-[0_2px_2px_0] text-[11.5px] text-[#004080] mb-[18px] leading-[1.6]">
        <strong className="font-semibold">30 gün ücretsiz deneme</strong> — Kart bilgisi gerekmez. Deneme bitmeden 3 gün önce hatırlatma e-postası göndereceğiz.
      </div>

      <div className="grid grid-cols-2 gap-[10px] mb-[18px] sm:grid-cols-4">
        {PLANLAR.map((p) => (
          <div key={p.id} onClick={() => onPlanSec(p.id)}
            className={`relative flex flex-col p-[18px] rounded-[2px] cursor-pointer transition-all duration-200 ${seciliPlan === p.id ? "border-2 border-[#003057] shadow-[0_4px_14px_rgba(0,48,87,0.08)]" : "border border-[#C8D8E8]"}`}>
            {p.popular && (
              <div className="absolute -top-[10px] left-1/2 -translate-x-1/2 bg-[#003057] text-white text-[9px] px-3 py-1 rounded-[2px] uppercase tracking-[1.5px] font-semibold whitespace-nowrap">
                EN POPÜLER
              </div>
            )}
            {p.badge && (
              <div className="absolute top-0 right-0 bg-[#E8F5EE] text-[#1A7A4A] text-[8.5px] px-2 py-[3px] rounded-[0_2px_0_2px] uppercase tracking-[1px] font-bold">
                {p.badge}
              </div>
            )}
            <p className="text-[9px] tracking-[2px] text-[#8A98A8] uppercase font-semibold mb-2 mt-1">{p.etiket}</p>
            <p className="text-[16px] font-medium text-[#003057] mb-1">{p.ad}</p>
            <p className="text-[11px] text-[#4A5568] mb-[14px]">{p.aciklama}</p>
            <p className="text-[22px] font-light text-[#003057] tracking-[-0.5px] leading-none">{p.fiyat}</p>
            <p className="text-[10px] text-[#8A98A8] mt-[3px]">{p.fiyatAlt}</p>
            <div className="mt-[14px] pt-[14px] border-t border-[#DDE8F0] flex flex-col gap-[6px] flex-1">
              {p.ozellikler.map((o) => (
                <p key={o.metin} className={`text-[10.5px] leading-[1.5] ${o.var ? "text-[#3D4E63]" : "text-[#8A98A8] line-through"}`}>
                  {o.var ? "✓" : "–"} {o.metin}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>

      {ozet && (
        <Kart baslik="Seçtiğiniz Plan Özeti">
          {[
            ["Plan", ozet.ad],
            ["Fiyat", ozet.fiyat],
            ["Deneme", ozet.deneme],
            ["İlk ödeme", ozet.ilkOdeme],
            ["Ödeme yöntemi", "Kart · Havale"],
          ].map(([lbl, val]) => (
            <div key={lbl} className="flex justify-between py-2 border-b border-[#DDE8F0] text-[12px] last:border-b-0">
              <span className="text-[#4A5568]">{lbl}</span>
              <span className="font-medium text-[#003057]">{val}</span>
            </div>
          ))}
          <div className="mt-[14px] bg-[#E8F5EE] border-l-[3px] border-[#1A7A4A] px-[14px] py-[10px] text-[11px] text-[#1A7A4A] leading-[1.6]">
            <strong>İptal kolay:</strong> Deneme süresince istediğiniz zaman tek tıkla iptal edebilirsiniz, ücret çekilmez.
          </div>
        </Kart>
      )}

      {hata && (
        <div className="bg-[#FEE2E2] text-[#B83232] border-l-[3px] border-[#B83232] px-[13px] py-[9px] text-[11.5px] rounded-[2px] mb-[14px] leading-[1.45]">
          {hata}
        </div>
      )}

      <label className="flex items-start gap-[9px] p-[9px] text-[11.5px] text-[#3D4E63] cursor-pointer leading-[1.55]">
        <input type="checkbox" checked={sozlesmeOnay} onChange={(e) => onSozlesme(e.target.checked)}
          className="mt-[2px] w-[14px] h-[14px] accent-[#003057] flex-shrink-0" />
        <span>
          <a href="/kvkk" className="text-[#0077CC] no-underline hover:underline">KVKK</a>,{" "}
          <a href="/kullanim-kosullari" className="text-[#0077CC] no-underline hover:underline">Kullanım Koşulları</a> ve{" "}
          <a href="/abonelik-sartlari" className="text-[#0077CC] no-underline hover:underline">Abonelik Şartları</a>&apos;nı okudum, kabul ediyorum.
        </span>
      </label>
    </div>
  );
}

// ─── Ana Bileşen ─────────────────────────────────────────────────────────────

export function FasoncuKayitFormu() {
  const [adim, setAdim] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [serverHata, setServerHata] = useState<string | null>(null);

  // Step 1 — RHF
  const form = useForm<FasoncuAdim1Data>({
    resolver: zodResolver(fasoncuAdim1Schema),
    mode: "onBlur",
  });

  // Steps 2–7 — local state
  const [tezgahlar, setTezgahlar] = useState<KaydedilenTezgah[]>([]);
  const [islemeTurleri, setIslemeTurleri] = useState<SecimSet>(new Set());
  const [malzemeUzmanligi, setMalzemeUzmanligi] = useState<SecimSet>(new Set());
  const [ozelYetenekler, setOzelYetenekler] = useState<SecimSet>(new Set());
  const [sertifikalar, setSertifikalar] = useState<SecimSet>(new Set());
  const [olcumEkipmanlari, setOlcumEkipmanlari] = useState<SecimSet>(new Set());
  const [fotografSayisi, setFotografSayisi] = useState(0);
  const [seciliPlan, setSeciliPlan] = useState<string>("profesyonel");
  const [sozlesmeOnay, setSozlesmeOnay] = useState(false);

  function chipToggle(setter: React.Dispatch<React.SetStateAction<SecimSet>>, v: string) {
    setter((prev) => {
      const s = new Set(prev);
      if (s.has(v)) { s.delete(v); } else { s.add(v); }
      return s;
    });
  }

  function yetenekToggle(kategori: string, v: string) {
    if (kategori === "islemeTurleri") chipToggle(setIslemeTurleri, v);
    else if (kategori === "malzemeUzmanligi") chipToggle(setMalzemeUzmanligi, v);
    else if (kategori === "ozelYetenekler") chipToggle(setOzelYetenekler, v);
  }

  function kaliteToggle(kategori: string, v: string) {
    if (kategori === "sertifikalar") chipToggle(setSertifikalar, v);
    else if (kategori === "olcumEkipmanlari") chipToggle(setOlcumEkipmanlari, v);
  }

  async function ileriGit() {
    if (adim === 0) {
      const gecerli = await form.trigger();
      if (!gecerli) return;
    }
    if (adim === 6) {
      await finalGonder();
      return;
    }
    setAdim((a) => Math.min(6, a + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function geriGit() {
    setAdim((a) => Math.max(0, a - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function finalGonder() {
    if (!sozlesmeOnay) {
      setServerHata("Devam etmek için KVKK ve Kullanım Koşullarını kabul etmelisiniz.");
      return;
    }
    setServerHata(null);
    const adim1 = form.getValues();
    startTransition(async () => {
      const sonuc = await fasoncuKayitYap({
        email: adim1.email,
        sifre: adim1.sifre,
        vkn: adim1.vkn,
        ticariUnvan: adim1.ticariUnvan,
        il: adim1.il,
        ilce: adim1.ilce,
        adres: adim1.adres,
        yetkiliKisi: adim1.yetkiliKisi,
        telefon: adim1.telefon,
        website: adim1.website,
        kurulisYili: adim1.kurulisYili,
        calisanAralik: adim1.calisanAralik,
        kisaTanitim: adim1.kisaTanitim,
        seciliPlan,
      });
      if (sonuc?.hata) setServerHata(sonuc.hata);
    });
  }

  const yuzde = ADIM_YUZDELERI[adim];

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* İlerleme alanı */}
      <div className="bg-white border-b border-[#DDE8F0] px-7 py-5 flex-shrink-0">
        <div className="flex justify-between items-center mb-[14px]">
          <p className="text-[15px] font-medium text-[#003057]">{ADIM_BASLIKLARI[adim]}</p>
          <p className="text-[11px] text-[#0077CC] font-medium tracking-[0.5px]">Adım {adim + 1} / 7</p>
        </div>
        <div className="h-[3px] bg-[#DDE8F0] rounded-[2px] overflow-hidden mb-4">
          <div className="h-full bg-gradient-to-r from-[#00529C] to-[#0077CC] rounded-[2px] transition-[width] duration-400" style={{ width: `${yuzde}%` }} />
        </div>
        <div className="flex">
          {ADIM_KISA.map((lbl, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 relative">
              {i < ADIM_KISA.length - 1 && (
                <div className={`absolute top-[13px] left-[55%] w-[90%] h-[1px] ${i < adim ? "bg-[#00529C]" : "bg-[#DDE8F0]"}`} />
              )}
              <div className={`w-[26px] h-[26px] rounded-full border-2 flex items-center justify-center text-[10px] font-medium z-10 transition-all duration-200 ${i === adim ? "border-[#003057] bg-[#003057] text-white" : i < adim ? "border-[#00529C] bg-[#00529C] text-white" : "border-[#DDE8F0] bg-white text-[#8A98A8]"}`}>
                {i < adim ? "✓" : i + 1}
              </div>
              <p className={`text-[9px] uppercase tracking-[0.3px] text-center ${i === adim ? "text-[#003057] font-medium" : i < adim ? "text-[#00529C]" : "text-[#8A98A8]"}`}>{lbl}</p>
            </div>
          ))}
        </div>
      </div>

      {/* İçerik */}
      <div className="flex-1 overflow-y-auto px-7 py-6">
        {adim === 0 && <Adim1 form={form} />}
        {adim === 1 && <Adim2 tezgahlar={tezgahlar} onKaydet={(t) => setTezgahlar((prev) => [...prev, t])} onKaldir={(id) => setTezgahlar((prev) => prev.filter((t) => t.id !== id))} />}
        {adim === 2 && <Adim3 secili={{ islemeTurleri, malzemeUzmanligi, ozelYetenekler }} onToggle={yetenekToggle} />}
        {adim === 3 && <Adim4 secili={{ sertifikalar, olcumEkipmanlari }} onToggle={kaliteToggle} />}
        {adim === 4 && <Adim5 />}
        {adim === 5 && <Adim6 fotografSayisi={fotografSayisi} onFotografEkle={() => setFotografSayisi((n) => Math.min(10, n + 1))} />}
        {adim === 6 && <Adim7 seciliPlan={seciliPlan} onPlanSec={setSeciliPlan} sozlesmeOnay={sozlesmeOnay} onSozlesme={setSozlesmeOnay} hata={serverHata} />}
      </div>

      {/* Profil doluluk */}
      <div className="bg-white border-t border-[#DDE8F0] px-7 py-[14px] flex items-center gap-4 flex-shrink-0">
        <p className="text-[10px] text-[#8A98A8] uppercase tracking-[1px] whitespace-nowrap">Profil doluluk</p>
        <div className="flex-1 h-[4px] bg-[#DDE8F0] rounded-[2px] overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#00529C] to-[#0077CC] rounded-[2px] transition-[width] duration-400" style={{ width: `${yuzde}%` }} />
        </div>
        <p className="text-[11px] text-[#0077CC] font-medium tracking-[0.5px] w-9 text-right">%{yuzde}</p>
      </div>

      {/* Navigasyon */}
      <div className="bg-white border-t border-[#DDE8F0] px-7 py-[14px] flex justify-between items-center flex-shrink-0">
        <button type="button" onClick={geriGit} disabled={adim === 0}
          className="px-6 py-[9px] border border-[#C8D8E8] rounded-[2px] bg-white text-[#3D4E63] text-[12px] uppercase tracking-[0.5px] hover:bg-[#F4F7FB] disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-150">
          Geri
        </button>
        <span className="text-[11px] text-[#8A98A8] tracking-[0.5px]">{adim + 1} / 7</span>
        <button type="button" onClick={ileriGit} disabled={isPending}
          className={`px-6 py-[9px] rounded-[2px] text-white text-[12px] uppercase tracking-[0.5px] border-none cursor-pointer transition-[background] duration-150 disabled:opacity-60 disabled:cursor-not-allowed ${adim === 6 ? "bg-[#1A7A4A] hover:bg-[#155E3A]" : "bg-[#003057] hover:bg-[#004080]"}`}>
          {isPending ? "Kaydediliyor…" : adim === 6 ? "30 Gün Ücretsiz Başla" : "Devam Et"}
        </button>
      </div>
    </div>
  );
}
