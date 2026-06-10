import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import TeklifFormu from "./TeklifFormu";

export default async function RfqDetayPage({
  params,
  searchParams,
}: {
  params: Promise<{ rfqId: string }>;
  searchParams: Promise<{ rfqFirmaId?: string }>;
}) {
  const { rfqId } = await params;
  const { rfqFirmaId } = await searchParams;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/giris");

  const { data: kul } = await supabaseAdmin
    .from("kullanici")
    .select("firma_id")
    .eq("email", user.email!)
    .single();
  if (!kul?.firma_id) redirect("/panel");

  // rfq_firma kaydını bul
  const rfqFirmaQuery = supabaseAdmin
    .from("rfq_firma")
    .select("rfq_firma_id, durum, okunma_tarihi")
    .eq("rfq_id", rfqId)
    .eq("firma_id", kul.firma_id)
    .single();

  const rfqQuery = supabaseAdmin
    .from("rfq")
    .select(`
      rfq_id, baslik, aciklama, adet, termin, cevap_son_tarihi,
      firma_sayisi, tezgah_tipleri, malzemeler, tolerans,
      yuzey_puruzlulugu, sertifika_gereksinimleri, butce_araligi,
      sehir_bolge, nda_request, iletisim_tercihi, olusturulma_tarihi,
      alici ( ad, soyad, firma_adi, ulke )
    `)
    .eq("rfq_id", rfqId)
    .single();

  const [{ data: rfqFirma }, { data: rfq }] = await Promise.all([rfqFirmaQuery, rfqQuery]);

  if (!rfqFirma || !rfq) redirect("/panel/rfq");

  // Mevcut teklif varsa getir
  const { data: mevcutTeklif } = await supabaseAdmin
    .from("teklif")
    .select("teklif_id, birim_fiyat, toplam_fiyat, para_birimi, termin_haftalari, notlar, gecerlilik_bitis, durum")
    .eq("rfq_firma_id", rfqFirma.rfq_firma_id)
    .maybeSingle();

  // İlk açılışta okundu olarak işaretle
  if (!rfqFirma.okunma_tarihi && rfqFirma.durum === "gonderildi") {
    await supabaseAdmin
      .from("rfq_firma")
      .update({ durum: "goruldu", okunma_tarihi: new Date().toISOString() })
      .eq("rfq_firma_id", rfqFirma.rfq_firma_id);
  }

  const alici = (rfq.alici as unknown as { ad: string; soyad: string; firma_adi: string; ulke: string } | null);
  const tezgahTipleri = (rfq.tezgah_tipleri as string[] | null) ?? [];
  const malzemeler = (rfq.malzemeler as string[] | null) ?? [];
  const sertifikalar = (rfq.sertifika_gereksinimleri as string[] | null) ?? [];
  const iletisimTercihi = (rfq.iletisim_tercihi as string[] | null) ?? [];
  const sureDoldu = rfq.cevap_son_tarihi
    ? new Date(rfq.cevap_son_tarihi) < new Date()
    : false;

  return (
    <div className="max-w-[860px]">
      {/* Geri */}
      <a href="/panel/rfq" className="inline-flex items-center gap-1 text-[11px] text-[#0077CC] hover:underline mb-4 no-underline">
        ← Gelen RFQ Listesi
      </a>

      {/* RFQ başlık kartı */}
      <div className="bg-white border border-[#D4D8DC] rounded-[2px] p-[22px] mb-4">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="text-[10px] text-[#8B97A4] font-mono tracking-wider mb-1">{rfq.rfq_id}</div>
            <h1 className="text-[20px] font-light text-[#003057] leading-[1.3]">{rfq.baslik}</h1>
            {alici && (
              <div className="text-[11px] text-[#5B6770] mt-1">
                {alici.firma_adi}{alici.ulke ? ` · ${alici.ulke}` : ""}
              </div>
            )}
          </div>
          <div className="flex-shrink-0 text-right">
            {sureDoldu ? (
              <span className="text-[9.5px] font-semibold px-2 py-1 rounded-[2px] bg-[#F4F6F8] text-[#5B6770]">Süresi Doldu</span>
            ) : (
              rfq.cevap_son_tarihi && (
                <div>
                  <div className="text-[9px] text-[#8B97A4] uppercase tracking-[1px]">Son tarih</div>
                  <div className="text-[13px] font-semibold text-[#C77700]">
                    {new Date(rfq.cevap_son_tarihi).toLocaleDateString("tr-TR", { day: "2-digit", month: "long", year: "numeric" })}
                  </div>
                </div>
              )
            )}
          </div>
        </div>

        {/* Açıklama */}
        <p className="text-[13px] text-[#3D4E63] leading-[1.7] mb-5 whitespace-pre-wrap">{rfq.aciklama}</p>

        {/* Detay grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { lbl: "Adet", val: `${rfq.adet} adet` },
            { lbl: "Termin", val: rfq.termin ? new Date(rfq.termin).toLocaleDateString("tr-TR") : "—" },
            { lbl: "Bütçe", val: rfq.butce_araligi || "—" },
            { lbl: "Şehir / Bölge", val: rfq.sehir_bolge || "—" },
            { lbl: "Tolerans", val: rfq.tolerans || "—" },
            { lbl: "Yüzey Pürüzlülüğü", val: rfq.yuzey_puruzlulugu || "—" },
          ].map((d) => (
            <div key={d.lbl} className="bg-[#F8FAFB] rounded-[2px] p-3">
              <div className="text-[9px] text-[#8B97A4] uppercase tracking-[1px] mb-[3px]">{d.lbl}</div>
              <div className="text-[12px] font-medium text-[#1A2535]">{d.val}</div>
            </div>
          ))}
        </div>

        {/* Tag listeler */}
        <div className="mt-4 flex flex-col gap-3">
          {tezgahTipleri.length > 0 && (
            <div>
              <div className="text-[9px] text-[#8B97A4] uppercase tracking-[1px] mb-2">Tezgah Tipleri</div>
              <div className="flex flex-wrap gap-1.5">
                {tezgahTipleri.map((t) => (
                  <span key={t} className="px-2 py-[3px] bg-[#E8F0F8] text-[#003057] text-[11px] rounded-[2px]">{t}</span>
                ))}
              </div>
            </div>
          )}
          {malzemeler.length > 0 && (
            <div>
              <div className="text-[9px] text-[#8B97A4] uppercase tracking-[1px] mb-2">Malzemeler</div>
              <div className="flex flex-wrap gap-1.5">
                {malzemeler.map((m) => (
                  <span key={m} className="px-2 py-[3px] bg-[#F0F7FF] text-[#0077CC] text-[11px] rounded-[2px]">{m}</span>
                ))}
              </div>
            </div>
          )}
          {sertifikalar.length > 0 && (
            <div>
              <div className="text-[9px] text-[#8B97A4] uppercase tracking-[1px] mb-2">Sertifika Gereksinimleri</div>
              <div className="flex flex-wrap gap-1.5">
                {sertifikalar.map((s) => (
                  <span key={s} className="px-2 py-[3px] bg-[#E8F5EE] text-[#1A7A4A] text-[11px] rounded-[2px]">{s}</span>
                ))}
              </div>
            </div>
          )}
          {iletisimTercihi.length > 0 && (
            <div className="text-[11px] text-[#5B6770]">
              <span className="text-[9px] text-[#8B97A4] uppercase tracking-[1px] mr-2">İletişim Tercihi:</span>
              {iletisimTercihi.join(", ")}
            </div>
          )}
          {rfq.nda_request && (
            <div className="flex items-center gap-2 text-[11px] text-[#B07A00]">
              <span className="w-[5px] h-[5px] rounded-full bg-[#B07A00]" />
              Bu RFQ için NDA imzalanması talep ediliyor.
            </div>
          )}
        </div>
      </div>

      {/* Teklif formu veya mevcut teklif */}
      <TeklifFormu
        rfqFirmaId={rfqFirma.rfq_firma_id}
        rfqId={rfq.rfq_id}
        sureDoldu={sureDoldu}
        mevcutTeklif={mevcutTeklif ?? null}
      />
    </div>
  );
}
