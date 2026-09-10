import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "./logout-button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let username = "";
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .single();
    username = profile?.username || "";
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-line px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="font-display font-semibold">
          LinkBio
        </Link>
        <div className="flex items-center gap-4 text-sm">
          {username && (
            <Link
              href={`/${username}`}
              target="_blank"
              className="text-muted hover:text-ink"
            >
              Ver minha página →
            </Link>
          )}
          <LogoutButton />
        </div>
      </header>
      <div className="max-w-2xl mx-auto px-6 py-10">{children}</div>
    </div>
  );
}
