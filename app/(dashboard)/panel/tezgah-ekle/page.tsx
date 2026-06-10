"use client";

import { useState, useTransition, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { tezgahKaydet, type TezgahKaydetInput } from "@/lib/actions/tezgah";
import TezgahParametrelerBolumu from "@/app/(dashboard)/panel/_components/TezgahParametrelerBolumu";

type TipItem = { tipId: number; kod: string; ad: string };
type AltKategoriItem = { altKategoriId: number; kod: string; ad: string };
type EksenItem = { eksenId: number; ad: string };
type MarkaItem = { markaId: number; ad: string; ulke: string };

// Ülke kodu → emoji + Türkçe ad (Türkiye pazarı öncelik sırası)
const ULKE_GRUPLARI: { ulkeler: string[]; etiket: string }[] = [
  { ulkeler: ["KR"],             etiket: "🇰🇷 Kore"     },
  { ulkeler: ["TW"],             etiket: "🇹🇼 Tayvan"   },
  { ulkeler: ["JP"],             etiket: "🇯🇵 Japonya"  },
  { ulkeler: ["TR"],             etiket: "🇹🇷 Türkiye"  },
  { ulkeler: ["DE","CH","AT"],   etiket: "🇩🇪 Avrupa"   },
  { ulkeler: ["US","CA"],        etiket: "🇺🇸 ABD"       },
  { ulkeler: ["CN"],             etiket: "🇨🇳 Çin"       },
  { ulkeler: ["IT","ES","SE","BE","GB","FR","FI","NL"], etiket: "🌍 Diğer Avrupa" },
];

function grupluMarkalar(markalar: MarkaItem[]) {
  const grups: { etiket: string; items: MarkaItem[] }[] = [];
  const kullanilan = new Set<number>();
  for (const grup of ULKE_GRUPLARI) {
    const items = markalar.filter(
      (m) => grup.ulkeler.includes(m.ulke) && !kullanilan.has(m.markaId)
    );
    if (items.length > 0) {
      items.forEach((m) => kullanilan.add(m.markaId));
      grups.push({ etiket: grup.etiket, items });
    }
  }
  // Kalan (ülkesi bilinmeyen)
  const diger = markalar.filter((m) => !kullanilan.has(m.markaId));
  if (diger.length > 0) grups.push({ etiket: "🔧 Diğer", items: diger });
  return grups;
}

type KayitliTezgah = { id: number; ozet: string };

// Alt kategori kodu → model sorgusunda kullanılacak gerçek tip_id
// (Hibrit/Mill-Turn gibi farklı tip altında saklanan modeller için)
const ALTKAT_TIP_OVERRIDE: Record<string, number> = {
  millturn: 46, // Turn-Mill / Tornalama Merkezi → Hibrit Tezgahlar (tip_id=46)
};

// Alt kategori koduna göre gösterilecek ipucu (bilgi banner)
const ALTKAT_BILGI: Record<string, string> = {
  millturn: "Turn-Mill / Tornalama Merkezleri; tornalama + frezeleme işlemlerini tek bağlamada yapabilen tezgahlardır. Model bulamazsanız 'Manuel Giriş' seçeneğini kullanın.",
};

// Tezgah tipi seçilince gösterilecek genel yönlendirme
const TIP_BILGI: Record<number, string> = {
  33: "5 eksen ve çok eksenli işleme merkezleri bu kategorinin alt seçeneklerinde yer alır. Her markanın 5 eksen serileri farklı isimlendirilir — alt kategoriden uygun tipi seçin.",
  35: "Turn-Mill / Tornalama Merkezleri 'Turn-Mill' alt kategorisinde listelenmiştir. Her markanın bu serideki modelleri farklı isimler taşır — modeli listede bulamazsanız manuel giriş yapın.",
  41: "Lazer kesme, abkant pres, plazma kesme, su jeti ve diğer sac işleme tezgahları bu kategorinin altındadır. Alt kategoride işleme türünü seçin.",
  46: "Hibrit tezgahlar; birden fazla işlem türünü (frezeleme + tornalama vb.) bir arada yapabilen çok işlevli merkezlerdir.",
};

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

// ============================================================
// AI Analiz Bileşeni
// ============================================================
type AnalizSonucu = {
  marka: string | null;
  model: string | null;
  tezgahTipi: string | null;
  kontrolSistemi: string | null;
  yaklasikYil: number | null;
  guven: "yuksek" | "orta" | "dusuk";
  notlar: string | null;
};

function AIAnalizButon({
  foto,
  onSonuc,
}: {
  foto: File;
  onSonuc: (s: AnalizSonucu) => void;
}) {
  const [durum, setDurum] = useState<"bosta" | "yukleniyor" | "tamam" | "hata">("bosta");
  const [mesaj, setMesaj] = useState("");

  async function analiz() {
    setDurum("yukleniyor");
    setMesaj("");
    try {
      const fd = new FormData();
      fd.append("foto", foto);
      const res = await fetch("/api/foto-analiz", { method: "POST", body: fd });
      const veri = await res.json();
      if (veri.hata) throw new Error(veri.hata);
      onSonuc(veri as AnalizSonucu);
      const guvenMesaj = veri.guven === "yuksek" ? "✓ Yüksek güven" : veri.guven === "orta" ? "~ Orta güven" : "! Düşük güven";
      setMesaj(guvenMesaj + (veri.notlar ? ` — ${veri.notlar}` : ""));
      setDurum("tamam");
    } catch (err) {
      setMesaj("Analiz yapılamadı: " + String(err));
      setDurum("hata");
    }
  }

  return (
    <div className="mt-[8px]">
      <button
        type="button"
        onClick={analiz}
        disabled={durum === "yukleniyor"}
        className="flex items-center gap-[8px] px-[14px] py-[9px] bg-[#1A1A2E] text-white rounded-[3px] text-[11px] font-medium tracking-[0.3px] hover:bg-[#2D2D44] transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <span className="text-[15px]">🤖</span>
        {durum === "yukleniyor" ? "Analiz ediliyor…" : "Fotoğraftan Otomatik Doldur"}
      </button>
      {mesaj && (
        <div className={`mt-[6px] text-[10.5px] px-[10px] py-[6px] rounded-[3px] ${
          durum === "tamam" ? "bg-[#E8F5EE] text-[#1A7A4A]" : "bg-red-50 text-red-600"
        }`}>
          {mesaj}
        </div>
      )}
      {durum === "tamam" && (
        <div className="text-[10px] text-[#8A98A8] mt-[4px]">
          Doldurulan alanları kontrol edin, gerekirse düzeltin
        </div>
      )}
    </div>
  );
}

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
  const [altKategoriKod, setAltKategoriKod] = useState("");
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
  const [parametreler, setParametreler] = useState<Record<string, string>>({});

  // Fotoğraf state'leri
  type FotoOnizleme = { file: File; previewUrl: string; id: string };
  const [fotolar, setFotolar] = useState<FotoOnizleme[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // UI state
  const [yükleniyor, setYükleniyor] = useState({ tipler: false, altKat: false, eksen: false, marka: false, model: false });
  const [hata, setHata] = useState("");
  const [kayitliTezgahlar, setKayitliTezgahlar] = useState<KayitliTezgah[]>([]);

  // Otomatik taslak
  const TASLAK_KEY = "rentcnc_tezgah_taslak";
  const [taslakVar, setTaslakVar] = useState(false);
  const debounceRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRestore = useRef<Record<string, unknown> | null>(null);

  // Taslak kontrol — tipler yüklenince
  useEffect(() => {
    if (tipler.length === 0) return;
    try {
      const kayitli = localStorage.getItem(TASLAK_KEY);
      if (kayitli) {
        const v = JSON.parse(kayitli);
        if (v.tipId) setTaslakVar(true);
      }
    } catch { /* ignore */ }
  }, [tipler]);

  // Alt kategoriler yüklenince → cascade'den gelen değerleri geri yükle
  useEffect(() => {
    const v = pendingRestore.current;
    if (!v || altKategoriler.length === 0) return;
    if (v.altKategoriId) {
      setAltKategoriId(v.altKategoriId as number);
      setAltKategoriAdi(v.altKategoriAdi as string ?? "");
    }
  }, [altKategoriler]);

  // Markalar yüklenince → marka + model geri yükle
  useEffect(() => {
    const v = pendingRestore.current;
    if (!v || markalar.length === 0) return;

    const markaAdDeger = v.markaAdi as string ?? "";
    if (markaAdDeger) {
      setMarkaAdi(markaAdDeger);
      setMarkaId(v.markaId as number ?? null);
      setMarkaManuel(v.markaManuel as string ?? "");

      if (markaAdDeger !== "Diğer / Manuel Giriş") {
        const tipParam = v.tipId ? `&tipId=${v.tipId}` : "";
        fetch(`/api/modeller?markaAdi=${encodeURIComponent(markaAdDeger)}${tipParam}`)
          .then((r) => r.json())
          .then((data) => {
            if (Array.isArray(data)) {
              setModeller(data);
              if (v.modelSec) setModelSec(v.modelSec as string);
            }
          })
          .catch(() => {});
      }
    }
    pendingRestore.current = null; // Geri yükleme tamamlandı
  }, [markalar]);

  // Taslak yükle — sadece teknik alanları + tip seçimini tetikle
  function taslakYukle() {
    try {
      const kayitli = localStorage.getItem(TASLAK_KEY);
      if (!kayitli) return;
      const v = JSON.parse(kayitli);

      // Teknik alanlar hemen set edilir
      setBagXMm(v.bagXMm ?? "");
      setBagYMm(v.bagYMm ?? "");
      setBagZMm(v.bagZMm ?? "");
      setMaxRpm(v.maxRpm ?? "");
      setYapimYili(v.yapimYili ?? "");
      setKontrolSistemi(v.kontrolSistemi ?? "");
      setDurum(v.durum ?? "");
      setModelManuel(v.modelManuel ?? "");
      setEksenAdi(v.eksenAdi ?? "");

      // Cascade sonrası geri yükleme için ref'e kaydet
      pendingRestore.current = v;

      // Cascade'i başlat
      if (v.tipId) tipDegisti(String(v.tipId));
    } catch { /* ignore */ }
    setTaslakVar(false);
  }

  function taslakReddet() {
    localStorage.removeItem(TASLAK_KEY);
    setTaslakVar(false);
  }

  // Otomatik kayıt (debounce 2sn)
  useEffect(() => {
    if (!tipId) return; // Bir şey seçilmediyse kaydetme
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      try {
        localStorage.setItem(TASLAK_KEY, JSON.stringify({
          tipId, tipKod, tipAdi,
          altKategoriId, altKategoriAdi,
          eksenAdi, markaAdi, markaManuel, markaId,
          modelSec, modelManuel,
          bagXMm, bagYMm, bagZMm, maxRpm, yapimYili,
          kontrolSistemi, durum,
        }));
      } catch { /* ignore */ }
    }, 2000);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipId, altKategoriId, eksenAdi, markaAdi, markaManuel, modelSec, modelManuel,
      bagXMm, bagYMm, bagZMm, maxRpm, yapimYili, kontrolSistemi, durum]);

  // Bölüm görünürlükleri
  const altKatGoster = tipId !== null;
  const altDetayGoster = altKategoriId !== null;
  const markaManuelGoster = markaAdi === "Diğer / Manuel Giriş";
  const modelGoster = altKategoriId !== null;
  const modelManuelGoster = modelSec === "__manuel__";

  // Form geçerliliği
  const markaGecerli = markaAdi && (markaAdi !== "Diğer / Manuel Giriş" || markaManuel.trim() !== "");
  const formGecerli = tipId && altKategoriId && markaGecerli && durum;

  // Eksik zorunlu alanlar
  const eksikAlanlar = altKategoriId ? [
    ...(markaGecerli ? [] : ["Marka seçimi"]),
    ...(durum ? [] : ["Durum (Aktif / Kısmen Müsait / Bakımda)"]),
  ] : [];

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
    setAltKategoriId(null); setAltKategoriAdi(""); setAltKategoriKod("");
    setEksenAdi(""); setMarkaId(null); setMarkaAdi(""); setMarkaManuel("");
    setModelSec(""); setModelManuel(""); setModeller([]);
    setEksenler([]); setAltKategoriler([]); setMarkalar([]);
    setDurum(""); setKontrolSistemi("");
    setBagXMm(""); setBagYMm(""); setBagZMm(""); setMaxRpm(""); setYapimYili("");
    setParametreler({});

    if (!sec) return;
    setYükleniyor((p) => ({ ...p, altKat: true }));
    setHata("");
    try {
      const fetchJson = (url: string) => {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 15000);
        return fetch(url, { signal: ctrl.signal })
          .then((r) => r.json())
          .finally(() => clearTimeout(t));
      };
      const [altRes, markaRes] = await Promise.all([
        fetchJson(`/api/alt-kategoriler?tipKod=${sec.kod}`),
        fetchJson(`/api/markalar?tipKod=${sec.kod}`),
      ]);
      setAltKategoriler(Array.isArray(altRes) ? altRes : []);
      setMarkalar(Array.isArray(markaRes) ? markaRes : []);
    } catch {
      setHata(`"${sec.ad}" için veriler yüklenemedi. Lütfen tekrar deneyin.`);
    } finally {
      setYükleniyor((p) => ({ ...p, altKat: false }));
    }
  }, [tipler]);

  const altKatDegisti = useCallback(async (val: string) => {
    const sec = altKategoriler.find((a) => String(a.altKategoriId) === val);
    setAltKategoriId(sec ? sec.altKategoriId : null);
    setAltKategoriAdi(sec?.ad ?? "");
    setAltKategoriKod(sec?.kod ?? "");
    setEksenAdi(""); setMarkaId(null); setMarkaAdi(""); setMarkaManuel("");
    setModelSec(""); setModelManuel(""); setModeller([]);

    if (!sec) return;
    setYükleniyor((p) => ({ ...p, eksen: true }));
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      const eksenRes = await fetch(
        `/api/eksenler?altKategoriId=${sec.altKategoriId}`,
        { signal: controller.signal }
      ).then((r) => r.json()).finally(() => clearTimeout(timeoutId));
      setEksenler(Array.isArray(eksenRes) ? eksenRes : []);
    } catch {
      // Eksen opsiyonel — hata gösterme, sadece boş bırak
      setEksenler([]);
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
      // Alt kategori override: millturn → Hibrit (46) gibi farklı tip_id'de saklı modeller
      const modelTipId = altKategoriKod && ALTKAT_TIP_OVERRIDE[altKategoriKod]
        ? ALTKAT_TIP_OVERRIDE[altKategoriKod]
        : tipId;
      const tipParam = modelTipId ? `&tipId=${modelTipId}` : "";
      // 8 saniyelik timeout — asılı kalmayı önle
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      const modelRes = await fetch(
        `/api/modeller?markaAdi=${encodeURIComponent(val)}${tipParam}`,
        { signal: controller.signal }
      ).then((r) => r.json()).finally(() => clearTimeout(timeoutId));
      const liste = Array.isArray(modelRes) ? modelRes : [];
      setModeller(liste);
      // Marka DB'de yok (0 model) → otomatik Manuel Giriş moduna geç
      if (liste.length === 0) setModelSec("__manuel__");
    } catch {
      // Modeller opsiyonel — hata veya timeout → manuel girişe geç
      setModeller([]);
      setModelSec("__manuel__");
    } finally {
      setYükleniyor((p) => ({ ...p, model: false }));
    }
  }, [markalar, tipId, altKategoriKod]);

  // Fotoğraf seç
  const fotoSec = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const yeniOlanlar = files
      .filter((f) => fotolar.length + files.indexOf(f) < 5) // max 5
      .map((f) => ({
        file: f,
        previewUrl: URL.createObjectURL(f),
        id: Math.random().toString(36).slice(2),
      }));
    setFotolar((prev) => [...prev, ...yeniOlanlar].slice(0, 5));
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [fotolar]);

  const fotoKaldir = useCallback((id: string) => {
    setFotolar((prev) => {
      const kaldir = prev.find((f) => f.id === id);
      if (kaldir) URL.revokeObjectURL(kaldir.previewUrl);
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  const resetForm = useCallback(() => {
    setTipId(null); setTipKod(""); setTipAdi("");
    setAltKategoriId(null); setAltKategoriAdi(""); setAltKategoriKod("");
    setEksenAdi(""); setMarkaId(null); setMarkaAdi(""); setMarkaManuel("");
    setModelSec(""); setModelManuel("");
    setBagXMm(""); setBagYMm(""); setBagZMm(""); setMaxRpm(""); setYapimYili("");
    setKontrolSistemi(""); setDurum("");
    setParametreler({});
    setAltKategoriler([]); setEksenler([]); setMarkalar([]); setModeller([]);
    fotolar.forEach((f) => URL.revokeObjectURL(f.previewUrl));
    setFotolar([]);
    setHata("");
    localStorage.removeItem(TASLAK_KEY);
  }, [fotolar]);

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
      parametreler: Object.fromEntries(
        Object.entries(parametreler).filter(([, v]) => v !== "")
      ),
    };

    setHata("");
    startTransition(async () => {
      // Fotoğrafları server API üzerinden yükle
      let gorselData: { url: string; storagePath: string }[] = [];
      if (fotolar.length > 0) {
        const fd = new FormData();
        fotolar.forEach((f) => fd.append("dosya", f.file));
        const res = await fetch("/api/upload-gorsel", { method: "POST", body: fd });
        const json = await res.json();
        if (json.gorseller) gorselData = json.gorseller;
        else console.error("Upload hatası:", json.hata);
      }

      const sonuc = await tezgahKaydet({ ...input, gorseller: gorselData });
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

      {/* Yarım kalan taslak banner */}
      {taslakVar && (
        <div className="bg-[#FEF8E6] border border-[#E8D200] rounded-[3px] px-[14px] py-[11px] mb-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-[10px]">
            <span className="text-[18px]">📋</span>
            <div>
              <div className="text-[12px] font-semibold text-[#7A6200]">Yarım kalan form bulundu</div>
              <div className="text-[10.5px] text-[#A08000] mt-[1px]">Kaldığınız yerden devam etmek ister misiniz?</div>
            </div>
          </div>
          <div className="flex gap-[8px] flex-shrink-0">
            <button type="button" onClick={taslakYukle}
              className="px-[12px] py-[6px] bg-[#C77700] text-white text-[10.5px] font-medium rounded-[2px] cursor-pointer hover:bg-[#A56200] transition-colors">
              Devam Et
            </button>
            <button type="button" onClick={taslakReddet}
              className="px-[12px] py-[6px] border border-[#C8B800] text-[#7A6200] text-[10.5px] font-medium rounded-[2px] cursor-pointer hover:bg-[#FEF0A0] transition-colors">
              Yeni Başla
            </button>
          </div>
        </div>
      )}

      {/* Hata mesajı */}
      {hata && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-[12px] px-[14px] py-[10px] rounded-[3px] mb-4 flex items-center justify-between gap-3">
          <span>{hata}</span>
          {tipId && (
            <button
              type="button"
              onClick={() => tipDegisti(String(tipId))}
              className="flex-shrink-0 px-3 py-1 bg-red-600 text-white rounded-[2px] text-[10px] font-semibold uppercase tracking-wide hover:bg-red-700 transition-colors cursor-pointer"
            >
              ↺ Tekrar Dene
            </button>
          )}
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
          {/* Tip bazlı yönlendirme */}
          {tipId && TIP_BILGI[tipId] && (
            <div className="flex items-start gap-[8px] mt-[7px] bg-[#EEF6FF] border border-[#B8D4F0] rounded-[3px] px-[11px] py-[8px]">
              <span className="text-[14px] flex-shrink-0">💡</span>
              <span className="text-[11px] text-[#004A8F] leading-[1.5]">{TIP_BILGI[tipId]}</span>
            </div>
          )}
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
            {/* Alt kategori bazlı bilgi */}
            {altKategoriKod && ALTKAT_BILGI[altKategoriKod] && (
              <div className="flex items-start gap-[8px] mt-[5px] bg-[#EEF6FF] border border-[#B8D4F0] rounded-[3px] px-[11px] py-[8px]">
                <span className="text-[14px] flex-shrink-0">💡</span>
                <span className="text-[11px] text-[#004A8F] leading-[1.5]">{ALTKAT_BILGI[altKategoriKod]}</span>
              </div>
            )}
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
              {grupluMarkalar(markalar).map((grup) => (
                <optgroup key={grup.etiket} label={grup.etiket}>
                  {grup.items.map((m) => (
                    <option key={m.markaId} value={m.ad}>{m.ad}</option>
                  ))}
                </optgroup>
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
            {!yükleniyor.model && markaAdi && markaAdi !== "Diğer / Manuel Giriş" && (
              <div className={`text-[9px] font-semibold tracking-[0.5px] mt-[2px] ${modeller.length > 0 ? "text-[#1A7A4A]" : "text-[#C05C00]"}`}>
                {modeller.length > 0
                  ? `${modeller.length} model listelendi`
                  : "Bu marka için model bulunamadı — aşağıdan manuel giriş yapın"}
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
                    type="text"
                    inputMode="numeric"
                    className={inputCls}
                    placeholder={ph}
                    value={val}
                    onChange={(e) => set(e.target.value.replace(/[^0-9]/g, ""))}
                  />
                </div>
              ))}
            </div>

            {/* RPM + Yıl */}
            <div className="grid grid-cols-2 gap-[13px] mb-[13px]">
              <div className="flex flex-col gap-[5px]">
                <label className={labelCls}>Max. İşmili Devri (RPM)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  className={inputCls}
                  placeholder="12000"
                  value={maxRpm}
                  onChange={(e) => setMaxRpm(e.target.value.replace(/[^0-9]/g, ""))}
                />
              </div>
              <div className="flex flex-col gap-[5px]">
                <label className={labelCls}>Yapım Yılı</label>
                <input
                  type="text"
                  inputMode="numeric"
                  className={inputCls}
                  placeholder="2019"
                  value={yapimYili}
                  onChange={(e) => setYapimYili(e.target.value.replace(/[^0-9]/g, ""))}
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
          {/* Dinamik Teknik Parametreler */}
          <TezgahParametrelerBolumu
            tipId={tipId}
            degerler={parametreler}
            onChange={(key, val) => setParametreler((prev) => ({ ...prev, [key]: val }))}
          />

          {/* Fotoğraf Yükleme */}
          <div className="flex flex-col gap-[5px] mb-[13px] mt-[16px]">
            <label className={labelCls}>
              Tezgah Fotoğrafları{" "}
              <span className="text-[9px] text-[#8A98A8] font-normal normal-case tracking-normal">
                (İsteğe bağlı — max 5 adet, JPG/PNG/WebP)
              </span>
            </label>

            {/* Yüklü fotoğraflar */}
            {fotolar.length > 0 && (
              <div className="flex gap-[8px] flex-wrap mb-[8px]">
                {fotolar.map((f) => (
                  <div key={f.id} className="relative w-[72px] h-[72px] rounded-[3px] overflow-hidden border border-[#DDE8F0] group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={f.previewUrl} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => fotoKaldir(f.id)}
                      className="absolute inset-0 bg-black/50 text-white text-[18px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {/* Boş slot göstergesi */}
                {fotolar.length < 5 && (
                  <div className="w-[72px] h-[72px] rounded-[3px] border-2 border-dashed border-[#C8D8E8] flex items-center justify-center text-[#8A98A8] text-[10px]">
                    {5 - fotolar.length} kaldı
                  </div>
                )}
              </div>
            )}

            {/* Dosya seç butonu */}
            {fotolar.length < 5 && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  className="hidden"
                  onChange={fotoSec}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-[8px] px-[14px] py-[9px] border border-dashed border-[#A0B4C8] rounded-[3px] text-[11px] text-[#5B6770] hover:border-[#003057] hover:text-[#003057] hover:bg-[#F8FAFB] transition-all cursor-pointer w-fit"
                >
                  <span className="text-[16px]">📷</span>
                  {fotolar.length === 0 ? "Fotoğraf Ekle" : "Daha Fazla Ekle"}
                </button>
              </>
            )}
            <div className="text-[10px] text-[#8A98A8] mt-[2px]">
              Alıcılar tezgahın durumunu ve modelini görebilir — fotoğraf güveni artırır
            </div>

            {/* AI Analiz butonu */}
            {fotolar.length > 0 && (
              <AIAnalizButon
                foto={fotolar[0].file}
                onSonuc={(sonuc) => {
                  if (sonuc.marka) {
                    const bulunan = markalar.find(
                      (m) => m.ad.toLowerCase().includes(sonuc.marka!.toLowerCase()) ||
                             sonuc.marka!.toLowerCase().includes(m.ad.toLowerCase())
                    );
                    if (bulunan) markaDegisti(bulunan.ad);
                  }
                  if (sonuc.model) setModelManuel(sonuc.model);
                  if (sonuc.kontrolSistemi) setKontrolSistemi(sonuc.kontrolSistemi);
                  if (sonuc.yaklasikYil) setYapimYili(String(sonuc.yaklasikYil));
                }}
              />
            )}
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

        {/* Eksik alan uyarısı */}
        {altKategoriId && eksikAlanlar.length > 0 && (
          <div className="bg-[#FFF0D6] border-2 border-[#C77700] rounded-[3px] px-[14px] py-[12px] mt-[4px] mb-[2px]"
            style={{ boxShadow: "0 0 0 3px rgba(199,119,0,0.12)" }}>
            <div className="flex items-center gap-[8px] mb-[8px]">
              <span className="text-[18px] leading-none">⚠️</span>
              <div className="text-[12px] font-bold text-[#7A3D00] tracking-[0.2px]">
                Kayıt için şu alanlar zorunludur:
              </div>
            </div>
            <ul className="list-none space-y-[6px]">
              {eksikAlanlar.map((alan) => (
                <li key={alan} className="flex items-center gap-[8px]">
                  <span className="flex-shrink-0 w-[18px] h-[18px] rounded-full bg-[#C77700] text-white flex items-center justify-center text-[10px] font-black">!</span>
                  <span className="text-[12px] font-bold text-[#7A3D00]">{alan}</span>
                </li>
              ))}
            </ul>
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
          {/* Kaydet butonu — her zaman görünür, eksikse soluk + uyarı */}
          {altKategoriId && (
            <button
              type="button"
              className={`px-[22px] py-[9px] rounded-[2px] text-[11px] font-medium tracking-[0.5px] uppercase transition-colors
                ${formGecerli
                  ? "bg-[#003057] text-white hover:bg-[#004080] cursor-pointer"
                  : "bg-[#A0B4C8] text-white cursor-not-allowed opacity-70"
                } disabled:opacity-60`}
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
