import { notFound } from "next/navigation";
import Link from "next/link";
import { firmaProfilGetir, benzerFirmalariGetir } from "@/lib/actions/firma";
import { parametreLabel, parametreBirim } from "@/lib/tezgah-parametreleri";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const veri = await firmaProfilGetir(id);
  if (!veri) return { title: "Firma Bulunamadı" };
  return { title: veri.firma.ticari_unvan };
}

export default async function FirmaProfilSayfasi({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const veri = await firmaProfilGetir(id);
  if (!veri) notFound();

  const {
    firma,
    tezgahlar,
    sertifikalar,
    yetenekler,
    malzemeler,
    kapasite,
    gorseller,
    degerlendirmeler,
    referansParcalar,
    tezgahSayisi,
    puanOrtalama,
    degerlendirmeSayisi,
  } = veri;

  const benzerFirmalar = await benzerFirmalariGetir(id, firma.il);

  const basTumsayisi =
    firma.ticari_unvan
      .split(" ")
      .slice(0, 2)
      .map((w: string) => w[0])
      .join("")
      .toUpperCase();

  const durumLabel: Record<string, { text: string; cls: string }> = {
    aktif_tam_kapasite: { text: "Aktif", cls: "bg-green-100 text-green-800" },
    kismen_musait: { text: "Kısmen Müsait", cls: "bg-yellow-100 text-yellow-800" },
    bakimda: { text: "Bakımda", cls: "bg-orange-100 text-orange-800" },
    satildi_kapali: { text: "Kapalı", cls: "bg-gray-100 text-gray-600" },
  };

  const yetenekGruplari = yetenekler.reduce(
    (acc: Record<string, string[]>, y: { kategori: string | null; deger: string }) => {
      const kat = y.kategori ?? "Diğer";
      if (!acc[kat]) acc[kat] = [];
      acc[kat].push(y.deger);
      return acc;
    },
    {}
  );

  return (
    <div className="min-h-screen" style={{ background: "#F4F7FB", fontFamily: "-apple-system,'Segoe UI',sans-serif" }}>
      {/* TOPBAR */}
      <div style={{ background: "#003057", height: 48 }} className="flex items-center px-6 gap-3 sticky top-0 z-50">
        <Link href="/" className="text-white text-xs font-light tracking-widest uppercase hover:opacity-80">
          RENT<span className="font-bold" style={{ color: "#7ABFFF" }}>CNC</span>MACHINE
        </Link>
        <div className="flex items-center gap-1.5 ml-2 text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
          <Link href="/ara" className="hover:text-blue-300 transition-colors">Firmalar</Link>
          <span style={{ color: "rgba(255,255,255,0.25)" }}>›</span>
          <span style={{ color: "rgba(255,255,255,0.75)" }}>{firma.ticari_unvan}</span>
        </div>
        <div className="ml-auto flex gap-2">
          <Link href="/ara" className="text-xs px-3.5 py-1.5 border border-white/25 text-white/70 hover:bg-white/10 hover:text-white transition-all rounded-sm uppercase tracking-wide">
            ◁ Geri
          </Link>
        </div>
      </div>

      {/* STICKY CTA */}
      <div
        className="sticky z-40 flex justify-between items-center px-6 py-2.5 shadow"
        style={{ top: 48, background: "#fff", borderBottom: "2px solid #00529C" }}
      >
        <div>
          <div className="text-sm font-semibold" style={{ color: "#003057" }}>{firma.ticari_unvan}</div>
          <div className="text-xs mt-0.5" style={{ color: "#8A98A8" }}>
            {firma.il}{firma.ilce ? `, ${firma.ilce}` : ""}
            {sertifikalar.length > 0 && ` · ${sertifikalar.map((s: { sertifika_adi: string }) => s.sertifika_adi).slice(0, 2).join(" · ")}`}
            {puanOrtalama && ` · ★ ${puanOrtalama}`}
          </div>
        </div>
        <div className="flex gap-2">
          <button className="text-xs px-4 py-1.5 border rounded-sm uppercase tracking-wide transition-all hover:opacity-80" style={{ borderColor: "#00529C", color: "#003057" }}>
            Favorilere Ekle
          </button>
          <Link
            href={`/rfq?firma=${id}`}
            className="text-xs px-4 py-1.5 rounded-sm uppercase tracking-wide text-white transition-all hover:opacity-90"
            style={{ background: "#003057" }}
          >
            Teklif İste →
          </Link>
        </div>
      </div>

      {/* HERO */}
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg,#003057 0%,#004080 100%)", padding: "28px 24px 0" }}>
        <div className="absolute" style={{ right: -60, top: -60, width: 280, height: 280, borderRadius: "50%", background: "rgba(0,119,204,0.12)" }} />
        <div className="max-w-5xl mx-auto">
          <div className="flex gap-5 items-start mb-5 relative">
            {/* Logo */}
            <div
              className="flex-shrink-0 flex items-center justify-center text-2xl font-bold rounded"
              style={{ width: 68, height: 68, background: "#E8F2FA", color: "#003057", border: "2px solid rgba(255,255,255,0.15)" }}
            >
              {basTumsayisi}
            </div>
            <div className="flex-1">
              <div className="text-white mb-1" style={{ fontSize: 22, fontWeight: 300, letterSpacing: 1 }}>
                {firma.ticari_unvan}
              </div>
              <div className="flex items-center gap-1.5 mb-2.5" style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
                📍 {[firma.ilce, firma.il].filter(Boolean).join(", ")}
                {!firma.il && "Türkiye"}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {firma.dogrulanmis_rozet && (
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-sm font-semibold tracking-wide uppercase" style={{ background: "rgba(26,122,74,0.3)", color: "#6EE7B7", border: "1px solid rgba(110,231,183,0.3)" }}>
                    ✓ Doğrulanmış
                  </span>
                )}
                {sertifikalar.slice(0, 3).map((s: { sertifika_id: string; sertifika_adi: string }) => (
                  <span key={s.sertifika_id} className="inline-flex items-center text-xs px-2 py-0.5 rounded-sm font-semibold tracking-wide uppercase" style={{ background: "rgba(26,122,74,0.25)", color: "#6EE7B7", border: "1px solid rgba(110,231,183,0.2)" }}>
                    {s.sertifika_adi}
                  </span>
                ))}
                {firma.il && (
                  <span className="inline-flex items-center text-xs px-2 py-0.5 rounded-sm font-semibold tracking-wide uppercase" style={{ background: "rgba(0,119,204,0.2)", color: "#7ABFFF", border: "1px solid rgba(122,191,255,0.2)" }}>
                    {firma.il}
                  </span>
                )}
              </div>
              {puanOrtalama && (
                <div className="flex items-center gap-2 mt-3">
                  <span style={{ color: "#FCD34D", fontSize: 16, letterSpacing: 2 }}>{"★".repeat(Math.round(Number(puanOrtalama)))}</span>
                  <span className="text-white font-semibold text-xl">{puanOrtalama}</span>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>/ 5.0 · {degerlendirmeSayisi} değerlendirme</span>
                </div>
              )}
            </div>
          </div>

          {/* STATS */}
          <div className="grid" style={{ gridTemplateColumns: "repeat(4,1fr)", background: "rgba(255,255,255,0.06)", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            {[
              { val: tezgahSayisi.toString(), lbl: "Tezgah" },
              { val: sertifikalar.length.toString(), lbl: "Sertifika" },
              { val: firma.kurulus_yili ? `${new Date().getFullYear() - firma.kurulus_yili} Yıl` : "–", lbl: "Deneyim" },
              { val: firma.calisan_aralik ?? "–", lbl: "Çalışan" },
            ].map((s, i) => (
              <div key={i} className="text-center py-3.5" style={{ borderRight: i < 3 ? "1px solid rgba(255,255,255,0.08)" : "none" }}>
                <div className="text-white font-semibold" style={{ fontSize: 20, lineHeight: 1 }}>{s.val}</div>
                <div className="mt-1 uppercase tracking-widest" style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>{s.lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className="max-w-5xl mx-auto grid gap-4 p-4 pb-12" style={{ gridTemplateColumns: "1fr 300px" }}>
        {/* MAIN */}
        <div className="flex flex-col gap-3.5">

          {/* FOTOĞRAF GALERİSİ */}
          {gorseller.length > 0 && (
            <div className="rounded overflow-hidden border" style={{ background: "#fff", borderColor: "#DDE8F0" }}>
              <div className="grid gap-1" style={{ gridTemplateColumns: "2fr 1fr 1fr", height: 170 }}>
                <div className="relative bg-gray-100 flex items-center justify-center overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={gorseller[0].url} alt={gorseller[0].baslik ?? "Fotoğraf"} className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col gap-1">
                  {gorseller[1] && (
                    <div className="flex-1 bg-gray-100 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={gorseller[1].url} alt={gorseller[1].baslik ?? ""} className="w-full h-full object-cover" />
                    </div>
                  )}
                  {gorseller[2] && (
                    <div className="flex-1 bg-gray-100 overflow-hidden relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={gorseller[2].url} alt={gorseller[2].baslik ?? ""} className="w-full h-full object-cover" />
                      {gorseller.length > 3 && (
                        <div className="absolute inset-0 flex items-center justify-center font-semibold text-white" style={{ background: "#003057" }}>
                          +{gorseller.length - 3}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB KARTLARI */}
          <div className="rounded border" style={{ background: "#fff", borderColor: "#DDE8F0" }}>
            {/* Hakkında */}
            {firma.hakkinda && (
              <div className="border-b" style={{ borderColor: "#DDE8F0" }}>
                <div className="px-4 py-3.5 border-b" style={{ borderColor: "#DDE8F0" }}>
                  <span className="text-xs font-bold tracking-wider uppercase" style={{ color: "#003057" }}>Firma Hakkında</span>
                </div>
                <div className="px-4 py-4 text-sm leading-relaxed" style={{ color: "#3D4E63" }}>
                  {firma.hakkinda}
                </div>
              </div>
            )}

            {/* Tezgahlar */}
            <div>
              <div className="px-4 py-3.5 border-b flex justify-between items-center" style={{ borderColor: "#DDE8F0" }}>
                <span className="text-xs font-bold tracking-wider uppercase" style={{ color: "#003057" }}>Tezgah Parkuru</span>
                <span className="text-xs" style={{ color: "#8A98A8" }}>{tezgahSayisi} tezgah</span>
              </div>
              <div className="p-4 flex flex-col gap-2">
                {tezgahlar.length === 0 && (
                  <p className="text-sm text-center py-4" style={{ color: "#8A98A8" }}>Henüz tezgah eklenmemiş.</p>
                )}
                {tezgahlar.map((t: {
                  tezgah_id: string;
                  durum: string | null;
                  tezgah_tip: { ad: string }[] | null;
                  tezgah_alt_kategori: { ad: string }[] | null;
                  tezgah_marka: { ad: string }[] | null;
                  model: string | null;
                  eksen_ozellik: string | null;
                  bag_x_mm: number | null;
                  bag_y_mm: number | null;
                  bag_z_mm: number | null;
                  max_rpm: number | null;
                  yapim_yili: number | null;
                  parametreler: Record<string, string | number> | null;
                }) => {
                  const d = t.durum ? durumLabel[t.durum] : null;
                  const paramEntries = t.parametreler
                    ? Object.entries(t.parametreler).filter(([, v]) => v !== null && v !== "")
                    : [];
                  return (
                    <div key={t.tezgah_id} className="rounded p-3 border" style={{ background: "#F4F7FB", borderColor: "#DDE8F0" }}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="text-xs font-semibold" style={{ color: "#003057" }}>
                            {[t.tezgah_tip?.[0]?.ad, t.tezgah_alt_kategori?.[0]?.ad].filter(Boolean).join(" — ")}
                          </div>
                          <div className="text-xs mt-0.5" style={{ color: "#8A98A8" }}>
                            {[t.tezgah_marka?.[0]?.ad, t.model].filter(Boolean).join(" ")}
                            {t.yapim_yili && ` · ${t.yapim_yili}`}
                          </div>
                        </div>
                        {d && (
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-sm tracking-wide uppercase ${d.cls}`}>
                            {d.text}
                          </span>
                        )}
                      </div>
                      {/* Standart parametreler */}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {t.eksen_ozellik && <span className="text-[10px] px-1.5 py-0.5 border rounded-sm" style={{ background: "#fff", borderColor: "#DDE8F0", color: "#3D4E63" }}>{t.eksen_ozellik}</span>}
                        {t.bag_x_mm && <span className="text-[10px] px-1.5 py-0.5 border rounded-sm" style={{ background: "#fff", borderColor: "#DDE8F0", color: "#3D4E63" }}>X:{t.bag_x_mm}mm</span>}
                        {t.bag_y_mm && <span className="text-[10px] px-1.5 py-0.5 border rounded-sm" style={{ background: "#fff", borderColor: "#DDE8F0", color: "#3D4E63" }}>Y:{t.bag_y_mm}mm</span>}
                        {t.bag_z_mm && <span className="text-[10px] px-1.5 py-0.5 border rounded-sm" style={{ background: "#fff", borderColor: "#DDE8F0", color: "#3D4E63" }}>Z:{t.bag_z_mm}mm</span>}
                        {t.max_rpm && <span className="text-[10px] px-1.5 py-0.5 border rounded-sm" style={{ background: "#fff", borderColor: "#DDE8F0", color: "#3D4E63" }}>{t.max_rpm} rpm</span>}
                      </div>
                      {/* JSONB dinamik parametreler */}
                      {paramEntries.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {paramEntries.map(([key, val]) => {
                            const birim = parametreBirim(key);
                            return (
                              <span key={key} className="text-[10px] px-1.5 py-0.5 border rounded-sm"
                                style={{ background: "#EEF6FF", borderColor: "#B8D4F0", color: "#003057" }}>
                                <span style={{ color: "#6B8FA8" }}>{parametreLabel(key)}: </span>
                                {String(val)}{birim ? ` ${birim}` : ""}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* YETENEKler & MALZEMELer */}
          {(yetenekler.length > 0 || malzemeler.length > 0) && (
            <div className="rounded border" style={{ background: "#fff", borderColor: "#DDE8F0" }}>
              <div className="px-4 py-3.5 border-b" style={{ borderColor: "#DDE8F0" }}>
                <span className="text-xs font-bold tracking-wider uppercase" style={{ color: "#003057" }}>Yetenekler & Malzemeler</span>
              </div>
              <div className="p-4 flex flex-col gap-3.5">
                {Object.entries(yetenekGruplari).map(([kat, degerler]) => (
                  <div key={kat}>
                    <div className="text-[10px] font-bold tracking-wider uppercase mb-2" style={{ color: "#8A98A8" }}>{kat}</div>
                    <div className="flex flex-wrap gap-1.5">
                      {(degerler as string[]).map((d, i) => (
                        <span key={i} className="text-xs px-2.5 py-1 border rounded-sm" style={{ borderColor: "#C8D8E8", color: "#3D4E63", background: "#F4F7FB" }}>{d}</span>
                      ))}
                    </div>
                  </div>
                ))}
                {malzemeler.length > 0 && (
                  <div>
                    <div className="text-[10px] font-bold tracking-wider uppercase mb-2" style={{ color: "#8A98A8" }}>Malzemeler</div>
                    <div className="flex flex-wrap gap-1.5">
                      {malzemeler.map((m: { malzeme_id: string; malzeme_adi: string }) => (
                        <span key={m.malzeme_id} className="text-xs px-2.5 py-1 border rounded-sm" style={{ borderColor: "#C8D8E8", color: "#3D4E63", background: "#F4F7FB" }}>{m.malzeme_adi}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SERTİFİKALAR */}
          {sertifikalar.length > 0 && (
            <div className="rounded border" style={{ background: "#fff", borderColor: "#DDE8F0" }}>
              <div className="px-4 py-3.5 border-b" style={{ borderColor: "#DDE8F0" }}>
                <span className="text-xs font-bold tracking-wider uppercase" style={{ color: "#003057" }}>Kalite & Sertifikalar</span>
              </div>
              <div className="px-4 py-2">
                {sertifikalar.map((s: { sertifika_id: string; sertifika_adi: string; gecerlilik_bitis: string | null; dogrulandi: boolean }) => (
                  <div key={s.sertifika_id} className="flex items-center gap-3 py-2.5 border-b last:border-0" style={{ borderColor: "#DDE8F0" }}>
                    <div className="flex-shrink-0 flex items-center justify-center rounded text-base" style={{ width: 34, height: 34, background: "#E8F5EE", color: "#1A7A4A" }}>✓</div>
                    <div className="flex-1">
                      <div className="text-xs font-semibold" style={{ color: "#003057" }}>{s.sertifika_adi}</div>
                      {s.gecerlilik_bitis && (
                        <div className="text-[10px] mt-0.5" style={{ color: "#8A98A8" }}>
                          Geçerlilik: {new Date(s.gecerlilik_bitis).toLocaleDateString("tr-TR")}
                        </div>
                      )}
                    </div>
                    {s.dogrulandi && <span className="font-bold" style={{ color: "#1A7A4A" }}>✓</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* KAPASİTE */}
          {kapasite && (
            <div className="rounded border" style={{ background: "#fff", borderColor: "#DDE8F0" }}>
              <div className="px-4 py-3.5 border-b" style={{ borderColor: "#DDE8F0" }}>
                <span className="text-xs font-bold tracking-wider uppercase" style={{ color: "#003057" }}>Kapasite & Lojistik</span>
              </div>
              <div className="p-4 grid grid-cols-2 gap-2.5">
                {[
                  { lbl: "Min Sipariş", val: kapasite.min_siparis_adedi ? `${kapasite.min_siparis_adedi} adet` : null },
                  { lbl: "Vardiya", val: kapasite.vardiya },
                  { lbl: "Teslimat", val: kapasite.teslimat_suresi },
                  { lbl: "Aylık Kapasite", val: kapasite.aylik_kapasite ? `${kapasite.aylik_kapasite} parça` : null },
                  { lbl: "Acil İş", val: kapasite.acil_is ? "Evet" : "Hayır" },
                  { lbl: "İhracat", val: kapasite.ihracat_deneyimi ? "Var" : "Yok" },
                ].filter(r => r.val).map((r, i) => (
                  <div key={i} className="rounded p-3 border" style={{ background: "#F4F7FB", borderColor: "#DDE8F0" }}>
                    <div className="text-[9px] font-bold tracking-wider uppercase mb-1.5" style={{ color: "#8A98A8" }}>{r.lbl}</div>
                    <div className="text-sm font-semibold" style={{ color: "#003057" }}>{r.val}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* REFERANS PARÇALAR */}
          {referansParcalar.length > 0 && (
            <div className="rounded border overflow-hidden" style={{ background: "#fff", borderColor: "#DDE8F0" }}>
              <div className="px-5 py-4 border-b flex justify-between items-center" style={{ borderColor: "#DDE8F0" }}>
                <div>
                  <span className="text-xs font-bold tracking-wider uppercase" style={{ color: "#003057" }}>Referans Parçalar</span>
                  <span className="text-[10px] ml-2" style={{ color: "#8A98A8" }}>{referansParcalar.length} örnek parça</span>
                </div>
              </div>
              <div className="p-5" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: 16 }}>
                {referansParcalar.map((p: {
                  parca_id: string;
                  baslik: string;
                  aciklama: string | null;
                  malzeme: string | null;
                  islem_turu: string | null;
                  gorsel_url: string | null;
                }) => (
                  <div key={p.parca_id} className="rounded overflow-hidden border" style={{ borderColor: "#DDE8F0", boxShadow: "0 1px 4px rgba(0,48,87,0.06)" }}>
                    {/* Görsel */}
                    <div style={{ position: "relative", height: 160, background: "#F4F7FB", overflow: "hidden" }}>
                      {p.gorsel_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.gorsel_url} alt={p.baslik} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <span style={{ fontSize: 32, opacity: 0.15 }}>⚙</span>
                        </div>
                      )}
                      {p.islem_turu && (
                        <div style={{
                          position: "absolute", bottom: 8, left: 8,
                          background: "rgba(0,48,87,0.82)", backdropFilter: "blur(4px)",
                          color: "#fff", fontSize: 9, fontWeight: 600,
                          letterSpacing: 1, textTransform: "uppercase",
                          padding: "3px 7px", borderRadius: 2,
                        }}>
                          {p.islem_turu}
                        </div>
                      )}
                    </div>
                    {/* Bilgi */}
                    <div style={{ padding: "12px 14px" }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#003057", marginBottom: 6, lineHeight: 1.3 }}>{p.baslik}</div>
                      {p.malzeme && (
                        <div style={{ fontSize: 10, color: "#8A98A8", marginBottom: 4 }}>
                          <span style={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Malzeme · </span>
                          <span style={{ color: "#3D4E63" }}>{p.malzeme}</span>
                        </div>
                      )}
                      {p.aciklama && (
                        <p style={{ fontSize: 10, color: "#8A98A8", lineHeight: 1.6, margin: 0, marginTop: 6 }}>{p.aciklama}</p>
                      )}
                    </div>
                    <div style={{ height: 2, background: "linear-gradient(90deg,#003057,#0077CC)" }} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DEĞERLENDİRMELER */}
          {degerlendirmeler.length > 0 && (
            <div className="rounded border" style={{ background: "#fff", borderColor: "#DDE8F0" }}>
              <div className="px-4 py-3.5 border-b flex justify-between items-center" style={{ borderColor: "#DDE8F0" }}>
                <span className="text-xs font-bold tracking-wider uppercase" style={{ color: "#003057" }}>Değerlendirmeler</span>
                {puanOrtalama && (
                  <span className="text-xs font-semibold" style={{ color: "#F59E0B" }}>★ {puanOrtalama} / 5.0</span>
                )}
              </div>
              <div className="px-4 py-2">
                {degerlendirmeler.map((d: { degerlendirme_id: string; puan: number; yorum: string | null; dogrulanmis_is: boolean; olusturulma_tarihi: string }) => (
                  <div key={d.degerlendirme_id} className="py-3 border-b last:border-0" style={{ borderColor: "#DDE8F0" }}>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-xs font-semibold" style={{ color: "#003057" }}>
                        {d.dogrulanmis_is ? "✓ Doğrulanmış Müşteri" : "Müşteri"}
                      </span>
                      <span className="text-[10px]" style={{ color: "#8A98A8" }}>
                        {new Date(d.olusturulma_tarihi).toLocaleDateString("tr-TR")}
                      </span>
                    </div>
                    <div className="mb-1.5" style={{ color: "#F59E0B", fontSize: 12, letterSpacing: 1 }}>
                      {"★".repeat(d.puan)}{"☆".repeat(5 - d.puan)}
                    </div>
                    {d.yorum && <p className="text-xs leading-relaxed" style={{ color: "#3D4E63" }}>{d.yorum}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* SIDEBAR */}
        <div className="flex flex-col gap-3">
          {/* CTA KARTI */}
          <div className="rounded p-5 text-center" style={{ background: "#003057" }}>
            <div className="text-xs font-semibold text-white mb-1 tracking-wide">Bu Firmaya Teklif İste</div>
            <div className="text-[10px] mb-4 leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
              Proje detaylarınızı paylaşın,<br />24 saat içinde yanıt alın.
            </div>
            <Link
              href={`/rfq?firma=${id}`}
              className="block w-full py-2.5 text-xs font-semibold text-white uppercase tracking-wide rounded-sm mb-2 hover:opacity-90 transition-opacity"
              style={{ background: "#0077CC" }}
            >
              Teklif Formu Doldur
            </Link>
            <button className="block w-full py-2.5 text-xs text-white/70 uppercase tracking-wide rounded-sm border border-white/20 hover:bg-white/10 transition-all">
              Mesaj Gönder
            </button>
            <div className="h-px my-3.5" style={{ background: "rgba(255,255,255,0.1)" }} />
            <div className="text-[10px]" style={{ color: "rgba(255,255,255,0.4)" }}>
              Ortalama yanıt süresi:{" "}
              {firma.ort_yanit_suresi_saat
                ? `${firma.ort_yanit_suresi_saat} saat`
                : "–"}
            </div>
          </div>

          {/* FİRMA BİLGİLERİ */}
          <div className="rounded p-4 border" style={{ background: "#fff", borderColor: "#DDE8F0" }}>
            <div className="text-[10px] font-bold tracking-wider uppercase pb-2 mb-3 border-b" style={{ color: "#003057", borderColor: "#DDE8F0" }}>
              Firma Bilgileri
            </div>
            {[
              { lbl: "Konum", val: [firma.il, firma.ilce].filter(Boolean).join(", ") || null },
              { lbl: "Kuruluş", val: firma.kurulus_yili?.toString() ?? null },
              { lbl: "Çalışan", val: firma.calisan_aralik ?? null },
              { lbl: "İş Telefonu", val: firma.telefon ?? null },
              { lbl: "Mevcut Durum", val: firma.mevcut_durum === "musait" ? "Müsait" : firma.mevcut_durum === "mesgul" ? "Meşgul" : "Bakım" },
              { lbl: "Website", val: firma.website ?? null },
            ].filter(r => r.val).map((r, i) => (
              <div key={i} className="flex justify-between py-1.5 border-b last:border-0 text-xs" style={{ borderColor: "#DDE8F0" }}>
                <span style={{ color: "#8A98A8" }}>{r.lbl}</span>
                {r.lbl === "Website" ? (
                  <a href={r.val!} target="_blank" rel="noopener noreferrer" className="font-semibold hover:underline" style={{ color: "#0077CC" }}>
                    {r.val!.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                  </a>
                ) : (
                  <span className="font-semibold text-right" style={{ color: "#1A2535" }}>{r.val}</span>
                )}
              </div>
            ))}
          </div>

          {/* PROFİL DOLULUK */}
          {firma.profil_doluluk !== null && (
            <div className="rounded p-4 border" style={{ background: "#fff", borderColor: "#DDE8F0" }}>
              <div className="flex justify-between mb-1.5">
                <span className="text-[10px]" style={{ color: "#8A98A8" }}>Profil Doluluk</span>
                <span className="text-xs font-bold" style={{ color: "#1A7A4A" }}>{firma.profil_doluluk}%</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#DDE8F0" }}>
                <div
                  className="h-full rounded-full"
                  style={{ width: `${firma.profil_doluluk}%`, background: "linear-gradient(90deg,#00529C,#0077CC)" }}
                />
              </div>
            </div>
          )}

          {/* BENZER FİRMALAR */}
          {benzerFirmalar.length > 0 && (
            <div className="rounded p-4 border" style={{ background: "#fff", borderColor: "#DDE8F0" }}>
              <div className="text-[10px] font-bold tracking-wider uppercase pb-2 mb-1 border-b" style={{ color: "#003057", borderColor: "#DDE8F0" }}>
                Bölgedeki Firmalar
              </div>
              {benzerFirmalar.map((f: { firma_id: string; ticari_unvan: string; il: string | null; ilce: string | null; dogrulanmis_rozet: boolean }) => {
                const ks = f.ticari_unvan.split(" ").slice(0, 2).map((w: string) => w[0]).join("").toUpperCase();
                return (
                  <Link
                    key={f.firma_id}
                    href={`/firma/${f.firma_id}`}
                    className="flex items-center gap-2.5 py-2 border-b last:border-0 group"
                    style={{ borderColor: "#DDE8F0" }}
                  >
                    <div className="flex-shrink-0 flex items-center justify-center text-xs font-bold rounded" style={{ width: 34, height: 34, background: "#E8F2FA", color: "#003057" }}>
                      {ks}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold truncate group-hover:text-blue-600 transition-colors" style={{ color: "#003057" }}>{f.ticari_unvan}</div>
                      <div className="text-[10px] mt-0.5" style={{ color: "#8A98A8" }}>{[f.ilce, f.il].filter(Boolean).join(", ")}</div>
                    </div>
                    <span className="text-xs" style={{ color: "#8A98A8" }}>›</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
