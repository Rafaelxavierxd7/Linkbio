import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Fail-closed: se a configuração de autenticação estiver incompleta, TODA
// rota protegida por este middleware é bloqueada, em vez de deixar passar
// sem checagem. Não existe um estado "sem REQUIRE_AUTH" que resulte em acesso liberado.
function hasAuthConfig() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export async function middleware(request: NextRequest) {
  if (!hasAuthConfig()) {
    console.error(
      "Configuração de autenticação ausente (NEXT_PUBLIC_SUPABASE_URL/ANON_KEY). " +
        "Bloqueando acesso por padrão (fail-closed)."
    );
    return new NextResponse("Serviço indisponível: configuração de autenticação ausente.", {
      status: 503,
    });
  }

  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && request.nextUrl.pathname.startsWith("/dashboard")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
