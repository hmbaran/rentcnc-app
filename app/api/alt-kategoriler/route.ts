import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  const tipKod = req.nextUrl.searchParams.get("tipKod");
  if (!tipKod) return NextResponse.json([]);

  // Önce tip_id'yi kod'dan bul
  const { data: tipData } = await supabaseAdmin
    .from("tezgah_tip")
    .select("tip_id")
    .eq("kod", tipKod)
    .single();

  if (!tipData) return NextResponse.json([]);

  const { data, error } = await supabaseAdmin
    .from("tezgah_alt_kategori")
    .select("alt_kategori_id, kod, ad")
    .eq("tip_id", tipData.tip_id)
    .eq("aktif", true)
    .order("sira", { ascending: true });

  if (error) {
    console.error("alt-kategoriler hatası:", error);
    return NextResponse.json({ hata: error.message }, { status: 500 });
  }

  return NextResponse.json(
    data.map((r) => ({ altKategoriId: r.alt_kategori_id, kod: r.kod, ad: r.ad }))
  );
}
