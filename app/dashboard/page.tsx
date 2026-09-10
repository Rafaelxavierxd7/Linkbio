import { createClient } from "@/lib/supabase/server";
import AddLinkForm from "./add-link-form";
import LinkRow from "./link-row";

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: links } = await supabase
    .from("links")
    .select("id, title, url, active, position")
    .eq("profile_id", user.id)
    .order("position", { ascending: true });

  const linkIds = links?.map((l) => l.id) || [];

  let countsByLink: Record<string, number> = {};
  if (linkIds.length) {
    const { data: clicks } = await supabase
      .from("clicks")
      .select("link_id")
      .in("link_id", linkIds);

    countsByLink = (clicks || []).reduce((acc: Record<string, number>, c) => {
      acc[c.link_id] = (acc[c.link_id] || 0) + 1;
      return acc;
    }, {});
  }

  const totalClicks = Object.values(countsByLink).reduce((a, b) => a + b, 0);

  return (
    <div>
      <div className="flex items-baseline justify-between mb-8">
        <h1 className="text-2xl font-semibold">Seus links</h1>
        <p className="text-muted text-sm">
          <span className="text-ink font-semibold">{totalClicks}</span>{" "}
          cliques no total
        </p>
      </div>

      <AddLinkForm nextPosition={(links?.length || 0)} />

      <div className="flex flex-col gap-3 mt-6">
        {links?.length ? (
          links.map((link) => (
            <LinkRow
              key={link.id}
              link={link}
              clickCount={countsByLink[link.id] || 0}
            />
          ))
        ) : (
          <p className="text-muted text-sm">
            Você ainda não adicionou nenhum link.
          </p>
        )}
      </div>
    </div>
  );
}
