"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db/index";
import { firma, kullanici, alici } from "@/lib/db/schema";

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
    if (authError.message.toLowerCase().includes("already registered")) {
      return { hata: "Bu e-posta adresi zaten kayıtlı. Giriş yapmayı deneyin." };
    }
    return { hata: "Kayıt sırasında hata oluştu: " + authError.message };
  }

  if (!authData.user) {
    return { hata: "Kullanıcı oluşturulamadı. Lütfen tekrar deneyin." };
  }

  // 2. DB kayıtlarını oluştur (postgres superuser — RLS bypass)
  try {
    const kurulusYiliParsed =
      input.kurulisYili && input.kurulisYili !== "Daha önce"
        ? parseInt(input.kurulisYili)
        : null;

    const [yeniFirma] = await db
      .insert(firma)
      .values({
        vergiNo: input.vkn,
        ticariUnvan: input.ticariUnvan,
        il: input.il || null,
        ilce: input.ilce || null,
        adres: input.adres || null,
        telefon: input.telefon || null,
        email: input.email,
        website: input.website || null,
        kurulusYili: kurulusYiliParsed,
        calisanAralik: input.calisanAralik || null,
        hakkinda: input.kisaTanitim || null,
        durum: "taslak",
      })
      .returning({ firmaId: firma.firmaId });

    await db.insert(kullanici).values({
      firmaId: yeniFirma.firmaId,
      adSoyad: input.yetkiliKisi,
      email: input.email,
      rol: "firma_admin",
      telefon: input.telefon || null,
      dilTercihi: "tr",
    });
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
