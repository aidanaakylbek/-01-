import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log("[Supabase] URL:", supabaseUrl ? "✓ configured" : "✗ missing");
console.log("[Supabase] Anon Key:", supabaseAnonKey ? "✓ configured" : "✗ missing");
console.log("[Supabase] Service Role:", supabaseServiceRoleKey ? "✓ configured" : "✗ missing");

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("\n⚠️  SUPABASE NOT FULLY CONFIGURED");
  console.warn("Add to backend/.env:");
  console.warn("  SUPABASE_URL=https://your-project.supabase.co");
  console.warn("  SUPABASE_ANON_KEY=your-key-here");
  console.warn("  SUPABASE_SERVICE_ROLE_KEY=your-service-key-here\n");
}

// Client for user operations (with RLS) - will be null if not configured
export const supabaseClient = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Service role client (for admin operations) - will be null if not configured
export const supabaseAdmin = supabaseUrl && (supabaseServiceRoleKey || supabaseAnonKey)
  ? createClient(supabaseUrl, (supabaseServiceRoleKey || supabaseAnonKey) as string)
  : null;

export { createClient } from "@supabase/supabase-js";
