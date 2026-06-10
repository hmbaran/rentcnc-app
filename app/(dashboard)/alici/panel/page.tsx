import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

const RFQ_DURUM: Record<string, { txt: string; cls: string }> = {
  taslak:          { txt: "Taslak",          cls: "bg-[#F4F6F8] text-[#5B6770]" },
  aktif:           { txt: "Aktif",           cls: "bg-[#E8F5EE] text-[#1A7A4A]" },
  teklifler_geldi: { txt: "Teklif Var",      cls: "bg-[#F0F7FF] text-[#0077CC]" },
  tamamlandi:      { txt: "Tamamlandı",      cls: "bg-[#E8F5EE] text-[#1A7A4A]" },
  iptal:           { txt: "İptal",           cls: "bg-[#FEE2E2] text-[#B83232]" },
};

export default async function AliciPanelPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/giris");

  // Alıcı ID
  const { data: alici } = await supabaseAdmin
    .from("alici")
    .select("alici_id, ad, soyad, firma_adi")
    .eq("email", user.email!)
    .single();

  if (!alici) redirect("/giris");

  // RFQ'ları + gelen teklif sayısını çek
  const { data: rfqlar } = await supabaseAdmin
    .from("rfq")
    .select(`
      rfq_id, baslik, durum, adet, termin, firma_sayisi, olusturulma_tarihi, hedef_firma_id,
      rfq_firma ( durum )
    `)
    .eq("alici_id", alici.alici_id)
    .order("olusturulma_tarihi", { ascending: false })
    .limit(10);

  const rfqSayisi = rfqlar?.length ?? 0;
  const aktifRfq  = rfqlar?.filter((r) => r.durum === "aktif" || r.durum === "teklifler_geldi").length ?? 0;

  return (
    <div>
      {/* Hoş geldin banner */}
      <div className="bg-gradient-to-r from-[#003057] to-[#1A3A5C] text-white px-[22px] py-[18px] rounded-[2px] mb-[18px] flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-[18px] font-light tracking-[0.2px] mb-1">
            Hoş geldiniz, {alici.ad}! 👋
          </h1>
          <p className="text-[11.5px] text-white/70 tracking-[0.2px]">
            {alici.firma_adi
              ? `${alici.firma_adi} · `
              : ""}
            Türkiye&apos;nin en iyi CNC fasoncu firmalarını keşfedin.
          </p>
        </div>
        <Link href="/rfq"
          className="px-5 py-2.5 text-[10px] font-semibold tracking-[1.5px] uppercase text-white rounded-[2px] border border-white/30 hover:bg-white/10 transition-colors flex-shrink-0">
          + Yeni RFQ Gönder
        </Link>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-4 gap-3 mb-[18px] max-lg:grid-cols-2">
        {[
          { lbl: "Toplam RFQ",   icon: "▸", val: rfqSayisi.toString(),  delta: rfqSayisi > 0 ? "Gönderildi" : "Henüz RFQ yok" },
          { lbl: "Aktif Teklif", icon: "◈", val: aktifRfq.toString(),   delta: aktifRfq > 0 ? "Yanıt bekleniyor" : "Aktif yok" },
          { lbl: "Mesaj",        icon: "✉", val: "—", delta: "Yakında" },
          { lbl: "Favori",       icon: "♡", val: "—", delta: "Yakında" },
        ].map((s) => (
          <div key={s.lbl} className="bg-white border border-[#D4D8DC] rounded-[2px] px-4 py-[14px]">
            <div className="flex justify-between items-start mb-[6px]">
              <span className="text-[9.5px] text-[#5B6770] tracking-[1.5px] uppercase font-semibold leading-[1.3]">{s.lbl}</span>
              <span className="w-[22px] h-[22px] bg-[#F0F7FF] text-[#003057] rounded-[2px] flex items-center justify-center text-[11px] font-bold flex-shrink-0 ml-1">{s.icon}</span>
            </div>
            <div className="text-[26px] font-light text-[#003057] tracking-[-0.5px] leading-[1.1]">{s.val}</div>
            <div className="text-[10px] mt-[5px] tracking-[0.2px] text-[#8B97A4]">{s.delta}</div>
          </div>
        ))}
      </div>

      {/* 2 kolonlu grid */}
      <div className="grid grid-cols-[2fr_1fr] gap-[18px] mb-[18px] max-lg:grid-cols-1">

        {/* RFQ listesi */}
        <div className="bg-white border border-[#D4D8DC] rounded-[2px]">
          <div className="px-[18px] py-[14px] border-b border-[#D4D8DC] flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#003057] tracking-[1.5px] uppercase">Son RFQ Taleplerim</span>
            <Link href="/rfq" className="text-[10px] text-[#0077CC] tracking-[0.5px] uppercase font-semibold hover:underline">
              + Yeni
            </Link>
          </div>

          {rfqlar && rfqlar.length > 0 ? (
            <div>
              {rfqlar.map((r) => {
                const d = RFQ_DURUM[r.durum] ?? { txt: r.durum, cls: "bg-[#F4F6F8] text-[#5B6770]" };
                const tarih = new Date(r.olusturulma_tarihi).toLocaleDateString("tr-TR", {
                  day: "2-digit", month: "short", year: "numeric",
                });
                const firmaSayisiLabel: Record<string, string> = {
                  sadece_hedef: "1 firma",
                  uc_firma: "3 firma",
                  bes_firma: "5 firma",
                  on_firma: "10 firma",
                };
                const rfqFirmaList = (r as unknown as { rfq_firma: { durum: string }[] }).rfq_firma ?? [];
                const teklifSayisi = rfqFirmaList.filter((f) => f.durum === "teklif_verildi").length;

                return (
                  <div key={r.rfq_id} className="px-[18px] py-[14px] border-b border-[#D4D8DC] last:border-0 hover:bg-[#F8FAFB] transition-colors">
                    <div className="flex items-start justify-between gap-3 mb-1.5">
                      <div className="min-w-0">
                        <div className="text-[12px] font-semibold text-[#003057] truncate">{r.baslik}</div>
                        <div className="text-[10px] text-[#8B97A4] mt-0.5 font-mono tracking-wide">{r.rfq_id}</div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {teklifSayisi > 0 && (
                          <span className="text-[9.5px] font-semibold px-2 py-0.5 rounded-[2px] tracking-[0.5px] bg-[#E8F5EE] text-[#1A7A4A]">
                            {teklifSayisi} teklif
                          </span>
                        )}
                        <span className={`text-[9.5px] font-semibold px-2 py-0.5 rounded-[2px] tracking-[0.5px] ${d.cls}`}>
                          {d.txt}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-4 text-[10px] text-[#8B97A4]">
                      <span>📦 {r.adet} adet</span>
                      {r.termin && <span>📅 {new Date(r.termin).toLocaleDateString("tr-TR")}</span>}
                      <span>🏭 {firmaSayisiLabel[r.firma_sayisi] ?? r.firma_sayisi}</span>
                      <span className="ml-auto">{tarih}</span>
                      {teklifSayisi > 0 && (
                        <Link href={`/alici/rfq/${r.rfq_id}`} className="text-[#0077CC] hover:underline no-underline">
                          Teklifleri gör →
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="px-[18px] py-[44px] text-center">
              <div className="text-[28px] mb-3 opacity-30">▸</div>
              <p className="text-[13px] text-[#5B6770] font-medium mb-1">Henüz RFQ gönderilmedi</p>
              <p className="text-[11.5px] text-[#8B97A4] leading-[1.5] max-w-[280px] mx-auto mb-4">
                Türkiye&apos;deki CNC fasoncu firmalarına teklif isteği gönderin.
              </p>
              <Link href="/rfq"
                className="inline-block px-5 py-2.5 text-[10px] font-semibold tracking-[1.5px] uppercase text-white rounded-[2px] hover:opacity-90 transition-opacity"
                style={{ background: "#003057" }}>
                İlk RFQ&apos;yu Gönder →
              </Link>
            </div>
          )}
        </div>

        {/* Sağ sütun */}
        <div className="flex flex-col gap-[18px]">

          {/* Fabrika Ara */}
          <div className="bg-white border border-[#D4D8DC] rounded-[2px] p-[18px]">
            <div className="text-[10px] tracking-[2px] text-[#5B6770] uppercase font-semibold mb-1">Tedarikçi Ara</div>
            <div className="text-[15px] font-light text-[#003057] tracking-[-0.2px] mb-3">
              CNC fasoncu firmalarını keşfet
            </div>
            <p className="text-[11px] text-[#8B97A4] leading-[1.5] mb-3">
              Tezgah tipi, malzeme, sertifika ve şehre göre filtrele.
            </p>
            <Link href="/ara"
              className="block w-full text-center py-[10px] text-[10px] tracking-[1.5px] uppercase text-white rounded-[2px] font-medium hover:opacity-90 transition-opacity"
              style={{ background: "#003057" }}>
              Fabrika Ara →
            </Link>
          </div>

          {/* Hızlı aksiyonlar */}
          <div className="bg-white border border-[#D4D8DC] rounded-[2px]">
            <div className="px-[18px] py-[14px] border-b border-[#D4D8DC]">
              <span className="text-[11px] font-semibold text-[#003057] tracking-[1.5px] uppercase">Hızlı Aksiyonlar</span>
            </div>
            <div className="grid grid-cols-2 gap-2 p-[14px]">
              <Link href="/rfq"
                className="p-[14px_12px] bg-white border border-[#D4D8DC] rounded-[2px] text-center hover:border-[#003057] hover:bg-[#F0F7FF] transition-colors no-underline">
                <div className="text-[18px] mb-[6px] text-[#003057]">▸</div>
                <div className="text-[10.5px] tracking-[0.5px] text-[#003057] font-semibold uppercase leading-[1.3]">RFQ Gönder</div>
              </Link>
              <Link href="/ara"
                className="p-[14px_12px] bg-white border border-[#D4D8DC] rounded-[2px] text-center hover:border-[#003057] hover:bg-[#F0F7FF] transition-colors no-underline">
                <div className="text-[18px] mb-[6px] text-[#003057]">⊕</div>
                <div className="text-[10.5px] tracking-[0.5px] text-[#003057] font-semibold uppercase leading-[1.3]">Fabrika Ara</div>
              </Link>
              {[
                { icon: "◈", label: "Tekliflerim" },
                { icon: "♡", label: "Favorilerim" },
              ].map((a) => (
                <div key={a.label}
                  className="p-[14px_12px] bg-white border border-[#D4D8DC] rounded-[2px] text-center opacity-40 cursor-not-allowed select-none"
                  title="Yakında">
                  <div className="text-[18px] mb-[6px] text-[#003057]">{a.icon}</div>
                  <div className="text-[10.5px] tracking-[0.5px] text-[#003057] font-semibold uppercase leading-[1.3]">{a.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
