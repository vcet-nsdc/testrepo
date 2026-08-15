# Admin Panel Rebuild — Update Log

## What Changed

### New Components (`src/components/admin/`)

| File | What it does |
|------|-------------|
| `AdminShell.tsx` | Client wrapper that owns sidebar collapse state; adjusts main content `marginLeft` (15rem expanded / 4rem collapsed) |
| `Sidebar.tsx` | Collapsible sidebar (w-60 / w-16); role-filtered nav; Faculty Admin (Shield) vs Developer (Zap) badge; active route indicator; sign-out button |
| `TopBar.tsx` | Fixed header with dynamic page title (prefix-matched from route map); Search + Bell icon buttons |
| `EventForm.tsx` | Reusable create/edit event form — Basic Info, Schedule & Location, Registration config (toggle, team min/max, fee, payment/approval flags), Highlights list, FAQs list; auto-generates slug from title |
| `LoginForm.tsx` | Rebuilt dark login UI — gradient glow, NSDC logo, email/password, `signIn("credentials")`, specific lock-out error message |

---

### New Pages (`src/app/admin/`)

| Route | File | What it does |
|-------|------|-------------|
| `/admin` | `page.tsx` | Dashboard — parallel fetches health + 4 registration counts (total/pending/approved/rejected); StatCard grid; DB connection badge; Quick Actions grid; skeleton loading |
| `/admin/registrations` | `registrations/page.tsx` | Domain + status filter tabs; paginated table (20/page, URL search params); detail modal with leader info, team members, payment screenshot viewer (blob fetch), approve/reject with optional note; Excel export |
| `/admin/events` | `events/page.tsx` | Events list with status filter (all/published/draft/archived); status icon + badge per row; delete with confirm; link to edit |
| `/admin/events/new` | `events/new/page.tsx` | Thin wrapper rendering `<EventForm />` |
| `/admin/events/[id]/edit` | `events/[id]/edit/page.tsx` | Fetches event via GET API; populates EventForm; uses `use(params)` for async params |
| `/admin/cms` | `cms/page.tsx` | 7 collapsible content type sections (team, faq, sponsor, announcement, social, page, gallery); lazy-loads items on open; inline create/edit forms per type; publish (draft→live) and delete actions |
| `/admin/team` | `team/page.tsx` | Team member grid with photo/avatar initials; inline MemberForm (name, position, email, socials, photo URL, order); publish/unpublish; delete; backed by CMS `team` type |
| `/admin/settings` | `settings/page.tsx` | Two scopes — Business (UPI ID, registration open, contact email/phone) and Technical (maintenance mode, debug logging); form view + JSON view toggle; boolean toggle switches; 403 forbidden state for DEVELOPER_ADMIN on business scope |
| `/admin/audit` | `audit/page.tsx` | Paginated audit log (50/page); action color coding (emerald=create, blue=update, red=delete, teal=publish, violet=settings); immutable display only |
| `/admin/system` | `system/page.tsx` | DB connection banner (emerald/red); document count cards (registrations, events, users, CMS items); runtime cards (uptime, Node.js version, last check timestamp) |
| `/admin/login` | `login/page.tsx` | Redirects authenticated users to `/admin`; renders LoginForm |

---

### Modified Files

| File | Change |
|------|--------|
| `src/app/admin/layout.tsx` | Replaced server-side `AdminNav` with `AdminShell` client component; passes `role` and `name` from session |
| `src/app/api/admin/events/[id]/route.ts` | Added missing `GET` handler (only PATCH + DELETE existed); imports `getEventById` from eventService |

---

### RBAC — Who Sees What

| Section | FACULTY_ADMIN | DEVELOPER_ADMIN |
|---------|:---:|:---:|
| Dashboard | ✅ | ✅ |
| Events (create/edit/delete) | ✅ | ✅ |
| Registrations (approve/reject) | ✅ | ✅ |
| Content (CMS) | ✅ | ❌ (hidden) |
| Team | ✅ | ❌ (hidden) |
| Settings | ✅ | ❌ (hidden from nav; 403 on API) |
| Audit Log | ✅ | ✅ |
| System Health | ✅ | ✅ |

---

### Architecture Decisions

- **No more hardcoded `ml-60`** — sidebar collapse synced via `onCollapse` callback to `AdminShell` which applies inline `marginLeft` style
- **All pages are client components** — fetch their own data via admin API routes (no server-side props leaking layout concerns)
- **CMS upsert pattern** — single `POST /api/admin/cms/[type]` handles both create and update (id in body = update, no id = create)
- **Payment screenshot** — fetched as blob via `/api/admin/screenshot/[id]` and rendered as object URL (never stored in page state as base64)
- **Excel export** — streamed from `/api/admin/export` with domain filter param

---

### What Was NOT Changed

- All existing API routes (data contracts preserved)
- MongoDB models and services
- Auth configuration (`/auth.ts`, NextAuth v5)
- Public-facing pages (`/`, `/events/*`, `/register/*`)
- `src/config/roles.ts` (RBAC config untouched)
- `src/lib/` utilities

---

### Build Status

```
tsc --noEmit   → 0 errors
npm run lint   → 0 errors, 5 pre-existing warnings
```
