import { createBrowserClient } from "@supabase/ssr";
import { assertPublicEnv } from "@/lib/env";

export function createClient() {
  assertPublicEnv();
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
