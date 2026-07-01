# Reestruturação do site GenZ1n

Vou reescrever o site em uma nova arquitetura multi-página com CMS admin, ativando o Lovable Cloud (banco de dados + auth + IA) para dar suporte às funcionalidades.

## 1. Nova paleta e identidade

Tokens semânticos no `src/styles.css` baseados nas cores enviadas:

- Navy profundo `#001167` (background principal)
- Azul elétrico `#003CFF` (primário / CTAs)
- Roxo neon `#B800FF` (accent / destaques)
- Azul claro `#9CC7DB` (superfícies suaves)
- Off-white `#FEFEED` (foreground em blocos claros)

Logo redesenhado usando o gradiente azul → roxo (SVG inline, sem imagem externa).

## 2. Vídeo de fundo no hero

- Baixar o MP4 do Pexels (36262413) e servir localmente.
- `<video autoplay muted loop playsinline>` cobrindo o hero em `object-cover`, com overlay escuro em gradiente para legibilidade.
- Remover todo o efeito de radar atual + cursor HUD.

## 3. Estrutura de rotas (TanStack Start)

- /                     Home (hero com vídeo, showcase de projetos, CTA)
/projetos             Lista completa de projetos (CMS)
/trabalhe-conosco     Página de vagas + formulário de candidatura
/contato              Nova seção de contato (layout split com mapa/cards)
/admin/login          Login do painel
/admin                Dashboard admin (protegido)
/admin/projetos       CRUD de projetos
/admin/vagas          CRUD de vagas
/admin/mensagens      Contatos + candidaturas recebidas
/admin/config         Textos do site, redes sociais, contatos, cores do hero

Todas as páginas com metadados SEO próprios e o layout compartilha nav + rodapé.

## 4. Projetos

- Card em preto & branco (grayscale), colore no hover, agora envolvido em `<a href={project.url} target="_blank">`.
- Admin cadastra: título, categoria, ano, imagem (upload storage), URL externa, ordem.

## 5. Nova seção de contato

Layout completamente novo: bloco split em duas colunas — à esquerda um formulário elegante (nome, email, assunto, mensagem) com envio para tabela `contact_messages`; à direita cartões com endereço, email, telefone e horário, sobre fundo com gradiente azul→roxo e blobs sutis. Nada de tipografia gigante centralizada como está hoje.

## 6. Rodapé

Rodapé completo com 4 colunas: marca + descrição, links rápidos, contato (endereço, email, telefone), redes sociais (Instagram, LinkedIn, Behance, GitHub). Copyright na base. Conteúdo puxado da tabela `site_settings`.

## 7. Chatbot

Widget fixo no canto inferior direito (todas as páginas). Usa Lovable AI Gateway (`google/gemini-2.5-flash`) via server function protegida, com prompt de sistema puxado de `site_settings.chatbot_prompt` (editável no admin). Histórico só em memória do cliente.

## 8. Painel Admin (Lovable Cloud)

- Auth com email/senha (Lovable Cloud). Primeiro usuário cadastrado vira admin via tabela `user_roles` + função `has_role`.
- Rotas `/admin/*` sob `_authenticated` + guard de role `admin`.
- Tabelas: `projects`, `job_openings`, `job_applications`, `contact_messages`, `site_settings` (chave/valor JSON: hero_title, hero_subtitle, about, address, phone, email, social_instagram, social_linkedin, social_behance, social_github, chatbot_prompt).
- Storage bucket `project-images` para uploads.
- RLS: leitura pública em `projects`, `job_openings`, `site_settings`; escrita só admin. `contact_messages` e `job_applications` aceitam INSERT anônimo, SELECT só admin.

## Detalhes técnicos

- Ativar Lovable Cloud (banco + auth + IA + storage).
- Migração SQL com todas as tabelas, GRANTs, RLS e seed inicial de `site_settings`.
- Server functions em `src/lib/*.functions.ts` para: enviar contato, enviar candidatura, chatbot, CRUD admin.
- Componentes shadcn: form, input, textarea, table, dialog, sonner (toasts).
- Vídeo em `public/hero-bg.mp4` (baixado no build).

## O que sai

- Todo o efeito de radar holográfico, grid tech, HUD do cursor.
- Seção de contato atual (bloco centralizado gigante).
- Layout single-page — vira multi-página.

## Pergunta antes de começar

Confirmo estas 2 decisões:

1. **Primeiro cadastro = admin automático** (você cria sua conta em `/admin/login` e vira admin sem configuração manual). Depois disso, novos cadastros ficam como usuário comum. Ok?
2. **Conteúdo inicial**: mantenho os 4 projetos atuais (Cortex Digital, Aura OS, Vanguard, Stellar Core) como seed no banco pra você editar depois, ou começa vazio?  
  
Pelo painel admin tem que ser possivel alterar texto das sections, projetos, links, imagens, tudo que estiver no site.