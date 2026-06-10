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

export async function sertifikaEkle(formData: FormData) {
  const firmaId = await getFirmaId();
  if (!firmaId) return { hata: "Oturum bulunamadı." };

  const adi = formData.get("sertifika_adi") as string;
  const bitis = formData.get("gecerlilik_bitis") as string;

  if (!adi?.trim()) return { hata: "Sertifika adı zorunludur." };

  const { error } = await supabaseAdmin.from("sertifika").insert({
    firma_id: firmaId,
    sertifika_adi: adi.trim(),
    gecerlilik_bitis: bitis || null,
  });

  if (error) return { hata: "Sertifika eklenemedi: " + error.message };
  revalidatePath("/panel/profil");
  return { basari: true };
}

export async function sertifikaSil(sertifikaId: string) {
  const firmaId = await getFirmaId();
  if (!firmaId) return { hata: "Oturum bulunamadı." };

  const { error } = await supabaseAdmin
    .from("sertifika")
    .delete()
    .eq("sertifika_id", sertifikaId)
    .eq("firma_id", firmaId);

  if (error) return { hata: "Sertifika silinemedi." };
  revalidatePath("/panel/profil");
  return { basari: true };
}

export async function sertifikalariGetir() {
  const firmaId = await getFirmaId();
  if (!firmaId) return [];

  const { data } = await supabaseAdmin
    .from("sertifika")
    .select("sertifika_id, sertifika_adi, gecerlilik_bitis, dogrulandi")
    .eq("firma_id", firmaId)
    .order("olusturulma_tarihi", { ascending: false });

  return data ?? [];
}
