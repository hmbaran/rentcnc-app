import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  // Auth kontrolü
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ hata: "Giriş yapılmamış" }, { status: 401 });

  try {
    const formData = await req.formData();
    const dosyalar = formData.getAll("dosya") as File[];

    if (dosyalar.length === 0) {
      return NextResponse.json({ hata: "Dosya bulunamadı" }, { status: 400 });
    }

    const yuklenenler: { url: string; storagePath: string }[] = [];

    for (const dosya of dosyalar) {
      const ext = dosya.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const path = `tezgahlar/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

      const bytes = await dosya.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const { error } = await supabaseAdmin.storage
        .from("firma-gorseller")
        .upload(path, buffer, {
          contentType: dosya.type || "image/jpeg",
          upsert: false,
        });

      if (error) {
        console.error("Upload hatası:", error);
        continue; // Bu dosyayı atla, diğerlerine devam et
      }

      const { data: urlData } = supabaseAdmin.storage
        .from("firma-gorseller")
        .getPublicUrl(path);

      yuklenenler.push({ url: urlData.publicUrl, storagePath: path });
    }

    if (yuklenenler.length === 0) {
      return NextResponse.json({ hata: "Hiçbir dosya yüklenemedi" }, { status: 500 });
    }

    return NextResponse.json({ gorseller: yuklenenler });
  } catch (err) {
    console.error("Upload route hatası:", err);
    return NextResponse.json({ hata: String(err) }, { status: 500 });
  }
}
