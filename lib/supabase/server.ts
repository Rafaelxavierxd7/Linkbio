import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { assertPublicEnv, assertServerEnv } from "@/lib/env";

export function createClient() {
  assertPublicEnv();
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // chamado de um Server Component sem permissão de escrita — ok ignorar,
            // o middleware cuida de renovar a sessão.
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch {}
        },
      },
    }
  );
}

// Cliente com privilégio total (service role). NUNCA importar isso em código
// que roda no navegador — só em route handlers (app/api/**) no servidor.
export function createServiceClient() {
  // Falha controlada e explícita: sem as duas variáveis obrigatórias,
  // nenhum cliente com privilégio total é criado.
  assertServerEnv();
  const { createClient: createSupabaseClient } = require("@supabase/supabase-js");
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
