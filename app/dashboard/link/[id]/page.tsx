import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function LinkDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: link } = await supabase
    .from("links")
    .select("id, title, url, profile_id")
    .eq("id", params.id)
    .single();

  if (!link || link.profile_id !== user.id) notFound();

  const { data: clicks } = await supabase
    .from("clicks")
    .select("id, clicked_at, city, region, country, device, browser, os, referrer")
    .eq("link_id", params.id)
    .order("clicked_at", { ascending: false })
    .limit(200);

  const deviceCounts = (clicks || []).reduce((acc: Record<string, number>, c) => {
    const key = c.device || "desktop";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <Link href="/dashboard" className="text-muted text-sm hover:text-ink">
        ← Voltar
      </Link>

      <h1 className="text-2xl font-semibold mt-2">{link.title}</h1>
      <p className="text-muted text-sm truncate mb-6">{link.url}</p>

      <div className="flex gap-6 mb-8">
        <div>
          <p className="text-2xl font-semibold text-signal">{clicks?.length || 0}</p>
          <p className="text-muted text-sm">cliques registrados</p>
        </div>
        {Object.entries(deviceCounts).map(([device, count]) => (
          <div key={device}>
            <p className="text-2xl font-semibold">{count}</p>
            <p className="text-muted text-sm capitalize">{traduzDispositivo(device)}</p>
          </div>
        ))}
      </div>

      <div className="border border-line rounded-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-panel text-left">
            <tr>
              <th className="px-4 py-2.5 font-medium">Quando</th>
              <th className="px-4 py-2.5 font-medium">Local</th>
              <th className="px-4 py-2.5 font-medium">Dispositivo</th>
              <th className="px-4 py-2.5 font-medium">Navegador</th>
            </tr>
          </thead>
          <tbody>
            {clicks?.length ? (
              clicks.map((c) => (
                <tr key={c.id} className="border-t border-line">
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    {new Date(c.clicked_at).toLocaleString("pt-BR")}
                  </td>
                  <td className="px-4 py-2.5">
                    {[c.city, c.region, c.country].filter(Boolean).join(", ") ||
                      "Desconhecido"}
                  </td>
                  <td className="px-4 py-2.5 capitalize">
                    {traduzDispositivo(c.device)} {c.os ? `· ${c.os}` : ""}
                  </td>
                  <td className="px-4 py-2.5">{c.browser || "—"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-muted">
                  Ainda não há cliques neste link.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function traduzDispositivo(device: string | null) {
  if (!device || device === "desktop") return "Computador";
  if (device === "mobile") return "Celular";
  if (device === "tablet") return "Tablet";
  return device;
}
