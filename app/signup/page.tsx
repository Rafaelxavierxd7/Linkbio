"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
    if (!cleanUsername) {
      setError("Escolha um nome de usuário válido (letras, números e hífen).");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      setError(traduzErro(signUpError.message));
      setLoading(false);
      return;
    }

    if (data.user) {
      const { error: profileError } = await supabase.from("profiles").insert({
        id: data.user.id,
        username: cleanUsername,
        display_name: cleanUsername,
      });

      if (profileError) {
        setError(
          profileError.code === "23505"
            ? "Esse nome de usuário já está em uso."
            : "Não foi possível criar o perfil. Tente outro nome de usuário."
        );
        setLoading(false);
        return;
      }
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold mb-1">Criar conta</h1>
        <p className="text-muted mb-6">Leva menos de um minuto.</p>

        <label className="block text-sm font-medium mb-1">Nome de usuário</label>
        <div className="flex items-center border border-line rounded-card mb-4 overflow-hidden focus-within:outline focus-within:outline-2 focus-within:outline-accent">
          <span className="pl-3 text-muted text-sm">linkbio.app/</span>
          <input
            className="flex-1 py-2 pr-3 outline-none"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="seunome"
            required
          />
        </div>

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
          minLength={6}
          required
        />

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-accent hover:bg-accent-hover text-white py-2.5 rounded-card font-medium transition-colors disabled:opacity-60"
        >
          {loading ? "Criando..." : "Criar conta"}
        </button>

        <p className="text-sm text-muted mt-4 text-center">
          Já tem conta?{" "}
          <Link href="/login" className="text-accent font-medium">
            Entrar
          </Link>
        </p>
      </form>
    </main>
  );
}

function traduzErro(msg: string) {
  if (msg.includes("already registered")) return "Esse e-mail já está cadastrado.";
  if (msg.includes("Password")) return "A senha precisa ter pelo menos 6 caracteres.";
  return "Não foi possível criar a conta. Verifique os dados e tente de novo.";
}
