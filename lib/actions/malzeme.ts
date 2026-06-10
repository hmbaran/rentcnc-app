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

export async function malzemeEkle(formData: FormData) {
  const firmaId = await getFirmaId();
  if (!firmaId) return { hata: "Oturum bulunamadı." };

  const adi = formData.get("malzeme_adi") as string;
  if (!adi?.trim()) return { hata: "Malzeme adı zorunludur." };

  const { error } = await supabaseAdmin.from("malzeme").insert({
    firma_id: firmaId,
    malzeme_adi: adi.trim(),
  });

  if (error) return { hata: "Malzeme eklenemedi: " + error.message };
  revalidatePath("/panel/profil");
  return { basari: true };
}

export async function malzemeSil(malzemeId: string) {
  const firmaId = await getFirmaId();
  if (!firmaId) return { hata: "Oturum bulunamadı." };

  const { error } = await supabaseAdmin
    .from("malzeme")
    .delete()
    .eq("malzeme_id", malzemeId)
    .eq("firma_id", firmaId);

  if (error) return { hata: "Malzeme silinemedi." };
  revalidatePath("/panel/profil");
  return { basari: true };
}
