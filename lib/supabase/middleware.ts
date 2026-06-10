import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/lib/db/database.types";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // getUser() session'ı yeniler — bunu atlamayın
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Korumalı rotalar: giriş yapmamışsa /giris'e yönlendir
  const korumalıRotalar = ["/panel", "/alici/panel", "/admin"];
  const korumalı = korumalıRotalar.some((rota) => pathname.startsWith(rota));

  if (korumalı && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/giris";
    return NextResponse.redirect(url);
  }

  // Giriş yapmışsa auth sayfalarına gitmesin
  const authRotalar = ["/giris", "/kayit"];
  const authSayfasi = authRotalar.some((rota) => pathname.startsWith(rota));

  if (authSayfasi && user) {
    const url = request.nextUrl.clone();
    const rol = user.user_metadata?.rol as string | undefined;
    if (rol === "admin") {
      url.pathname = "/admin";
    } else if (rol === "alici") {
      url.pathname = "/alici/panel";
    } else {
      url.pathname = "/panel";
    }
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
