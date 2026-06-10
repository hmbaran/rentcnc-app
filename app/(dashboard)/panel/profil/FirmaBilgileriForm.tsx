"use client";

import { useState, useTransition } from "react";
import { firmaBilgileriGuncelle, type FirmaBilgileriInput } from "@/lib/actions/firma";
import { IL_ILCE_MAP } from "@/lib/data/ilceler";

const CALISAN_ARALIKLAR = ["1-5", "6-10", "11-25", "26-50", "51-100", "101-250", "250+"];
const IL_LISTESI = Object.keys(IL_ILCE_MAP).sort((a, b) => a.localeCompare(b, "tr"));

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

const inputCls = "w-full px-3 py-[9px] border border-[#C8D8E8] rounded-[3px] bg-white text-[#1A2535] text-[13px] outline-none focus:border-[#00529C] focus:ring-2 focus:ring-[#0077CC]/10 transition-[border-color]";
const labelCls = "text-[10px] font-semibold text-[#4A5568] tracking-[0.8px] uppercase";
const selectCls = inputCls + " appearance-none cursor-pointer";
const sectionTitle = "text-[10px] font-semibold text-[#003057] tracking-[1.5px] uppercase mb-[14px] pb-[10px] border-b border-[#DDE8F0]";

type Props = { firma: Record<string, unknown> | null };

export default function FirmaBilgileriForm({ firma }: Props) {
  const [isPending, startTransition] = useTransition();
  const [mesaj, setMesaj] = useState<{ tip: "basari" | "hata"; text: string } | null>(null);

  const [ticariUnvan,   setTicariUnvan]   = useState(String(firma?.ticari_unvan    ?? ""));
  const [il,            setIl]            = useState(String(firma?.il              ?? ""));
  const [ilce,          setIlce]          = useState(String(firma?.ilce            ?? ""));
  const [adres,         setAdres]         = useState(String(firma?.adres           ?? ""));
  const [telefon,       setTelefon]       = useState(String(firma?.telefon         ?? ""));
  // telefon_gsm önce, yoksa eski kayıtlardaki telefon alanından al
  const [telefonGsm,    setTelefonGsm]    = useState(
    String(firma?.telefon_gsm ?? firma?.telefon ?? "")
  );
  const [email,         setEmail]         = useState(String(firma?.email           ?? ""));
  const [website,       setWebsite]       = useState(String(firma?.website         ?? ""));
  const [kurulusYili,   setKurulusYili]   = useState(String(firma?.kurulus_yili    ?? ""));
  const [calisanAralik, setCalisanAralik] = useState(String(firma?.calisan_aralik  ?? ""));
  const [hakkinda,      setHakkinda]      = useState(String(firma?.hakkinda        ?? ""));
  const [irtibat2Ad,       setIrtibat2Ad]       = useState(String(firma?.irtibat_2_ad       ?? ""));
  const [irtibat2Email,    setIrtibat2Email]    = useState(String(firma?.irtibat_2_email    ?? ""));
  const [irtibat2Telefon,  setIrtibat2Telefon]  = useState(String(firma?.irtibat_2_telefon  ?? ""));
  const [irtibat2TelTip,   setIrtibat2TelTip]   = useState(String(firma?.irtibat_2_tel_tip  ?? "cep"));
  const [irtibat2Acik,     setIrtibat2Acik]     = useState(!!(firma?.irtibat_2_ad));

  function kaydet() {
    setMesaj(null);
    startTransition(async () => {
      const input: FirmaBilgileriInput = {
        ticariUnvan, il, ilce, adres, telefon, telefonGsm,
        email, website, kurulusYili, calisanAralik, hakkinda,
        irtibat2Ad, irtibat2Email, irtibat2Telefon, irtibat2TelTip,
      };
      const sonuc = await firmaBilgileriGuncelle(input);
      if ("hata" in sonuc) setMesaj({ tip: "hata",   text: sonuc.hata });
      else                  setMesaj({ tip: "basari", text: "Firma bilgileri kaydedildi ✓" });
    });
  }

  return (
    <div className="bg-white border border-[#DDE8F0] rounded-[4px] p-[18px] mb-[14px]">

      {/* ── BÖLÜM 1: Firma Bilgileri ── */}
      <div className={sectionTitle}>Firma Bilgileri</div>

      <div className="flex flex-col gap-[5px] mb-[13px]">
        <label className={labelCls}>Ticari Ünvan <span className="text-[#0077CC]">*</span></label>
        <input type="text" className={inputCls} value={ticariUnvan}
          onChange={(e) => setTicariUnvan(e.target.value)}
          placeholder="Örn: FORM Makina CNC Takım Tezgahları Tic. Ltd. Şti." />
      </div>

      <div className="grid grid-cols-2 gap-[13px] mb-[13px]">
        <div className="flex flex-col gap-[5px]">
          <label className={labelCls}>İl</label>
          <select className={selectCls} value={il} onChange={(e) => { setIl(e.target.value); setIlce(""); }}>
            <option value="">— Seçin —</option>
            {IL_LISTESI.map((i) => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-[5px]">
          <label className={labelCls}>İlçe</label>
          <select className={selectCls} value={ilce} onChange={(e) => setIlce(e.target.value)} disabled={!il}>
            <option value="">{il ? "— Seçin —" : "Önce il seçin"}</option>
            {(IL_ILCE_MAP[il] ?? []).map((i) => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-[5px] mb-[13px]">
        <label className={labelCls}>Adres</label>
        <textarea className={inputCls + " resize-none"} rows={2} value={adres}
          onChange={(e) => setAdres(e.target.value)}
          placeholder="Cadde, sokak, bina no, posta kodu…" />
      </div>

      <div className="flex flex-col gap-[5px] mb-[13px]">
        <label className={labelCls}>Web Sitesi</label>
        <input type="url" className={inputCls} value={website}
          onChange={(e) => setWebsite(e.target.value)} placeholder="https://www.firmam.com" />
      </div>

      <div className="grid grid-cols-2 gap-[13px] mb-[16px]">
        <div className="flex flex-col gap-[5px]">
          <label className={labelCls}>Kuruluş Yılı</label>
          <input type="number" className={inputCls} value={kurulusYili}
            onChange={(e) => setKurulusYili(e.target.value)}
            placeholder="2005" min={1950} max={new Date().getFullYear()} />
        </div>
        <div className="flex flex-col gap-[5px]">
          <label className={labelCls}>Çalışan Sayısı</label>
          <select className={selectCls} value={calisanAralik} onChange={(e) => setCalisanAralik(e.target.value)}>
            <option value="">— Seçin —</option>
            {CALISAN_ARALIKLAR.map((c) => <option key={c} value={c}>{c} kişi</option>)}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-[5px] mb-[20px]">
        <label className={labelCls}>
          Firma Hakkında{" "}
          <span className="text-[9px] text-[#8A98A8] font-normal normal-case tracking-normal">(max 500 karakter)</span>
        </label>
        <textarea className={inputCls + " resize-none"} rows={3}
          value={hakkinda} onChange={(e) => setHakkinda(e.target.value.slice(0, 500))}
          placeholder="Firmamız 2005 yılında kurulmuş olup, havacılık ve otomotiv sektörlerine yönelik CNC işleme hizmeti vermektedir…" />
        <div className="text-[10px] text-[#8A98A8] text-right">{hakkinda.length}/500</div>
      </div>

      {/* ── BÖLÜM 2: İletişim Bilgileri ── */}
      <div className={sectionTitle}>İletişim Bilgileri</div>

      {/* Telefon çifti */}
      <div className="grid grid-cols-2 gap-[13px] mb-[13px]">
        <div className="flex flex-col gap-[5px]">
          <label className={labelCls}>
            📱 Cep Telefonu
            <span className="text-[9px] text-[#8A98A8] font-normal normal-case tracking-normal ml-1">(kayıtta girildi)</span>
          </label>
          <input type="tel" className={inputCls} value={telefonGsm}
            onChange={(e) => setTelefonGsm(formatTelefon(e.target.value))}
            placeholder="+90 5XX XXX XX XX" />
        </div>
        <div className="flex flex-col gap-[5px]">
          <label className={labelCls}>☎ İş / Ofis Telefonu</label>
          <input type="tel" className={inputCls} value={telefon}
            onChange={(e) => setTelefon(formatTelefon(e.target.value))}
            placeholder="+90 212 XXX XX XX" />
        </div>
      </div>

      {/* E-posta */}
      <div className="flex flex-col gap-[5px] mb-[16px]">
        <label className={labelCls}>Firma E-posta</label>
        <input type="email" className={inputCls} value={email}
          onChange={(e) => setEmail(e.target.value)} placeholder="info@firmam.com" />
      </div>

      {/* 2. Yetkili Kişi */}
      {!irtibat2Acik ? (
        <button
          type="button"
          onClick={() => setIrtibat2Acik(true)}
          className="text-[11px] text-[#0077CC] hover:underline mb-[16px] block"
        >
          + 2. Yetkili Kişi Ekle (opsiyonel)
        </button>
      ) : (
        <div className="border border-dashed border-[#C8D8E8] rounded-[3px] p-[13px] mb-[16px]">
          <div className="flex items-center justify-between mb-[10px]">
            <span className="text-[10px] font-semibold text-[#4A5568] tracking-[0.8px] uppercase">2. Yetkili Kişi</span>
            <button type="button" onClick={() => { setIrtibat2Acik(false); setIrtibat2Ad(""); setIrtibat2Email(""); }}
              className="text-[10px] text-[#8A98A8] hover:text-red-500">Kaldır</button>
          </div>
          <div className="grid grid-cols-2 gap-[13px] mb-[10px]">
            <div className="flex flex-col gap-[5px]">
              <label className={labelCls}>Ad Soyad</label>
              <input type="text" className={inputCls} value={irtibat2Ad}
                onChange={(e) => setIrtibat2Ad(e.target.value)}
                placeholder="Ad Soyad" />
            </div>
            <div className="flex flex-col gap-[5px]">
              <label className={labelCls}>E-posta</label>
              <input type="email" className={inputCls} value={irtibat2Email}
                onChange={(e) => setIrtibat2Email(e.target.value)}
                placeholder="kisi2@firmam.com" />
            </div>
          </div>
          {/* 2. kişi telefon */}
          <div className="flex gap-[10px]">
            <div className="flex flex-col gap-[5px] w-[110px]">
              <label className={labelCls}>Tip</label>
              <select className={selectCls} value={irtibat2TelTip} onChange={(e) => setIrtibat2TelTip(e.target.value)}>
                <option value="cep">Cep</option>
                <option value="is">İş</option>
                <option value="ofis">Ofis</option>
              </select>
            </div>
            <div className="flex flex-col gap-[5px] flex-1">
              <label className={labelCls}>Telefon</label>
              <input type="tel" className={inputCls} value={irtibat2Telefon}
                onChange={(e) => setIrtibat2Telefon(formatTelefon(e.target.value))}
                placeholder="İsteğe bağlı" />
            </div>
          </div>
        </div>
      )}

      {/* ── Kaydet ── */}
      {mesaj && (
        <div className={`px-[14px] py-[10px] rounded-[3px] text-[12px] mb-[14px] ${
          mesaj.tip === "basari"
            ? "bg-[#E8F5EE] border border-[#A8D8B8] text-[#1A7A4A]"
            : "bg-red-50 border border-red-200 text-red-700"
        }`}>{mesaj.text}</div>
      )}

      <button type="button" onClick={kaydet} disabled={isPending}
        className="px-[22px] py-[9px] rounded-[2px] text-[11px] font-medium tracking-[0.5px] uppercase bg-[#003057] text-white hover:bg-[#004080] transition-colors cursor-pointer disabled:opacity-60">
        {isPending ? "Kaydediliyor…" : "✓ Kaydet"}
      </button>
    </div>
  );
}
