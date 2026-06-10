// Admin kullanıcısı oluşturur veya mevcut kullanıcıya admin rolü verir
// Kullanım: node scripts/make-admin.mjs <email>

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://rqmxmzevcbsimbzdxcom.supabase.co";
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxbXhtemV2Y2JzaW1iemR4Y29tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTY3NzUxNiwiZXhwIjoyMDk1MjUzNTE2fQ.rybmkHHgWWDlh_jTmdgysAc4bJu6dyxfa5FUf9i3Iwg";

const email = process.argv[2];
if (!email) {
  console.error("Kullanım: node scripts/make-admin.mjs <email>");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// Kullanıcıyı e-posta ile bul
const { data: { users }, error: listErr } = await supabase.auth.admin.listUsers();
if (listErr) { console.error("Kullanıcılar alınamadı:", listErr.message); process.exit(1); }

const user = users.find(u => u.email === email);

if (user) {
  // Mevcut kullanıcıya admin rolü ver
  const { error } = await supabase.auth.admin.updateUserById(user.id, {
    user_metadata: { ...user.user_metadata, rol: "admin" }
  });
  if (error) { console.error("Güncelleme hatası:", error.message); process.exit(1); }
  console.log(`✅ ${email} kullanıcısına admin rolü verildi (id: ${user.id})`);
} else {
  // Yeni admin kullanıcısı oluştur
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: "Admin1234!",
    email_confirm: true,
    user_metadata: { rol: "admin" }
  });
  if (error) { console.error("Kullanıcı oluşturulamadı:", error.message); process.exit(1); }
  console.log(`✅ Yeni admin kullanıcısı oluşturuldu: ${email} / şifre: Admin1234!`);
  console.log(`   ID: ${data.user?.id}`);
}
