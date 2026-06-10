import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://rqmxmzevcbsimbzdxcom.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxbXhtemV2Y2JzaW1iemR4Y29tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTY3NzUxNiwiZXhwIjoyMDk1MjUzNTE2fQ.rybmkHHgWWDlh_jTmdgysAc4bJu6dyxfa5FUf9i3Iwg",
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const email = process.argv[2];
const password = process.argv[3] || "Test1234!";

const { data: { users } } = await supabase.auth.admin.listUsers();
const user = users.find(u => u.email === email);

if (!user) { console.error("Kullanıcı bulunamadı:", email); process.exit(1); }

const { error } = await supabase.auth.admin.updateUserById(user.id, { password });
if (error) { console.error("Hata:", error.message); process.exit(1); }
console.log(`✅ ${email} şifresi "${password}" olarak güncellendi.`);
