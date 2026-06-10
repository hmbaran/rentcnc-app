import { supabaseAdmin } from "@/lib/supabase/admin";

export interface AnaSayfaIstatistik {
  fasoncuSayisi: number;
  aliciSayisi: number;
  tezgahSayisi: number;
  ulkeSayisi: number;
}

export async function anaSayfaIstatistikGetir(): Promise<AnaSayfaIstatistik> {
  const [firmaRes, aliciRes, tezgahRes] = await Promise.all([
    supabaseAdmin
      .from("firma")
      .select("firma_id", { count: "exact", head: true })
      .eq("durum", "yayinda"),
    supabaseAdmin
      .from("alici")
      .select("alici_id", { count: "exact", head: true }),
    supabaseAdmin
      .from("tezgah")
      .select("tezgah_id", { count: "exact", head: true }),
  ]);

  return {
    fasoncuSayisi: firmaRes.count ?? 0,
    aliciSayisi: aliciRes.count ?? 0,
    tezgahSayisi: tezgahRes.count ?? 0,
    ulkeSayisi: 23, // Hedef pazar ülke sayısı — sabit
  };
}
