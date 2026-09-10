# LinkBio

Alternativa open-source ao Linktree com uma diferença: **rastreamento de cliques de verdade**. Cada link do seu perfil registra data/hora, dispositivo, navegador e localização aproximada de quem clicou — tudo visível no seu painel.

## Funcionalidades

- **Cadastro e login** — cada pessoa cria seu próprio perfil (multi-usuário)
- **Página pública de links** — `seusite.com/seunome`, no estilo Linktree
- **Rastreamento por clique** — cada clique registra:
  - Data e hora
  - Dispositivo (celular, tablet, computador) e sistema operacional
  - Navegador
  - Cidade/região/país aproximados (via IP)
  - Página de origem (referrer)
- **Painel de controle** — adicione, ative/desative e remova links; veja o contador de cliques de cada um e a lista detalhada de cada clique individual

## Tecnologias

- [Next.js 14](https://nextjs.org/) (App Router) — frontend e backend
- [Supabase](https://supabase.com/) — banco de dados Postgres + autenticação
- [Tailwind CSS](https://tailwindcss.com/) — estilos
- [ua-parser-js](https://github.com/faisalman/ua-parser-js) — identificação de dispositivo/navegador
- Deploy recomendado: [Vercel](https://vercel.com/) (plano gratuito)

## Como funciona o rastreamento

Os links do perfil público não apontam direto para o destino. Eles apontam para uma rota interna (`/api/click/[id]`), que:

1. Recebe o clique
2. Registra os detalhes (IP, user-agent, referrer) na tabela `clicks`
3. Redireciona a pessoa para a URL real

Esse redirecionamento é instantâneo — quem clica não percebe a diferença.

## Instalação e deploy

Veja o passo a passo completo em [`COMO_PUBLICAR.md`](./COMO_PUBLICAR.md): criação do projeto no Supabase, execução do schema SQL e deploy na Vercel. Leva cerca de 15-20 minutos, do zero ao site no ar.

Resumo rápido para rodar localmente:

```bash
npm install
cp .env.local.example .env.local   # preencha com as chaves do seu projeto Supabase
npm run dev
```

## Estrutura do projeto

```
app/
  page.tsx                  # landing page
  login/                    # tela de login
  signup/                   # tela de cadastro
  [username]/               # página pública de links
  api/click/[linkId]/       # registra o clique e redireciona
  dashboard/                # painel: lista de links, contadores, detalhes de cliques
lib/supabase/                # clientes Supabase (browser, servidor, service role)
sql/schema.sql                # schema do banco + políticas de segurança (RLS)
middleware.ts                 # protege as rotas /dashboard
```

## Banco de dados

Três tabelas: `profiles`, `links` e `clicks`. O schema completo com as políticas de Row Level Security está em [`sql/schema.sql`](./sql/schema.sql).

## Segurança e privacidade

- **Fail-closed**: se as variáveis de ambiente de autenticação (`NEXT_PUBLIC_SUPABASE_URL`,
  `NEXT_PUBLIC_SUPABASE_ANON_KEY`) estiverem ausentes, o middleware bloqueia o acesso ao
  `/dashboard` (HTTP 503) em vez de deixar passar sem checagem. O mesmo vale para a rota de
  clique: sem `SUPABASE_SERVICE_ROLE_KEY`, ela recusa a requisição em vez de redirecionar
  sem registrar.
- **Dados de clique são minimizados**: o IP nunca é salvo em texto puro — é convertido em
  hash (SHA-256 com salt, ver `IP_HASH_SALT`) antes de ir para o banco. Cidade/região/país
  aproximados vêm de um lookup de IP, mas o IP em si não fica armazenado.
- **Antes de publicar em produção**: se você for coletar dados de visitantes na União
  Europeia, Brasil (LGPD) ou outras jurisdições com lei de proteção de dados, adicione um
  aviso de cookies/rastreamento na página pública e defina uma política de retenção
  (ex.: apagar cliques com mais de X meses).
- URLs de links são validadas tanto no formulário quanto por uma constraint no banco
  (`links_url_must_be_http`), exigindo `http://` ou `https://`.

## Roadmap

- [ ] Upload de foto de perfil
- [ ] Gráfico de cliques ao longo do tempo
- [ ] Reordenar links por arrastar e soltar
- [ ] Exportar cliques em CSV

## Licença

MIT — use, modifique e distribua livremente.
