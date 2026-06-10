import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return NextResponse.json({ hata: "Oturum bulunamadı." }, { status: 401 });

  // Firma ID al
  const { data: kul } = await supabaseAdmin
    .from("kullanici").select("firma_id").eq("email", user.email).single();
  if (!kul?.firma_id) return NextResponse.json({ hata: "Firma bulunamadı." }, { status: 403 });

  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) return NextResponse.json({ hata: "Dosya eksik." }, { status: 400 });
  if (file.size > 8 * 1024 * 1024) return NextResponse.json({ hata: "Dosya 8 MB'dan büyük." }, { status: 400 });

  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `referans/${kul.firma_id}/${Date.now()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadHata } = await supabaseAdmin.storage
    .from("firma-gorselleri")
    .upload(path, buffer, { contentType: file.type, upsert: false });

  if (uploadHata) return NextResponse.json({ hata: uploadHata.message }, { status: 500 });

  const { data: { publicUrl } } = supabaseAdmin.storage
    .from("firma-gorselleri")
    .getPublicUrl(path);

  return NextResponse.json({ url: publicUrl });
}
