"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

async function getFirmaId(): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return null;
  const { data } = await supabaseAdmin
    .from("kullanici").select("firma_id").eq("email", user.email).single();
  return data?.firma_id ?? null;
}

export async function kapasiteKaydet(formData: FormData) {
  const firmaId = await getFirmaId();
  if (!firmaId) return { hata: "Oturum bulunamadı." };

  const payload = {
    firma_id: firmaId,
    min_siparis_adedi: Number(formData.get("min_siparis_adedi")) || 1,
    vardiya: formData.get("vardiya") as string || null,
    teslimat_suresi: formData.get("teslimat_suresi") as string || null,
    acil_is: formData.get("acil_is") === "true",
    ihracat_deneyimi: formData.get("ihracat_deneyimi") === "true",
    ihracat_ulkeleri: formData.get("ihracat_ulkeleri") as string || null,
    fiyat_yontemi: formData.get("fiyat_yontemi") as string || null,
    odeme_kosulu: formData.get("odeme_kosulu") as string || null,
    aylik_kapasite: Number(formData.get("aylik_kapasite")) || null,
    doluluk_orani: Number(formData.get("doluluk_orani")) || null,
  };

  const { error } = await supabaseAdmin
    .from("kapasite")
    .upsert(payload, { onConflict: "firma_id" });

  if (error) return { hata: "Kapasite kaydedilemedi: " + error.message };
  revalidatePath("/panel/profil");
  return { basari: true };
}
