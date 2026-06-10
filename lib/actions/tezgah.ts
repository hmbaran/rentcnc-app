"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

type TezgahDurum = "aktif_tam_kapasite" | "kismen_musait" | "bakimda" | "satildi_kapali";

const DURUM_MAP: Record<string, TezgahDurum> = {
  "Aktif — Tam Kapasitede": "aktif_tam_kapasite",
  "Kısmen Müsait":          "kismen_musait",
  "Bakımda":                "bakimda",
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
  parametreler?: Record<string, string | number | null>;
  // Fotoğraflar: client'tan yüklendikten sonra URL + path çifti gelir
  gorseller?: { url: string; storagePath: string }[];
};

export async function tezgahKaydet(
  input: TezgahKaydetInput,
): Promise<{ hata: string } | { basari: true }> {
  // 1. Oturumu doğrula
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { hata: "Oturum bulunamadı. Lütfen tekrar giriş yapın." };

  // 2. Kullanıcının firma_id'sini bul
  const { data: kulData } = await supabaseAdmin
    .from("kullanici")
    .select("firma_id")
    .eq("email", user.email!)
    .single();

  if (!kulData?.firma_id) {
    return { hata: "Firma kaydı bulunamadı. Lütfen önce firma kaydını tamamlayın." };
  }
  const firmaId = kulData.firma_id as string;

  // 3. Manuel marka → onay kuyruğuna ekle
  if (input.markaManuelAd?.trim()) {
    await supabaseAdmin.from("marka_onay_kuyrugu").insert({
      teklif_edilen_ad:    input.markaManuelAd.trim(),
      tip_id:              input.tipId,
      teklif_eden_firma_id: firmaId,
    });
  }

  // 4. Kontrol sistemi ID'sini bul (opsiyonel)
  let kontrolSistemiId: number | null = null;
  const ksAdi = input.kontrolSistemiAdi;
  if (ksAdi && ksAdi !== "Diğer / Manuel Giriş") {
    const { data: ksData } = await supabaseAdmin
      .from("kontrol_sistemi")
      .select("kontrol_sistemi_id")
      .eq("ad", ksAdi)
      .single();
    kontrolSistemiId = ksData?.kontrol_sistemi_id ?? null;
  }

  // 5. Tezgahı kaydet
  const durumDeger = DURUM_MAP[input.durum] ?? "aktif_tam_kapasite";
  const notlar = input.markaManuelAd?.trim()
    ? `Manuel marka: ${input.markaManuelAd.trim()}`
    : null;

  const { data: tezgahData, error } = await supabaseAdmin
    .from("tezgah")
    .insert({
      firma_id:           firmaId,
      tip_id:             input.tipId,
      alt_kategori_id:    input.altKategoriId,
      eksen_ozellik:      input.eksenOzellik || null,
      marka_id:           input.markaId,
      model:              input.model || null,
      bag_x_mm:           input.bagXMm,
      bag_y_mm:           input.bagYMm,
      bag_z_mm:           input.bagZMm,
      max_rpm:            input.maxRpm,
      yapim_yili:         input.yapimYili,
      kontrol_sistemi_id: kontrolSistemiId,
      durum:              durumDeger,
      notlar,
      ...(input.parametreler && Object.keys(input.parametreler).length > 0
        ? { parametreler: input.parametreler }
        : {}),
    })
    .select("tezgah_id")
    .single();

  if (error) {
    console.error("Tezgah kayıt hatası:", error);
    return { hata: "Tezgah kaydedilemedi: " + error.message };
  }

  // 6. Fotoğrafları kaydet (varsa)
  if (input.gorseller && input.gorseller.length > 0 && tezgahData) {
    const gorselRows = input.gorseller.map((g, i) => ({
      tezgah_id:    tezgahData.tezgah_id,
      firma_id:     firmaId,
      storage_path: g.storagePath,
      url:          g.url,
      sira:         i,
    }));
    await supabaseAdmin.from("tezgah_gorsel").insert(gorselRows);
  }

  return { basari: true };
}

// ============================================================
// TEZGAH GÜNCELLE
// ============================================================
export async function tezgahGuncelle(
  tezgahId: string,
  input: Partial<TezgahKaydetInput>
): Promise<{ hata: string } | { basari: true }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { hata: "Oturum bulunamadı." };

  // Sahiplik kontrolü
  const { data: kul } = await supabaseAdmin
    .from("kullanici").select("firma_id").eq("email", user.email!).single();
  if (!kul?.firma_id) return { hata: "Firma kaydı bulunamadı." };

  const { data: tezgahCheck } = await supabaseAdmin
    .from("tezgah").select("firma_id").eq("tezgah_id", tezgahId).single();
  if (tezgahCheck?.firma_id !== kul.firma_id)
    return { hata: "Bu tezgahı düzenleme yetkiniz yok." };

  // Kontrol sistemi ID
  let kontrolSistemiId: number | null = null;
  if (input.kontrolSistemiAdi && input.kontrolSistemiAdi !== "Diğer / Manuel Giriş") {
    const { data: ks } = await supabaseAdmin
      .from("kontrol_sistemi").select("kontrol_sistemi_id")
      .eq("ad", input.kontrolSistemiAdi).single();
    kontrolSistemiId = ks?.kontrol_sistemi_id ?? null;
  }

  const durumDeger = input.durum ? (DURUM_MAP[input.durum] ?? "aktif_tam_kapasite") : undefined;

  const { error } = await supabaseAdmin.from("tezgah").update({
    ...(input.tipId           !== undefined && { tip_id:             input.tipId }),
    ...(input.altKategoriId   !== undefined && { alt_kategori_id:    input.altKategoriId }),
    ...(input.eksenOzellik    !== undefined && { eksen_ozellik:      input.eksenOzellik || null }),
    ...(input.markaId         !== undefined && { marka_id:           input.markaId }),
    ...(input.model           !== undefined && { model:              input.model || null }),
    ...(input.bagXMm          !== undefined && { bag_x_mm:           input.bagXMm }),
    ...(input.bagYMm          !== undefined && { bag_y_mm:           input.bagYMm }),
    ...(input.bagZMm          !== undefined && { bag_z_mm:           input.bagZMm }),
    ...(input.maxRpm          !== undefined && { max_rpm:            input.maxRpm }),
    ...(input.yapimYili       !== undefined && { yapim_yili:         input.yapimYili }),
    ...(kontrolSistemiId      !== undefined && { kontrol_sistemi_id: kontrolSistemiId }),
    ...(durumDeger            !== undefined && { durum:              durumDeger }),
    ...(input.parametreler !== undefined && { parametreler: input.parametreler }),
  }).eq("tezgah_id", tezgahId);

  if (error) return { hata: "Güncellenemedi: " + error.message };

  // Yeni fotoğrafları kaydet (varsa)
  if (input.gorseller && input.gorseller.length > 0) {
    // Mevcut en yüksek sırayı bul
    const { data: mevcutGorseller } = await supabaseAdmin
      .from("tezgah_gorsel")
      .select("sira")
      .eq("tezgah_id", tezgahId)
      .order("sira", { ascending: false })
      .limit(1);
    const baslangicSira = (mevcutGorseller?.[0]?.sira ?? -1) + 1;

    const gorselRows = input.gorseller.map((g, i) => ({
      tezgah_id:    tezgahId,
      firma_id:     kul.firma_id,
      storage_path: g.storagePath,
      url:          g.url,
      sira:         baslangicSira + i,
    }));
    await supabaseAdmin.from("tezgah_gorsel").insert(gorselRows);
  }

  return { basari: true };
}

// ============================================================
// TEZGAH GÖRSEL SİL
// ============================================================
export async function tezgahGorselSil(
  gorselId: string,
  storagePath: string
): Promise<{ hata: string } | { basari: true }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { hata: "Oturum bulunamadı." };

  const { data: kul } = await supabaseAdmin
    .from("kullanici").select("firma_id").eq("email", user.email!).single();
  if (!kul?.firma_id) return { hata: "Firma kaydı bulunamadı." };

  // Sahiplik kontrolü
  const { data: gorsel } = await supabaseAdmin
    .from("tezgah_gorsel").select("firma_id").eq("gorsel_id", gorselId).single();
  if (gorsel?.firma_id !== kul.firma_id)
    return { hata: "Bu görseli silme yetkiniz yok." };

  // Storage'dan sil
  if (storagePath) {
    await supabaseAdmin.storage.from("firma-gorseller").remove([storagePath]);
  }

  const { error } = await supabaseAdmin
    .from("tezgah_gorsel").delete().eq("gorsel_id", gorselId);

  if (error) return { hata: "Görsel silinemedi: " + error.message };
  revalidatePath("/panel/tezgahlar");
  return { basari: true };
}

// ============================================================
// TEZGAH SİL
// ============================================================
export async function tezgahSil(
  tezgahId: string
): Promise<{ hata: string } | { basari: true }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { hata: "Oturum bulunamadı." };

  const { data: kul } = await supabaseAdmin
    .from("kullanici").select("firma_id").eq("email", user.email!).single();
  if (!kul?.firma_id) return { hata: "Firma kaydı bulunamadı." };

  const { data: tezgahCheck } = await supabaseAdmin
    .from("tezgah").select("firma_id").eq("tezgah_id", tezgahId).single();
  if (tezgahCheck?.firma_id !== kul.firma_id)
    return { hata: "Bu tezgahı silme yetkiniz yok." };

  const { error } = await supabaseAdmin
    .from("tezgah").delete().eq("tezgah_id", tezgahId);

  if (error) return { hata: "Silinemedi: " + error.message };
  return { basari: true };
}
