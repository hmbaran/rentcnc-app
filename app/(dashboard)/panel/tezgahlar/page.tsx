import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import TezgahIslemler from "./TezgahIslemler";
import { tezgahDolulukHesapla, dolulukRenk } from "@/lib/utils/doluluk";

const DURUM_LABEL: Record<string, { txt: string; cls: string }> = {
  aktif_tam_kapasite: { txt: "Aktif — Tam Kapasite", cls: "bg-[#E8F5EE] text-[#1A7A4A]" },
  kismen_musait:      { txt: "Kısmen Müsait",        cls: "bg-[#FEF8E6] text-[#B07A00]" },
  bakimda:            { txt: "Bakımda",               cls: "bg-[#FEF0E6] text-[#C05C00]" },
  satildi_kapali:     { txt: "Kapalı / Satıldı",     cls: "bg-[#F4F6F8] text-[#8B97A4]" },
};

type TezgahRow = {
  tezgah_id: string;
  durum: string;
  model: string | null;
  eksen_ozellik: string | null;
  bag_x_mm: number | null;
  bag_y_mm: number | null;
  bag_z_mm: number | null;
  max_rpm: number | null;
  yapim_yili: number | null;
  notlar: string | null;
  ekleme_tarihi: string;
  tezgah_tip: { ad: string } | null;
  tezgah_alt_kategori: { ad: string } | null;
  tezgah_marka: { ad: string } | null;
  kontrol_sistemi: { ad: string } | null;
  gorsel_sayisi?: number;
  gorseller?: { gorsel_id: string; url: string; sira: number }[];
};

export default async function TezgahlarPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let firmaId: string | null = null;
  if (user?.email) {
    const { data: kul } = await supabaseAdmin
      .from("kullanici").select("firma_id").eq("email", user.email).single();
    firmaId = kul?.firma_id ?? null;
  }

  let tezgahlar: TezgahRow[] = [];
  if (firmaId) {
    const { data } = await supabaseAdmin
      .from("tezgah")
      .select(`
        tezgah_id, durum, model, eksen_ozellik,
        bag_x_mm, bag_y_mm, bag_z_mm, max_rpm, yapim_yili,
        notlar, ekleme_tarihi,
        tezgah_tip ( ad ),
        tezgah_alt_kategori ( ad ),
        tezgah_marka ( ad ),
        kontrol_sistemi ( ad ),
        tezgah_gorsel ( gorsel_id, url, sira )
      `)
      .eq("firma_id", firmaId)
      .order("ekleme_tarihi", { ascending: false });

    tezgahlar = ((data ?? []) as unknown as TezgahRow[]).map((t: TezgahRow & {
      tezgah_gorsel?: { gorsel_id: string; url: string; sira: number }[]
    }) => ({
      ...t,
      gorseller:    (t.tezgah_gorsel ?? []).sort((a, b) => a.sira - b.sira),
      gorsel_sayisi: t.tezgah_gorsel?.length ?? 0,
    }));
  }

  return (
    <div>
      {/* Başlık */}
      <div className="flex items-center gap-3 mb-5">
        <Link href="/panel" className="text-[11px] text-[#5B6770] hover:text-[#003057] tracking-[0.5px] no-underline transition-colors">
          ← Dashboard
        </Link>
        <span className="text-[#D4D8DC] text-[11px]">/</span>
        <span className="text-[11px] text-[#003057] font-medium tracking-[0.5px]">Tezgah Parkım</span>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-[10px]">
          <div className="w-7 h-7 rounded-full bg-[#003057] text-white flex items-center justify-center text-[11px] font-semibold">▦</div>
          <div>
            <div className="text-[14px] font-medium text-[#003057]">Tezgah Parkım</div>
            <div className="text-[11px] text-[#8A98A8] mt-[1px]">
              {tezgahlar.length > 0 ? `${tezgahlar.length} tezgah kayıtlı` : "Henüz tezgah eklenmedi"}
            </div>
          </div>
        </div>
        <Link href="/panel/tezgah-ekle"
          className="px-[18px] py-[9px] bg-[#003057] text-white text-[11px] font-medium tracking-[0.5px] uppercase rounded-[2px] no-underline hover:bg-[#004080] transition-colors">
          + Yeni Tezgah Ekle
        </Link>
      </div>

      {tezgahlar.length === 0 ? (
        <div className="bg-white border border-[#DDE8F0] rounded-[4px] px-[18px] py-[60px] text-center">
          <div className="text-[36px] mb-4 opacity-20">▦</div>
          <p className="text-[14px] text-[#5B6770] font-medium mb-2">Tezgah parkınız boş</p>
          <Link href="/panel/tezgah-ekle"
            className="inline-block px-6 py-[10px] bg-[#003057] text-white text-[11px] font-medium tracking-[0.5px] uppercase rounded-[2px] no-underline hover:bg-[#004080] transition-colors">
            + İlk Tezgahı Ekle
          </Link>
        </div>
      ) : (
        <div className="space-y-[10px]">
          {tezgahlar.map((t, i) => {
            const tip    = (t.tezgah_tip as { ad: string } | null)?.ad ?? null;
            const altKat = (t.tezgah_alt_kategori as { ad: string } | null)?.ad ?? null;
            const marka  = (t.tezgah_marka as { ad: string } | null)?.ad ?? null;
            const ks     = (t.kontrol_sistemi as { ad: string } | null)?.ad ?? null;
            const { yuzde, adimlar } = tezgahDolulukHesapla({
              model: t.model, bag_x_mm: t.bag_x_mm, bag_y_mm: t.bag_y_mm,
              bag_z_mm: t.bag_z_mm, max_rpm: t.max_rpm, yapim_yili: t.yapim_yili,
              kontrol_sistemi: ks ? { ad: ks } : null, gorsel_sayisi: t.gorsel_sayisi,
            });
            const renk = dolulukRenk(yuzde);
            const eksikler = adimlar.filter((a) => !a.tamam);
            const durum  = DURUM_LABEL[t.durum] ?? { txt: t.durum, cls: "bg-[#F4F6F8] text-[#8B97A4]" };
            const strok  = t.bag_x_mm && t.bag_y_mm
              ? `X:${t.bag_x_mm}  Y:${t.bag_y_mm}${t.bag_z_mm ? `  Z:${t.bag_z_mm}` : ""} mm`
              : null;
            const tarih  = new Date(t.ekleme_tarihi).toLocaleDateString("tr-TR", {
              day: "2-digit", month: "long", year: "numeric",
            });

            return (
              <div key={t.tezgah_id} className="bg-white border border-[#DDE8F0] rounded-[4px] overflow-hidden">
                {/* Kart üstü */}
                <div className="px-[18px] py-[10px] bg-[#F8FAFB] border-b border-[#EEF2F6] flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-[#5B6770] tracking-[1px] uppercase">
                    TEZGAH #{i + 1}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-[9.5px] text-[#B0BAC4]">{tarih}</span>
                    <span className={`text-[9.5px] font-semibold px-[8px] py-[3px] rounded-[2px] tracking-[0.5px] ${durum.cls}`}>
                      {durum.txt}
                    </span>
                  </div>
                </div>

                {/* Kart içi */}
                <div className="px-[18px] py-[14px]">
                  <div className="flex items-start justify-between gap-4 mb-[10px]">
                    <div className="flex-1 min-w-0">
                      <div className="text-[15px] font-semibold text-[#003057] leading-[1.3]">
                        {marka ?? "Bilinmiyor"}
                        {t.model && <span className="font-normal text-[#5B6770] ml-2">— {t.model}</span>}
                      </div>
                      <div className="text-[11px] text-[#8A98A8] mt-[3px]">
                        {[tip, altKat, t.eksen_ozellik].filter(Boolean).join("  ›  ")}
                      </div>
                    </div>

                    {/* Aksiyon butonları — Client Component */}
                    <TezgahIslemler tezgahId={t.tezgah_id} />
                  </div>

                  {/* Fotoğraf thumbnails */}
                  {t.gorseller && t.gorseller.length > 0 && (
                    <div className="flex gap-[6px] mb-[10px] flex-wrap">
                      {t.gorseller.slice(0, 4).map((g, gi) => (
                        <div key={g.gorsel_id}
                          className="relative w-[64px] h-[64px] rounded-[3px] overflow-hidden border border-[#DDE8F0] bg-[#F4F6F8] flex-shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={g.url} alt={`Fotoğraf ${gi + 1}`}
                            className="w-full h-full object-cover" />
                        </div>
                      ))}
                      {t.gorseller.length > 4 && (
                        <div className="w-[64px] h-[64px] rounded-[3px] border border-[#DDE8F0] bg-[#F4F6F8] flex items-center justify-center text-[11px] font-semibold text-[#8A98A8] flex-shrink-0">
                          +{t.gorseller.length - 4}
                        </div>
                      )}
                    </div>
                  )}
                  {(!t.gorseller || t.gorseller.length === 0) && (
                    <div className="flex items-center gap-[6px] mb-[10px]">
                      <Link href={`/panel/tezgahlar/${t.tezgah_id}/duzenle`}
                        className="flex items-center gap-[5px] text-[10px] text-[#8A98A8] hover:text-[#00529C] no-underline transition-colors">
                        <span>📷</span> Fotoğraf ekle
                      </Link>
                    </div>
                  )}

                  {/* Teknik detaylar */}
                  <div className="grid grid-cols-2 gap-x-6 gap-y-[5px]">
                    {strok && (
                      <div className="flex justify-between text-[11.5px] border-b border-[#F0F3F6] pb-[4px]">
                        <span className="text-[#8A98A8]">X/Y/Z Strok</span>
                        <span className="font-medium text-[#1A2535]">{strok}</span>
                      </div>
                    )}
                    {t.max_rpm && (
                      <div className="flex justify-between text-[11.5px] border-b border-[#F0F3F6] pb-[4px]">
                        <span className="text-[#8A98A8]">Max. Devir</span>
                        <span className="font-medium text-[#1A2535]">{t.max_rpm.toLocaleString()} RPM</span>
                      </div>
                    )}
                    {t.yapim_yili && (
                      <div className="flex justify-between text-[11.5px] border-b border-[#F0F3F6] pb-[4px]">
                        <span className="text-[#8A98A8]">Yapım Yılı</span>
                        <span className="font-medium text-[#1A2535]">{t.yapim_yili}</span>
                      </div>
                    )}
                    {ks && (
                      <div className="flex justify-between text-[11.5px] border-b border-[#F0F3F6] pb-[4px]">
                        <span className="text-[#8A98A8]">Kontrol Sistemi</span>
                        <span className="font-medium text-[#1A2535]">{ks}</span>
                      </div>
                    )}
                  </div>

                  {t.notlar && (
                    <div className="mt-[8px] px-[10px] py-[6px] bg-[#FEF8E6] border border-[#E8D98A] rounded-[3px] text-[10.5px] text-[#7A6200]">
                      {t.notlar}
                    </div>
                  )}

                  {/* Doluluk çubuğu */}
                  <div className="mt-[12px] pt-[10px] border-t border-[#EEF2F6]">
                    <div className="flex items-center justify-between mb-[5px]">
                      <span className="text-[9.5px] font-semibold text-[#8A98A8] tracking-[0.8px] uppercase">
                        Bilgi Doluluk
                      </span>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold ${renk.text}`}>{yuzde}%</span>
                        {yuzde < 100 && (
                          <Link href={`/panel/tezgahlar/${t.tezgah_id}/duzenle`}
                            className={`text-[9.5px] font-medium px-[8px] py-[2px] rounded-[2px] no-underline transition-colors ${renk.badge} hover:opacity-80`}>
                            Tamamla →
                          </Link>
                        )}
                      </div>
                    </div>

                    {/* Bar */}
                    <div className="h-[5px] bg-[#EEF2F6] rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${renk.bar}`}
                        style={{ width: `${yuzde}%` }} />
                    </div>

                    {/* Eksik alanlar */}
                    {eksikler.length > 0 && yuzde < 80 && (
                      <div className="flex flex-wrap gap-[4px] mt-[6px]">
                        {eksikler.map((e) => (
                          <span key={e.alan}
                            className="text-[9px] px-[6px] py-[2px] bg-[#F4F6F8] text-[#8A98A8] rounded-[2px]">
                            + {e.alan}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tezgahlar.length > 0 && (
        <div className="mt-[18px] flex justify-center">
          <Link href="/panel/tezgah-ekle"
            className="px-[22px] py-[10px] border-2 border-dashed border-[#C8D8E8] text-[11px] text-[#5B6770] font-medium tracking-[0.5px] uppercase rounded-[3px] no-underline hover:border-[#003057] hover:text-[#003057] transition-colors">
            + Başka Tezgah Ekle
          </Link>
        </div>
      )}
    </div>
  );
}
