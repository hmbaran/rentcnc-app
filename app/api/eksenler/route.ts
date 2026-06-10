import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  const altKategoriId = req.nextUrl.searchParams.get("altKategoriId");
  if (!altKategoriId) return NextResponse.json([]);

  const { data, error } = await supabaseAdmin
    .from("tezgah_eksen_secenek")
    .select("eksen_id, ad")
    .eq("alt_kategori_id", parseInt(altKategoriId))
    .eq("aktif", true)
    .order("sira", { ascending: true });

  if (error) {
    console.error("eksenler hatası:", error);
    return NextResponse.json({ hata: error.message }, { status: 500 });
  }

  return NextResponse.json(
    data.map((r) => ({ eksenId: r.eksen_id, ad: r.ad }))
  );
}
