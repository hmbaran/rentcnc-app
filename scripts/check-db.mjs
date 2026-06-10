import { createClient } from "@supabase/supabase-js";

const s = createClient(
  "https://rqmxmzevcbsimbzdxcom.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxbXhtemV2Y2JzaW1iemR4Y29tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTY3NzUxNiwiZXhwIjoyMDk1MjUzNTE2fQ.rybmkHHgWWDlh_jTmdgysAc4bJu6dyxfa5FUf9i3Iwg",
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// Tezgah tipleri
const { data: tipler } = await s.from("tezgah_tip").select("tip_id, kod, ad").order("tip_id");
console.log("\n=== TEZGAH TİPLERİ ===");
tipler?.forEach(t => console.log(`  [${t.tip_id}] ${t.kod} → ${t.ad}`));

// "Dişli" tipini bul ve alt kategorilerine bak
const disliTip = tipler?.find(t => t.ad.toLowerCase().includes("dişli") || t.ad.toLowerCase().includes("disli"));
if (disliTip) {
  const { data: altKat } = await s.from("tezgah_alt_kategori")
    .select("alt_kategori_id, ad, aktif")
    .eq("tip_id", disliTip.tip_id);
  console.log(`\n=== "${disliTip.ad}" ALT KATEGORİLERİ ===`);
  if (!altKat || altKat.length === 0) {
    console.log("  ⚠️  HİÇ ALT KATEGORİ YOK!");
  } else {
    altKat.forEach(a => console.log(`  [${a.alt_kategori_id}] ${a.ad} (aktif: ${a.aktif})`));
  }
} else {
  console.log("\n⚠️  'Dişli Tezgahları' tipi DB'de bulunamadı!");
}

// Toplam alt kategori sayısı
const { count } = await s.from("tezgah_alt_kategori").select("*", { count: "exact", head: true });
console.log(`\n=== TOPLAM ALT KATEGORİ: ${count} ===`);
