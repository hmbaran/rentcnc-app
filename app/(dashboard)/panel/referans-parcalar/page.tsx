"use client";

import { useState, useEffect, useRef } from "react";
import { referansParcalariGetir, referansParcaEkle, referansParcaSil } from "@/lib/actions/referans";

type Parca = {
  parca_id: string;
  baslik: string;
  aciklama: string | null;
  malzeme: string | null;
  islem_turu: string | null;
  gorsel_url: string | null;
  sira: number;
};

const ISLEM_TURLERI = [
  "CNC Frezeleme", "CNC Tornalama", "5-Eksen İşleme", "4-Eksen İşleme",
  "Taşlama", "Tel Erozyon", "Dalma Erozyon", "Honlama",
  "Lazer Kesim", "Sac Bükme", "Kaynak", "Yüzey İşlem",
  "Montaj", "Ölçüm / CMM",
];

const MALZEME_ONERILERI = [
  "Alüminyum 7075", "Alüminyum 6061", "Paslanmaz 316L", "Paslanmaz 304",
  "Çelik 42CrMo4", "Takım Çeliği", "Ti-6Al-4V", "Inconel 718",
  "Bakır", "Pirinç", "Dökme Demir", "PEEK", "PA6 (Naylon)",
];

export default function ReferansParcalarSayfasi() {
  const [parcalar, setParcalar] = useState<Parca[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [formAcik, setFormAcik] = useState(false);
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [hata, setHata] = useState("");
  const [gorselYukleniyor, setGorselYukleniyor] = useState(false);
  const [onizleme, setOnizleme] = useState<string | null>(null);
  const dosyaRef = useRef<HTMLInputElement>(null);

  const [baslik, setBaslik] = useState("");
  const [aciklama, setAciklama] = useState("");
  const [malzeme, setMalzeme] = useState("");
  const [islemTuru, setIslemTuru] = useState("");
  const [gorselUrl, setGorselUrl] = useState("");

  useEffect(() => {
    referansParcalariGetir().then((data) => {
      setParcalar(data as Parca[]);
      setYukleniyor(false);
    });
  }, []);

  function formuTemizle() {
    setBaslik(""); setAciklama(""); setMalzeme("");
    setIslemTuru(""); setGorselUrl(""); setOnizleme(null); setHata("");
  }

  async function gorselSec(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) { setHata("Dosya 8 MB'dan büyük."); return; }

    // Önizleme
    const reader = new FileReader();
    reader.onload = (ev) => setOnizleme(ev.target?.result as string);
    reader.readAsDataURL(file);

    // Upload
    setGorselYukleniyor(true);
    setHata("");
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/referans-gorsel-yukle", { method: "POST", body: fd });
    const json = await res.json();
    setGorselYukleniyor(false);
    if (json.hata) { setHata(json.hata); setOnizleme(null); return; }
    setGorselUrl(json.url);
  }

  async function kaydet() {
    if (!baslik.trim()) { setHata("Başlık zorunludur."); return; }
    setKaydediliyor(true);
    setHata("");
    const sonuc = await referansParcaEkle({ baslik, aciklama, malzeme, islem_turu: islemTuru, gorsel_url: gorselUrl });
    setKaydediliyor(false);
    if ("hata" in sonuc) { setHata(sonuc.hata); return; }
    const yeni = await referansParcalariGetir();
    setParcalar(yeni as Parca[]);
    formuTemizle();
    setFormAcik(false);
  }

  async function sil(parcaId: string) {
    if (!confirm("Bu referans parçayı silmek istediğinizden emin misiniz?")) return;
    await referansParcaSil(parcaId);
    setParcalar((prev) => prev.filter((p) => p.parca_id !== parcaId));
  }

  if (yukleniyor) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#003057", borderTopColor: "transparent" }} />
        <span className="text-xs tracking-wider uppercase" style={{ color: "#8A98A8" }}>Yükleniyor</span>
      </div>
    </div>
  );

  return (
    <div style={{ fontFamily: "-apple-system,'Segoe UI',Helvetica,sans-serif", background: "#F4F7FB", minHeight: "100vh" }}>

      {/* PAGE HEADER */}
      <div style={{ background: "#fff", borderBottom: "1px solid #DDE8F0", padding: "24px 32px" }}>
        <div className="flex justify-between items-end" style={{ maxWidth: 1100 }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "#8A98A8", marginBottom: 6 }}>
              Firma Profili
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 300, color: "#003057", margin: 0, letterSpacing: 0.5 }}>
              Referans Parçalar
            </h1>
            <p style={{ fontSize: 12, color: "#8A98A8", marginTop: 6, marginBottom: 0 }}>
              Ürettiğiniz parçaları sergileyin — alıcılar yetkinliğinizi doğrudan görür.
            </p>
          </div>
          <button
            onClick={() => { setFormAcik(true); formuTemizle(); }}
            style={{
              background: "#003057", color: "#fff", border: "none",
              padding: "10px 24px", fontSize: 11, fontWeight: 600,
              letterSpacing: 1.5, textTransform: "uppercase", cursor: "pointer",
              borderRadius: 2,
            }}
          >
            + Parça Ekle
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 32px" }}>

        {/* FORM MODAL OVERLAY */}
        {formAcik && (
          <div
            style={{
              position: "fixed", inset: 0, zIndex: 50,
              background: "rgba(0,0,0,0.5)",
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: 24,
            }}
            onClick={(e) => { if (e.target === e.currentTarget) { setFormAcik(false); formuTemizle(); } }}
          >
            <div style={{
              background: "#fff", width: "100%", maxWidth: 680,
              borderRadius: 4, overflow: "hidden",
              boxShadow: "0 24px 80px rgba(0,0,0,0.18)",
            }}>
              {/* Modal Header */}
              <div style={{ background: "#003057", padding: "20px 28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "rgba(255,255,255,0.45)", marginBottom: 4 }}>
                    Yeni Kayıt
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 300, color: "#fff", letterSpacing: 0.5 }}>
                    Referans Parça Ekle
                  </div>
                </div>
                <button
                  onClick={() => { setFormAcik(false); formuTemizle(); }}
                  style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", width: 32, height: 32, cursor: "pointer", fontSize: 16, borderRadius: 2 }}
                >
                  ✕
                </button>
              </div>

              {/* Modal Body */}
              <div style={{ padding: "28px 28px 0" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

                  {/* SOL — Görsel Upload */}
                  <div>
                    <div
                      onClick={() => !gorselYukleniyor && dosyaRef.current?.click()}
                      style={{
                        width: "100%", height: 220,
                        border: `2px dashed ${onizleme ? "#003057" : "#C8D8E8"}`,
                        borderRadius: 3, cursor: gorselYukleniyor ? "wait" : "pointer",
                        overflow: "hidden", position: "relative",
                        background: onizleme ? "#000" : "#F4F7FB",
                        transition: "border-color 0.2s",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}
                    >
                      {onizleme ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={onizleme} alt="Önizleme" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: gorselYukleniyor ? 0.5 : 1 }} />
                      ) : (
                        <div style={{ textAlign: "center", padding: 20 }}>
                          <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.3 }}>📷</div>
                          <div style={{ fontSize: 11, fontWeight: 600, color: "#003057", marginBottom: 4 }}>Fotoğraf Yükle</div>
                          <div style={{ fontSize: 10, color: "#8A98A8" }}>JPG, PNG, WEBP · Max 8 MB</div>
                        </div>
                      )}
                      {gorselYukleniyor && (
                        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,48,87,0.7)" }}>
                          <div style={{ color: "#fff", fontSize: 11, textAlign: "center" }}>
                            <div className="animate-spin" style={{ fontSize: 20, marginBottom: 8 }}>⟳</div>
                            Yükleniyor...
                          </div>
                        </div>
                      )}
                      {onizleme && !gorselYukleniyor && (
                        <div style={{ position: "absolute", bottom: 8, right: 8 }}>
                          <button
                            onClick={(e) => { e.stopPropagation(); setOnizleme(null); setGorselUrl(""); }}
                            style={{ background: "rgba(0,0,0,0.6)", color: "#fff", border: "none", padding: "3px 8px", fontSize: 10, cursor: "pointer", borderRadius: 2 }}
                          >
                            Değiştir
                          </button>
                        </div>
                      )}
                    </div>
                    <input ref={dosyaRef} type="file" accept="image/*" onChange={gorselSec} style={{ display: "none" }} />
                    {gorselUrl && (
                      <div style={{ fontSize: 10, color: "#1A7A4A", marginTop: 6, display: "flex", alignItems: "center", gap: 4 }}>
                        ✓ Görsel yüklendi
                      </div>
                    )}
                  </div>

                  {/* SAĞ — Bilgiler */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 9, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "#8A98A8", marginBottom: 6 }}>
                        Başlık *
                      </label>
                      <input
                        type="text"
                        value={baslik}
                        onChange={(e) => setBaslik(e.target.value)}
                        placeholder="Örn: Havacılık Bağlantı Flanşı"
                        style={{
                          width: "100%", padding: "9px 12px", fontSize: 12,
                          border: "1px solid #C8D8E8", borderRadius: 2, outline: "none",
                          color: "#1A2535", boxSizing: "border-box",
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 9, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "#8A98A8", marginBottom: 6 }}>
                        Malzeme
                      </label>
                      <input
                        type="text"
                        value={malzeme}
                        onChange={(e) => setMalzeme(e.target.value)}
                        placeholder="Ti-6Al-4V, Paslanmaz 316L..."
                        list="malzeme-listesi"
                        style={{
                          width: "100%", padding: "9px 12px", fontSize: 12,
                          border: "1px solid #C8D8E8", borderRadius: 2, outline: "none",
                          color: "#1A2535", boxSizing: "border-box",
                        }}
                      />
                      <datalist id="malzeme-listesi">
                        {MALZEME_ONERILERI.map((m) => <option key={m} value={m} />)}
                      </datalist>
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 9, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "#8A98A8", marginBottom: 6 }}>
                        İşlem Türü
                      </label>
                      <select
                        value={islemTuru}
                        onChange={(e) => setIslemTuru(e.target.value)}
                        style={{
                          width: "100%", padding: "9px 12px", fontSize: 12,
                          border: "1px solid #C8D8E8", borderRadius: 2, outline: "none",
                          color: islemTuru ? "#1A2535" : "#8A98A8", background: "#fff",
                          boxSizing: "border-box",
                        }}
                      >
                        <option value="">Seçin...</option>
                        {ISLEM_TURLERI.map((t) => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: "block", fontSize: 9, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "#8A98A8", marginBottom: 6 }}>
                        Kısa Açıklama
                      </label>
                      <textarea
                        value={aciklama}
                        onChange={(e) => setAciklama(e.target.value)}
                        rows={3}
                        placeholder="Tolerans, yüzey kalitesi, özel işlem detayları..."
                        style={{
                          width: "100%", padding: "9px 12px", fontSize: 12,
                          border: "1px solid #C8D8E8", borderRadius: 2, outline: "none",
                          color: "#1A2535", resize: "none", fontFamily: "inherit",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>
                  </div>
                </div>

                {hata && (
                  <div style={{ margin: "12px 0 0", padding: "10px 14px", background: "#FEF2F2", borderLeft: "3px solid #B91C1C", borderRadius: 2 }}>
                    <span style={{ fontSize: 11, color: "#B91C1C" }}>{hata}</span>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div style={{ padding: "20px 28px", display: "flex", gap: 10, justifyContent: "flex-end", borderTop: "1px solid #DDE8F0", marginTop: 20 }}>
                <button
                  onClick={() => { setFormAcik(false); formuTemizle(); }}
                  style={{
                    padding: "9px 20px", fontSize: 11, fontWeight: 600, letterSpacing: 1,
                    textTransform: "uppercase", cursor: "pointer",
                    border: "1px solid #C8D8E8", background: "#fff", color: "#4A5568", borderRadius: 2,
                  }}
                >
                  İptal
                </button>
                <button
                  onClick={kaydet}
                  disabled={kaydediliyor || gorselYukleniyor}
                  style={{
                    padding: "9px 28px", fontSize: 11, fontWeight: 600, letterSpacing: 1,
                    textTransform: "uppercase", cursor: kaydediliyor ? "wait" : "pointer",
                    background: "#003057", color: "#fff", border: "none", borderRadius: 2,
                    opacity: kaydediliyor || gorselYukleniyor ? 0.6 : 1,
                  }}
                >
                  {kaydediliyor ? "Kaydediliyor..." : "Kaydet"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* BOŞ DURUM */}
        {parcalar.length === 0 ? (
          <div style={{
            background: "#fff", border: "1px solid #DDE8F0", borderRadius: 4,
            padding: "80px 40px", textAlign: "center",
          }}>
            <div style={{ fontSize: 48, marginBottom: 20, opacity: 0.15 }}>⚙</div>
            <div style={{ fontSize: 16, fontWeight: 300, color: "#003057", marginBottom: 8 }}>
              Henüz referans parça eklenmedi
            </div>
            <div style={{ fontSize: 12, color: "#8A98A8", marginBottom: 28, maxWidth: 380, margin: "0 auto 28px" }}>
              Ürettiğiniz parçaları sergileyin. Kaliteli fotoğraflar ve teknik detaylar,
              alıcıların sizi seçmesini kolaylaştırır.
            </div>
            <button
              onClick={() => { setFormAcik(true); formuTemizle(); }}
              style={{
                background: "#003057", color: "#fff", border: "none",
                padding: "12px 32px", fontSize: 11, fontWeight: 600,
                letterSpacing: 1.5, textTransform: "uppercase", cursor: "pointer", borderRadius: 2,
              }}
            >
              + İlk Parçayı Ekle
            </button>
          </div>
        ) : (
          <>
            {/* İPUCU */}
            <div style={{
              background: "#E8F2FA", border: "1px solid #C8D8E8", borderRadius: 3,
              padding: "10px 16px", marginBottom: 20,
              display: "flex", alignItems: "center", gap: 10,
            }}>
              <span style={{ fontSize: 14 }}>💡</span>
              <span style={{ fontSize: 11, color: "#003057" }}>
                Kaliteli fotoğraflar profilinizi öne çıkarır. Yüksek çözünürlüklü, iyi aydınlatılmış görseller kullanın.
              </span>
            </div>

            {/* GRID */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
              {parcalar.map((p) => (
                <div
                  key={p.parca_id}
                  style={{
                    background: "#fff", border: "1px solid #DDE8F0", borderRadius: 3,
                    overflow: "hidden",
                    boxShadow: "0 1px 4px rgba(0,48,87,0.06)",
                    transition: "box-shadow 0.2s, transform 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 32px rgba(0,48,87,0.12)";
                    (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 4px rgba(0,48,87,0.06)";
                    (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                  }}
                >
                  {/* Görsel */}
                  <div style={{ position: "relative", height: 200, background: "#F4F7FB", overflow: "hidden" }}>
                    {p.gorsel_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.gorsel_url} alt={p.baslik}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8 }}>
                        <span style={{ fontSize: 36, opacity: 0.15 }}>⚙</span>
                        <span style={{ fontSize: 10, color: "#C8D8E8", textTransform: "uppercase", letterSpacing: 1 }}>Görsel yok</span>
                      </div>
                    )}
                    {/* Badge */}
                    {p.islem_turu && (
                      <div style={{
                        position: "absolute", top: 10, left: 10,
                        background: "rgba(0,48,87,0.85)", backdropFilter: "blur(4px)",
                        color: "#fff", fontSize: 9, fontWeight: 600,
                        letterSpacing: 1, textTransform: "uppercase",
                        padding: "4px 8px", borderRadius: 2,
                      }}>
                        {p.islem_turu}
                      </div>
                    )}
                    {/* Sil butonu */}
                    <button
                      onClick={() => sil(p.parca_id)}
                      style={{
                        position: "absolute", top: 10, right: 10,
                        background: "rgba(185,28,28,0.85)", border: "none",
                        color: "#fff", width: 28, height: 28, cursor: "pointer",
                        borderRadius: 2, fontSize: 12, display: "flex",
                        alignItems: "center", justifyContent: "center",
                      }}
                      title="Sil"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Bilgi */}
                  <div style={{ padding: "16px 18px" }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "#003057", marginBottom: 8, lineHeight: 1.3 }}>
                      {p.baslik}
                    </div>
                    {p.malzeme && (
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "#8A98A8" }}>Malzeme</span>
                        <span style={{ fontSize: 11, color: "#003057", fontWeight: 500 }}>{p.malzeme}</span>
                      </div>
                    )}
                    {p.aciklama && (
                      <p style={{ fontSize: 11, color: "#8A98A8", lineHeight: 1.6, margin: 0, marginTop: 8 }}>
                        {p.aciklama}
                      </p>
                    )}
                  </div>

                  {/* Alt çizgi */}
                  <div style={{ height: 2, background: "linear-gradient(90deg, #003057, #0077CC)" }} />
                </div>
              ))}

              {/* + Ekle Kartı */}
              <div
                onClick={() => { setFormAcik(true); formuTemizle(); }}
                style={{
                  border: "2px dashed #C8D8E8", borderRadius: 3,
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center",
                  height: 280, cursor: "pointer",
                  transition: "border-color 0.2s, background 0.2s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = "#003057";
                  (e.currentTarget as HTMLDivElement).style.background = "#F4F7FB";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = "#C8D8E8";
                  (e.currentTarget as HTMLDivElement).style.background = "transparent";
                }}
              >
                <div style={{ fontSize: 28, color: "#C8D8E8", marginBottom: 10, fontWeight: 300 }}>+</div>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", color: "#8A98A8" }}>
                  Parça Ekle
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
