import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("tezgah_tip")
    .select("tip_id, kod, ad")
    .eq("aktif", true)
    .order("sira", { ascending: true });

  if (error) {
    console.error("tezgah-tipleri hatası:", error);
    return NextResponse.json({ hata: error.message }, { status: 500 });
  }

  return NextResponse.json(
    data.map((r) => ({ tipId: r.tip_id, kod: r.kod, ad: r.ad }))
  );
}
