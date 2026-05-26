import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Şifre sıfırlama veya özel yönlendirme varsa öncelikli kullan
      if (next) {
        return NextResponse.redirect(`${origin}${next}`);
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      const tip = user?.user_metadata?.tip as string | undefined;
      const rol = user?.user_metadata?.rol as string | undefined;

      if (rol === "admin") return NextResponse.redirect(`${origin}/admin`);
      if (tip === "alici") return NextResponse.redirect(`${origin}/alici/panel`);
      return NextResponse.redirect(`${origin}/panel`);
    }
  }

  return NextResponse.redirect(`${origin}/giris?hata=dogrulama_basarisiz`);
}
