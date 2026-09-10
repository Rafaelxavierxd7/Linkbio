import { NextRequest, NextResponse } from "next/server";
import { UAParser } from "ua-parser-js";
import { createHash } from "crypto";
import { createServiceClient } from "@/lib/supabase/server";

// O IP bruto nunca é persistido: usamos um hash (com salt) só pra permitir
// deduplicar/analisar sem guardar um dado pessoal diretamente identificável.
function hashIp(ip: string) {
  const salt = process.env.IP_HASH_SALT || "linkbio-default-salt-troque-em-producao";
  return createHash("sha256").update(salt + ip).digest("hex").slice(0, 16);
}

export async function GET(
  request: NextRequest,
  { params }: { params: { linkId: string } }
) {
  let supabase;
  try {
    // Fail-closed: se a service role key estiver ausente, não redireciona
    // silenciosamente sem registrar o clique — recusa a requisição.
    supabase = createServiceClient();
  } catch (err) {
    console.error(err);
    return new NextResponse("Serviço de redirecionamento indisponível.", {
      status: 503,
    });
  }
  const { linkId } = params;

  const { data: link } = await supabase
    .from("links")
    .select("url, active")
    .eq("id", linkId)
    .single();

  if (!link || !link.active) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Coleta os dados do clique sem bloquear o redirecionamento em caso de falha
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "";

    const userAgent = request.headers.get("user-agent") || "";
    const parser = new UAParser(userAgent);
    const device = parser.getDevice();
    const browser = parser.getBrowser();
    const os = parser.getOS();

    let geo: { city?: string; region?: string; country_name?: string } = {};
    if (ip && !isPrivateIp(ip)) {
      try {
        const geoRes = await fetch(`https://ipapi.co/${ip}/json/`, {
          signal: AbortSignal.timeout(2000),
        });
        if (geoRes.ok) geo = await geoRes.json();
      } catch {
        // geolocalização é "nice to have" — se falhar, seguimos sem ela
      }
    }

    await supabase.from("clicks").insert({
      link_id: linkId,
      ip_address: ip ? hashIp(ip) : null,
      city: geo.city || null,
      region: geo.region || null,
      country: geo.country_name || null,
      device: device.type || "desktop",
      browser: browser.name || null,
      os: os.name || null,
      referrer: request.headers.get("referer") || null,
    });
  } catch (err) {
    console.error("Falha ao registrar clique:", err);
  }

  return NextResponse.redirect(link.url);
}

function isPrivateIp(ip: string) {
  return (
    ip.startsWith("127.") ||
    ip.startsWith("10.") ||
    ip.startsWith("192.168.") ||
    ip === "::1"
  );
}
