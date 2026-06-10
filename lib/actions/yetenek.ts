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

export async function yetenekEkle(formData: FormData) {
  const firmaId = await getFirmaId();
  if (!firmaId) return { hata: "Oturum bulunamadı." };

  const deger = formData.get("deger") as string;
  const kategori = formData.get("kategori") as string;

  if (!deger?.trim()) return { hata: "Yetenek adı zorunludur." };

  const { error } = await supabaseAdmin.from("yetenek").insert({
    firma_id: firmaId,
    deger: deger.trim(),
    kategori: kategori?.trim() || null,
  });

  if (error) return { hata: "Yetenek eklenemedi: " + error.message };
  revalidatePath("/panel/profil");
  return { basari: true };
}

export async function yetenekSil(yetenekId: string) {
  const firmaId = await getFirmaId();
  if (!firmaId) return { hata: "Oturum bulunamadı." };

  const { error } = await supabaseAdmin
    .from("yetenek")
    .delete()
    .eq("yetenek_id", yetenekId)
    .eq("firma_id", firmaId);

  if (error) return { hata: "Yetenek silinemedi." };
  revalidatePath("/panel/profil");
  return { basari: true };
}
