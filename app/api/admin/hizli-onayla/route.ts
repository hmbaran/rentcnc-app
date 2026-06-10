import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { firmaOnayBildirimiGonder, adminOnayTokenUret } from "@/lib/email";
import { revalidatePath } from "next/cache";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const firmaId = searchParams.get("firma_id");
  const islem  = searchParams.get("islem");   // "onayla" | "reddet"
  const token  = searchParams.get("token");

  if (!firmaId || !islem || !token) {
    return new NextResponse("Eksik parametre.", { status: 400 });
  }

  const beklenenToken = adminOnayTokenUret(firmaId, islem);
  if (token !== beklenenToken) {
    return new NextResponse("Geçersiz token.", { status: 403 });
  }

  if (islem === "onayla") {
    const { error } = await supabaseAdmin
      .from("firma")
      .update({ durum: "yayinda" })
      .eq("firma_id", firmaId);

    if (error) return new NextResponse("DB hatası: " + error.message, { status: 500 });

    const { data: firma } = await supabaseAdmin
      .from("firma")
      .select("ticari_unvan, email")
      .eq("firma_id", firmaId)
      .single();

    if (firma?.email) {
      await firmaOnayBildirimiGonder({
        firmaEmail: firma.email,
        firmaAdi:   firma.ticari_unvan,
        firmaId,
      }).catch(() => {});
    }

    revalidatePath("/admin");
    return new NextResponse(onayHtml(firma?.ticari_unvan ?? firmaId, "onaylandi"), {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  if (islem === "reddet") {
    const { error } = await supabaseAdmin
      .from("firma")
      .update({ durum: "reddedildi" })
      .eq("firma_id", firmaId);

    if (error) return new NextResponse("DB hatası: " + error.message, { status: 500 });

    revalidatePath("/admin");
    return new NextResponse(onayHtml("", "reddedildi"), {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  return new NextResponse("Geçersiz işlem.", { status: 400 });
}

function onayHtml(firmaAdi: string, sonuc: "onaylandi" | "reddedildi") {
  const renk   = sonuc === "onaylandi" ? "#1A7A4A" : "#CC2200";
  const simge  = sonuc === "onaylandi" ? "✓" : "✗";
  const baslik = sonuc === "onaylandi"
    ? `${firmaAdi} onaylandı ve yayına alındı.`
    : "Firma reddedildi.";

  return `<!DOCTYPE html>
<html lang="tr">
<head><meta charset="UTF-8"/><title>Admin İşlemi</title></head>
<body style="font-family:-apple-system,'Segoe UI',sans-serif;background:#F4F7FB;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;">
  <div style="background:#fff;border:1px solid #DDE8F0;border-radius:6px;padding:40px 48px;text-align:center;max-width:400px;">
    <div style="width:56px;height:56px;background:${renk}22;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 20px;font-size:24px;color:${renk};">${simge}</div>
    <p style="font-size:18px;color:#003057;margin:0 0 8px;font-weight:500;">${baslik}</p>
    <p style="font-size:12px;color:#8A98A8;margin:0;">Bu sekmeyi kapatabilirsiniz.</p>
    <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/admin" style="display:inline-block;margin-top:24px;font-size:11px;color:#0077CC;text-decoration:none;">Admin Panele Git →</a>
  </div>
</body>
</html>`;
}
