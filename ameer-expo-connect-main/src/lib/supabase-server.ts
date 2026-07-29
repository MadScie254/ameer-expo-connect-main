import { createClient } from "@supabase/supabase-js";

const supabaseServerKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;

export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  supabaseServerKey!,
  { auth: { autoRefreshToken: false, persistSession: false } },
);
