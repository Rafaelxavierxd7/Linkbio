"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type LinkData = {
  id: string;
  title: string;
  url: string;
  active: boolean;
};

export default function LinkRow({
  link,
  clickCount,
}: {
  link: LinkData;
  clickCount: number;
}) {
  const router = useRouter();

  async function toggleActive() {
    const supabase = createClient();
    await supabase
      .from("links")
      .update({ active: !link.active })
      .eq("id", link.id);
    router.refresh();
  }

  async function removeLink() {
    if (!confirm(`Remover o link "${link.title}"? Isso apaga o histórico de cliques dele.`)) return;
    const supabase = createClient();
    await supabase.from("links").delete().eq("id", link.id);
    router.refresh();
  }

  return (
    <div className="border border-line rounded-card p-4 flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="font-medium truncate">{link.title}</p>
        <p className="text-muted text-sm truncate">{link.url}</p>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <Link
          href={`/dashboard/link/${link.id}`}
          className="text-center"
          title="Ver detalhes dos cliques"
        >
          <span className="block text-lg font-semibold text-signal leading-none">
            {clickCount}
          </span>
          <span className="text-xs text-muted">cliques</span>
        </Link>
        <button
          onClick={toggleActive}
          className="text-sm text-muted hover:text-ink"
          title={link.active ? "Desativar link" : "Ativar link"}
        >
          {link.active ? "Ativo" : "Inativo"}
        </button>
        <button
          onClick={removeLink}
          className="text-sm text-red-600 hover:text-red-700"
        >
          Remover
        </button>
      </div>
    </div>
  );
}
