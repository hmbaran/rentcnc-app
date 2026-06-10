import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  // Auth kontrolü
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return NextResponse.json({ hata: "Oturum bulunamadı." }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File;
  const firmaId = formData.get("firma_id") as string;

  if (!file || !firmaId) return NextResponse.json({ hata: "Dosya veya firma_id eksik." }, { status: 400 });
  if (file.size > 5 * 1024 * 1024) return NextResponse.json({ hata: "Dosya 5 MB'dan büyük." }, { status: 400 });

  // Storage'a yükle
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${firmaId}/${Date.now()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadHata } = await supabaseAdmin.storage
    .from("firma-gorselleri")
    .upload(path, buffer, { contentType: file.type, upsert: false });

  if (uploadHata) return NextResponse.json({ hata: "Yükleme hatası: " + uploadHata.message }, { status: 500 });

  // Public URL al
  const { data: { publicUrl } } = supabaseAdmin.storage
    .from("firma-gorselleri")
    .getPublicUrl(path);

  // DB'ye kaydet
  const { data: gorsel, error: dbHata } = await supabaseAdmin
    .from("gorsel")
    .insert({
      firma_id: firmaId,
      url: publicUrl,
      tip: "foto",
      sira: 0,
    })
    .select("gorsel_id, url, baslik")
    .single();

  if (dbHata) return NextResponse.json({ hata: "DB kayıt hatası: " + dbHata.message }, { status: 500 });

  return NextResponse.json({ gorsel });
}
