# Orbit — work in motion

Orbit is a polished, full-stack Kanban board for small product teams. It pairs a calm editorial interface with the practical details that make a board useful every day: anonymous private workspaces, drag-and-drop status changes, task detail, comments, activity history, teammates, labels, search, filtering, due-date urgency, and live summary stats.

## Product thinking

The brief asks for something closer to Linear or Asana than a generic todo list. The idea is therefore built around three principles:

1. **The board is the home.** The four required stages stay visible, and every card communicates priority, urgency, labels, discussion, and ownership without becoming dense.
2. **Depth appears on demand.** Editing happens in a focused modal; context, comments, and history live in a side drawer. The board remains visually quiet.
3. **A zero-config first run matters.** Without credentials, Orbit starts in a realistic local demo that persists in the browser. With Supabase variables present, it automatically creates an anonymous session and uses the RLS-protected cloud database.

The visual direction is “creative studio operating system”: warm paper, deep ink, a sharp chartreuse accent, editorial typography, fine rules, and small bits of expressive motion. It is intentionally distinct from the usual blue-and-white admin dashboard.

## Included features

- Four required columns: To do, In progress, In review, and Done
- Pointer and keyboard drag-and-drop
- Create, edit, inspect, and delete tasks
- Descriptions, priority, due date, labels, and multiple assignees
- Comments and chronological activity history
- Search plus priority and label filters
- Overdue and due-soon states on cards and in task detail
- Total, completed, overdue, and completion-rate stats
- Lightweight team-member creation
- Loading, error, empty, confirmation, and demo states
- Responsive horizontal-snap board on mobile
- Anonymous Supabase auth and per-user RLS policies
- Persistent offline-friendly demo mode for immediate review

## Stack

- React 19 + TypeScript + Vite
- dnd-kit for accessible drag-and-drop
- Supabase Auth and Postgres
- Plain CSS design system (no component-library visual defaults)
- Vitest for targeted logic tests

## Run locally

Requirements: Node.js 20+ and pnpm 9+ (npm also works).

```bash
pnpm install
pnpm dev
```

Open the URL shown in the terminal. No account or environment variables are needed for demo mode.

## Connect Supabase

1. Create a free Supabase project.
2. In the SQL editor, run [`supabase/schema.sql`](supabase/schema.sql) in full.
3. Open **Authentication → Providers → Anonymous Sign-Ins** and enable it.
4. Copy `.env.example` to `.env.local` and add the project URL and public anon key:

```dotenv
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key
```

5. Restart the development server.

Only the public anon key belongs in the browser. Never expose or commit the service-role key. The schema enables RLS on every app table and checks `auth.uid()` for every data operation.

## Production build

```bash
pnpm test
pnpm build
pnpm preview
```

The generated `dist/` folder can be deployed to Vercel, Netlify, or Cloudflare Pages. Add the same two `VITE_` variables in the hosting provider and use `pnpm build` as the build command with `dist` as the output directory.

## Project structure

```text
src/
  components/       board columns, cards, modal, drawer, people panel
  data/             realistic demo data
  hooks/useBoard    local/Supabase data adapter and mutations
  lib/              Supabase client and formatting helpers
  App.tsx           board composition, filters, drag-and-drop, stats
  styles.css        responsive visual system
supabase/
  schema.sql        tables, indexes, grants, and RLS policies
```

## Tradeoffs and next steps

- Ordering is represented by a `position` field; this version prioritizes cross-column movement over collaborative fine-grained reordering. A production iteration would use fractional ranks and batch updates.
- Team members are intentionally workspace-local personas, not separately authenticated collaborators. Real collaboration would add invitations and organization membership.
- The frontend writes activity events after mutations. A production system should move immutable audit logging into Postgres triggers or an Edge Function.
- Automated coverage targets due-date logic. The next pass would add component interaction tests and a Playwright drag-and-drop flow.
- Realtime subscriptions are not necessary for the single-guest requirement, but are the natural next step for multi-user collaboration.

## Submission checklist

- [ ] Create a public repository or share a private repository link
- [ ] Deploy the frontend and add its URL
- [ ] Verify two separate anonymous browser sessions cannot see each other’s data
- [ ] Add screenshots and the two links to the final assessment document
- [ ] Include `supabase/schema.sql` as the full database schema

