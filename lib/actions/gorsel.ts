"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function gorselSil(gorselId: string, url: string) {
  // Storage path'i URL'den çıkar
  const storagePath = url.split("/firma-gorselleri/")[1];
  if (storagePath) {
    await supabaseAdmin.storage.from("firma-gorselleri").remove([storagePath]);
  }

  const { error } = await supabaseAdmin
    .from("gorsel")
    .delete()
    .eq("gorsel_id", gorselId);

  if (error) return { hata: "Görsel silinemedi." };
  revalidatePath("/panel/profil");
  return { basari: true };
}
