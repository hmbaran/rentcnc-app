import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  const tipKod = req.nextUrl.searchParams.get("tipKod");
  if (!tipKod) return NextResponse.json([]);

  // tip_id'yi bul
  const { data: tipData } = await supabaseAdmin
    .from("tezgah_tip")
    .select("tip_id")
    .eq("kod", tipKod)
    .single();

  if (!tipData) return NextResponse.json([]);

  // Bu tipe ait marka_id listesini al
  const { data: markaTipData } = await supabaseAdmin
    .from("tezgah_marka_tip")
    .select("marka_id")
    .eq("tip_id", tipData.tip_id);

  const markaIds = (markaTipData ?? []).map((r) => r.marka_id);
  if (markaIds.length === 0) return NextResponse.json([]);

  // Markaları getir (ulke dahil — dropdown gruplandırması için)
  const { data, error } = await supabaseAdmin
    .from("tezgah_marka")
    .select("marka_id, ad, ulke")
    .in("marka_id", markaIds)
    .eq("aktif", true)
    .order("ad", { ascending: true });

  if (error) {
    console.error("markalar hatası:", error);
    return NextResponse.json({ hata: error.message }, { status: 500 });
  }

  return NextResponse.json(
    data.map((r) => ({ markaId: r.marka_id, ad: r.ad, ulke: r.ulke ?? "" }))
  );
}
