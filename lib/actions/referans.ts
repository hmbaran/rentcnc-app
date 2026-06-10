"use server";

import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

async function firmaIdGetir() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: kul } = await supabaseAdmin
    .from("kullanici")
    .select("firma_id")
    .eq("email", user.email!)
    .single();
  return kul?.firma_id ?? null;
}

export async function referansParcalariGetir() {
  const firmaId = await firmaIdGetir();
  if (!firmaId) return [];
  const { data } = await supabaseAdmin
    .from("referans_parca")
    .select("parca_id, baslik, aciklama, malzeme, islem_turu, gorsel_url, sira")
    .eq("firma_id", firmaId)
    .order("sira");
  return data ?? [];
}

export async function referansParcaEkle(input: {
  baslik: string;
  aciklama?: string;
  malzeme?: string;
  islem_turu?: string;
  gorsel_url?: string;
}): Promise<{ hata: string } | { basari: true }> {
  const firmaId = await firmaIdGetir();
  if (!firmaId) return { hata: "Firma hesabı bulunamadı." };

  const { error } = await supabaseAdmin.from("referans_parca").insert({
    firma_id: firmaId,
    baslik: input.baslik,
    aciklama: input.aciklama || null,
    malzeme: input.malzeme || null,
    islem_turu: input.islem_turu || null,
    gorsel_url: input.gorsel_url || null,
  });

  if (error) return { hata: error.message };
  revalidatePath("/panel/referans-parcalar");
  return { basari: true };
}

export async function referansParcaSil(
  parcaId: string
): Promise<{ hata: string } | { basari: true }> {
  const firmaId = await firmaIdGetir();
  if (!firmaId) return { hata: "Firma hesabı bulunamadı." };

  const { error } = await supabaseAdmin
    .from("referans_parca")
    .delete()
    .eq("parca_id", parcaId)
    .eq("firma_id", firmaId);

  if (error) return { hata: error.message };
  revalidatePath("/panel/referans-parcalar");
  return { basari: true };
}
