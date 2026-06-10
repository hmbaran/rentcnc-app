import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("sektor")
    .select("sektor_id, kod, ad, kategori, ikon, sira")
    .eq("aktif", true)
    .order("sira", { ascending: true });

  if (error) {
    console.error("sektorler hatası:", error);
    return NextResponse.json({ hata: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
