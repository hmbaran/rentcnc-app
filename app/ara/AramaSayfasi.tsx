"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { FirmaListeItem } from "@/lib/actions/firma";

// ── Sabit filtre seçenekleri ─────────────────────────────────────────────────
const TEZGAH_TIPLERI = [
  // Ana kategoriler (DB tezgah_tip.ad değerleri)
  "Dik İşleme Merkezi",
  "Yatay İşleme Merkezi",
  "Tornalar",
  "Otomatlar ve Kayar Otomatlar",
  "Taşlama Tezgahları",
  "Erozyon Tezgahları",
  "Portal Tezgahlar",
  "Gantry Tezgahlar",
  "Metal Şekillendirme/Kesme/Bükme",
  "Kaynak Tezgahları",
  "Dişli Tezgahları",
  "Honlama Tezgahları",
  "Tapping Centers / Delik Delme",
  "Universal / Manuel Tezgahlar",
  "Additive Manufacturing",
  "Takım Bileme Tezgahları",
  "Ölçüm / CMM Tezgahları",
  "Testereler",
  // Popüler alt kategoriler
  "Silindirik Taşlama",
  "Düzlem Taşlama",
  "Tel Erozyon",
  "Dalma Erozyon",
  "Diş Taşlama",
  "Diş Frezeleme (Hobbing)",
];

const MALZEMELER = [
  "Alüminyum", "Çelik", "Paslanmaz", "Titanyum",
  "Inconel / Süper Alaşım", "Bakır / Pirinç", "Magnezyum",
  "Kompozit (CFRP/GFRP)", "Seramik", "Plastik / PEEK",
  "Dökme Demir", "Takım Çeliği",
];

const SERTIFIKALAR = [
  "ISO 9001", "IATF 16949", "AS9100", "ISO 13485",
  "NADCAP", "ITAR", "ISO 14001", "DIN 6701",
];

const SEKTORLER = [
  "Havacılık", "Otomotiv", "Savunma", "Medikal",
  "Enerji", "Denizcilik", "Beyaz Eşya",
];

const ILLER = [
  "İstanbul", "Bursa", "Kocaeli", "Sakarya", "Tekirdağ",
  "İzmir", "Manisa", "Denizli",
  "Ankara", "Konya", "Kayseri", "Eskişehir",
  "Antalya", "Adana", "Gaziantep",
  "Samsun", "Trabzon",
];

type Siralama = "profil" | "tezgah" | "puan";

// ── Yardımcı bileşen: filtre chip ────────────────────────────────────────────
function Chip({
  label, active, onClick,
}: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-2.5 py-1 text-[11px] border rounded-sm cursor-pointer transition-all tracking-wide"
      style={
        active
          ? { background: "#003057", borderColor: "#003057", color: "#fff" }
          : { background: "#fff", borderColor: "#C8D8E8", color: "#4A5568" }
      }
    >
      {label}
    </button>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <div
        className="text-[9px] font-medium tracking-[1.5px] uppercase mb-2.5 pb-1.5 border-b"
        style={{ color: "#8A98A8", borderColor: "#DDE8F0" }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

// ── Ana bileşen ───────────────────────────────────────────────────────────────
export default function AramaSayfasi({ firmalar }: { firmalar: FirmaListeItem[] }) {
  const [aramaMetni, setAramaMetni] = useState("");
  const [secilenTipler, setSecilenTipler] = useState<string[]>([]);
  const [secilenMalzemeler, setSecilenMalzemeler] = useState<string[]>([]);
  const [secilenSertifikalar, setSecilenSertifikalar] = useState<string[]>([]);
  const [secilenSektorler, setSecilenSektorler] = useState<string[]>([]);
  const [secilenIl, setSecilenIl] = useState("");
  const [siralama, setSiralama] = useState<Siralama>("profil");
  const [sidebarAcik, setSidebarAcik] = useState(false);

  function toggler(list: string[], setList: (v: string[]) => void, val: string) {
    setList(list.includes(val) ? list.filter((x) => x !== val) : [...list, val]);
  }

  const filtrelenmis = useMemo(() => {
    let sonuc = firmalar.filter((f) => {
      if (
        aramaMetni &&
        ![f.ticari_unvan, f.il, f.ilce, ...f.tipAdlari, ...f.malzemeler, ...f.sertAdi]
          .join(" ")
          .toLowerCase()
          .includes(aramaMetni.toLowerCase())
      )
        return false;

      if (secilenTipler.length && !secilenTipler.some((t) => f.tipAdlari.some((a) => a.includes(t) || t.includes(a))))
        return false;

      if (secilenMalzemeler.length && !secilenMalzemeler.some((m) => f.malzemeler.some((a) => a.includes(m) || m.includes(a))))
        return false;

      if (secilenSertifikalar.length && !secilenSertifikalar.some((s) => f.sertAdi.some((a) => a.includes(s) || s.includes(a))))
        return false;

      if (secilenSektorler.length && !secilenSektorler.some((s) => f.sektorler.some((a) => a.includes(s) || s.includes(a))))
        return false;

      if (secilenIl && f.il !== secilenIl) return false;

      return true;
    });

    sonuc = [...sonuc].sort((a, b) => {
      if (siralama === "tezgah") return b.tezgahSayisi - a.tezgahSayisi;
      if (siralama === "puan") return (b.puan ?? 0) - (a.puan ?? 0);
      return (b.profil_doluluk ?? 0) - (a.profil_doluluk ?? 0);
    });

    return sonuc;
  }, [firmalar, aramaMetni, secilenTipler, secilenMalzemeler, secilenSertifikalar, secilenSektorler, secilenIl, siralama]);

  const aktifFiltreler: { etiket: string; temizle: () => void }[] = [
    ...secilenTipler.map((v) => ({ etiket: v, temizle: () => toggler(secilenTipler, setSecilenTipler, v) })),
    ...secilenMalzemeler.map((v) => ({ etiket: v, temizle: () => toggler(secilenMalzemeler, setSecilenMalzemeler, v) })),
    ...secilenSertifikalar.map((v) => ({ etiket: v, temizle: () => toggler(secilenSertifikalar, setSecilenSertifikalar, v) })),
    ...secilenSektorler.map((v) => ({ etiket: v, temizle: () => toggler(secilenSektorler, setSecilenSektorler, v) })),
    ...(secilenIl ? [{ etiket: secilenIl, temizle: () => setSecilenIl("") }] : []),
  ];

  function tumunuTemizle() {
    setSecilenTipler([]);
    setSecilenMalzemeler([]);
    setSecilenSertifikalar([]);
    setSecilenSektorler([]);
    setSecilenIl("");
    setAramaMetni("");
  }

  const SidebarIcerik = () => (
    <>
      <button
        className="md:hidden w-full py-2.5 mb-3.5 text-xs font-semibold text-white uppercase tracking-wider rounded-sm"
        style={{ background: "#003057" }}
        onClick={() => setSidebarAcik(false)}
      >
        ✕ Filtreleri Kapat
      </button>

      <FilterSection title="Tezgah Tipi">
        <div className="flex flex-wrap gap-1.5">
          {TEZGAH_TIPLERI.map((t) => (
            <Chip key={t} label={t} active={secilenTipler.includes(t)} onClick={() => toggler(secilenTipler, setSecilenTipler, t)} />
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Malzeme">
        <div className="flex flex-wrap gap-1.5">
          {MALZEMELER.map((m) => (
            <Chip key={m} label={m} active={secilenMalzemeler.includes(m)} onClick={() => toggler(secilenMalzemeler, setSecilenMalzemeler, m)} />
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Sertifika">
        <div className="flex flex-wrap gap-1.5">
          {SERTIFIKALAR.map((s) => (
            <Chip key={s} label={s} active={secilenSertifikalar.includes(s)} onClick={() => toggler(secilenSertifikalar, setSecilenSertifikalar, s)} />
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Sektör Tecrübesi">
        <div className="flex flex-wrap gap-1.5">
          {SEKTORLER.map((s) => (
            <Chip key={s} label={s} active={secilenSektorler.includes(s)} onClick={() => toggler(secilenSektorler, setSecilenSektorler, s)} />
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Şehir / Bölge">
        <select
          value={secilenIl}
          onChange={(e) => setSecilenIl(e.target.value)}
          className="w-full px-2.5 py-1.5 text-xs border rounded-sm outline-none"
          style={{ borderColor: "#C8D8E8", color: "#3D4E63", background: "#fff" }}
        >
          <option value="">Tüm Türkiye</option>
          {ILLER.map((il) => <option key={il}>{il}</option>)}
        </select>
      </FilterSection>

      {aktifFiltreler.length > 0 && (
        <button
          onClick={tumunuTemizle}
          className="w-full py-1.5 text-[10px] text-center uppercase tracking-wide border rounded-sm mt-1 hover:opacity-80 transition-opacity"
          style={{ borderColor: "#DDE8F0", color: "#0077CC" }}
        >
          Filtreleri Temizle
        </button>
      )}
    </>
  );

  return (
    <div className="flex flex-col" style={{ height: "100vh", background: "#F4F7FB", fontFamily: "-apple-system,'Segoe UI',sans-serif" }}>
      {/* TOPBAR */}
      <div className="flex items-center gap-3 px-5 flex-shrink-0" style={{ background: "#003057", height: 52 }}>
        <Link href="/" className="text-white text-[13px] font-light tracking-[3px] uppercase flex-shrink-0 hover:opacity-80">
          RENT<span className="font-semibold" style={{ color: "#7ABFFF" }}>CNC</span>MACHINE
        </Link>
        <div className="flex-1 relative max-w-lg">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/45 text-sm">⌕</span>
          <input
            type="text"
            value={aramaMetni}
            onChange={(e) => setAramaMetni(e.target.value)}
            placeholder="Tezgah tipi, malzeme, şehir..."
            className="w-full py-2 pr-3 text-xs text-white outline-none rounded-sm"
            style={{ paddingLeft: 32, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)" }}
          />
        </div>
        <div className="ml-auto flex gap-2">
          <Link href="/giris" className="text-[11px] px-4 py-1.5 uppercase tracking-wide rounded-sm transition-all" style={{ border: "1px solid rgba(255,255,255,0.25)", color: "rgba(255,255,255,0.8)" }}>
            Giriş
          </Link>
          <Link href="/kayit/fasoncu" className="text-[11px] px-4 py-1.5 uppercase tracking-wide rounded-sm text-white" style={{ background: "#0077CC" }}>
            Kayıt Ol
          </Link>
        </div>
      </div>

      {/* BODY */}
      <div className="flex flex-1 overflow-hidden">
        {/* MOBİL OVERLAY */}
        {sidebarAcik && (
          <div
            className="fixed inset-0 z-40 md:hidden overflow-y-auto p-3"
            style={{ background: "#fff" }}
          >
            {SidebarIcerik()}
          </div>
        )}

        {/* SIDEBAR — masaüstü */}
        <div
          className="hidden md:block flex-shrink-0 overflow-y-auto p-4"
          style={{ width: 220, background: "#fff", borderRight: "1px solid #DDE8F0" }}
        >
          {SidebarIcerik()}
        </div>

        {/* SONUÇLAR */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Mobil filtre butonu */}
          <button
            className="md:hidden mb-3 flex items-center gap-1.5 px-3.5 py-2 text-[11px] font-semibold uppercase tracking-wide border rounded-sm"
            style={{ background: "#fff", borderColor: "#C8D8E8", color: "#3D4E63" }}
            onClick={() => setSidebarAcik(true)}
          >
            ☰ Filtrele {aktifFiltreler.length > 0 && `(${aktifFiltreler.length})`}
          </button>

          {/* Aktif filtre etiketleri */}
          {aktifFiltreler.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {aktifFiltreler.map((f) => (
                <span
                  key={f.etiket}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-sm text-[10px] text-white"
                  style={{ background: "#003057" }}
                >
                  {f.etiket}
                  <button onClick={f.temizle} className="opacity-70 hover:opacity-100 text-xs leading-none">✕</button>
                </span>
              ))}
            </div>
          )}

          {/* Başlık + sıralama */}
          <div className="flex justify-between items-center mb-3">
            <div className="text-xs" style={{ color: "#4A5568" }}>
              <strong style={{ color: "#003057", fontWeight: 500 }}>{filtrelenmis.length}</strong> firma bulundu
            </div>
            <div className="flex items-center gap-2 text-[11px]" style={{ color: "#8A98A8" }}>
              <span>Sırala:</span>
              <select
                value={siralama}
                onChange={(e) => setSiralama(e.target.value as Siralama)}
                className="px-2 py-1 text-[11px] border rounded-sm outline-none"
                style={{ borderColor: "#C8D8E8", color: "#3D4E63", background: "#fff" }}
              >
                <option value="profil">Profil Doluluk</option>
                <option value="tezgah">Tezgah Sayısı</option>
                <option value="puan">Puan</option>
              </select>
            </div>
          </div>

          {/* Kart grid */}
          {filtrelenmis.length === 0 ? (
            <div className="text-center py-16 text-sm" style={{ color: "#8A98A8" }}>
              <div className="text-4xl mb-3">🔍</div>
              Sonuç bulunamadı. Filtreleri değiştirmeyi deneyin.
            </div>
          ) : (
            <div className="grid gap-2.5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
              {filtrelenmis.map((f) => <FirmaKarti key={f.firma_id} firma={f} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Firma kartı ───────────────────────────────────────────────────────────────
function FirmaKarti({ firma }: { firma: FirmaListeItem }) {
  const basTumsayisi = firma.ticari_unvan
    .split(" ")
    .slice(0, 2)
    .map((w: string) => w[0])
    .join("")
    .toUpperCase();

  const musait = firma.mevcut_durum === "musait";

  return (
    <Link
      href={`/firma/${firma.firma_id}`}
      className="block rounded border transition-all hover:border-[#00529C]"
      style={{ background: "#fff", borderColor: "#DDE8F0", textDecoration: "none", color: "inherit" }}
    >
      {/* Üst */}
      <div className="p-4 border-b" style={{ borderColor: "#DDE8F0" }}>
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2.5">
            <div
              className="flex-shrink-0 flex items-center justify-center text-sm font-bold rounded"
              style={{ width: 36, height: 36, background: "#E8F2FA", color: "#003057" }}
            >
              {basTumsayisi}
            </div>
            <div>
              <div className="text-[13px] font-medium leading-snug" style={{ color: "#003057" }}>
                {firma.ticari_unvan}
              </div>
              <div className="text-[10px] mt-0.5 tracking-wide" style={{ color: "#8A98A8" }}>
                📍 {[firma.ilce, firma.il].filter(Boolean).join(", ")}
              </div>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            {firma.puan !== null && (
              <div className="text-[12px] tracking-wide" style={{ color: "#B87A0A" }}>
                {"★".repeat(Math.round(firma.puan))}
              </div>
            )}
            {firma.profil_doluluk !== null && (
              <div className="text-[9px] mt-0.5 tracking-wide" style={{ color: "#8A98A8" }}>
                %{firma.profil_doluluk}
              </div>
            )}
          </div>
        </div>

        {/* Badge'ler */}
        {(firma.sertAdi.length > 0 || firma.dogrulanmis_rozet) && (
          <div className="flex flex-wrap gap-1 mb-2">
            {firma.dogrulanmis_rozet && (
              <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-sm uppercase tracking-wide" style={{ background: "#E8F5EE", color: "#1A7A4A" }}>
                ✓ Doğrulanmış
              </span>
            )}
            {firma.sertAdi.slice(0, 2).map((s) => (
              <span key={s} className="text-[9px] font-medium px-1.5 py-0.5 rounded-sm uppercase tracking-wide" style={{ background: "#E8F5EE", color: "#1A7A4A" }}>
                {s}
              </span>
            ))}
            {firma.sertAdi.length > 2 && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-sm" style={{ background: "#F4F7FB", color: "#8A98A8" }}>
                +{firma.sertAdi.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Tezgah bilgisi */}
        <div className="text-[11px] leading-relaxed" style={{ color: "#4A5568" }}>
          <strong style={{ color: "#1A2535", fontWeight: 500 }}>{firma.tezgahSayisi} tezgah</strong>
          {firma.tipAdlari.length > 0 && (
            <> · {firma.tipAdlari.slice(0, 2).join(", ")}{firma.tipAdlari.length > 2 ? "…" : ""}</>
          )}
        </div>
      </div>

      {/* Alt */}
      <div className="px-4 py-2.5 flex justify-between items-center">
        <span className="text-[10px] tracking-wide" style={{ color: "#8A98A8" }}>
          <span
            className="inline-block w-1.5 h-1.5 rounded-full mr-1 align-middle"
            style={{ background: musait ? "#1A7A4A" : "#C05C00" }}
          />
          {firma.kurulus_yili ? `Kur.: ${firma.kurulus_yili}` : "–"}
        </span>
        <span
          className="text-[10px] px-3 py-1 border rounded-sm uppercase tracking-wide transition-all"
          style={{ borderColor: "#00529C", color: "#00529C" }}
        >
          Detay →
        </span>
      </div>
    </Link>
  );
}
