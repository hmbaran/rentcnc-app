"use client";

import { useState, useTransition, useEffect, useCallback } from "react";
import Link from "next/link";
import { tezgahKaydet, type TezgahKaydetInput } from "@/lib/actions/tezgah";

type TipItem = { tipId: number; kod: string; ad: string };
type AltKategoriItem = { altKategoriId: number; kod: string; ad: string };
type EksenItem = { eksenId: number; ad: string };
type MarkaItem = { markaId: number; ad: string };

type KayitliTezgah = { id: number; ozet: string };

const KONTROL_SISTEMLERI = [
  "Fanuc 0i-MF","Fanuc 0i-TF","Fanuc 30i","Fanuc 31i","Fanuc 32i",
  "Siemens 828D","Siemens 840D sl","Siemens One",
  "Heidenhain TNC 320","Heidenhain TNC 620","Heidenhain TNC 640","Heidenhain TNC 7",
  "Mazatrol SmoothG (Mazak)","Mazatrol SmoothX (Mazak)","Mazatrol SmoothAi (Mazak)",
  "OSP-P300 (Okuma)","OSP-P500 (Okuma)",
  "Mitsubishi M70V","Mitsubishi M800",
  "Bosch Rexroth MTX","Brother Speedio",
  "Diğer / Manuel Giriş",
];

const DURUM_SECENEKLER = [
  "Aktif — Tam Kapasitede",
  "Kısmen Müsait",
  "Bakımda",
];

// Düzgün görüntülenebilir etiket için emoji temizleme
function temizAd(ad: string) {
  return ad.replace(/\s*[\uD83C][\uDDE0-\uDDFF][\uD83C][\uDDE0-\uDDFF]\s*/g, "").trim();
}

const inputCls =
  "w-full px-3 py-[9px] border border-[#C8D8E8] rounded-[3px] bg-white text-[#1A2535] text-[13px] outline-none focus:border-[#00529C] focus:ring-2 focus:ring-[#0077CC]/10 disabled:bg-[#F4F7FB] disabled:text-[#8A98A8] disabled:cursor-not-allowed transition-[border-color]";
const labelCls = "text-[10px] font-semibold text-[#4A5568] tracking-[0.8px] uppercase";
const selectCls = inputCls + " appearance-none cursor-pointer";

export default function TezgahEklePage() {
  const [isPending, startTransition] = useTransition();

  // Dropdown seçenekleri
  const [tipler, setTipler] = useState<TipItem[]>([]);
  const [altKategoriler, setAltKategoriler] = useState<AltKategoriItem[]>([]);
  const [eksenler, setEksenler] = useState<EksenItem[]>([]);
  const [markalar, setMarkalar] = useState<MarkaItem[]>([]);
  const [modeller, setModeller] = useState<string[]>([]);

  // Seçilen değerler
  const [tipId, setTipId] = useState<number | null>(null);
  const [tipKod, setTipKod] = useState("");
  const [tipAdi, setTipAdi] = useState("");
  const [altKategoriId, setAltKategoriId] = useState<number | null>(null);
  const [altKategoriAdi, setAltKategoriAdi] = useState("");
  const [eksenAdi, setEksenAdi] = useState("");
  const [markaId, setMarkaId] = useState<number | null>(null);
  const [markaAdi, setMarkaAdi] = useState("");
  const [markaManuel, setMarkaManuel] = useState("");
  const [modelSec, setModelSec] = useState(""); // "__manuel__" veya model adı
  const [modelManuel, setModelManuel] = useState("");
  const [bagXMm, setBagXMm] = useState("");
  const [bagYMm, setBagYMm] = useState("");
  const [bagZMm, setBagZMm] = useState("");
  const [maxRpm, setMaxRpm] = useState("");
  const [yapimYili, setYapimYili] = useState("");
  const [kontrolSistemi, setKontrolSistemi] = useState("");
  const [durum, setDurum] = useState("");

  // UI state
  const [yükleniyor, setYükleniyor] = useState({ tipler: false, altKat: false, eksen: false, marka: false, model: false });
  const [hata, setHata] = useState("");
  const [kayitliTezgahlar, setKayitliTezgahlar] = useState<KayitliTezgah[]>([]);

  // Bölüm görünürlükleri
  const altKatGoster = tipId !== null;
  const altDetayGoster = altKategoriId !== null;
  const markaManuelGoster = markaAdi === "Diğer / Manuel Giriş";
  const modelGoster = altKategoriId !== null;
  const modelManuelGoster = modelSec === "__manuel__";

  // Form geçerliliği
  const markaGecerli = markaAdi && (markaAdi !== "Diğer / Manuel Giriş" || markaManuel.trim() !== "");
  const formGecerli = tipId && altKategoriId && markaGecerli && durum;

  // Mevcut model değeri
  const modelDegeri = modelSec === "__manuel__" ? modelManuel : modelSec;

  // Özet satırları
  const ozetSatirlar = [
    { k: "Tezgah Tipi", v: tipAdi },
    { k: "Alt Kategori", v: altKategoriAdi },
    { k: "Eksen / Özellik", v: eksenAdi },
    { k: "Marka", v: markaAdi === "Diğer / Manuel Giriş" ? (markaManuel || "(yazılmadı)") + " ⚠ Manuel" : temizAd(markaAdi) },
    { k: "Model", v: modelDegeri },
    { k: "X/Y/Z Strok", v: bagXMm && bagYMm ? `X:${bagXMm}  Y:${bagYMm}  Z:${bagZMm || "?"} mm` : "" },
    { k: "Max. İşmili Devri", v: maxRpm ? maxRpm + " RPM" : "" },
    { k: "Yapım Yılı", v: yapimYili },
    { k: "Kontrol Sistemi", v: kontrolSistemi },
    { k: "Durum", v: durum },
  ].filter((r) => r.v && r.v.trim());

  // Tezgah tiplerini yükle
  useEffect(() => {
    setYükleniyor((p) => ({ ...p, tipler: true }));
    fetch("/api/tezgah-tipleri")
      .then((r) => r.json())
      .then((data: TipItem[]) => setTipler(data))
      .catch(() => setHata("Tezgah tipleri yüklenemedi."))
      .finally(() => setYükleniyor((p) => ({ ...p, tipler: false })));
  }, []);

  const tipDegisti = useCallback(async (val: string) => {
    const sec = tipler.find((t) => String(t.tipId) === val);
    setTipId(sec ? sec.tipId : null);
    setTipKod(sec?.kod ?? "");
    setTipAdi(sec?.ad ?? "");
    setAltKategoriId(null); setAltKategoriAdi("");
    setEksenAdi(""); setMarkaId(null); setMarkaAdi(""); setMarkaManuel("");
    setModelSec(""); setModelManuel(""); setModeller([]);
    setEksenler([]); setAltKategoriler([]); setMarkalar([]);
    setDurum(""); setKontrolSistemi("");
    setBagXMm(""); setBagYMm(""); setBagZMm(""); setMaxRpm(""); setYapimYili("");

    if (!sec) return;
    setYükleniyor((p) => ({ ...p, altKat: true }));
    try {
      const [altRes, markaRes] = await Promise.all([
        fetch(`/api/alt-kategoriler?tipKod=${sec.kod}`).then((r) => r.json()),
        fetch(`/api/markalar?tipKod=${sec.kod}`).then((r) => r.json()),
      ]);
      setAltKategoriler(Array.isArray(altRes) ? altRes : []);
      setMarkalar(Array.isArray(markaRes) ? markaRes : []);
    } catch {
      setHata("Veriler yüklenemedi.");
    } finally {
      setYükleniyor((p) => ({ ...p, altKat: false }));
    }
  }, [tipler]);

  const altKatDegisti = useCallback(async (val: string) => {
    const sec = altKategoriler.find((a) => String(a.altKategoriId) === val);
    setAltKategoriId(sec ? sec.altKategoriId : null);
    setAltKategoriAdi(sec?.ad ?? "");
    setEksenAdi(""); setMarkaId(null); setMarkaAdi(""); setMarkaManuel("");
    setModelSec(""); setModelManuel(""); setModeller([]);

    if (!sec) return;
    setYükleniyor((p) => ({ ...p, eksen: true }));
    try {
      const eksenRes = await fetch(`/api/eksenler?altKategoriId=${sec.altKategoriId}`).then((r) => r.json());
      setEksenler(Array.isArray(eksenRes) ? eksenRes : []);
    } catch {
      // Eksen seçeneği opsiyonel — hata gösterme
    } finally {
      setYükleniyor((p) => ({ ...p, eksen: false }));
    }
  }, [altKategoriler]);

  const markaDegisti = useCallback(async (val: string) => {
    setMarkaAdi(val);
    setModelSec(""); setModelManuel(""); setModeller([]);

    if (val === "Diğer / Manuel Giriş") {
      setMarkaId(null);
      return;
    }
    const sec = markalar.find((m) => m.ad === val);
    setMarkaId(sec?.markaId ?? null);

    if (!val) return;
    setYükleniyor((p) => ({ ...p, model: true }));
    try {
      const modelRes = await fetch(`/api/modeller?markaAdi=${encodeURIComponent(val)}`).then((r) => r.json());
      setModeller(Array.isArray(modelRes) ? modelRes : []);
    } catch {
      // Modeller opsiyonel
    } finally {
      setYükleniyor((p) => ({ ...p, model: false }));
    }
  }, [markalar]);

  const resetForm = useCallback(() => {
    setTipId(null); setTipKod(""); setTipAdi("");
    setAltKategoriId(null); setAltKategoriAdi("");
    setEksenAdi(""); setMarkaId(null); setMarkaAdi(""); setMarkaManuel("");
    setModelSec(""); setModelManuel("");
    setBagXMm(""); setBagYMm(""); setBagZMm(""); setMaxRpm(""); setYapimYili("");
    setKontrolSistemi(""); setDurum("");
    setAltKategoriler([]); setEksenler([]); setMarkalar([]); setModeller([]);
    setHata("");
  }, []);

  const tezgahiKaydet = () => {
    if (!tipId || !altKategoriId || !durum) {
      setHata("Lütfen zorunlu alanları doldurun.");
      return;
    }
    const markaGecerliKontrol = markaAdi && (markaAdi !== "Diğer / Manuel Giriş" || markaManuel.trim() !== "");
    if (!markaGecerliKontrol) {
      setHata("Lütfen marka seçin veya manuel marka adını girin.");
      return;
    }

    const input: TezgahKaydetInput = {
      tipId,
      altKategoriId,
      eksenOzellik: eksenAdi,
      markaId: markaAdi === "Diğer / Manuel Giriş" ? null : markaId,
      markaManuelAd: markaAdi === "Diğer / Manuel Giriş" ? markaManuel.trim() : null,
      model: modelDegeri,
      bagXMm: bagXMm ? parseInt(bagXMm) : null,
      bagYMm: bagYMm ? parseInt(bagYMm) : null,
      bagZMm: bagZMm ? parseInt(bagZMm) : null,
      maxRpm: maxRpm ? parseInt(maxRpm) : null,
      yapimYili: yapimYili ? parseInt(yapimYili) : null,
      kontrolSistemiAdi: kontrolSistemi,
      durum,
    };

    setHata("");
    startTransition(async () => {
      const sonuc = await tezgahKaydet(input);
      if ("hata" in sonuc) {
        setHata(sonuc.hata);
        return;
      }
      // Başarılı — listeye ekle, formu sıfırla
      const markaLabel = markaAdi === "Diğer / Manuel Giriş" ? markaManuel + " ⚠" : temizAd(markaAdi);
      const ozet = [tipAdi, altKategoriAdi, eksenAdi, markaLabel, modelDegeri]
        .filter(Boolean)
        .join(" › ");
      setKayitliTezgahlar((prev) => [...prev, { id: Date.now(), ozet }]);
      resetForm();
    });
  };

  return (
    <div>
      {/* Başlık */}
      <div className="flex items-center gap-3 mb-5">
        <Link
          href="/panel"
          className="text-[11px] text-[#5B6770] hover:text-[#003057] tracking-[0.5px] no-underline transition-colors"
        >
          ← Dashboard
        </Link>
        <span className="text-[#D4D8DC] text-[11px]">/</span>
        <span className="text-[11px] text-[#003057] font-medium tracking-[0.5px]">Tezgah Ekle</span>
      </div>

      {/* Step başlığı */}
      <div className="flex items-center gap-[10px] mb-4">
        <div className="w-7 h-7 rounded-full bg-[#003057] text-white flex items-center justify-center text-[11px] font-semibold flex-shrink-0">
          +
        </div>
        <div>
          <div className="text-[14px] font-medium text-[#003057]">Tezgah Parkına Tezgah Ekle</div>
          <div className="text-[11px] text-[#8A98A8] mt-[1px]">
            Tezgah Tipi → Alt Kategori → Eksen/Özellik → Marka → Model → Teknik Detaylar
          </div>
        </div>
      </div>

      {/* Bilgi şeridi */}
      <div className="bg-[#E8F2FA] border-l-[3px] border-[#00529C] px-[13px] py-[9px] text-[11px] text-[#004080] mb-4 leading-[1.6] rounded-r-[3px]">
        Tezgah tipini seçtikçe alt kategoriler otomatik güncellenir.
        Marka seçilince <strong>model listesi otomatik yüklenir</strong> — bulamazsanız &quot;Listede yok&quot; seçip elle yazabilirsiniz.
        Birden fazla tezgah için <strong>+ Başka Tezgah Ekle</strong> butonunu kullanın.
      </div>

      {/* Hata mesajı */}
      {hata && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-[12px] px-[14px] py-[10px] rounded-[3px] mb-4">
          {hata}
        </div>
      )}

      {/* Form kartı */}
      <div className="bg-white border border-[#DDE8F0] rounded-[4px] p-[18px] mb-[14px]">
        <div className="text-[10px] font-semibold text-[#003057] tracking-[1.5px] uppercase mb-[14px] pb-[10px] border-b border-[#DDE8F0] flex items-center gap-2">
          Tezgah
          <span className="text-[9px] font-semibold px-2 py-[2px] rounded-[2px] bg-[#FEF0E6] text-[#C05C00] tracking-[0.5px]">
            Yeni
          </span>
        </div>

        {/* 1. Tezgah Tipi */}
        <div className="flex flex-col gap-[5px] mb-[13px]">
          <label className={labelCls}>
            1. Tezgah Tipi <span className="text-[#0077CC]">*</span>
          </label>
          <select
            className={selectCls}
            value={tipId !== null ? String(tipId) : ""}
            onChange={(e) => tipDegisti(e.target.value)}
            disabled={yükleniyor.tipler}
          >
            <option value="">— {yükleniyor.tipler ? "Yükleniyor…" : "Seçin"} —</option>
            {tipler.map((t) => (
              <option key={t.tipId} value={String(t.tipId)}>
                {t.ad}
              </option>
            ))}
          </select>
          <div className="text-[10px] text-[#8A98A8] mt-[2px]">
            20 ana kategori — birden fazla tezgah için aşağıdaki butonu kullanın
          </div>
        </div>

        {/* 2. Alt Kategori */}
        {altKatGoster && (
          <div className="flex flex-col gap-[5px] mb-[13px]">
            <label className={labelCls}>
              2. Alt Kategori / Tip <span className="text-[#0077CC]">*</span>
            </label>
            <select
              className={selectCls}
              value={altKategoriId !== null ? String(altKategoriId) : ""}
              onChange={(e) => altKatDegisti(e.target.value)}
              disabled={yükleniyor.altKat}
            >
              <option value="">— {yükleniyor.altKat ? "Yükleniyor…" : "Seçin"} —</option>
              {altKategoriler.map((a) => (
                <option key={a.altKategoriId} value={String(a.altKategoriId)}>
                  {a.ad}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* 3. Eksen / Özellik */}
        {altDetayGoster && eksenler.length > 0 && (
          <div className="flex flex-col gap-[5px] mb-[13px]">
            <label className={labelCls}>
              3. Eksen / Özellik <span className="text-[#0077CC]">*</span>
            </label>
            <select
              className={selectCls}
              value={eksenAdi}
              onChange={(e) => setEksenAdi(e.target.value)}
              disabled={yükleniyor.eksen}
            >
              <option value="">— {yükleniyor.eksen ? "Yükleniyor…" : "Seçin"} —</option>
              {eksenler.map((e) => (
                <option key={e.eksenId} value={e.ad}>
                  {e.ad}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* 4. Marka */}
        {altDetayGoster && (
          <div className="flex flex-col gap-[5px] mb-[13px]">
            <label className={labelCls}>
              4. Marka <span className="text-[#0077CC]">*</span>
            </label>
            <select
              className={selectCls}
              value={markaAdi}
              onChange={(e) => markaDegisti(e.target.value)}
              disabled={yükleniyor.marka}
            >
              <option value="">— Seçin —</option>
              {markalar.map((m) => (
                <option key={m.markaId} value={m.ad}>
                  {m.ad}
                </option>
              ))}
              <option value="Diğer / Manuel Giriş">— Diğer / Manuel Giriş</option>
            </select>

            {/* Manuel marka girişi */}
            {markaManuelGoster && (
              <div className="bg-[#FEF0E6] border border-[#C05C00]/30 rounded-[3px] p-[12px_14px] mt-[6px]">
                <div className="text-[10px] font-semibold text-[#C05C00] tracking-[0.8px] uppercase mb-[6px]">
                  ✏ Marka Adını Yazın (Manuel Giriş)
                </div>
                <input
                  type="text"
                  className="w-full px-3 py-[9px] border border-[#C05C00]/30 rounded-[3px] bg-white text-[13px] outline-none focus:border-[#C05C00] text-[#1A2535]"
                  placeholder="Örn: Bodor, Ermaksan, HSG Laser, Özel yapım…"
                  value={markaManuel}
                  onChange={(e) => setMarkaManuel(e.target.value)}
                  autoFocus
                />
                <div className="text-[10px] text-[#C05C00] mt-[6px]">
                  Admin onayı sonrası sisteme eklenecek ve dropdown&apos;a dahil edilecek
                </div>
              </div>
            )}
          </div>
        )}

        {/* 5. Model */}
        {modelGoster && (
          <div className="flex flex-col gap-[5px] mb-[13px]">
            <label className={labelCls}>
              5. Model{" "}
              <span className="text-[9px] text-[#8A98A8] font-normal normal-case tracking-normal">
                (İsteğe bağlı)
              </span>
            </label>
            <select
              className={selectCls}
              value={modelSec}
              onChange={(e) => {
                setModelSec(e.target.value);
                if (e.target.value !== "__manuel__") setModelManuel("");
              }}
              disabled={!markaAdi || markaAdi === "Diğer / Manuel Giriş" || yükleniyor.model}
            >
              <option value="">
                {!markaAdi
                  ? "— Önce marka seçin —"
                  : markaAdi === "Diğer / Manuel Giriş"
                  ? "— Marka bilinmiyor, modeli aşağıya yazın —"
                  : yükleniyor.model
                  ? "— Yükleniyor… —"
                  : "— Seçin —"}
              </option>
              {modeller.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
              {(markaAdi && markaAdi !== "Diğer / Manuel Giriş") && (
                <option value="__manuel__">
                  {modeller.length > 0 ? "— Listede yok — Manuel Giriş" : "— Manuel Giriş —"}
                </option>
              )}
            </select>
            {modeller.length > 0 && !yükleniyor.model && (
              <div className="text-[9px] text-[#1A7A4A] font-semibold tracking-[0.5px] mt-[2px]">
                {modeller.length} model listelendi
              </div>
            )}

            {/* Manuel model veya manuel marka durumunda model giriş alanı */}
            {(modelManuelGoster || markaManuelGoster) && (
              <div className="bg-[#FEF0E6] border border-[#C05C00]/30 rounded-[3px] p-[12px_14px] mt-[6px]">
                <div className="text-[10px] font-semibold text-[#C05C00] tracking-[0.8px] uppercase mb-[6px]">
                  ✏ Model Adını Yazın
                </div>
                <input
                  type="text"
                  className="w-full px-3 py-[9px] border border-[#C05C00]/30 rounded-[3px] bg-white text-[13px] outline-none focus:border-[#C05C00] text-[#1A2535]"
                  placeholder="Örn: DMU 65 monoBLOCK, VF-5SS, S33 Linear…"
                  value={modelManuel}
                  onChange={(e) => setModelManuel(e.target.value)}
                  autoFocus={modelManuelGoster}
                />
              </div>
            )}
            <div className="text-[10px] text-[#8A98A8] mt-[2px] leading-[1.5]">
              Marka seçilince otomatik yüklenir — bulamazsanız &quot;Listede yok — Manuel Giriş&quot; seçeneğini kullanın
            </div>
          </div>
        )}

        {/* 6. Boyutlar + RPM + Yıl + Kontrol + Durum */}
        {altDetayGoster && (
          <div>
            {/* X / Y / Z stroku */}
            <div className="grid grid-cols-3 gap-[10px] mb-[13px]">
              {[
                { id: "bx", label: "Max. X Eksen Stroku (mm)", ph: "800", val: bagXMm, set: setBagXMm },
                { id: "by", label: "Max. Y Eksen Stroku (mm)", ph: "500", val: bagYMm, set: setBagYMm },
                { id: "bz", label: "Max. Z Eksen Stroku (mm)", ph: "400", val: bagZMm, set: setBagZMm },
              ].map(({ id, label, ph, val, set }) => (
                <div key={id} className="flex flex-col gap-[5px]">
                  <label className={labelCls}>{label}</label>
                  <input
                    type="number"
                    className={inputCls}
                    placeholder={ph}
                    value={val}
                    onChange={(e) => set(e.target.value)}
                    min={0}
                  />
                </div>
              ))}
            </div>

            {/* RPM + Yıl */}
            <div className="grid grid-cols-2 gap-[13px] mb-[13px]">
              <div className="flex flex-col gap-[5px]">
                <label className={labelCls}>Max. İşmili Devri (RPM)</label>
                <input
                  type="number"
                  className={inputCls}
                  placeholder="12000"
                  value={maxRpm}
                  onChange={(e) => setMaxRpm(e.target.value)}
                  min={0}
                />
              </div>
              <div className="flex flex-col gap-[5px]">
                <label className={labelCls}>Yapım Yılı</label>
                <input
                  type="number"
                  className={inputCls}
                  placeholder="2019"
                  value={yapimYili}
                  onChange={(e) => setYapimYili(e.target.value)}
                  min={1980}
                  max={new Date().getFullYear()}
                />
              </div>
            </div>

            {/* Kontrol sistemi */}
            <div className="flex flex-col gap-[5px] mb-[13px]">
              <label className={labelCls}>Kontrol Sistemi</label>
              <select
                className={selectCls}
                value={kontrolSistemi}
                onChange={(e) => setKontrolSistemi(e.target.value)}
              >
                <option value="">— Seçin —</option>
                {KONTROL_SISTEMLERI.map((ks) => (
                  <option key={ks} value={ks}>
                    {ks}
                  </option>
                ))}
              </select>
            </div>

            {/* Durum */}
            <div className="flex flex-col gap-[5px] mb-[13px]">
              <label className={labelCls}>
                Durum <span className="text-[#0077CC]">*</span>
              </label>
              <select
                className={selectCls}
                value={durum}
                onChange={(e) => setDurum(e.target.value)}
              >
                <option value="">— Seçin —</option>
                {DURUM_SECENEKLER.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Özet */}
        {ozetSatirlar.length > 0 && tipId && altKategoriId && (
          <div className="bg-[#F0F7FF] border border-[#00529C] rounded-[3px] p-[14px] mt-[4px] mb-[14px]">
            <div className="text-[10px] font-semibold text-[#003057] tracking-[1px] uppercase mb-[10px]">
              Tezgah Özeti
            </div>
            {ozetSatirlar.map(({ k, v }) => (
              <div
                key={k}
                className="flex justify-between py-[5px] border-b border-[#DDE8F0] last:border-0 text-[12px]"
              >
                <span className="text-[#4A5568]">{k}</span>
                <span className="font-medium text-[#003057] text-right max-w-[60%] break-words">{v}</span>
              </div>
            ))}
          </div>
        )}

        {/* Butonlar */}
        <div className="flex gap-[10px] mt-[14px] flex-wrap items-center">
          <button
            type="button"
            className="px-[22px] py-[9px] rounded-[2px] text-[11px] font-medium tracking-[0.5px] uppercase border border-[#C8D8E8] bg-white text-[#4A5568] hover:bg-[#F4F7FB] transition-colors cursor-pointer"
            onClick={resetForm}
            disabled={isPending}
          >
            ↺ Temizle
          </button>
          {formGecerli && (
            <button
              type="button"
              className="px-[22px] py-[9px] rounded-[2px] text-[11px] font-medium tracking-[0.5px] uppercase bg-[#003057] text-white hover:bg-[#004080] transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={tezgahiKaydet}
              disabled={isPending}
            >
              {isPending ? "Kaydediliyor…" : "✓ Bu Tezgahı Kaydet"}
            </button>
          )}
        </div>
      </div>

      {/* Kaydedilen tezgahlar (oturum içi) */}
      {kayitliTezgahlar.length > 0 && (
        <div className="space-y-[10px] mb-[14px]">
          {kayitliTezgahlar.map((t, i) => (
            <div
              key={t.id}
              className="bg-white border border-[#DDE8F0] border-l-[4px] border-l-[#00529C] rounded-[4px] px-[18px] py-[14px] flex justify-between items-center gap-4"
            >
              <div>
                <div className="text-[11px] text-[#8A98A8] tracking-[0.5px] mb-[3px]">TEZGAH #{i + 1}</div>
                <div className="text-[13px] font-medium text-[#003057]">{t.ozet}</div>
              </div>
              <button
                type="button"
                className="px-[10px] py-[4px] text-[11px] border border-[#DDE8F0] rounded-[2px] bg-white text-[#4A5568] hover:bg-[#FEF0E6] hover:text-[#C05C00] hover:border-[#C05C00] transition-colors cursor-pointer"
                onClick={() =>
                  setKayitliTezgahlar((prev) => prev.filter((x) => x.id !== t.id))
                }
              >
                Listeden Kaldır
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Alt butonlar */}
      <div className="flex items-center gap-4 mt-[4px]">
        <button
          type="button"
          className="px-[22px] py-[9px] rounded-[2px] text-[11px] font-medium tracking-[0.5px] uppercase bg-[#1A7A4A] text-white hover:bg-[#156040] transition-colors cursor-pointer"
          onClick={() => {
            resetForm();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          + Başka Tezgah Ekle
        </button>
        {kayitliTezgahlar.length > 0 && (
          <span className="text-[11px] text-[#8A98A8] tracking-[0.3px]">
            {kayitliTezgahlar.length} tezgah kaydedildi
          </span>
        )}
      </div>
    </div>
  );
}
