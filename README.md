# EtmosGram

[![Publicar no GitHub Pages](https://github.com/EnricoDiGioia/EtmosGram/actions/workflows/deploy.yml/badge.svg)](https://github.com/EnricoDiGioia/EtmosGram/actions/workflows/deploy.yml)

Rede social no estilo Instagram para os personagens de uma campanha de [Etmos](https://baldegalactico.com.br/jogo/etmos/), o RPG em que a magia é linguagem. Cada jogador cria seus personagens (e o mestre, os NPCs) e eles publicam fotos, vídeos, stories e reels, conversam no Direct e seguem uns aos outros dentro do mundo da campanha.

É um PWA: roda no navegador e se instala na tela inicial do iPhone e do Android como um app, sem loja. Funciona inteiro no plano grátis do Supabase e do GitHub Pages.

**No ar:** https://enricodigioia.github.io/EtmosGram/ (o cadastro pede um código de convite)

Feito a partir do [FargusGram](https://github.com/EnricoDiGioia/FargusGram): o código é o mesmo, com outra identidade visual, outro banco de dados e outro endereço. Os dois apps não compartilham contas, publicações nem fotos.

## Funcionalidades

**Publicações**
- Até 10 fotos ou vídeos por post, com recorte, filtros e textos e fotos por cima (arrastar, girar, mudar o tamanho)
- Curtidas, comentários com respostas, reações com emoji, comentários fixados, salvos e compartilhar no Direct
- Marcação de personagens, @menções, #hashtags, local e música do Apple Music
- Explorar, busca de personagens e hashtags, e rolagem contínua a partir de qualquer grade

**Stories e reels**
- Stories de 24 horas em foto, texto ou vídeo, com lista de quem viu, respostas e reações
- Figurinhas: enquete, caixinha de perguntas, menção, local, horário e música
- Repostar o story em que você foi marcado; destaques no perfil; lista de Melhores amigos
- Reels: vídeos em pé, um por tela, com aba própria no perfil

**Vídeo**
- Vídeos de até 15 s, cortados e comprimidos no próprio aparelho (MP4 H.264/AAC, 540 px, cerca de 1 a 1,5 MB)

**Conversas e avisos**
- Direct com conversas individuais e em grupo, fotos, figurinhas, respostas a mensagens e reações
- Notas no topo do Direct e notificações no celular (Web Push), mesmo com o app fechado

**Personalização e administração**
- Vários personagens por jogador, com troca rápida
- Temas prontos e temas criados pelo jogador, com papel de parede, sincronizados na conta
- Painel do admin: convite, jogadores, senhas, selo de verificado, números extras e moderação

## Stack

| Parte | Tecnologia |
| --- | --- |
| Interface | React 19, React Router 7 (HashRouter), Vite 8, CSS próprio com variáveis de tema |
| Back-end | Supabase: Postgres com Row Level Security, Auth, Storage, Realtime e Edge Function (Deno) |
| Vídeo | [Mediabunny](https://mediabunny.dev) sobre WebCodecs, com codificador AAC em WebAssembly como reserva |
| Música | Prévias de 30 s do Apple Music (busca pela iTunes Search API) |
| Notificações | Web Push (VAPID), enviado pela Edge Function `push` |
| Hospedagem | GitHub Pages, publicado pelo GitHub Actions a cada push na `main` |
| PWA | Manifesto e service worker próprio (cache do app, das fotos e dos vídeos) |

## Como funciona

- **Sem servidor próprio.** O navegador conversa direto com o Supabase. Toda a segurança está no banco: regras de Row Level Security e funções `security definer` decidem quem vê e quem altera cada coisa. As chaves que vão para o app são públicas por natureza.
- **Trabalho pesado no aparelho.** Fotos são recortadas, filtradas e comprimidas em canvas; vídeos são cortados, montados quadro a quadro (recorte, filtro, textos) e codificados com WebCodecs. Só sobe o arquivo final, pequeno.
- **Atualizações do banco sem quebrar o app.** Cada novidade que precisa do banco vem num arquivo em `supabase/atualizacoes/`. A função `me()` informa quais recursos o banco já tem, e o app esconde o que ainda não foi atualizado.
- **Economia do plano grátis.** O service worker guarda fotos e vídeos já vistos, só o vídeo que está na tela é baixado, e stories vencidos são apagados depois de 30 dias no arquivo (menos os que estão em destaques).

## Estrutura

```
├── src/
│   ├── pages/              telas (feed, perfil, stories, reels, direct, editores…)
│   ├── components/         peças reutilizadas (post, camadas, figurinhas, vídeo…)
│   ├── lib/                Supabase, mídia, vídeo, música, temas, push, cache
│   ├── state/              sessão, avisos e contadores
│   ├── styles/app.css      visual e temas
│   └── config.js           URL e chave pública do Supabase
├── public/                 ícones, manifesto e service worker
├── supabase/
│   ├── setup.sql           banco completo (tabelas, regras, funções, Storage)
│   ├── atualizacoes/       atualizações para quem já tem o banco
│   └── functions/push/     Edge Function das notificações
├── scripts/keepalive.mjs   consulta que mantém o Supabase acordado
└── .github/workflows/      publicação no Pages e robô contra a pausa
```

## Rodando localmente

Requisitos: [Node.js](https://nodejs.org) 22 ou mais novo e um projeto no Supabase.

```bash
git clone https://github.com/EnricoDiGioia/EtmosGram.git
cd EtmosGram
npm install
npm run dev
```

O app abre em `http://localhost:5173`. O terminal mostra também um endereço de rede, que abre no celular se ele estiver no mesmo Wi-Fi.

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Gera o site em `dist/` |
| `npm run preview` | Serve o `dist/` para conferir a versão de produção |

## Configuração

1. Crie um projeto no [Supabase](https://supabase.com) e rode `supabase/setup.sql` inteiro no **SQL Editor**.
2. Em **Authentication → Sign In / Providers → Email**, desligue **Confirm email**.
3. Cole a **Project URL** e a **publishable key** em `src/config.js`. Nunca use a chave `secret` ou `service_role` no app.
4. Para as notificações, publique `supabase/functions/push/index.ts` como uma Edge Function chamada `push`, com a verificação de JWT desligada (a função confere o login sozinha).

A primeira conta criada vira admin. O código de convite inicial é `etmos` e deve ser trocado no Painel do admin.

## Banco de dados

Quem instala do zero roda só o `setup.sql`, que já inclui tudo o que o FargusGram tinha até 01/10/2026 (música, notificações, destaques, notas, melhores amigos, reações, figurinhas, repost, números extras, temas e vídeos).

Uma mudança nova no banco entra nos dois lugares: num arquivo novo em `supabase/atualizacoes/` (para o banco que já está no ar) e no `setup.sql` (para quem instala do zero). Se a mudança vier do FargusGram, o arquivo de lá pode ser copiado para cá do jeito que está.

## Publicação

O workflow `.github/workflows/deploy.yml` gera o site e publica no GitHub Pages a cada push na `main` (em **Settings → Pages**, a fonte deve ser **GitHub Actions**). O app instalado nos celulares pega a versão nova na próxima vez que é aberto.

O workflow `keepalive.yml` faz uma consulta a cada 3 dias para o Supabase grátis não pausar o projeto por falta de uso.

## Limites do plano grátis

| Recurso | Limite | Uso típico |
| --- | --- | --- |
| Storage | 1 GB | foto ≈ 300 KB, vídeo de 15 s ≈ 1 a 1,5 MB, figurinha ≈ 50 KB |
| Banco | 500 MB | textos, curtidas e mensagens ocupam pouco |
| Tráfego | 5 GB por mês | cada aparelho baixa uma foto ou vídeo uma vez só |
| Edge Functions | 500 mil chamadas por mês | uma chamada por aviso no celular |

A música não conta em nenhum limite: o áudio vem direto da Apple.

## Segurança e privacidade

- Só quem entrou com o código de convite vê publicações, perfis, comentários e mensagens.
- Fotos e vídeos ficam num bucket público com endereços longos e aleatórios: quem tiver o link consegue abrir.
- Stories e notas de Melhores amigos, respostas das caixinhas e votos das enquetes são filtrados no próprio banco, não só na tela.
- As notificações passam pelos servidores de push do Google, da Apple ou da Mozilla, criptografadas de ponta a ponta.

## Créditos

- [Supabase](https://supabase.com), [React](https://react.dev), [Vite](https://vite.dev) e [React Router](https://reactrouter.com)
- [Mediabunny](https://github.com/Vanilagy/mediabunny) (MPL-2.0) para o processamento de vídeo
- Ícones do [Lucide](https://lucide.dev) e fontes do [Fontsource](https://fontsource.org)
- Prévias de música do Apple Music
- Etmos é um RPG publicado pela editora Balde Galáctico. O EtmosGram é um projeto de fã para uma mesa da campanha, sem ligação com a editora
