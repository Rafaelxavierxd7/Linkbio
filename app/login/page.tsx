"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError("E-mail ou senha incorretos.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold mb-1">Entrar</h1>
        <p className="text-muted mb-6">Acesse seu painel de links.</p>

        <label className="block text-sm font-medium mb-1">E-mail</label>
        <input
          type="email"
          className="w-full border border-line rounded-card px-3 py-2 mb-4 outline-none focus:outline-2 focus:outline-accent"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label className="block text-sm font-medium mb-1">Senha</label>
        <input
          type="password"
          className="w-full border border-line rounded-card px-3 py-2 mb-4 outline-none focus:outline-2 focus:outline-accent"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-accent hover:bg-accent-hover text-white py-2.5 rounded-card font-medium transition-colors disabled:opacity-60"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>

        <p className="text-sm text-muted mt-4 text-center">
          Ainda não tem conta?{" "}
          <Link href="/signup" className="text-accent font-medium">
            Criar conta
          </Link>
        </p>
      </form>
    </main>
  );
}
