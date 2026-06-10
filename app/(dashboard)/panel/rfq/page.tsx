import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

const DURUM_LABEL: Record<string, { txt: string; cls: string }> = {
  gonderildi:     { txt: "Yeni",           cls: "bg-[#F0F7FF] text-[#0077CC]" },
  goruldu:        { txt: "Görüldü",        cls: "bg-[#FEF8E6] text-[#B07A00]" },
  teklif_verildi: { txt: "Teklif Verildi", cls: "bg-[#E8F5EE] text-[#1A7A4A]" },
  reddedildi:     { txt: "Reddedildi",     cls: "bg-[#FEE2E2] text-[#B83232]" },
  sure_doldu:     { txt: "Süresi Doldu",   cls: "bg-[#F4F6F8] text-[#5B6770]" },
};

const FIRMA_SAYISI: Record<string, string> = {
  sadece_hedef: "Sadece siz",
  uc_firma: "3 firma",
  bes_firma: "5 firma",
  on_firma: "10 firma",
};

export default async function PanelRfqListePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/giris");

  const { data: kul } = await supabaseAdmin
    .from("kullanici")
    .select("firma_id")
    .eq("email", user.email!)
    .single();
  if (!kul?.firma_id) redirect("/panel");

  type RfqFirmaRow = {
    rfq_firma_id: string;
    durum: string;
    gonderilme_tarihi: string;
    rfq: {
      rfq_id: string;
      baslik: string;
      aciklama: string;
      adet: number;
      termin: string | null;
      cevap_son_tarihi: string | null;
      firma_sayisi: string;
      tezgah_tipleri: string[] | null;
      malzemeler: string[] | null;
      olusturulma_tarihi: string;
    };
  };

  const { data: rfqlar } = await supabaseAdmin
    .from("rfq_firma")
    .select(`
      rfq_firma_id, durum, gonderilme_tarihi,
      rfq (
        rfq_id, baslik, aciklama, adet, termin,
        cevap_son_tarihi, firma_sayisi,
        tezgah_tipleri, malzemeler, olusturulma_tarihi
      )
    `)
    .eq("firma_id", kul.firma_id)
    .order("gonderilme_tarihi", { ascending: false })
    .limit(50);

  const liste = (rfqlar as unknown as RfqFirmaRow[]) ?? [];

  return (
    <div>
      {/* Başlık */}
      <div className="flex items-center justify-between mb-[18px]">
        <div>
          <h1 className="text-[18px] font-light text-[#003057] tracking-[0.2px]">Gelen RFQ Talepleri</h1>
          <p className="text-[11px] text-[#5B6770] mt-[3px]">
            Alıcılardan gelen teklif istekleri — teklif vererek iş alın.
          </p>
        </div>
        <div className="text-[11px] text-[#8B97A4]">
          {liste.length} talep
        </div>
      </div>

      {liste.length === 0 ? (
        <div className="bg-white border border-[#D4D8DC] rounded-[2px] px-8 py-16 text-center">
          <div className="text-[40px] mb-4 opacity-20">▸</div>
          <p className="text-[14px] font-medium text-[#5B6770] mb-2">Henüz gelen RFQ yok</p>
          <p className="text-[12px] text-[#8B97A4] max-w-[320px] mx-auto leading-[1.6]">
            Profiliniz alıcılar tarafından bulunabildiğinde buraya teklif istekleri gelecek.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-[#D4D8DC] rounded-[2px]">
          <div className="px-[18px] py-[12px] border-b border-[#D4D8DC] grid grid-cols-[1fr_120px_100px_90px_80px] gap-4">
            {["RFQ", "Tezgah Tipi", "Adet / Termin", "Durum", ""].map((h) => (
              <div key={h} className="text-[9px] font-semibold text-[#8B97A4] tracking-[1.5px] uppercase">{h}</div>
            ))}
          </div>

          {liste.map((r, i) => {
            const rfq = r.rfq;
            const durum = DURUM_LABEL[r.durum] ?? { txt: r.durum, cls: "bg-[#F4F6F8] text-[#5B6770]" };
            const tezgahTipleri = (rfq.tezgah_tipleri as string[] | null) ?? [];
            const sureDoldu = rfq.cevap_son_tarihi
              ? new Date(rfq.cevap_son_tarihi) < new Date()
              : false;
            const tarih = new Date(r.gonderilme_tarihi).toLocaleDateString("tr-TR", {
              day: "2-digit", month: "short",
            });

            return (
              <div
                key={r.rfq_firma_id}
                className={`px-[18px] py-[14px] grid grid-cols-[1fr_120px_100px_90px_80px] gap-4 items-center ${
                  i < liste.length - 1 ? "border-b border-[#EEF2F6]" : ""
                } ${sureDoldu ? "opacity-60" : "hover:bg-[#F8FAFB]"} transition-colors`}
              >
                {/* RFQ bilgisi */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-[3px]">
                    <span className="text-[12px] font-semibold text-[#003057] truncate">{rfq.baslik}</span>
                    {r.durum === "gonderildi" && (
                      <span className="flex-shrink-0 w-[6px] h-[6px] rounded-full bg-[#0077CC]" title="Yeni" />
                    )}
                  </div>
                  <div className="text-[10px] text-[#8B97A4] flex gap-3">
                    <span className="font-mono tracking-wide">{rfq.rfq_id}</span>
                    <span>{tarih}</span>
                    <span>{FIRMA_SAYISI[rfq.firma_sayisi] ?? rfq.firma_sayisi}</span>
                  </div>
                </div>

                {/* Tezgah tipleri */}
                <div className="text-[11px] text-[#3D4E63] truncate">
                  {tezgahTipleri.length > 0
                    ? tezgahTipleri.slice(0, 2).join(", ") + (tezgahTipleri.length > 2 ? "…" : "")
                    : "—"}
                </div>

                {/* Adet / Termin */}
                <div className="text-[11px] text-[#3D4E63]">
                  <div>{rfq.adet} adet</div>
                  {rfq.termin && (
                    <div className="text-[10px] text-[#8B97A4]">
                      {new Date(rfq.termin).toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric" })}
                    </div>
                  )}
                </div>

                {/* Durum */}
                <div>
                  <span className={`text-[9.5px] font-semibold px-2 py-[3px] rounded-[2px] tracking-[0.5px] ${durum.cls}`}>
                    {durum.txt}
                  </span>
                  {sureDoldu && r.durum !== "teklif_verildi" && (
                    <div className="text-[9px] text-[#B83232] mt-[3px]">Süresi doldu</div>
                  )}
                </div>

                {/* Aksiyon */}
                <div className="text-right">
                  <Link
                    href={`/panel/rfq/${rfq.rfq_id}?rfqFirmaId=${r.rfq_firma_id}`}
                    className="text-[10px] font-semibold text-[#0077CC] hover:underline no-underline whitespace-nowrap"
                  >
                    {r.durum === "teklif_verildi" ? "Teklifim →" : "İncele →"}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
