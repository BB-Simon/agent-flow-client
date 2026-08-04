# Agent Flow — Frontend

React frontend for **Agent Flow**, a SaaS platform for visually building,
running, and debugging multi-agent AI workflows on a drag-and-drop canvas.
This app is the canvas/UI; all persistence, auth, and the execution engine
live in `../backend` (NestJS).

See `../agent-flow-spec.md` for the full product spec and `../CLAUDE.md` for
architecture notes and the build order this project followed
(`../agent-flow-phased-prompts.md`, Prompts 15–22).

## Tech stack

- **React 19 + TypeScript + Vite**
- **Tailwind CSS v4** — dark, developer-tool theme (near-black surfaces, one
  violet accent reserved for "active/running" state, distinct status colors
  for done/error/waiting-on-human) defined as CSS variables in `src/index.css`
- **@xyflow/react (React Flow)** — the canvas editor and the read-only replay/
  demo canvases
- **TanStack Query** — all server state (queries + mutations)
- **Zustand** — local auth state (`src/store/auth-store.ts`)
- **React Hook Form + Zod** — form validation
- **Socket.IO client** — live run streaming
- **Axios**, **Sonner** (toasts), **lucide-react** (icons)
- A small set of hand-rolled shadcn-style primitives in `src/components/ui`
  (not generated via the shadcn CLI — see note below)

## Setup

Requires the backend running (see `../backend/README.md`) — this app talks to
it over REST (`VITE_API_BASE_URL`) and Socket.IO, using httpOnly cookies for
auth, so the backend's `FRONTEND_URL` env var must match this app's origin.

```bash
npm install
cp .env.example .env   # VITE_API_BASE_URL, defaults to http://localhost:5000
npm run dev             # http://localhost:3000
```

## Common commands

```bash
npm run dev       # start Vite dev server
npm run build      # tsc -b && vite build
npm run lint        # oxlint
npm run preview      # preview a production build locally
```

## Project structure

```
src/
  features/
    auth/            login, signup, email verification, password reset, auth store hydration
    canvas/           React Flow editor — node types, edges, config drawer, workflow list/CRUD
    execution/        live run viewer (WebSocket), human-review modal, run history + replay
    billing/          plan comparison, Stripe Checkout/Portal redirects, usage meters
    team/             member list, invites, role changes, remove member
    api-keys/         generate/revoke API keys
    notifications/    notification bell + dropdown (polled)
    marketing/         public landing page, canvas demo, quickstart/docs
  components/
    ui/               shared primitives (Button, Input, Card, Form, …)
    app-header.tsx    authenticated app nav (Workflows/Team/API Keys/Billing + bell + logout)
  lib/
    api/              axios instance (cookie-based auth, single-flight refresh-on-401)
    socket/           shared Socket.IO client
    query-client.ts   TanStack Query client
  store/              Zustand stores
```

Each feature module owns its own `api/` (typed backend calls), `hooks/`
(TanStack Query wrappers), and `pages/` — mirroring the backend module it
talks to.

## Routes

| Path | Notes |
|---|---|
| `/` | Public landing page for guests; redirects to `/workflows` if authenticated |
| `/docs` | Public quickstart |
| `/login`, `/signup`, `/verify-email`, `/forgot-password`, `/reset-password` | Auth flow |
| `/workflows` | Workflow list (protected) |
| `/workflows/:id` | Canvas editor — build, save, Run |
| `/workflows/:id/runs` | Run history |
| `/workflows/:id/runs/:runId` | Replay viewer (scrubs the persisted `RunEvent` log) |
| `/team` | Members, invites, roles |
| `/api-keys` | Generate/revoke API keys |
| `/billing` | Plans, usage meters, Checkout/Portal |

## Notes on the UI primitives

`src/components/ui` was hand-written to match shadcn/ui's API shape rather
than scaffolded via `npx shadcn@latest` — the current shadcn CLI's interactive
preset wizard doesn't run non-interactively in this environment. If adding a
new primitive, keep following the same pattern: `React.forwardRef`, a `cn()`
class merge, and Tailwind classes driven by the theme's CSS variables (never
hardcoded colors) so dark-theme consistency holds automatically.

## Theme

The visual language (near-black background, one accent color reserved for
"running" state, status colors for done/error/waiting-on-human, node type
tints, animated edges) is defined once as CSS variables + Tailwind v4 `@theme`
tokens in `src/index.css`, and consumed by every canvas node, badge, and meter
in the app rather than redefined per component.
