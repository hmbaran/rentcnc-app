"use server";

import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import {
  teklifBildirimiGonder,
  teklifKabulBildirimiGonder,
  teklifRedBildirimiGonder,
} from "@/lib/email";

export type TeklifInput = {
  rfqFirmaId: string;
  birimFiyat: number;
  toplamFiyat?: number;
  paraBirimi?: string;
  terminHaftalari?: number;
  notlar?: string;
  gecerlilikBitis?: string;
};

export async function teklifVer(
  input: TeklifInput
): Promise<{ hata: string } | { basari: true; teklifId: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { hata: "Oturum açmanız gerekiyor." };

  // Kullanıcının firma_id'sini bul
  const { data: kul } = await supabaseAdmin
    .from("kullanici")
    .select("firma_id")
    .eq("email", user.email!)
    .single();
  if (!kul?.firma_id) return { hata: "Firma hesabı bulunamadı." };

  // rfq_firma kaydının bu firmaya ait olduğunu doğrula
  const { data: rfqFirma } = await supabaseAdmin
    .from("rfq_firma")
    .select("rfq_firma_id, firma_id, rfq_id")
    .eq("rfq_firma_id", input.rfqFirmaId)
    .eq("firma_id", kul.firma_id)
    .single();
  if (!rfqFirma) return { hata: "Bu RFQ size ait değil veya bulunamadı." };

  // Mevcut teklif var mı?
  const { data: mevcutTeklif } = await supabaseAdmin
    .from("teklif")
    .select("teklif_id")
    .eq("rfq_firma_id", input.rfqFirmaId)
    .maybeSingle();

  let teklifId: string;

  if (mevcutTeklif) {
    // Güncelle
    const { error } = await supabaseAdmin
      .from("teklif")
      .update({
        birim_fiyat: input.birimFiyat,
        toplam_fiyat: input.toplamFiyat ?? null,
        para_birimi: input.paraBirimi ?? "EUR",
        termin_haftalari: input.terminHaftalari ?? null,
        notlar: input.notlar ?? null,
        gecerlilik_bitis: input.gecerlilikBitis ?? null,
        durum: "verildi",
      })
      .eq("teklif_id", mevcutTeklif.teklif_id);
    if (error) return { hata: "Teklif güncellenemedi: " + error.message };
    teklifId = mevcutTeklif.teklif_id;
  } else {
    // Yeni teklif
    const { data: yeni, error } = await supabaseAdmin
      .from("teklif")
      .insert({
        rfq_firma_id: input.rfqFirmaId,
        birim_fiyat: input.birimFiyat,
        toplam_fiyat: input.toplamFiyat ?? null,
        para_birimi: input.paraBirimi ?? "EUR",
        termin_haftalari: input.terminHaftalari ?? null,
        notlar: input.notlar ?? null,
        gecerlilik_bitis: input.gecerlilikBitis ?? null,
        durum: "verildi",
      })
      .select("teklif_id")
      .single();
    if (error || !yeni) return { hata: "Teklif kaydedilemedi: " + error?.message };
    teklifId = yeni.teklif_id;
  }

  // rfq_firma durumunu güncelle
  await supabaseAdmin
    .from("rfq_firma")
    .update({ durum: "teklif_verildi", teklif_tarihi: new Date().toISOString() })
    .eq("rfq_firma_id", input.rfqFirmaId);

  revalidatePath("/panel/rfq");
  revalidatePath(`/panel/rfq/${rfqFirma.rfq_id}`);

  // Alıcıya email bildirimi
  const { data: rfqBilgi } = await supabaseAdmin
    .from("rfq")
    .select("baslik, alici_id, alici(email, ad_soyad)")
    .eq("rfq_id", rfqFirma.rfq_id)
    .single();

  const { data: firmaBilgi } = await supabaseAdmin
    .from("firma")
    .select("ticari_unvan")
    .eq("firma_id", kul.firma_id)
    .single();

  const aliciEmail = (rfqBilgi?.alici as { email?: string } | null)?.email;
  const aliciAd   = (rfqBilgi?.alici as { ad_soyad?: string } | null)?.ad_soyad ?? "";

  if (aliciEmail && rfqBilgi && firmaBilgi) {
    await teklifBildirimiGonder({
      aliciEmail,
      aliciAd,
      firmaAdi:    firmaBilgi.ticari_unvan,
      rfqBaslik:   rfqBilgi.baslik,
      rfqId:       rfqFirma.rfq_id,
      teklifFiyat: input.paraBirimi
        ? `${input.birimFiyat} ${input.paraBirimi}`
        : `${input.birimFiyat} EUR`,
      teklifTermin: input.terminHaftalari
        ? `${input.terminHaftalari} hafta`
        : undefined,
    }).catch(() => {});
  }

  return { basari: true, teklifId };
}

export async function teklifGeriCek(
  rfqFirmaId: string
): Promise<{ hata: string } | { basari: true }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { hata: "Oturum açmanız gerekiyor." };

  const { data: kul } = await supabaseAdmin
    .from("kullanici")
    .select("firma_id")
    .eq("email", user.email!)
    .single();
  if (!kul?.firma_id) return { hata: "Firma hesabı bulunamadı." };

  const { data: rfqFirma } = await supabaseAdmin
    .from("rfq_firma")
    .select("rfq_firma_id, rfq_id")
    .eq("rfq_firma_id", rfqFirmaId)
    .eq("firma_id", kul.firma_id)
    .single();
  if (!rfqFirma) return { hata: "Bu RFQ size ait değil." };

  await supabaseAdmin
    .from("teklif")
    .update({ durum: "geri_cekildi" })
    .eq("rfq_firma_id", rfqFirmaId);

  await supabaseAdmin
    .from("rfq_firma")
    .update({ durum: "gonderildi" })
    .eq("rfq_firma_id", rfqFirmaId);

  revalidatePath("/panel/rfq");
  revalidatePath(`/panel/rfq/${rfqFirma.rfq_id}`);
  return { basari: true };
}

export async function teklifKabulEt(
  teklifId: string,
  rfqId: string
): Promise<{ hata: string } | { basari: true }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { hata: "Oturum açmanız gerekiyor." };

  // Alıcı doğrulama
  const { data: alici } = await supabaseAdmin
    .from("alici")
    .select("alici_id")
    .eq("email", user.email!)
    .single();
  if (!alici) return { hata: "Alıcı hesabı bulunamadı." };

  // RFQ sahibi mi?
  const { data: rfq } = await supabaseAdmin
    .from("rfq")
    .select("rfq_id")
    .eq("rfq_id", rfqId)
    .eq("alici_id", alici.alici_id)
    .single();
  if (!rfq) return { hata: "Bu RFQ'ya erişim yetkiniz yok." };

  // Teklifi kabul et
  await supabaseAdmin.from("teklif").update({ durum: "kabul" }).eq("teklif_id", teklifId);

  // Diğer teklifleri reddet
  const { data: rfqFirma } = await supabaseAdmin
    .from("teklif")
    .select("rfq_firma_id")
    .eq("teklif_id", teklifId)
    .single();

  if (rfqFirma) {
    // rfq_id üzerinden diğer rfq_firma'ları bul, tekliflerini reddet
    const { data: digerler } = await supabaseAdmin
      .from("rfq_firma")
      .select("rfq_firma_id")
      .eq("rfq_id", rfqId)
      .neq("rfq_firma_id", rfqFirma.rfq_firma_id);

    if (digerler && digerler.length > 0) {
      const digerIds = digerler.map((d) => d.rfq_firma_id);
      await supabaseAdmin
        .from("teklif")
        .update({ durum: "red" })
        .in("rfq_firma_id", digerIds);
    }
  }

  // RFQ durumunu tamamlandi yap
  await supabaseAdmin.from("rfq").update({ durum: "tamamlandi" }).eq("rfq_id", rfqId);

  // Kabul edilen firmaya bildirim gönder
  if (rfqFirma) {
    const { data: rfqBilgi } = await supabaseAdmin
      .from("rfq").select("baslik").eq("rfq_id", rfqId).single();
    const { data: rfqFirmaBilgi } = await supabaseAdmin
      .from("rfq_firma")
      .select("firma_id, firma(ticari_unvan, email)")
      .eq("rfq_firma_id", rfqFirma.rfq_firma_id)
      .single();

    const firmaEmail = (rfqFirmaBilgi?.firma as { email?: string } | null)?.email;
    const firmaAd   = (rfqFirmaBilgi?.firma as { ticari_unvan?: string } | null)?.ticari_unvan ?? "";

    if (firmaEmail && rfqBilgi) {
      await teklifKabulBildirimiGonder({
        fasoncuEmail: firmaEmail,
        fasoncuAd:    firmaAd,
        firmaAdi:     firmaAd,
        rfqBaslik:    rfqBilgi.baslik,
        rfqId,
      }).catch(() => {});
    }
  }

  revalidatePath("/alici/panel");
  revalidatePath(`/alici/rfq/${rfqId}`);
  return { basari: true };
}

export async function teklifReddet(
  teklifId: string
): Promise<{ hata: string } | { basari: true }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { hata: "Oturum açmanız gerekiyor." };

  const { data: alici } = await supabaseAdmin
    .from("alici")
    .select("alici_id")
    .eq("email", user.email!)
    .single();
  if (!alici) return { hata: "Alıcı hesabı bulunamadı." };

  await supabaseAdmin.from("teklif").update({ durum: "red" }).eq("teklif_id", teklifId);

  revalidatePath("/alici/panel");
  return { basari: true };
}
