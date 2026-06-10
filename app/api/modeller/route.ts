import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  const markaId  = req.nextUrl.searchParams.get("markaId");
  const markaAdi = req.nextUrl.searchParams.get("markaAdi");
  const tipId    = req.nextUrl.searchParams.get("tipId");   // YENİ: tip filtresi

  if (!markaId && !markaAdi) {
    return NextResponse.json({ hata: "markaId veya markaAdi gerekli" }, { status: 400 });
  }

  // marka_id çöz
  let resolvedMarkaId: number | null = null;
  if (markaId) {
    resolvedMarkaId = parseInt(markaId);
  } else if (markaAdi) {
    const temizAd = markaAdi.replace(/\s*[\uD83C][\uDDE0-\uDDFF][\uD83C][\uDDE0-\uDDFF]\s*/g, "").trim();
    const { data: markaData } = await supabaseAdmin
      .from("tezgah_marka")
      .select("marka_id")
      .eq("ad", temizAd)
      .single();
    resolvedMarkaId = markaData?.marka_id ?? null;
  }

  if (!resolvedMarkaId) return NextResponse.json([]);

  // tip_id filtresi: önce bu tipe ait model var mı kontrol et
  let query = supabaseAdmin
    .from("tezgah_model")
    .select("ad")
    .eq("marka_id", resolvedMarkaId)
    .order("ad", { ascending: true });

  if (tipId) {
    const parsedTipId = parseInt(tipId);
    // Bu markanın bu tipe ait modeli var mı?
    const { count } = await supabaseAdmin
      .from("tezgah_model")
      .select("model_id", { count: "exact", head: true })
      .eq("marka_id", resolvedMarkaId)
      .eq("tip_id", parsedTipId);

    // Varsa tip filtresi uygula, yoksa tüm modelleri getir (henüz etiketlenmemiş)
    if (count && count > 0) {
      query = supabaseAdmin
        .from("tezgah_model")
        .select("ad")
        .eq("marka_id", resolvedMarkaId)
        .eq("tip_id", parsedTipId)
        .order("ad", { ascending: true });
    }
  }

  const { data, error } = await query;

  if (error) {
    console.error("modeller hatası:", error);
    return NextResponse.json({ hata: error.message }, { status: 500 });
  }

  return NextResponse.json(data.map((r) => r.ad));
}
