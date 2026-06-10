import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import RFQForm from "./RFQForm";

export const metadata = { title: "RFQ — Teklif İste" };

export default async function RFQPage({
  searchParams,
}: {
  searchParams: Promise<{ firma?: string }>;
}) {
  const { firma: firmaId } = await searchParams;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect(`/giris?redirect=/rfq${firmaId ? `?firma=${firmaId}` : ""}`);
  if (user.user_metadata?.tip !== "alici") redirect("/panel");

  // Hedef firma bilgisi
  let hedefFirmaAdi: string | undefined;
  let hedefFirmaIl: string | undefined;
  if (firmaId) {
    const { data } = await supabaseAdmin
      .from("firma")
      .select("ticari_unvan, il")
      .eq("firma_id", firmaId)
      .eq("durum", "yayinda")
      .single();
    if (data) {
      hedefFirmaAdi = data.ticari_unvan;
      hedefFirmaIl  = data.il ?? undefined;
    }
  }

  // Tezgah tipleri + alt kategoriler (gruplu)
  type TipRow = { tip_id: number; ad: string };
  type AltRow = { alt_kategori_id: number; tip_id: number; ad: string };

  const [{ data: tipler }, { data: altKategoriler }] = await Promise.all([
    supabaseAdmin
      .from("tezgah_tip")
      .select("tip_id, ad")
      .eq("aktif", true)
      .order("sira"),
    supabaseAdmin
      .from("tezgah_alt_kategori")
      .select("alt_kategori_id, tip_id, ad")
      .eq("aktif", true)
      .order("tip_id")
      .order("sira"),
  ]);

  const tezgahGruplari = (tipler as TipRow[] ?? []).map((tip) => ({
    tip_id: tip.tip_id,
    ad: tip.ad,
    altKategoriler: (altKategoriler as AltRow[] ?? [])
      .filter((a) => a.tip_id === tip.tip_id)
      .map((a) => ({ id: a.alt_kategori_id, ad: a.ad })),
  })).filter((g) => g.altKategoriler.length > 0);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#F4F6F8", fontFamily: "-apple-system,'Segoe UI',sans-serif" }}>
      {/* Topbar */}
      <div className="flex items-center gap-5 px-6 flex-shrink-0" style={{ background: "#003057", height: 54 }}>
        <Link href="/" className="text-white text-[12px] font-medium tracking-[2px] uppercase hover:opacity-80">
          RENT<span className="font-bold" style={{ color: "#7ABFFF" }}>CNC</span>MACHINE
        </Link>
        <span className="ml-auto text-[10px] tracking-[1.5px] uppercase" style={{ color: "rgba(255,255,255,0.6)" }}>
          YENİ RFQ — TEKLİF İSTEĞİ
        </span>
      </div>

      <div className="flex-1 flex justify-center px-5 py-6">
        <div className="w-full max-w-[800px]">
          <RFQForm
            hedefFirmaId={firmaId}
            hedefFirmaAdi={hedefFirmaAdi}
            hedefFirmaIl={hedefFirmaIl}
            tezgahGruplari={tezgahGruplari}
          />
        </div>
      </div>

      <footer className="flex justify-between items-center px-6 py-4 text-[10px] flex-wrap gap-2.5 border-t"
        style={{ background: "#fff", borderColor: "#D4D8DC", color: "#8B97A4" }}>
        <span>© 2026 RentCNCmachine.com</span>
        <div className="flex gap-5">
          {["KVKK", "Kullanım Koşulları"].map((l) => (
            <Link key={l} href={`/${l.toLowerCase().replace(" ", "-")}`}
              className="uppercase tracking-[1px] hover:opacity-70 transition-opacity" style={{ color: "#5B6770" }}>
              {l}
            </Link>
          ))}
        </div>
      </footer>
    </div>
  );
}
