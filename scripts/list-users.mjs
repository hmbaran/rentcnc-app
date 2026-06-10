import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://rqmxmzevcbsimbzdxcom.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxbXhtemV2Y2JzaW1iemR4Y29tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTY3NzUxNiwiZXhwIjoyMDk1MjUzNTE2fQ.rybmkHHgWWDlh_jTmdgysAc4bJu6dyxfa5FUf9i3Iwg",
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const { data: { users } } = await supabase.auth.admin.listUsers();
for (const u of users) {
  console.log(`${u.email.padEnd(35)} rol: ${u.user_metadata?.rol ?? "(yok)".padEnd(8)}  id: ${u.id}`);
}
