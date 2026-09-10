// Valida a configuração obrigatória em tempo de execução.
// Princípio: se a configuração de segurança estiver ausente ou incompleta,
// a aplicação deve falhar FECHADA (bloquear acesso) e nunca abrir por default.

const REQUIRED_PUBLIC_VARS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
] as const;

const REQUIRED_SERVER_VARS = ["SUPABASE_SERVICE_ROLE_KEY"] as const;

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
  const missing = REQUIRED_PUBLIC_VARS.filter((key) => !process.env[key]);
  if (missing.length) throw new ConfigurationError(missing);
}

/** Usar apenas em código server-only que também precisa da service role key. */
export function assertServerEnv() {
  assertPublicEnv();
  const missing = REQUIRED_SERVER_VARS.filter((key) => !process.env[key]);
  if (missing.length) throw new ConfigurationError(missing);
}
