"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { tezgahGuncelle, tezgahGorselSil } from "@/lib/actions/tezgah";
import TezgahParametrelerBolumu from "@/app/(dashboard)/panel/_components/TezgahParametrelerBolumu";

const DURUM_SECENEKLER = [
  "Aktif — Tam Kapasitede",
  "Kısmen Müsait",
  "Bakımda",
];

const KONTROL_SISTEMLERI = [
  "Fanuc 0i-MF","Fanuc 0i-TF","Fanuc 30i","Fanuc 31i","Fanuc 32i",
  "Siemens 828D","Siemens 840D sl","Siemens One",
  "Heidenhain TNC 320","Heidenhain TNC 620","Heidenhain TNC 640","Heidenhain TNC 7",
  "Mazatrol SmoothG (Mazak)","Mazatrol SmoothX (Mazak)","Mazatrol SmoothAi (Mazak)",
  "OSP-P300 (Okuma)","OSP-P500 (Okuma)","Mitsubishi M70V","Mitsubishi M800",
  "Bosch Rexroth MTX","Brother Speedio","Diğer / Manuel Giriş",
];

const DURUM_LABEL: Record<string, string> = {
  aktif_tam_kapasite: "Aktif — Tam Kapasitede",
  kismen_musait:      "Kısmen Müsait",
  bakimda:            "Bakımda",
  satildi_kapali:     "Kapalı / Satıldı",
};

const inputCls = "w-full px-3 py-[9px] border border-[#C8D8E8] rounded-[3px] bg-white text-[#1A2535] text-[13px] outline-none focus:border-[#00529C] focus:ring-2 focus:ring-[#0077CC]/10 transition-[border-color]";
const labelCls = "text-[10px] font-semibold text-[#4A5568] tracking-[0.8px] uppercase";
const selectCls = inputCls + " appearance-none cursor-pointer";

type FotoOnizleme = { file: File; previewUrl: string; id: string };
type MevcutGorsel = { gorsel_id: string; url: string; storage_path: string; sira: number };

export default function TezgahDuzenleForm({
  tezgah,
  mevcutGorseller = [],
}: {
  tezgah: Record<string, unknown>;
  mevcutGorseller?: MevcutGorsel[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [hata, setHata] = useState("");
  const [basari, setBasari] = useState(false);

  // Mevcut değerleri al
  const tip    = (tezgah.tezgah_tip    as { kod: string; ad: string } | null);
  const altKat = (tezgah.tezgah_alt_kategori as { ad: string } | null);
  const marka  = (tezgah.tezgah_marka  as { ad: string } | null);
  const ks     = (tezgah.kontrol_sistemi as { ad: string } | null);

  const [model,          setModel]          = useState(String(tezgah.model ?? ""));
  const [bagXMm,         setBagXMm]         = useState(String(tezgah.bag_x_mm ?? ""));
  const [bagYMm,         setBagYMm]         = useState(String(tezgah.bag_y_mm ?? ""));
  const [bagZMm,         setBagZMm]         = useState(String(tezgah.bag_z_mm ?? ""));
  const [maxRpm,         setMaxRpm]         = useState(String(tezgah.max_rpm ?? ""));
  const [yapimYili,      setYapimYili]      = useState(String(tezgah.yapim_yili ?? ""));
  const [kontrolSistemi, setKontrolSistemi] = useState(ks?.ad ?? "");
  const [durum,          setDurum]          = useState(DURUM_LABEL[String(tezgah.durum)] ?? "");
  const [parametreler,   setParametreler]   = useState<Record<string, string>>(
    tezgah.parametreler ? Object.fromEntries(
      Object.entries(tezgah.parametreler as Record<string, unknown>).map(([k, v]) => [k, String(v ?? "")])
    ) : {}
  );

  // Tip ID (parametreler bölümü için gerekli)
  const tipId = (tezgah.tezgah_tip as { tip_id?: number } | null)?.tip_id ?? null;

  // Fotoğraf state'leri
  const [fotolar, setFotolar] = useState<FotoOnizleme[]>([]);
  const [kaydedilenler, setKaydedilenler] = useState<MevcutGorsel[]>(mevcutGorseller);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function fotoSec(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const yeniOlanlar = files.slice(0, 5 - fotolar.length).map((f) => ({
      file: f, previewUrl: URL.createObjectURL(f), id: Math.random().toString(36).slice(2),
    }));
    setFotolar((prev) => [...prev, ...yeniOlanlar].slice(0, 5));
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function kaydedilenSil(gorselId: string, storagePath: string) {
    startTransition(async () => {
      const res = await tezgahGorselSil(gorselId, storagePath);
      if ("hata" in res) { setHata(res.hata); return; }
      setKaydedilenler((prev) => prev.filter((g) => g.gorsel_id !== gorselId));
    });
  }

  function fotoKaldir(id: string) {
    setFotolar((prev) => {
      const k = prev.find((f) => f.id === id);
      if (k) URL.revokeObjectURL(k.previewUrl);
      return prev.filter((f) => f.id !== id);
    });
  }

  function kaydet() {
    setHata(""); setBasari(false);
    startTransition(async () => {
      // Yeni fotoğrafları server API üzerinden yükle
      let gorselData: { url: string; storagePath: string }[] = [];
      if (fotolar.length > 0) {
        const fd = new FormData();
        fotolar.forEach((f) => fd.append("dosya", f.file));
        const res = await fetch("/api/upload-gorsel", { method: "POST", body: fd });
        const json = await res.json();
        if (json.gorseller) gorselData = json.gorseller;
        else console.error("Upload hatası:", json.hata);
      }

      const sonuc = await tezgahGuncelle(String(tezgah.tezgah_id), {
        model:             model || undefined,
        bagXMm:           bagXMm ? parseInt(bagXMm) : null,
        bagYMm:           bagYMm ? parseInt(bagYMm) : null,
        bagZMm:           bagZMm ? parseInt(bagZMm) : null,
        maxRpm:           maxRpm ? parseInt(maxRpm) : null,
        yapimYili:        yapimYili ? parseInt(yapimYili) : null,
        kontrolSistemiAdi: kontrolSistemi,
        durum,
        parametreler: Object.fromEntries(
          Object.entries(parametreler).filter(([, v]) => v !== "")
        ),
        gorseller: gorselData,
      });
      if ("hata" in sonuc) {
        setHata(sonuc.hata);
      } else {
        setBasari(true);
        setTimeout(() => router.push("/panel/tezgahlar"), 1200);
      }
    });
  }

  return (
    <div className="bg-white border border-[#DDE8F0] rounded-[4px] p-[18px]">

      {/* Değiştirilemeyen bilgiler — bilgi amaçlı */}
      <div className="bg-[#F8FAFB] border border-[#EEF2F6] rounded-[3px] p-[12px] mb-[16px]">
        <div className="text-[9px] font-semibold text-[#8A98A8] tracking-[1.5px] uppercase mb-[8px]">
          Sabit Bilgiler (değiştirilemez)
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-[4px] text-[11.5px]">
          {tip && (
            <div className="flex gap-2">
              <span className="text-[#8A98A8]">Tezgah Tipi:</span>
              <span className="font-medium text-[#003057]">{tip.ad}</span>
            </div>
          )}
          {altKat && (
            <div className="flex gap-2">
              <span className="text-[#8A98A8]">Alt Kategori:</span>
              <span className="font-medium text-[#003057]">{altKat.ad}</span>
            </div>
          )}
          {marka && (
            <div className="flex gap-2">
              <span className="text-[#8A98A8]">Marka:</span>
              <span className="font-medium text-[#003057]">{marka.ad}</span>
            </div>
          )}
        </div>
        <div className="text-[9.5px] text-[#8A98A8] mt-[8px]">
          Marka veya tezgah tipini değiştirmek için bu tezgahı silip yeniden ekleyin.
        </div>
      </div>

      {/* Düzenlenebilir alanlar */}
      <div className="text-[10px] font-semibold text-[#003057] tracking-[1.5px] uppercase mb-[14px] pb-[8px] border-b border-[#DDE8F0]">
        Düzenlenebilir Bilgiler
      </div>

      {/* Model */}
      <div className="flex flex-col gap-[5px] mb-[13px]">
        <label className={labelCls}>Model</label>
        <input type="text" className={inputCls} value={model}
          onChange={(e) => setModel(e.target.value)}
          placeholder="Örn: VF-2, NLX 2500, DMU 50..." />
      </div>

      {/* X/Y/Z Strok */}
      <div className="grid grid-cols-3 gap-[10px] mb-[13px]">
        {[
          { lbl: "Max. X Eksen Stroku (mm)", val: bagXMm, set: setBagXMm, ph: "800" },
          { lbl: "Max. Y Eksen Stroku (mm)", val: bagYMm, set: setBagYMm, ph: "500" },
          { lbl: "Max. Z Eksen Stroku (mm)", val: bagZMm, set: setBagZMm, ph: "400" },
        ].map(({ lbl, val, set, ph }) => (
          <div key={lbl} className="flex flex-col gap-[5px]">
            <label className={labelCls}>{lbl}</label>
            <input type="text" inputMode="numeric" className={inputCls} value={val}
              onChange={(e) => set(e.target.value.replace(/[^0-9]/g, ""))} placeholder={ph} />
          </div>
        ))}
      </div>

      {/* RPM + Yıl */}
      <div className="grid grid-cols-2 gap-[13px] mb-[13px]">
        <div className="flex flex-col gap-[5px]">
          <label className={labelCls}>Max. İşmili Devri (RPM)</label>
          <input type="text" inputMode="numeric" className={inputCls} value={maxRpm}
            onChange={(e) => setMaxRpm(e.target.value.replace(/[^0-9]/g, ""))} placeholder="12000" />
        </div>
        <div className="flex flex-col gap-[5px]">
          <label className={labelCls}>Yapım Yılı</label>
          <input type="text" inputMode="numeric" className={inputCls} value={yapimYili}
            onChange={(e) => setYapimYili(e.target.value.replace(/[^0-9]/g, ""))} placeholder="2019" />
        </div>
      </div>

      {/* Kontrol Sistemi */}
      <div className="flex flex-col gap-[5px] mb-[13px]">
        <label className={labelCls}>Kontrol Sistemi</label>
        <select className={selectCls} value={kontrolSistemi}
          onChange={(e) => setKontrolSistemi(e.target.value)}>
          <option value="">— Seçin —</option>
          {KONTROL_SISTEMLERI.map((ks) => (
            <option key={ks} value={ks}>{ks}</option>
          ))}
        </select>
      </div>

      {/* Durum */}
      <div className="flex flex-col gap-[5px] mb-[16px]">
        <label className={labelCls}>Durum <span className="text-[#0077CC]">*</span></label>
        <select className={selectCls} value={durum}
          onChange={(e) => setDurum(e.target.value)}>
          <option value="">— Seçin —</option>
          {DURUM_SECENEKLER.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      {/* Dinamik Teknik Parametreler */}
      <TezgahParametrelerBolumu
        tipId={tipId}
        degerler={parametreler}
        onChange={(key, val) => setParametreler((prev) => ({ ...prev, [key]: val }))}
      />

      {/* Fotoğraflar */}
      <div className="flex flex-col gap-[5px] mb-[16px] mt-[16px]">
        <label className={labelCls}>
          Fotoğraflar{" "}
          <span className="text-[9px] text-[#8A98A8] font-normal normal-case tracking-normal">
            (max 5 adet — JPG/PNG/WebP)
          </span>
        </label>

        {/* Mevcut kaydedilmiş görseller */}
        {kaydedilenler.length > 0 && (
          <div className="mb-[6px]">
            <div className="text-[9.5px] text-[#8A98A8] mb-1.5">Kayıtlı fotoğraflar:</div>
            <div className="flex gap-[8px] flex-wrap">
              {kaydedilenler.map((g) => (
                <div key={g.gorsel_id} className="relative w-[80px] h-[80px] rounded-[3px] overflow-hidden border border-[#DDE8F0] group flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={g.url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => kaydedilenSil(g.gorsel_id, g.storage_path)}
                    disabled={isPending}
                    className="absolute inset-0 bg-black/50 text-white text-[22px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
                    title="Fotoğrafı sil"
                  >
                    ×
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 bg-red-500/80 text-white text-[8px] text-center py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    Sil
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Yeni eklenecek görseller (önizleme) */}
        {fotolar.length > 0 && (
          <div className="mb-[6px]">
            <div className="text-[9.5px] text-[#8A98A8] mb-1.5">Eklenecek yeni fotoğraflar:</div>
            <div className="flex gap-[8px] flex-wrap">
              {fotolar.map((f) => (
                <div key={f.id} className="relative w-[80px] h-[80px] rounded-[3px] overflow-hidden border-2 border-dashed border-[#0077CC] group flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={f.previewUrl} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => fotoKaldir(f.id)}
                    className="absolute inset-0 bg-black/50 text-white text-[22px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                    ×
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 bg-[#0077CC]/80 text-white text-[8px] text-center py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    Kaldır
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dosya seç butonu */}
        {(kaydedilenler.length + fotolar.length) < 5 && (
          <>
            <input ref={fileInputRef} type="file"
              accept="image/jpeg,image/png,image/webp" multiple
              className="hidden" onChange={fotoSec} />
            <button type="button" onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-[8px] px-[14px] py-[9px] border border-dashed border-[#A0B4C8] rounded-[3px] text-[11px] text-[#5B6770] hover:border-[#003057] hover:text-[#003057] hover:bg-[#F8FAFB] transition-all cursor-pointer w-fit">
              <span className="text-[16px]">📷</span>
              {(kaydedilenler.length + fotolar.length) === 0 ? "Fotoğraf Ekle" : "+ Daha Fazla Ekle"}
            </button>
          </>
        )}
      </div>

      {/* Mesajlar */}
      {hata && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-[12px] px-[14px] py-[10px] rounded-[3px] mb-[14px]">
          ⚠ {hata}
        </div>
      )}
      {basari && (
        <div className="bg-[#E8F5EE] border border-[#A8D8B8] text-[#1A7A4A] text-[12px] px-[14px] py-[10px] rounded-[3px] mb-[14px]">
          ✓ Kaydedildi — Tezgah listesine yönlendiriliyorsunuz…
        </div>
      )}

      {/* Butonlar */}
      <div className="flex gap-[10px]">
        <button type="button" onClick={() => router.push("/panel/tezgahlar")}
          className="px-[18px] py-[9px] rounded-[2px] text-[11px] font-medium tracking-[0.5px] uppercase border border-[#C8D8E8] bg-white text-[#4A5568] hover:bg-[#F4F7FB] transition-colors cursor-pointer">
          ← İptal
        </button>
        <button type="button" onClick={kaydet} disabled={isPending}
          className="px-[22px] py-[9px] rounded-[2px] text-[11px] font-medium tracking-[0.5px] uppercase bg-[#003057] text-white hover:bg-[#004080] transition-colors cursor-pointer disabled:opacity-60">
          {isPending ? "Kaydediliyor…" : "✓ Değişiklikleri Kaydet"}
        </button>
      </div>
    </div>
  );
}
