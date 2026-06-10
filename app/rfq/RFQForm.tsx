"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { rfqOlustur } from "@/lib/actions/rfq";
import { rfqEslesmeFirmalariGetir, type RfqEslesmeFirma } from "@/lib/actions/firma";

// ─── Sabit listeler ───────────────────────────────────────────────────────────

const MALZEMELER = [
  "Çelik", "Paslanmaz Çelik", "Alüminyum", "Titanyum", "Inconel / Süper Alaşım",
  "Bakır / Pirinç / Bronz", "Magnezyum", "Çinko", "Dökme Demir", "Sfero Döküm",
  "Takım Çeliği", "Sertleştirilmiş Çelik", "Karbür", "Seramik",
  "Plastik / PEEK / Naylon", "Kompozit (CFRP / GFRP)", "Ahşap / MDF",
];

const SERTIFIKALAR = [
  "ISO 9001", "IATF 16949", "AS9100", "ISO 13485",
  "NADCAP", "ISO 14001", "CMM Ölçüm Raporu",
  "FAI (İlk Parti Kontrol)", "Malzeme Sertifikası",
];

const ILLER = [
  "Bursa", "İstanbul", "Ankara", "İzmir", "Kocaeli", "Konya",
  "Gaziantep", "Kayseri", "Eskişehir", "Sakarya", "Manisa", "Denizli",
  "Marmara Bölgesi", "Ege Bölgesi", "İç Anadolu",
];

const ILETISIM = ["Platform Mesajı", "E-posta", "Anlaşma Sonrası Telefon"];

// ─── Yardımcı bileşenler ─────────────────────────────────────────────────────

const inCls = "w-full px-3 py-[10px] text-[13px] border border-[#D4D8DC] rounded-sm bg-white text-[#1B2E40] outline-none focus:border-[#003057] transition-[border-color]";
const lblCls = "block text-[10px] font-semibold text-[#003057] uppercase tracking-[1.2px] mb-1.5";

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11.5px] border rounded-sm cursor-pointer transition-all tracking-wide"
      style={active
        ? { background: "#003057", borderColor: "#003057", color: "#fff" }
        : { background: "#fff", borderColor: "#D4D8DC", color: "#3D4E63" }}>
      {active && <span className="text-[10px] font-bold">✓</span>}
      {label}
    </button>
  );
}

function toggle<T>(list: T[], val: T): T[] {
  return list.includes(val) ? list.filter((x) => x !== val) : [...list, val];
}

function AdimBasi({ n, baslik, aktif, tamamlandi }: { n: number; baslik: string; aktif: boolean; tamamlandi: boolean }) {
  return (
    <div className={`flex items-center gap-2 text-[11px] font-semibold tracking-[0.5px] ${aktif ? "text-[#003057]" : tamamlandi ? "text-[#1A7A4A]" : "text-[#8B97A4]"}`}>
      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${aktif ? "bg-[#003057] text-white" : tamamlandi ? "bg-[#1A7A4A] text-white" : "bg-[#E0E5EA] text-[#8B97A4]"}`}>
        {tamamlandi ? "✓" : n}
      </div>
      {baslik}
    </div>
  );
}

// ─── Tipler ──────────────────────────────────────────────────────────────────

type TezgahGrup = {
  tip_id: number;
  ad: string;
  altKategoriler: { id: number; ad: string }[];
};

type Props = {
  hedefFirmaId?: string;
  hedefFirmaAdi?: string;
  hedefFirmaIl?: string;
  tezgahGruplari: TezgahGrup[];
};

// ─── Ana bileşen ─────────────────────────────────────────────────────────────

export default function RFQForm({ hedefFirmaId, hedefFirmaAdi, hedefFirmaIl, tezgahGruplari }: Props) {
  const [adim, setAdim] = useState<1 | 2 | 3>(1);
  const [isPending, startTransition] = useTransition();
  const [basariliRfqId, setBasariliRfqId] = useState<string | null>(null);
  const [hata, setHata] = useState("");

  // Adım 1 — Kriterler
  const [secilenAltKatIds, setSecilenAltKatIds] = useState<number[]>([]);
  const [secilenAltKatAdlar, setSecilenAltKatAdlar] = useState<string[]>([]);
  const [malzemeler, setMalzemeler] = useState<string[]>([]);
  const [sertifikalar, setSertifikalar] = useState<string[]>([]);
  const [il, setIl] = useState("");
  const [aramaYapildi, setAramaYapildi] = useState(false);
  const [araniyor, setAraniyor] = useState(false);

  // Adım 2 — Firma seçimi
  const [firmalar, setFirmalar] = useState<RfqEslesmeFirma[]>([]);
  const [secilenFirmaIdler, setSecilenFirmaIdler] = useState<string[]>(
    hedefFirmaId ? [hedefFirmaId] : []
  );

  // Adım 3 — RFQ detayları
  const [baslik, setBaslik]     = useState("");
  const [aciklama, setAciklama] = useState("");
  const [tolerans, setTolerans] = useState("");
  const [yuzey, setYuzey]       = useState("");
  const [adet, setAdet]         = useState("");
  const [termin, setTermin]     = useState("");
  const [butce, setButce]       = useState("");
  const [cevapSon, setCevapSon] = useState("");
  const [iletisim, setIletisim] = useState(["Platform Mesajı"]);
  const [nda, setNda]           = useState(false);
  const [onay, setOnay]         = useState(false);

  function altKatToggle(id: number, ad: string) {
    setSecilenAltKatIds((prev) => toggle(prev, id));
    setSecilenAltKatAdlar((prev) => toggle(prev, ad));
  }

  async function firmaAra() {
    if (secilenAltKatIds.length === 0 && malzemeler.length === 0) {
      setHata("En az bir tezgah tipi veya malzeme seçin.");
      return;
    }
    setHata("");
    setAraniyor(true);
    const sonuc = await rfqEslesmeFirmalariGetir({
      altKategoriIdler: secilenAltKatIds,
      malzemeler,
      sertifikalar,
      il: il || undefined,
    });
    setFirmalar(sonuc);
    setAramaYapildi(true);
    setAraniyor(false);
    if (sonuc.length > 0) setAdim(2);
  }

  function firmaSecToggle(id: string) {
    setSecilenFirmaIdler((prev) => toggle(prev, id));
  }

  function adim2Devam() {
    if (secilenFirmaIdler.length === 0) {
      setHata("En az bir firma seçin.");
      return;
    }
    setHata("");
    setAdim(3);
  }

  function gonder() {
    setHata("");
    if (!baslik.trim()) return setHata("RFQ başlığı zorunludur.");
    if (!aciklama.trim() || aciklama.length < 20) return setHata("İş açıklaması en az 20 karakter olmalıdır.");
    if (!onay) return setHata("RFQ politikasını kabul etmeniz gerekmektedir.");

    startTransition(async () => {
      const sonuc = await rfqOlustur({
        baslik, aciklama,
        tezgahTipleri: secilenAltKatAdlar,
        malzemeler,
        tolerans, yuzeyPuruzlulugu: yuzey,
        sertifikaGereksinimleri: sertifikalar,
        adet: Number(adet), termin,
        butceAraligi: butce, sehirBolge: il,
        cevapSonTarihi: cevapSon,
        iletisimTercihi: iletisim,
        ndaRequest: nda,
        hedefFirmaId,
        secilenFirmaIdler,
      });

      if ("hata" in sonuc) {
        setHata(sonuc.hata);
      } else {
        setBasariliRfqId(sonuc.rfqId);
      }
    });
  }

  // ── Başarı ekranı ──────────────────────────────────────────────────────────
  if (basariliRfqId) {
    return (
      <div className="bg-white border rounded-sm p-8 text-center" style={{ borderColor: "#D4D8DC" }}>
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 text-3xl"
          style={{ background: "#E8F5EE", border: "2px solid #1A7A4A", color: "#1A7A4A" }}>✓</div>
        <div className="text-[10px] font-semibold tracking-[2px] uppercase mb-2 text-[#5B6770]">RFQ Gönderildi</div>
        <div className="text-[22px] font-light mb-2 text-[#003057]">Talebiniz iletildi</div>
        <div className="inline-block px-3 py-1.5 text-[11px] font-mono font-semibold tracking-wider rounded-sm mb-3"
          style={{ background: "#fff", border: "1px solid #D4D8DC", color: "#003057" }}>
          {basariliRfqId}
        </div>
        <p className="text-[12px] mb-6 leading-relaxed text-[#5B6770]">
          {secilenFirmaIdler.length} firmaya bildirim gönderildi.<br />
          Teklifler geldikçe alıcı panelinizde görünecek.
        </p>
        <Link href="/alici/panel"
          className="block w-full py-3 text-[11px] font-medium tracking-[2px] uppercase text-white rounded-sm mb-3 text-center"
          style={{ background: "#003057" }}>
          RFQ&apos;larımı Gör →
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Adım göstergesi */}
      <div className="bg-white border rounded-sm px-6 py-4 mb-4 flex items-center gap-6 flex-wrap" style={{ borderColor: "#D4D8DC" }}>
        <AdimBasi n={1} baslik="Kriter Seç" aktif={adim === 1} tamamlandi={adim > 1} />
        <div className="text-[#D4D8DC] text-[10px]">─────</div>
        <AdimBasi n={2} baslik="Firma Seç" aktif={adim === 2} tamamlandi={adim > 2} />
        <div className="text-[#D4D8DC] text-[10px]">─────</div>
        <AdimBasi n={3} baslik="RFQ Detayları" aktif={adim === 3} tamamlandi={false} />
      </div>

      {/* Hedef firma varsa göster */}
      {hedefFirmaAdi && adim === 1 && (
        <div className="flex items-center gap-3 p-3 mb-4 rounded-sm border-l-[3px]"
          style={{ background: "#F0F7FF", border: "1px solid #D4D8DC", borderLeftColor: "#003057" }}>
          <div className="w-8 h-8 rounded-sm flex items-center justify-center text-[11px] font-semibold text-white flex-shrink-0" style={{ background: "#003057" }}>
            {hedefFirmaAdi.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()}
          </div>
          <div>
            <div className="text-[9px] font-semibold tracking-[1.5px] uppercase mb-0.5 text-[#5B6770]">Hedef Firma</div>
            <div className="text-[12.5px] font-semibold text-[#003057]">
              {hedefFirmaAdi}{hedefFirmaIl ? ` · ${hedefFirmaIl}` : ""}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          ADIM 1 — KRİTER SEÇİMİ
      ══════════════════════════════════════════════════════════════════════ */}
      {adim === 1 && (
        <div className="bg-white border rounded-sm p-6" style={{ borderColor: "#D4D8DC" }}>
          <div className="text-[18px] font-light text-[#003057] mb-1">İhtiyacınızı tanımlayın</div>
          <p className="text-[12px] text-[#5B6770] mb-6 leading-relaxed">
            Tezgah tipi, malzeme ve sertifika kriterlerini seçin — size uygun firmaları listeleyelim.
          </p>

          {/* Tezgah tipleri — gruplu */}
          <div className="mb-5">
            <label className={lblCls}>Tezgah Tipi <span style={{ color: "#B83232" }}>*</span></label>
            <p className="text-[10.5px] text-[#5B6770] mb-3">Birden fazla seçebilirsiniz. Seçtiğiniz kategorilere sahip firmalar listelenir.</p>
            <div className="space-y-3">
              {tezgahGruplari.map((grup) => (
                <div key={grup.tip_id}>
                  <div className="text-[9.5px] font-semibold text-[#8B97A4] uppercase tracking-[1.5px] mb-1.5">
                    {grup.ad}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {grup.altKategoriler.map((alt) => (
                      <Chip
                        key={alt.id}
                        label={alt.ad}
                        active={secilenAltKatIds.includes(alt.id)}
                        onClick={() => altKatToggle(alt.id, alt.ad)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Malzeme */}
          <div className="mb-5">
            <label className={lblCls}>İşlenecek Malzeme</label>
            <div className="flex flex-wrap gap-1.5">
              {MALZEMELER.map((m) => (
                <Chip key={m} label={m} active={malzemeler.includes(m)} onClick={() => setMalzemeler(toggle(malzemeler, m))} />
              ))}
            </div>
          </div>

          {/* Sertifika + Şehir */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div>
              <label className={lblCls}>Sertifika Gereksinimi <span className="font-normal normal-case tracking-normal text-[10px] text-[#8B97A4]">(opsiyonel)</span></label>
              <div className="flex flex-wrap gap-1.5">
                {SERTIFIKALAR.map((s) => (
                  <Chip key={s} label={s} active={sertifikalar.includes(s)} onClick={() => setSertifikalar(toggle(sertifikalar, s))} />
                ))}
              </div>
            </div>
            <div>
              <label className={lblCls}>Şehir / Bölge Tercihi <span className="font-normal normal-case tracking-normal text-[10px] text-[#8B97A4]">(opsiyonel)</span></label>
              <select className={inCls + " cursor-pointer"} value={il} onChange={(e) => setIl(e.target.value)}>
                <option value="">Tüm Türkiye</option>
                {ILLER.map((i) => <option key={i}>{i}</option>)}
              </select>
            </div>
          </div>

          {hata && (
            <div className="px-4 py-3 rounded-sm mb-4 text-[12px]" style={{ background: "#FEE2E2", color: "#B83232" }}>
              {hata}
            </div>
          )}

          {aramaYapildi && firmalar.length === 0 && (
            <div className="px-4 py-4 rounded-sm mb-4 text-[12px] text-center" style={{ background: "#FEF8E6", color: "#B07A00" }}>
              Kriterlere uygun yayında firma bulunamadı. Filtreleri genişletin.
            </div>
          )}

          <button onClick={firmaAra} disabled={araniyor}
            className="w-full py-3.5 text-[11px] font-medium tracking-[2px] uppercase text-white rounded-sm transition-opacity disabled:opacity-60 cursor-pointer"
            style={{ background: "#003057" }}>
            {araniyor ? "Aranıyor…" : "Uygun Firmaları Listele →"}
          </button>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          ADIM 2 — FİRMA SEÇİMİ
      ══════════════════════════════════════════════════════════════════════ */}
      {adim === 2 && (
        <div className="bg-white border rounded-sm" style={{ borderColor: "#D4D8DC" }}>
          <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: "#D4D8DC" }}>
            <div>
              <div className="text-[18px] font-light text-[#003057]">Firmalar</div>
              <div className="text-[11px] text-[#5B6770] mt-0.5">
                {firmalar.length} firma bulundu — RFQ göndermek istediklerinizi seçin
              </div>
            </div>
            <button onClick={() => { setAdim(1); setHata(""); }}
              className="text-[11px] text-[#0077CC] hover:underline">
              ← Kriterleri Değiştir
            </button>
          </div>

          <div className="divide-y" style={{ borderColor: "#EEF2F6" }}>
            {firmalar.map((f) => {
              const secili = secilenFirmaIdler.includes(f.firma_id);
              return (
                <label key={f.firma_id} className={`flex items-start gap-4 px-6 py-4 cursor-pointer transition-colors ${secili ? "bg-[#F0F7FF]" : "hover:bg-[#F8FAFB]"}`}>
                  <input type="checkbox" checked={secili} onChange={() => firmaSecToggle(f.firma_id)}
                    className="mt-1 flex-shrink-0 w-4 h-4 rounded" style={{ accentColor: "#003057" }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[13px] font-semibold text-[#003057]">{f.ticari_unvan}</span>
                      {f.dogrulanmis_rozet && (
                        <span className="text-[9px] bg-[#E8F5EE] text-[#1A7A4A] px-1.5 py-0.5 rounded-sm font-semibold">✓ Doğrulandı</span>
                      )}
                      {f.il && <span className="text-[11px] text-[#8B97A4]">{f.il}</span>}
                    </div>
                    {f.eslesen_tezgahlar.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-1.5">
                        {f.eslesen_tezgahlar.map((t) => (
                          <span key={t} className="text-[10px] px-2 py-0.5 rounded-sm" style={{ background: "#E8F0F8", color: "#003057" }}>{t}</span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-3 text-[10px] text-[#8B97A4]">
                      <span>{f.tezgah_sayisi} tezgah</span>
                      {f.sertifikalar.slice(0, 3).map((s) => (
                        <span key={s} className="text-[#1A7A4A]">{s}</span>
                      ))}
                    </div>
                  </div>
                  <Link href={`/firma/${f.firma_id}`} target="_blank"
                    onClick={(e) => e.stopPropagation()}
                    className="text-[10px] text-[#0077CC] hover:underline flex-shrink-0 mt-1">
                    Profil →
                  </Link>
                </label>
              );
            })}
          </div>

          <div className="px-6 py-4 border-t flex items-center justify-between gap-4" style={{ borderColor: "#D4D8DC" }}>
            <div className="text-[11px] text-[#5B6770]">
              {secilenFirmaIdler.length > 0
                ? <span className="font-semibold text-[#003057]">{secilenFirmaIdler.length} firma seçildi</span>
                : "Firma seçilmedi"}
            </div>
            {hata && <div className="text-[11px] text-[#B83232]">{hata}</div>}
            <button onClick={adim2Devam} disabled={secilenFirmaIdler.length === 0}
              className="px-6 py-2.5 text-[11px] font-medium tracking-[1.5px] uppercase text-white rounded-sm disabled:opacity-50 cursor-pointer"
              style={{ background: "#003057" }}>
              Devam — RFQ Detayları →
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          ADIM 3 — RFQ DETAYLARI
      ══════════════════════════════════════════════════════════════════════ */}
      {adim === 3 && (
        <div className="bg-white border rounded-sm p-6" style={{ borderColor: "#D4D8DC" }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-[18px] font-light text-[#003057]">RFQ Detayları</div>
              <div className="text-[11px] text-[#5B6770] mt-0.5">
                {secilenFirmaIdler.length} firmaya gönderilecek
              </div>
            </div>
            <button onClick={() => { setAdim(2); setHata(""); }}
              className="text-[11px] text-[#0077CC] hover:underline">
              ← Firma Seçimine Dön
            </button>
          </div>

          {/* İlk temas notu */}
          <div className="flex gap-3 p-4 rounded-sm mb-5 border-l-[3px]"
            style={{ background: "#F0F7FF", borderLeftColor: "#003057", border: "1px solid #D4E8F8", borderLeftWidth: 3 }}>
            <span className="text-[18px] flex-shrink-0">💬</span>
            <div>
              <div className="text-[11px] font-semibold text-[#003057] mb-1">Bu bir ilk temas mesajıdır</div>
              <div className="text-[11px] text-[#5B6770] leading-relaxed">
                Tolerans, adet, termin gibi teknik detayları şimdi bilmek zorunda değilsiniz. Sadece ne yaptırmak istediğinizi kısaca anlatın — fasoncu size ulaşsın, karşılıklı konuşun, sonra detaylara girin.
              </div>
            </div>
          </div>

          {/* Başlık */}
          <div className="mb-4">
            <label className={lblCls}>RFQ Başlığı <span style={{ color: "#B83232" }}>*</span></label>
            <input type="text" className={inCls} maxLength={120}
              value={baslik} onChange={(e) => setBaslik(e.target.value)}
              placeholder="örn. 5-eksen freze ile alüminyum şanzıman gövdesi — 250 adet" />
            <p className="text-[10.5px] mt-1 text-[#5B6770]">Firma bu başlığı listede görecek.</p>
          </div>

          {/* Açıklama */}
          <div className="mb-4">
            <label className={lblCls}>İş Açıklaması <span style={{ color: "#B83232" }}>*</span></label>
            <textarea className={inCls + " resize-y"} rows={5} minLength={20}
              value={aciklama} onChange={(e) => setAciklama(e.target.value)}
              placeholder="Parçanın işlevi, kritik özellikler, üretim notları, özel koşullar, teknik resim ekleri…" />
            <p className="text-[10.5px] mt-1 text-[#5B6770]">
              Gizli bilgi içeriyorsa NDA isteyebilirsiniz. {aciklama.length > 0 && `(${aciklama.length} karakter)`}
            </p>
          </div>

          {/* Tolerans + Yüzey */}
          <div className="grid grid-cols-2 gap-3 mb-4 max-sm:grid-cols-1">
            <div>
              <label className={lblCls}>Tolerans <span className="font-normal normal-case tracking-normal text-[10px] text-[#8B97A4]">(opsiyonel)</span></label>
              <select className={inCls + " cursor-pointer"} value={tolerans} onChange={(e) => setTolerans(e.target.value)}>
                <option value="">Seçin...</option>
                {["±0.5 mm (genel)", "±0.1 mm (hassas)", "±0.05 mm (yüksek hassas)",
                  "±0.02 mm (çok yüksek hassas)", "±0.01 mm (ultra hassas)",
                  "±0.005 mm (mikron seviye)", "Karışık — teknik resimde belirtildi"]
                  .map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className={lblCls}>Yüzey Pürüzlülüğü <span className="font-normal normal-case tracking-normal text-[10px] text-[#8B97A4]">(opsiyonel)</span></label>
              <select className={inCls + " cursor-pointer"} value={yuzey} onChange={(e) => setYuzey(e.target.value)}>
                <option value="">Seçin...</option>
                {["Ra 3.2 (kaba)", "Ra 1.6 (orta)", "Ra 0.8 (ince)",
                  "Ra 0.4 (çok ince)", "Ra 0.2 (ayna)", "Teknik resimde belirtildi"]
                  .map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>

          {/* Adet + Termin + Bütçe */}
          <div className="grid grid-cols-3 gap-3 mb-4 max-sm:grid-cols-1">
            <div>
              <label className={lblCls}>Adet <span className="font-normal normal-case tracking-normal text-[10px] text-[#8B97A4]">(opsiyonel)</span></label>
              <input type="number" className={inCls} min={1} value={adet}
                onChange={(e) => setAdet(e.target.value)} placeholder="250" />
            </div>
            <div>
              <label className={lblCls}>Termin <span className="font-normal normal-case tracking-normal text-[10px] text-[#8B97A4]">(opsiyonel)</span></label>
              <input type="date" className={inCls} value={termin} onChange={(e) => setTermin(e.target.value)} />
            </div>
            <div>
              <label className={lblCls}>Bütçe Aralığı <span className="font-normal normal-case tracking-normal text-[10px] text-[#8B97A4]">(opsiyonel)</span></label>
              <select className={inCls + " cursor-pointer"} value={butce} onChange={(e) => setButce(e.target.value)}>
                <option value="">Belirtmek istemiyorum</option>
                {["5.000 € altı", "5.000–25.000 €", "25.000–100.000 €",
                  "100.000–500.000 €", "500.000–1M €", "1M € üstü",
                  "Piyasayı görmek istiyorum"].map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>

          {/* Son tarih + İletişim */}
          <div className="grid grid-cols-2 gap-3 mb-4 max-sm:grid-cols-1">
            <div>
              <label className={lblCls}>Tekliflerin Son Tarihi <span className="font-normal normal-case tracking-normal text-[10px] text-[#8B97A4]">(opsiyonel)</span></label>
              <input type="date" className={inCls} value={cevapSon} onChange={(e) => setCevapSon(e.target.value)} />
              <p className="text-[10.5px] mt-1 text-[#5B6770]">Boş = 7 gün sonrası.</p>
            </div>
            <div>
              <label className={lblCls}>İletişim Tercihi</label>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {ILETISIM.map((i) => (
                  <Chip key={i} label={i} active={iletisim.includes(i)} onClick={() => setIletisim(toggle(iletisim, i))} />
                ))}
              </div>
            </div>
          </div>

          {/* NDA + Onay */}
          <div className="space-y-2 mb-5">
            <label className="flex items-start gap-2.5 py-1.5 cursor-pointer text-[11.5px] text-[#3D4E63]">
              <input type="checkbox" checked={nda} onChange={(e) => setNda(e.target.checked)}
                className="mt-0.5 flex-shrink-0 w-3.5 h-3.5" style={{ accentColor: "#003057" }} />
              <span>Fasoncu firmaların teklif vermeden önce NDA (Gizlilik Sözleşmesi) imzalamasını istiyorum.</span>
            </label>
            <label className="flex items-start gap-2.5 py-1.5 cursor-pointer text-[11.5px] text-[#3D4E63]">
              <input type="checkbox" checked={onay} onChange={(e) => setOnay(e.target.checked)}
                className="mt-0.5 flex-shrink-0 w-3.5 h-3.5" style={{ accentColor: "#003057" }} />
              <span>Bu RFQ&apos;nun gerçek bir iş talebi olduğunu kabul ederim. Fasoncu firmalara zaman kaybettirmeyeceğimi taahhüt ederim.</span>
            </label>
          </div>

          {hata && (
            <div className="px-4 py-3 rounded-sm mb-4 text-[12px]" style={{ background: "#FEE2E2", color: "#B83232" }}>
              {hata}
            </div>
          )}

          <button onClick={gonder} disabled={isPending}
            className="w-full py-3.5 text-[11px] font-medium tracking-[2px] uppercase text-white rounded-sm transition-opacity disabled:opacity-60 cursor-pointer"
            style={{ background: "#003057" }}>
            {isPending ? "Gönderiliyor…" : `RFQ'yu ${secilenFirmaIdler.length} Firmaya Gönder →`}
          </button>
        </div>
      )}
    </div>
  );
}
