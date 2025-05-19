# ArguForge — Forge Better Arguments with AI

ArguForge is an AI-powered practice arena that helps speakers sharpen their reasoning, rhetoric, and debate strategy through live, adversarial sessions and actionable analytics.

![ArguForge banner](public/ui.png)

## ✨ Features

| Category              | Highlights                                                                                         |
| --------------------- | -------------------------------------------------------------------------------------------------- |
| **Real-Time Debate**  | • GPT-4o Realtime opponent<br>• Configurable topic & stance<br>• Audio + text modalities           |
| **Granular Feedback** | • Automatic transcript<br>• Argument, rhetoric & strategy scores<br>• Gem-powered improvement plan |
| **Progress Tracking** | • Debate history dashboard<br>• Token & duration metrics<br>• Credit-based practice limits         |
| **Modern UX**         | • Sleek Tailwind UI<br>• Responsive & accessible<br>• Dark-mode ready                              |

## 🏗 Tech Stack

| Layer     | Choice                                      |
| --------- | ------------------------------------------- |
| Framework | Next 15 (App Router, React 19)              |
| UI        | Tailwind CSS + shadcn/ui                    |
| DB        | Postgres on Supabase, typed via Drizzle ORM |
| Auth      | Supabase Auth                               |
| AI        | OpenAI Realtime (GPT-4o) & Google Gemini    |
| Realtime  | WebRTC (mic ↔ assistant audio)             |

## 🚀 Quick Start

### 1. Clone

```bash
git clone https://github.com/your-org/arguforge.git
cd arguforge
```

### 2. Install

```bash
pnpm install
```

### 3. Configure

Create `.env.local` and fill **all** keys:

```env
OPENAI_API_KEY=your-openai-key
GOOGLE_AI_KEY=your-google-ai-key
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=public-anon-key
DATABASE_URL=postgres://user:pass@host:port/db
```

### 4. Run Dev

```bash
pnpm dev
```

Open `http://localhost:3000` and start forging arguments!

## 📂 Project Map

| Folder          | Purpose                             |
| --------------- | ----------------------------------- |
| **app/**        | Routes, layouts & UI logic          |
| **components/** | Reusable React components           |
| **lib/**        | Database, AI integrations & helpers |
| **public/**     | Static assets (icons, media)        |
| **scripts/**    | One-off utilities & migrations      |

## 🧩 Extending

- **Add voice** — update `components/voice-select.tsx`.
- **Create new debate tools** — extend `lib/tools.ts`.
- **Swap AI models** — edit endpoints in `app/api/openai/*`.

## 🌐 Deployment

1. Provision Postgres (Supabase recommended).
2. Set all env vars in your host (Vercel, Fly, Docker, etc.).
3. Run `pnpm build` — Next will perform a **static + edge** hybrid build.

A Vercel `vercel.json` example is included for zero-config deploys.

## 🤝 Contributing

1. Fork → feature branch → PR.
2. Run `pnpm lint:all` before pushing.
3. Describe **why** the change matters — not just _what_.

## 🙏 Acknowledgements

- [OpenAI Realtime API NextJS Starter](https://github.com/cameronking4/openai-realtime-api-nextjs)
- [shadcn/ui](https://ui.shadcn.com/)
