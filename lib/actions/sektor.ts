"use server";

import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

async function getFirmaId(): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return null;

  const { data } = await supabaseAdmin
    .from("kullanici")
    .select("firma_id")
    .eq("email", user.email)
    .single();
  return data?.firma_id ?? null;
}

export async function firmaSekorleriniGetir(): Promise<number[]> {
  const firmaId = await getFirmaId();
  if (!firmaId) return [];

  const { data } = await supabaseAdmin
    .from("firma_sektor")
    .select("sektor_id")
    .eq("firma_id", firmaId);

  return (data ?? []).map((r) => r.sektor_id as number);
}

export async function firmaSektorGuncelle(
  secilenIds: number[]
): Promise<{ hata: string } | { basari: true }> {
  const firmaId = await getFirmaId();
  if (!firmaId) return { hata: "Oturum bulunamadı." };

  // Mevcut sektörleri sil
  await supabaseAdmin
    .from("firma_sektor")
    .delete()
    .eq("firma_id", firmaId);

  // Seçilenleri ekle
  if (secilenIds.length > 0) {
    const rows = secilenIds.map((sektor_id) => ({ firma_id: firmaId, sektor_id }));
    const { error } = await supabaseAdmin.from("firma_sektor").insert(rows);
    if (error) return { hata: error.message };
  }

  return { basari: true };
}
