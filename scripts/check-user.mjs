import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://rqmxmzevcbsimbzdxcom.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxbXhtemV2Y2JzaW1iemR4Y29tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTY3NzUxNiwiZXhwIjoyMDk1MjUzNTE2fQ.rybmkHHgWWDlh_jTmdgysAc4bJu6dyxfa5FUf9i3Iwg",
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const email = process.argv[2];

// kullanici tablosunda bul
const { data: kullanici } = await supabase
  .from("kullanici")
  .select("*")
  .eq("email", email)
  .single();

console.log("kullanici:", kullanici);

if (kullanici?.firma_id) {
  const { data: firma } = await supabase
    .from("firma")
    .select("firma_id, ticari_unvan, durum, profil_doluluk, il")
    .eq("firma_id", kullanici.firma_id)
    .single();
  console.log("firma:", firma);

  const { data: tezgahlar } = await supabase
    .from("tezgah")
    .select("tezgah_id, model, durum")
    .eq("firma_id", kullanici.firma_id);
  console.log("tezgahlar:", tezgahlar);
}
