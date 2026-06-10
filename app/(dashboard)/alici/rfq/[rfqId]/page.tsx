import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import TeklifKabul from "./TeklifKabul";

export default async function AliciRfqDetayPage({
  params,
}: {
  params: Promise<{ rfqId: string }>;
}) {
  const { rfqId } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/giris");

  const { data: alici } = await supabaseAdmin
    .from("alici")
    .select("alici_id")
    .eq("email", user.email!)
    .single();
  if (!alici) redirect("/giris");

  // RFQ sahibi mi?
  const { data: rfq } = await supabaseAdmin
    .from("rfq")
    .select("rfq_id, baslik, adet, termin, durum, olusturulma_tarihi")
    .eq("rfq_id", rfqId)
    .eq("alici_id", alici.alici_id)
    .single();
  if (!rfq) redirect("/alici/panel");

  // Gelen teklifler
  type TeklifRow = {
    rfq_firma_id: string;
    durum: string;
    firma: { firma_id: string; ticari_unvan: string; il: string | null; dogrulanmis_rozet: boolean };
    teklif: {
      teklif_id: string;
      birim_fiyat: string;
      toplam_fiyat: string | null;
      para_birimi: string;
      termin_haftalari: number | null;
      notlar: string | null;
      gecerlilik_bitis: string | null;
      durum: string;
    } | null;
  };

  const { data: rfqFirmalar } = await supabaseAdmin
    .from("rfq_firma")
    .select(`
      rfq_firma_id, durum,
      firma ( firma_id, ticari_unvan, il, dogrulanmis_rozet ),
      teklif ( teklif_id, birim_fiyat, toplam_fiyat, para_birimi, termin_haftalari, notlar, gecerlilik_bitis, durum )
    `)
    .eq("rfq_id", rfqId)
    .order("gonderilme_tarihi");

  const liste = (rfqFirmalar as unknown as TeklifRow[]) ?? [];
  const teklifVerilenler = liste.filter((r) => r.teklif && r.teklif.durum !== "geri_cekildi");

  return (
    <div className="max-w-[860px]">
      <a href="/alici/panel" className="inline-flex items-center gap-1 text-[11px] text-[#0077CC] hover:underline mb-4 no-underline">
        ← Panele Dön
      </a>

      {/* RFQ özet */}
      <div className="bg-white border border-[#D4D8DC] rounded-[2px] p-[22px] mb-4">
        <div className="text-[10px] text-[#8B97A4] font-mono tracking-wider mb-1">{rfq.rfq_id}</div>
        <h1 className="text-[20px] font-light text-[#003057] mb-2">{rfq.baslik}</h1>
        <div className="flex gap-5 text-[11px] text-[#5B6770]">
          <span>📦 {rfq.adet} adet</span>
          {rfq.termin && <span>📅 {new Date(rfq.termin).toLocaleDateString("tr-TR")}</span>}
          <span className="ml-auto text-[10px]">
            {new Date(rfq.olusturulma_tarihi).toLocaleDateString("tr-TR", { day: "2-digit", month: "long", year: "numeric" })}
          </span>
        </div>
      </div>

      {/* Teklifler */}
      <div className="bg-white border border-[#D4D8DC] rounded-[2px]">
        <div className="px-[22px] py-[14px] border-b border-[#D4D8DC] flex items-center justify-between">
          <span className="text-[11px] font-semibold text-[#003057] tracking-[1.5px] uppercase">
            Gelen Teklifler
          </span>
          <span className="text-[11px] text-[#5B6770]">
            {teklifVerilenler.length} / {liste.length} firma teklif verdi
          </span>
        </div>

        {teklifVerilenler.length === 0 ? (
          <div className="px-8 py-12 text-center">
            <div className="text-[28px] mb-3 opacity-20">◈</div>
            <p className="text-[13px] text-[#5B6770] font-medium mb-1">Henüz teklif gelmedi</p>
            <p className="text-[11px] text-[#8B97A4]">Firmalar tekliflerini hazırlıyor olabilir.</p>
          </div>
        ) : (
          <div>
            {teklifVerilenler.map((r, i) => {
              const firma = r.firma;
              const teklif = r.teklif!;
              const kabul = teklif.durum === "kabul";
              const red = teklif.durum === "red";

              return (
                <div
                  key={r.rfq_firma_id}
                  className={`px-[22px] py-[18px] ${i < teklifVerilenler.length - 1 ? "border-b border-[#EEF2F6]" : ""} ${kabul ? "bg-[#F0FDF4]" : ""}`}
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <Link href={`/firma/${firma.firma_id}`}
                        className="text-[14px] font-semibold text-[#003057] hover:underline no-underline">
                        {firma.ticari_unvan}
                        {firma.dogrulanmis_rozet && <span className="ml-1 text-[10px] text-[#1A7A4A]">✓</span>}
                      </Link>
                      {firma.il && <div className="text-[11px] text-[#8B97A4] mt-[2px]">{firma.il}</div>}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-[20px] font-semibold text-[#003057] tracking-[-0.5px]">
                        {Number(teklif.birim_fiyat).toLocaleString("tr-TR")} {teklif.para_birimi}
                      </div>
                      <div className="text-[10px] text-[#8B97A4]">birim fiyat</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-3">
                    {[
                      { lbl: "Toplam", val: teklif.toplam_fiyat ? `${Number(teklif.toplam_fiyat).toLocaleString("tr-TR")} ${teklif.para_birimi}` : "—" },
                      { lbl: "Termin", val: teklif.termin_haftalari ? `${teklif.termin_haftalari} hafta` : "—" },
                      { lbl: "Geçerlilik", val: teklif.gecerlilik_bitis ? new Date(teklif.gecerlilik_bitis).toLocaleDateString("tr-TR") : "—" },
                    ].map((d) => (
                      <div key={d.lbl} className="bg-[#F8FAFB] rounded-[2px] p-2.5">
                        <div className="text-[9px] text-[#8B97A4] uppercase tracking-[1px] mb-[2px]">{d.lbl}</div>
                        <div className="text-[12px] font-medium text-[#1A2535]">{d.val}</div>
                      </div>
                    ))}
                  </div>

                  {teklif.notlar && (
                    <p className="text-[12px] text-[#3D4E63] leading-[1.6] mb-3 whitespace-pre-wrap bg-[#F8FAFB] p-3 rounded-[2px]">
                      {teklif.notlar}
                    </p>
                  )}

                  {kabul ? (
                    <div className="flex items-center gap-2 text-[11px] text-[#1A7A4A] font-semibold">
                      <span>✓</span> Teklif Kabul Edildi
                    </div>
                  ) : red ? (
                    <div className="text-[11px] text-[#B83232]">✕ Reddedildi</div>
                  ) : (
                    <TeklifKabul
                      teklifId={teklif.teklif_id}
                      rfqId={rfqId}
                      firmaAdi={firma.ticari_unvan}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
