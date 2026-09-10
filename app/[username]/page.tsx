import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function ProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const supabase = createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, display_name, bio, avatar_url")
    .eq("username", params.username)
    .single();

  if (!profile) notFound();

  const { data: links } = await supabase
    .from("links")
    .select("id, title, url, position")
    .eq("profile_id", profile.id)
    .eq("active", true)
    .order("position", { ascending: true });

  return (
    <main className="min-h-screen flex flex-col items-center px-6 py-16">
      <div className="w-16 h-16 rounded-full bg-panel border border-line flex items-center justify-center text-xl font-semibold mb-4">
        {(profile.display_name || profile.username)[0]?.toUpperCase()}
      </div>
      <h1 className="text-xl font-semibold">
        {profile.display_name || profile.username}
      </h1>
      {profile.bio && (
        <p className="text-muted text-center max-w-sm mt-2">{profile.bio}</p>
      )}

      <div className="w-full max-w-sm mt-8 flex flex-col gap-3">
        {links?.length ? (
          links.map((link) => (
            <a
              key={link.id}
              href={`/api/click/${link.id}`}
              className="w-full text-center border border-line rounded-card py-3.5 font-medium hover:border-accent hover:text-accent transition-colors"
            >
              {link.title}
            </a>
          ))
        ) : (
          <p className="text-muted text-center text-sm">
            Este perfil ainda não tem links.
          </p>
        )}
      </div>
    </main>
  );
}
