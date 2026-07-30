import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServerKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;

console.log(
  "[supabase-server] env check — SUPABASE_URL length:",
  (process.env.SUPABASE_URL ?? "").length,
  "| SUPABASE_SERVICE_ROLE_KEY length:",
  (process.env.SUPABASE_SERVICE_ROLE_KEY ?? "").length
);

if (!supabaseUrl || !supabaseServerKey) {
  throw new Error(
    "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env — set them and restart the dev server (see .env.example).",
  );
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServerKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
