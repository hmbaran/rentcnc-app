"use server";

import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { firmaOnayBildirimiGonder } from "@/lib/email";

async function adminKontrol() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const rol = user.user_metadata?.rol as string | undefined;
  if (rol !== "admin") return null;
  return user;
}

export async function bekleyenFirmalariGetir() {
  const user = await adminKontrol();
  if (!user) return [];

  const { data } = await supabaseAdmin
    .from("firma")
    .select(`
      firma_id, ticari_unvan, il, ilce, vergi_no, email, telefon,
      website, kurulus_yili, calisan_aralik, hakkinda, durum,
      olusturulma_tarihi
    `)
    .in("durum", ["taslak", "beklemede"])
    .order("olusturulma_tarihi", { ascending: true });

  return data ?? [];
}

export async function tumFirmalariGetir() {
  const user = await adminKontrol();
  if (!user) return [];

  const { data } = await supabaseAdmin
    .from("firma")
    .select(`
      firma_id, ticari_unvan, il, durum, profil_doluluk,
      dogrulanmis_rozet, olusturulma_tarihi
    `)
    .order("olusturulma_tarihi", { ascending: false })
    .limit(100);

  return data ?? [];
}

export async function firmaOnayla(
  firmaId: string
): Promise<{ hata: string } | { basari: true }> {
  const user = await adminKontrol();
  if (!user) return { hata: "Yetkisiz erişim." };

  const { error } = await supabaseAdmin
    .from("firma")
    .update({ durum: "yayinda" })
    .eq("firma_id", firmaId);

  if (error) return { hata: error.message };

  // Firmaya onay bildirimi gönder
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
  return { basari: true };
}

export async function firmaReddet(
  firmaId: string,
  neden?: string
): Promise<{ hata: string } | { basari: true }> {
  const user = await adminKontrol();
  if (!user) return { hata: "Yetkisiz erişim." };

  const { error } = await supabaseAdmin
    .from("firma")
    .update({ durum: "reddedildi" })
    .eq("firma_id", firmaId);

  if (error) return { hata: error.message };
  revalidatePath("/admin");
  return { basari: true };
}

export async function firmaDurumGuncelle(
  firmaId: string,
  durum: "yayinda" | "taslak" | "beklemede" | "reddedildi" | "askiya_alindi"
): Promise<{ hata: string } | { basari: true }> {
  const user = await adminKontrol();
  if (!user) return { hata: "Yetkisiz erişim." };

  const { error } = await supabaseAdmin
    .from("firma")
    .update({ durum })
    .eq("firma_id", firmaId);

  if (error) return { hata: error.message };
  revalidatePath("/admin");
  return { basari: true };
}

export async function firmaDogrula(
  firmaId: string,
  dogrulanmis: boolean
): Promise<{ hata: string } | { basari: true }> {
  const user = await adminKontrol();
  if (!user) return { hata: "Yetkisiz erişim." };

  const { error } = await supabaseAdmin
    .from("firma")
    .update({ dogrulanmis_rozet: dogrulanmis })
    .eq("firma_id", firmaId);

  if (error) return { hata: error.message };
  revalidatePath("/admin");
  return { basari: true };
}

export async function adminIstatistikler() {
  const user = await adminKontrol();
  if (!user) return null;

  const [
    { count: toplamFirma },
    { count: yayindaFirma },
    { count: bekleyenFirma },
    { count: toplamAlici },
    { count: toplamRfq },
  ] = await Promise.all([
    supabaseAdmin.from("firma").select("*", { count: "exact", head: true }),
    supabaseAdmin.from("firma").select("*", { count: "exact", head: true }).eq("durum", "yayinda"),
    supabaseAdmin.from("firma").select("*", { count: "exact", head: true }).in("durum", ["taslak", "beklemede"]),
    supabaseAdmin.from("alici").select("*", { count: "exact", head: true }),
    supabaseAdmin.from("rfq").select("*", { count: "exact", head: true }),
  ]);

  return { toplamFirma, yayindaFirma, bekleyenFirma, toplamAlici, toplamRfq };
}
