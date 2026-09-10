"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AddLinkForm({ nextPosition }: { nextPosition: number }) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    let finalUrl = url.trim();
    if (finalUrl && !/^https?:\/\//i.test(finalUrl)) {
      finalUrl = `https://${finalUrl}`;
    }

    if (!title.trim() || !finalUrl) {
      setError("Preencha o título e o link.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error: insertError } = await supabase.from("links").insert({
      profile_id: user!.id,
      title: title.trim(),
      url: finalUrl,
      position: nextPosition,
    });

    setLoading(false);
    if (insertError) {
      setError("Não foi possível adicionar o link.");
      return;
    }

    setTitle("");
    setUrl("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
      <input
        className="flex-1 border border-line rounded-card px-3 py-2 outline-none focus:outline-2 focus:outline-accent"
        placeholder="Título (ex: Instagram)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input
        className="flex-1 border border-line rounded-card px-3 py-2 outline-none focus:outline-2 focus:outline-accent"
        placeholder="Link (ex: instagram.com/voce)"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-accent hover:bg-accent-hover text-white px-5 py-2 rounded-card font-medium transition-colors disabled:opacity-60 whitespace-nowrap"
      >
        {loading ? "Adicionando..." : "Adicionar"}
      </button>
      {error && <p className="text-red-600 text-sm sm:ml-2">{error}</p>}
    </form>
  );
}
