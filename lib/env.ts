// Valida a configuração obrigatória em tempo de execução.
// Princípio: se a configuração de segurança estiver ausente ou incompleta,
// a aplicação deve falhar FECHADA (bloquear acesso) e nunca abrir por default.

class ConfigurationError extends Error {
  constructor(missing: string[]) {
    super(
      `Configuração obrigatória ausente: ${missing.join(", ")}. ` +
        "A aplicação não pode iniciar de forma segura sem essas variáveis. " +
        "Veja .env.local.example."
    );
    this.name = "ConfigurationError";
  }
}

/** Usar em qualquer código que rode no navegador ou no servidor. */
export function assertPublicEnv() {
  const missing: string[] = [];
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  if (missing.length) throw new ConfigurationError(missing);
}

/** Usar apenas em código server-only que também precisa da service role key. */
export function assertServerEnv() {
  assertPublicEnv();
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new ConfigurationError(["SUPABASE_SERVICE_ROLE_KEY"]);
  }
}
