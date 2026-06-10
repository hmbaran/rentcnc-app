import { createClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client — sadece server-side API route'larında kullan.
 * RLS'yi bypass eder; client-side'a asla expose etme.
 */
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
