# AI Assistant — WhatsApp Chatbot with RAG

An AI-powered WhatsApp chatbot built with Next.js, Supabase, and OpenAI. It uses Retrieval-Augmented Generation (RAG) to answer customer questions based on your product catalog and FAQ knowledge base.

## Features

- **WhatsApp Integration** — Receives and replies to WhatsApp messages via Meta Cloud API webhook
- **RAG Knowledge Base** — Vector similarity search over products and FAQs using pgvector
- **Persona Settings** — Customize bot name, tone, system prompt, and welcome message
- **Conversation History** — Stores and displays all conversations with message history
- **Dashboard** — Web UI to manage products, FAQs, persona settings, and view conversations
- **Auth** — Supabase Auth with Row Level Security (RLS) per user

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Database:** Supabase (PostgreSQL + pgvector)
- **AI:** OpenAI GPT (chat completions + text-embedding-ada-002)
- **Messaging:** WhatsApp Cloud API (Meta)
- **UI:** Tailwind CSS, shadcn/ui, Lucide icons
- **State:** TanStack React Query

## Prerequisites

- Node.js 18+
- npm
- A [Supabase](https://supabase.com) project (cloud or local via CLI)
- An [OpenAI API key](https://platform.openai.com/api-keys)
- A [Meta Developer](https://developers.facebook.com) app with WhatsApp Cloud API access

## Getting Started

### 1. Clone and install dependencies

```bash
git clone <your-repo-url>
cd ai-assistant
npm install
```

### 2. Set up environment variables

Create a `.env.local` file in the project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenAI
OPENAI_API_KEY=sk-your-openai-api-key

# WhatsApp Cloud API (Meta)
WHATSAPP_ACCESS_TOKEN=your-whatsapp-access-token
WHATSAPP_VERIFY_TOKEN=your-custom-verify-token
```

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL (found in Project Settings > API) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key (found in Project Settings > API) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key — **keep secret, never expose to client** |
| `OPENAI_API_KEY` | OpenAI API key for chat completions and embeddings |
| `WHATSAPP_ACCESS_TOKEN` | Permanent access token from Meta Developer Portal |
| `WHATSAPP_VERIFY_TOKEN` | Any random string you choose — used to verify the webhook |

### 3. Set up Supabase

#### Option A: Using Supabase Cloud

1. Create a new project at [supabase.com](https://supabase.com)
2. Install the Supabase CLI:
   ```bash
   npm install -g supabase
   ```
3. Link your project:
   ```bash
   supabase link --project-ref your-project-ref
   ```
4. Run the migrations:
   ```bash
   supabase db push
   ```

#### Option B: Using Supabase Local Development

1. Install the Supabase CLI and Docker
2. Start local Supabase:
   ```bash
   supabase start
   ```
3. The CLI will output local credentials — use those in `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<local-anon-key>
   SUPABASE_SERVICE_ROLE_KEY=<local-service-role-key>
   ```
4. Migrations run automatically on `supabase start`.

#### Database Schema

The migrations create the following tables:

- **`products`** — Product catalog with name, price, stock, and embedding vector
- **`faqs`** — FAQ entries with question, answer, and embedding vector
- **`persona_settings`** — Bot persona configuration (one per user)
- **`conversations`** — WhatsApp conversation threads
- **`messages`** — Individual messages within conversations

Plus two RPC functions (`match_products`, `match_faqs`) for vector similarity search.

> **Note:** The `pgvector` extension must be enabled. The migrations handle this automatically.

### 4. Set up WhatsApp Webhook

1. In your Meta Developer App, go to **WhatsApp > Configuration**
2. Set the webhook URL to:
   ```
   https://your-domain.com/api/webhook/whatsapp
   ```
3. Set the verify token to the same value as `WHATSAPP_VERIFY_TOKEN` in your `.env.local`
4. Subscribe to the `messages` field

> For local development, use a tunnel like [ngrok](https://ngrok.com) to expose your local server.

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access the dashboard.

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run gen:types` | Generate TypeScript types from Supabase schema |
| `npm run backfill:embeddings` | Backfill embeddings for existing products/FAQs |

## Project Structure

```
src/
├── app/
│   ├── api/webhook/whatsapp/  # WhatsApp webhook endpoint
│   ├── dashboard/             # Dashboard pages (knowledge, persona, conversations)
│   ├── login/                 # Auth login page
│   ├── layout.tsx             # Root layout
│   └── providers.tsx          # React Query provider
├── components/ui/             # shadcn/ui components
├── lib/
│   ├── supabase/              # Supabase clients (client, server, admin, middleware)
│   ├── chat.ts                # AI chat response generation
│   ├── embeddings.ts          # OpenAI embedding generation
│   ├── rag.ts                 # RAG search (vector similarity)
│   └── types.ts               # TypeScript types
supabase/
├── migrations/                # SQL migrations
└── config.toml                # Supabase local config
```

## Deployment

Deploy to [Vercel](https://vercel.com) or any platform that supports Next.js:

1. Push your code to a Git repository
2. Import the project in Vercel
3. Add all environment variables from `.env.local` to the Vercel project settings
4. Deploy

Make sure your WhatsApp webhook URL points to the deployed domain.
