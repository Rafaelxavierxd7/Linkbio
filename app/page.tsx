import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <span className="text-signal font-medium mb-3">um link. todos os seus links.</span>
      <h1 className="text-4xl md:text-6xl font-semibold max-w-2xl leading-tight">
        Saiba exatamente quem clica em cada link do seu perfil.
      </h1>
      <p className="text-muted max-w-md mt-4">
        Monte sua página de links em minutos e veja, clique a clique, a origem,
        o dispositivo e o horário de cada visita.
      </p>
      <div className="flex gap-3 mt-8">
        <Link
          href="/signup"
          className="bg-accent hover:bg-accent-hover text-white px-6 py-3 rounded-card font-medium transition-colors"
        >
          Criar minha página
        </Link>
        <Link
          href="/login"
          className="border border-line px-6 py-3 rounded-card font-medium hover:bg-panel transition-colors"
        >
          Entrar
        </Link>
      </div>
    </main>
  );
}
