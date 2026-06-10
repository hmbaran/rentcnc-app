"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { db } from "@/lib/db/index";
import { alici } from "@/lib/db/schema";
import { yeniFirmaAdminBildirimi } from "@/lib/email";

type GirisInput = {
  email: string;
  sifre: string;
};

export async function girisYap(
  input: GirisInput
): Promise<{ hata: string } | undefined> {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.sifre,
  });

  if (error) {
    return { hata: "E-posta veya şifre hatalı. Lütfen tekrar deneyin." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const tip = user?.user_metadata?.tip as string | undefined;
  const rol = user?.user_metadata?.rol as string | undefined;

  if (rol === "admin") redirect("/admin");
  if (tip === "alici") redirect("/alici/panel");
  redirect("/panel");
}

type FasoncuKayitInput = {
  email: string;
  sifre: string;
  vkn: string;
  ticariUnvan: string;
  il: string;
  ilce: string;
  adres: string;
  yetkiliKisi: string;
  telefon: string;
  website?: string;
  kurulisYili: string;
  calisanAralik: string;
  kisaTanitim?: string;
  seciliPlan: string;
};

export async function fasoncuKayitYap(
  input: FasoncuKayitInput
): Promise<{ hata: string } | undefined> {
  const supabase = await createClient();

  // 1. Supabase auth kullanıcısı oluştur
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: input.email,
    password: input.sifre,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback`,
      data: { tip: "firma", rol: "firma_admin" },
    },
  });

  if (authError) {
    const msg = authError.message.toLowerCase();
    if (msg.includes("already registered") || msg.includes("user already registered")) {
      return { hata: "Bu e-posta adresi zaten kayıtlı. Giriş yapmayı deneyin." };
    }
    if (msg.includes("rate limit")) {
      return { hata: "⏳ Çok kısa sürede çok fazla deneme yapıldı. 2–3 dakika bekleyip tekrar deneyin — bilgileriniz kaybolmadı." };
    }
    console.error("Supabase signUp hatası:", authError);
    return { hata: "Kayıt sırasında hata oluştu: " + authError.message };
  }

  // Supabase onaylanmamış e-posta varsa bazen user:null döner (email enumeration koruması)
  if (!authData.user) {
    console.error("Supabase signUp: user null döndü, authData:", JSON.stringify(authData));
    return {
      hata: "Bu e-posta ile daha önce kayıt başlatılmış olabilir. E-posta kutunuzu kontrol edin veya farklı bir e-posta deneyin.",
    };
  }

  // 2. DB kayıtlarını oluştur (supabaseAdmin — RLS bypass)
  try {
    const kurulusYiliParsed =
      input.kurulisYili && input.kurulisYili !== "Daha önce"
        ? parseInt(input.kurulisYili)
        : null;

    const { data: yeniFirma, error: firmaHata } = await supabaseAdmin
      .from("firma")
      .insert({
        vergi_no: input.vkn,
        ticari_unvan: input.ticariUnvan,
        il: input.il || null,
        ilce: input.ilce || null,
        adres: input.adres || null,
        telefon_gsm: input.telefon || null,   // kayıt telefonu = cep
        email: input.email,
        website: input.website || null,
        kurulus_yili: kurulusYiliParsed,
        calisan_aralik: input.calisanAralik || null,
        hakkinda: input.kisaTanitim || null,
        durum: "taslak",
      })
      .select("firma_id")
      .single();

    if (firmaHata || !yeniFirma) {
      console.error("Firma insert hatası:", firmaHata);
      throw firmaHata;
    }

    const { error: kullaniciHata } = await supabaseAdmin
      .from("kullanici")
      .insert({
        firma_id: yeniFirma.firma_id,
        ad_soyad: input.yetkiliKisi,
        email: input.email,
        rol: "firma_admin",
        telefon: input.telefon || null,
        dil_tercihi: "tr",
      });

    if (kullaniciHata) {
      console.error("Kullanici insert hatası:", kullaniciHata);
      throw kullaniciHata;
    }
    // Admin'e bildirim gönder (hızlı onay butonları ile)
    await yeniFirmaAdminBildirimi({
      firmaId:    yeniFirma.firma_id,
      firmaAdi:   input.ticariUnvan,
      firmaEmail: input.email,
      il:         input.il || undefined,
      vergiNo:    input.vkn || undefined,
    }).catch(() => {});
  } catch (dbHata) {
    console.error("DB kayıt hatası:", dbHata);
    return {
      hata: "Firma kaydı oluşturulamadı. Lütfen bizimle iletişime geçin: murat@rentcncmachine.com",
    };
  }

  redirect("/dogrulama");
}

type AliciKayitInput = {
  firmaAdi: string;
  sektor: string;
  ulke: string;
  vatNo?: string;
  website?: string;
  calisanSayisi?: string;
  ad: string;
  soyad: string;
  pozisyon?: string;
  email: string;
  sifre: string;
  telefon?: string;
  dilTercihi?: string;
  aciliyet: string;
  yillikHacim?: string;
  arananTezgahTipleri: string[];
  arananMalzemeler: string[];
  arananSertifikalar: string[];
  notlar?: string;
  kvkkOnay: boolean;
  bultenOnay: boolean;
};

export async function aliciKayitYap(
  input: AliciKayitInput
): Promise<{ hata: string } | undefined> {
  const supabase = await createClient();

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: input.email,
    password: input.sifre,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback`,
      data: { tip: "alici" },
    },
  });

  if (authError) {
    if (authError.message.toLowerCase().includes("already registered")) {
      return { hata: "Bu e-posta adresi zaten kayıtlı. Giriş yapmayı deneyin." };
    }
    return { hata: "Kayıt sırasında hata oluştu: " + authError.message };
  }

  if (!authData.user) {
    return { hata: "Kullanıcı oluşturulamadı. Lütfen tekrar deneyin." };
  }

  const ACILIYET_GECERLI = ["acil", "uc_ay", "arastirma", "surekli"] as const;
  type AciliyetTip = (typeof ACILIYET_GECERLI)[number];

  try {
    const aciliyetDegeri = ACILIYET_GECERLI.includes(input.aciliyet as AciliyetTip)
      ? (input.aciliyet as AciliyetTip)
      : null;

    await db.insert(alici).values({
      firmaAdi: input.firmaAdi,
      sektor: input.sektor || null,
      ulke: input.ulke || null,
      vatNo: input.vatNo || null,
      website: input.website || null,
      calisanSayisi: input.calisanSayisi || null,
      ad: input.ad,
      soyad: input.soyad,
      pozisyon: input.pozisyon || null,
      email: input.email,
      telefon: input.telefon || null,
      dilTercihi: input.dilTercihi || "en",
      aciliyet: aciliyetDegeri,
      yillikHacim: input.yillikHacim || null,
      arananTezgahTipleri: input.arananTezgahTipleri,
      arananMalzemeler: input.arananMalzemeler,
      arananSertifikalar: input.arananSertifikalar,
      notlar: input.notlar || null,
      kvkkOnay: input.kvkkOnay,
      bultenOnay: input.bultenOnay,
    });
  } catch (dbHata) {
    console.error("DB kayıt hatası:", dbHata);
    return {
      hata: "Hesap oluşturulamadı. Lütfen bizimle iletişime geçin: murat@rentcncmachine.com",
    };
  }

  redirect("/dogrulama");
}

export async function sifreSifirlamaIste(
  email: string
): Promise<{ hata: string } | undefined> {
  const supabase = await createClient();

  // Güvenlik: e-posta var/yok bilgisini dışa açmıyoruz
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback?next=/sifre-sifirla/yeni`,
  });

  return undefined;
}

export async function yeniSifreGuncelle(
  sifre: string
): Promise<{ hata: string } | { basari: true }> {
  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({ password: sifre });

  if (error) {
    if (error.message.includes("session")) {
      return { hata: "Oturum süresi dolmuş. Lütfen şifre sıfırlama bağlantısını tekrar kullanın." };
    }
    return { hata: "Şifre güncellenemedi: " + error.message };
  }

  return { basari: true };
}

export async function cikisYap() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/giris");
}
