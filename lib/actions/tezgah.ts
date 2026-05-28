"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import {
  tezgah,
  kullanici,
  kontrolSistemi,
  markaOnayKuyrugu,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";

type TezgahDurum = "aktif_tam_kapasite" | "kismen_musait" | "bakimda" | "satildi_kapali";

const DURUM_MAP: Record<string, TezgahDurum> = {
  "Aktif — Tam Kapasitede": "aktif_tam_kapasite",
  "Kısmen Müsait": "kismen_musait",
  "Bakımda": "bakimda",
};

export type TezgahKaydetInput = {
  tipId: number;
  altKategoriId: number;
  eksenOzellik: string;
  markaId: number | null;
  markaManuelAd: string | null;
  model: string;
  bagXMm: number | null;
  bagYMm: number | null;
  bagZMm: number | null;
  maxRpm: number | null;
  yapimYili: number | null;
  kontrolSistemiAdi: string;
  durum: string;
};

export async function tezgahKaydet(
  input: TezgahKaydetInput,
): Promise<{ hata: string } | { basari: true }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { hata: "Oturum bulunamadı. Lütfen tekrar giriş yapın." };

  const [kul] = await db
    .select({ firmaId: kullanici.firmaId })
    .from(kullanici)
    .where(eq(kullanici.email, user.email!))
    .limit(1);

  if (!kul?.firmaId) return { hata: "Firma kaydı bulunamadı." };

  // Manuel marka → onay kuyruğuna ekle
  if (input.markaManuelAd?.trim()) {
    await db.insert(markaOnayKuyrugu).values({
      teklifEdilenAd: input.markaManuelAd.trim(),
      tipId: input.tipId,
      teklifEdenFirmaId: kul.firmaId,
    });
  }

  // Kontrol sistemi ID'sini bul (bulamazsa null)
  let kontrolSistemiId: number | null = null;
  const ksAdi = input.kontrolSistemiAdi;
  if (ksAdi && ksAdi !== "Diğer / Manuel Giriş") {
    const [ks] = await db
      .select({ id: kontrolSistemi.kontrolSistemiId })
      .from(kontrolSistemi)
      .where(eq(kontrolSistemi.ad, ksAdi))
      .limit(1);
    kontrolSistemiId = ks?.id ?? null;
  }

  const durumDeger = DURUM_MAP[input.durum] ?? "aktif_tam_kapasite";

  // Manuel marka adını notlar alanına ekle (audit için)
  const notlar = input.markaManuelAd?.trim()
    ? `Manuel marka: ${input.markaManuelAd.trim()}`
    : null;

  try {
    await db.insert(tezgah).values({
      firmaId: kul.firmaId,
      tipId: input.tipId,
      altKategoriId: input.altKategoriId,
      eksenOzellik: input.eksenOzellik || null,
      markaId: input.markaId,
      model: input.model || null,
      bagXMm: input.bagXMm,
      bagYMm: input.bagYMm,
      bagZMm: input.bagZMm,
      maxRpm: input.maxRpm,
      yapimYili: input.yapimYili,
      kontrolSistemiId,
      durum: durumDeger,
      notlar,
    });
  } catch (err) {
    console.error("Tezgah kayıt hatası:", err);
    return { hata: "Tezgah kaydedilemedi. Lütfen tekrar deneyin." };
  }

  return { basari: true };
}
