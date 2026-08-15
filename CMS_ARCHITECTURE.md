# NSDC VCET — CMS Admin Panel Architecture Analysis

## 1. Current Architecture

**Framework:** Next.js 16 (App Router) · React 19 · TypeScript 5 strict mode  
**Database:** MongoDB Atlas via Mongoose 8  
**Auth:** NextAuth v5 (JWT sessions, 8hr, credentials provider, bcryptjs)  
**Styling:** TailwindCSS v4 · dark theme (`bg-[#06060a]`) · Lucide icons  
**Media:** Cloudinary (direct browser upload via signed URL, metadata in DB)  
**Infra:** Vercel-compatible serverless routes  
**Extras:** Zod validation · xlsx export · jsPDF certificates · Framer Motion · rate-limit

The platform is a **hackathon/event CRM** for VCET NSDC chapter — creates events, collects team registrations with payment screenshots, approves/rejects, issues certificates.

---

## 2. Repository Map

```
src/
├── app/
│   ├── (pages)/              # Public site group layout
│   │   ├── contact/          # Contact form (hardcoded)
│   │   ├── events/           # Events listing + [slug] dynamic page
│   │   ├── register/         # Registration CLOSED page (hardcoded text)
│   │   ├── socials/          # Social links (hardcoded)
│   │   └── team/             # Team page (hardcoded or CMS?)
│   ├── admin/                # Protected admin panel
│   │   ├── layout.tsx        # AdminShell wrapper (role from session)
│   │   ├── page.tsx          # Dashboard — stats
│   │   ├── audit/            # Audit log table
│   │   ├── cms/              # CMS CRUD (7 types accordion)
│   │   ├── events/           # Event list + new + [id]/edit
│   │   ├── registrations/    # Registration table + modal
│   │   ├── settings/         # Business + Technical settings
│   │   ├── system/           # Health check
│   │   └── team/             # Team members (CMS wrapper)
│   ├── api/
│   │   ├── admin/
│   │   │   ├── audit/        # GET audit log
│   │   │   ├── cms/[type]/   # GET list, POST upsert
│   │   │   ├── cms/[type]/[id]/ # PATCH publish, DELETE
│   │   │   ├── events/       # GET list, POST create
│   │   │   ├── events/[id]/  # GET, PATCH, DELETE
│   │   │   ├── export/       # GET xlsx export
│   │   │   ├── registrations/ # GET paginated+filtered
│   │   │   ├── registrations/[id]/ # PATCH approve/reject/waitlist
│   │   │   ├── screenshot/[id]/ # GET payment screenshot
│   │   │   ├── settings/[scope]/ # GET/PATCH business|technical
│   │   │   └── system/health/ # GET system status
│   │   ├── auth/[...nextauth]/ # NextAuth handlers
│   │   ├── certificates/     # GET by email, GET by id
│   │   ├── cms/[type]/       # PUBLIC: list published content
│   │   ├── contact/          # POST contact form
│   │   ├── events/           # PUBLIC: GET published events
│   │   ├── events/[slug]/    # PUBLIC: GET single event
│   │   ├── media/            # POST record asset, POST sign upload
│   │   ├── register/         # PUBLIC: POST new registration
│   │   └── settings/business/ # PUBLIC: GET business settings
├── auth.ts / auth.config.ts  # NextAuth config
├── middleware.ts              # Admin route protection
├── models/                   # Mongoose schemas (12 models)
├── server/
│   ├── http.ts               # Response helpers (ok/fail/paginated)
│   ├── services/             # Business logic layer
│   └── validation/           # Zod schemas
├── config/
│   ├── roles.ts              # FACULTY_ADMIN | DEVELOPER_ADMIN
│   └── permissions.ts        # 20 permissions + role→permission map
├── lib/                      # Utilities
├── components/
│   ├── admin/                # AdminShell, Sidebar, TopBar, EventForm, LoginForm
│   ├── events/dynamic/       # SectionRenderer (data-driven event page)
│   └── ui/                   # Input, Label, Button, etc.
└── data/
    ├── events.ts             # HARDCODED static events array + JSON import
    └── team.ts               # (assume hardcoded team data)
```

---

## 3. Data Model

```
User
  _id, name, email, passwordHash
  role: FACULTY_ADMIN | DEVELOPER_ADMIN
  isActive, lastLoginAt, createdBy
  └─ creates/updates → Events, CmsContent

Event
  _id, title, slug, status (draft|published|archived)
  startsAt, endsAt, venue, summary, content, coverImage
  gallery: string[]
  themeId → EventTheme
  registration: {
    enabled, opensAt, closesAt
    formSchemaId → FormSchema   ← dynamic form support (underused)
    teamConfig: {min, max}
    fee, currency, requiresPayment, requiresApproval
  }
  sponsors: [{name, logo, tier, url}]
  faqs: [{q, a}]
  highlights: string[]
  createdBy, updatedBy → User

EventTheme
  _id, name, slug, category (hackathon|workshop|webinar|bootcamp|competition|custom)
  layout: { sections: [{type, enabled, order, config}] }
  isActive, createdBy
  SectionType: hero|about|schedule|sponsors|gallery|faq|register

FormSchema
  _id, name, version
  fields: [{
    key, label
    type: text|email|phone|select|number|file|checkbox|textarea
    required, options[], validation: {min, max, pattern}
    conditional: {fieldKey, equals}    ← conditional logic already modeled!
  }]
  createdBy

Registration
  _id, eventId → Event (optional — legacy regs have no eventId)
  squadName, domain
  leader: {fullName, email, phone, college}
  members: [{fullName, email}]
  transactionId, paymentScreenshot (base64)
  paymentProof → MediaAsset (Cloudinary ref, migration path)
  payment: {status: submitted|verified|rejected, verifiedBy, verifiedAt, note}
  status: pending|approved|rejected|waitlisted
  reviewedBy, reviewedAt → User
  certificateEligible: boolean

Certificate
  certificateNumber, name, product, email, date
  imageData (base64), status: generated|downloaded|shared
  downloadCount, shareCount, lastAccessed

CmsContent
  _id, type: team|faq|sponsor|announcement|social|page|gallery
  key (optional slug), status: draft|published
  order, data: Record<string, unknown>
  version, versions: [{version, data, publishedAt, publishedBy}]
  publishedAt, createdBy, updatedBy

MediaAsset
  _id, provider: cloudinary, publicId, url, secureUrl
  type: image|video|pdf
  width, height, bytes, folder
  uploadedBy → User
  refType: registration_proof|event_cover|gallery|sponsor|certificate|cms
  refId: ObjectId

Settings
  scope: business|technical
  data: Record<string, unknown>   ← flexible key-value store

AuditLog
  actorId → User, actorRole, action
  resource: {type, id}
  before, after (snapshots)
  ip, userAgent, createdAt

LoginAttempt  (brute-force protection)
Message       (contact form submissions)
```

---

## 4. Current User Flow

**Public Users:**
1. Visit `/` → hardcoded homepage
2. Visit `/events` → fetches `GET /api/events` → lists published DB events + static data
3. Visit `/events/[slug]` → fetches event by slug → `SectionRenderer` (data-driven sections from EventTheme)
4. Visit `/register` → currently shows "registrations full" hardcoded page
5. (Old flow) → `/register` had `RegisterForm` → `POST /api/register` → base64 screenshot saved

**Admin Flow:**
1. `/admin/login` → credentials → NextAuth session → JWT with role
2. Middleware protects `/admin/*` — redirects to login if no session
3. Admin sees dashboard → stats from parallel API calls
4. Events: list → create (EventForm) → publish
5. Registrations: table with domain/status filters → modal → approve/reject → updates DB
6. CMS: accordion per type → draft/publish workflow
7. Settings: business (UPI ID, reg open) + technical (maintenance, debug)
8. Audit: paginated log of all admin actions
9. System: health check (DB connected, document counts, uptime)

---

## 5. Current Admin Capabilities (What Exists)

| Module | Status |
|--------|--------|
| Login (credentials + lockout) | ✅ Done |
| Dashboard (stats, DB status) | ✅ Done |
| Event CRUD (list/create/edit/delete) | ✅ Done |
| Event status (draft/published/archived) | ✅ Done |
| Registration table (filter/paginate) | ✅ Done |
| Registration approval (approve/reject/waitlist) | ✅ Done |
| Payment screenshot viewer | ✅ Done |
| Registration export (xlsx) | ✅ Done |
| CMS (7 types: team/faq/sponsor/announcement/social/page/gallery) | ✅ Done |
| CMS draft → publish workflow | ✅ Done |
| CMS versioning + version storage | ✅ Model exists, no UI |
| CMS version restore | ✅ Service exists, no UI |
| Settings (business + technical) | ✅ Done |
| Audit log (paginated) | ✅ Done |
| System health | ✅ Done |
| Team management (via CMS team type) | ✅ Done |
| Cloudinary upload signing | ✅ API done, no admin UI uploader |
| Media asset recording | ✅ API done, no media library UI |
| Certificate issuance | ✅ API done, no admin management UI |
| EventTheme management | ✅ Model + DB, no admin UI |
| FormSchema builder | ✅ Model + DB, no admin UI |
| User/admin management | ❌ No UI, no API |
| Contact form messages inbox | ❌ No UI |
| Public registration form (live) | ❌ Hardcoded closed |
| Analytics/charts | ❌ None |
| Scheduled publish/unpublish | ❌ Not implemented |
| Media library browser | ❌ No UI |

---

## 6. Missing Admin Capabilities (What Needs Building)

### HIGH PRIORITY — Core Business Operations

**A. User/Admin Management**
- List all admin users, create new (FACULTY only), deactivate
- No current API — needs `GET/POST /api/admin/users`, `PATCH /api/admin/users/[id]`

**B. EventTheme Builder UI**
- Model fully defined. Section types: hero, about, schedule, sponsors, gallery, faq, register
- Admin needs: create theme, enable/disable/reorder sections, configure sections
- Links to event via `event.themeId`

**C. FormSchema Builder UI**
- Model fully defined with conditional fields, validation, 8 field types
- Admin needs drag-drop field builder, preview, link to event's `registration.formSchemaId`
- This unlocks dynamic registration forms instead of hardcoded RegisterForm

**D. Dynamic Registration Form (Public)**
- `/register` currently hardcoded "registrations full"
- When `event.registration.enabled && event.registration.formSchemaId` → render dynamic form
- Needs `GET /api/events/[slug]/form-schema` → public

**E. Media Library**
- `MediaAsset` model fully defined. Cloudinary signed upload API exists.
- Admin needs: browse assets, upload, copy URL, delete, filter by refType

**F. Certificate Admin**
- APIs exist at `/api/certificates`
- Admin needs: list certs, bulk generate, search by email, view status

**G. Registration Analytics**
- Real data available in DB — just needs aggregation queries
- Registrations by domain, by date, by status, conversion rates

**H. Contact Messages Inbox**
- `Message` model exists, contact form posts to `/api/contact`
- Admin needs: list messages, mark read, respond

### MEDIUM PRIORITY

**I. CMS Version History UI**
- Model stores versions array. `cmsService` has restore logic.
- Needs: version timeline, diff view, restore button

**J. Audit Log Filter/Search**
- Current: paginated only. Needs: filter by action, actor, resource type, date range

**K. Registration Search**
- Current: filter by domain+status only. Needs: search by name/email/college/txn ID

**L. Scheduled Publishing**
- EventModel already has `opensAt`/`closesAt` on registration sub-doc
- Extend: `publishAt`/`unpublishAt` on Event itself, cron-style scheduler

### LOWER PRIORITY

**M. Event Gallery Management** — upload multiple images to event.gallery[]  
**N. Event Sponsors Management** — inline sponsor editor in EventForm  
**O. Certificate Eligibility Toggle** — bulk mark `certificateEligible` on registrations  
**P. Payment Status Actions** — verify-payment / reject-payment actions (API exists, no UI)

---

## 7. Proposed CMS Architecture

The new admin CMS extends the existing system — no schema replacement, no auth replacement.

### Navigation Structure

```
DASHBOARD
  Overview (existing, enhanced with charts)

EVENTS
  All Events          — existing list + EventTheme column
  Create Event        — existing EventForm + Theme picker + FormSchema picker
  Event Themes        — NEW: theme builder
  Form Builder        — NEW: FormSchema builder

REGISTRATIONS
  All Registrations   — existing table + search + payment verification
  Analytics           — NEW: charts (by domain, by date, by status)

CONTENT (CMS)
  Content Manager     — existing 7-type accordion
  Media Library       — NEW: Cloudinary asset browser
  Messages            — NEW: contact form inbox

PEOPLE
  Admin Users         — NEW: user list + create + deactivate

SYSTEM
  Settings            — existing (business + technical)
  Audit Log           — existing + filter/search
  System Health       — existing
  Certificates        — NEW: list + search + bulk ops
```

### Key Architectural Principles

1. **No schema migrations for CRUD modules** — all required models already exist
2. **FormSchema → dynamic public registration** — when linked, `/register` renders schema-driven form
3. **EventTheme → data-driven public event pages** — already working via SectionRenderer; admin just needs builder UI
4. **Public site reads from DB** — events page, event detail, CMS content all already data-driven
5. **Hardcoded data in `src/data/events.ts`** — legacy; new events should come entirely from EventModel. This file should be sunset gradually.
6. **Cloudinary direct upload** — signed URL flow already implemented; media library UI just needs to call existing APIs

---

## 8. Database Changes Required

| Change | Type | Reason |
|--------|------|--------|
| Event: add `publishAt?: Date`, `unpublishAt?: Date` | Schema extend | Scheduled publishing |
| Event: add `tags: string[]` | Schema extend | Searchability |
| AuditLog: index on `action` + `createdAt` compound | Index add | Filtered audit queries |
| Registration: add `searchIndex` on `leader.email + squadName` | Index add | Registration search |
| NO model replacements | — | All business entities covered |

**No breaking changes.** All additions are optional fields or new indexes.

---

## 9. API / Server Actions Required

### New APIs Needed

```
# Users
GET    /api/admin/users               registration:read(?) → admin:manage
POST   /api/admin/users               admin:manage (Faculty only)
PATCH  /api/admin/users/[id]          admin:manage

# Event Themes
GET    /api/admin/themes              theme:manage
POST   /api/admin/themes              theme:manage
PATCH  /api/admin/themes/[id]         theme:manage
DELETE /api/admin/themes/[id]         theme:manage

# Form Schemas
GET    /api/admin/form-schemas        cms:write
POST   /api/admin/form-schemas        cms:write
PATCH  /api/admin/form-schemas/[id]   cms:write
DELETE /api/admin/form-schemas/[id]   cms:write

# Media
GET    /api/admin/media               media:upload
DELETE /api/admin/media/[id]          media:delete

# Messages
GET    /api/admin/messages            admin:manage (Faculty)
PATCH  /api/admin/messages/[id]       admin:manage

# Certificates (admin)
GET    /api/admin/certificates        certificate:manage
POST   /api/admin/certificates/bulk   certificate:manage

# Analytics
GET    /api/admin/analytics/registrations   registration:read

# CMS Version History (UI for existing service)
GET    /api/admin/cms/[type]/[id]/versions  cms:read
POST   /api/admin/cms/[type]/[id]/restore   cms:publish

# Public: Dynamic Form Schema
GET    /api/events/[slug]/registration-form   public
```

### Existing APIs Enhanced

```
GET /api/admin/registrations → add ?search=, ?eventId=
GET /api/admin/audit         → add ?action=, ?actorId=, ?from=, ?to=
```

---

## 10. Admin Navigation (Information Architecture)

```
/admin                          Dashboard (stats + quick actions)

/admin/events                   Events list
/admin/events/new               Create event
/admin/events/[id]/edit         Edit event
/admin/themes                   Event themes list
/admin/themes/new               Create theme
/admin/themes/[id]/edit         Edit theme + section builder
/admin/form-schemas             Form schemas list
/admin/form-schemas/new         Create form schema
/admin/form-schemas/[id]/edit   Field builder

/admin/registrations            Registrations table + modal
/admin/registrations/analytics  Registration analytics

/admin/cms                      CMS accordion (7 types)
/admin/media                    Media library
/admin/messages                 Contact form inbox

/admin/users                    Admin user management

/admin/certificates             Certificate list + ops
/admin/settings                 Business + Technical settings
/admin/audit                    Audit log (filterable)
/admin/system                   System health
/admin/login                    Login
```

---

## 11. Event Creation Flow (Full Admin Workflow)

```
1. BASIC INFO
   Title → auto-slug
   Status: draft (default)
   Summary (≤500 chars)
   Full Content (Markdown)

2. THEME SELECTION
   Pick EventTheme or use defaults
   Theme controls: which sections appear + order
   (hero, about, schedule, sponsors, gallery, faq, register)

3. SCHEDULE & LOCATION
   Starts At / Ends At (datetime-local)
   Registration Opens / Closes (datetime-local)
   Venue (text)
   Online/Offline/Hybrid

4. MEDIA
   Cover Image → Cloudinary uploader (signed URL flow)
   Gallery Images → multi-upload or URL array

5. REGISTRATION CONFIG
   Enable toggle
   Fee + currency
   Requires Payment: yes/no
   Requires Approval: yes/no
   Team Size: min/max
   Form Schema: pick from FormSchema library OR use default fields

6. CONTENT SECTIONS
   Sponsors: inline add/remove/reorder {name, logo, tier, url}
   Highlights: add/remove bullet list
   FAQs: add/remove {q, a}

7. PREVIEW
   Opens public event URL in preview mode (draft visible to admin)

8. PUBLISH
   status → published
   Audit logged
```

---

## 12. Registration Form Builder Architecture

```
FormSchema (DB model, already exists):
  name: string
  version: number
  fields: IFormField[]

IFormField:
  key: string          unique field identifier
  label: string
  type: text|email|phone|select|number|file|checkbox|textarea
  required: boolean
  options: string[]    (for select)
  validation: {min, max, pattern}
  conditional: {fieldKey, equals}   ← "show this field IF field X = value Y"

Admin Builder UI:
  - Drag-drop reorder fields
  - Add field button → type picker
  - Per-field: label, required toggle, options (if select), validation, conditional
  - Preview pane showing live form render
  - Save → creates/updates FormSchema in DB

Event linking:
  event.registration.formSchemaId = formSchema._id

Public form render:
  GET /api/events/[slug]/registration-form → returns FormSchema fields
  Frontend renders <DynamicForm fields={fields} onSubmit={...} />
  DynamicForm handles text/select/file/checkbox/textarea/conditional visibility

Currently: RegisterForm.tsx is completely hardcoded (squad name, domain dropdown,
leader + 2 members, payment). This needs to be replaced with DynamicForm driven
by FormSchema, with domain options coming from event config.
```

---

## 13. Security Model

### Authentication
- NextAuth v5 JWT sessions (8hr max age)
- Credentials provider with bcryptjs password verification
- Brute-force protection: `LoginAttempt` model, 5 attempts → lockout

### Authorization
- `requirePermission(permission)` server-side guard on every route handler
- Never trusts client-side role — session JWT verified server-side
- Middleware (`middleware.ts`) blocks `/admin/*` without valid session

### RBAC
```
FACULTY_ADMIN → ALL 20 permissions (full control)
DEVELOPER_ADMIN → 9 permissions:
  system:health, system:logs, audit:read, settings:technical,
  event:create, event:update, cms:read, registration:read, media:upload
```

### New permissions needed (additive):
```
'admin:manage'       → already in permissions.ts → assigned to FACULTY_ADMIN
'theme:manage'       → already in permissions.ts → FACULTY_ADMIN
'media:delete'       → already in permissions.ts → FACULTY_ADMIN
'certificate:manage' → already in permissions.ts → FACULTY_ADMIN
```

All existing permissions already cover the new modules. No permission schema changes needed.

### Audit Trail
Every state-changing admin operation → `AuditLog` entry with:
- actorId, actorRole, action, resource {type, id}
- before + after snapshots (where applicable)
- ip, userAgent

### Data Safety
- Payment screenshots: never sent in list API (excluded via projection). Only fetched one-at-a-time via `/api/admin/screenshot/[id]`
- Settings: business settings publicly readable; technical settings require `settings:technical`
- XSS: content stored as-is; rendering via React (auto-escaping). Rich text should be sanitized before HTML render.
- File uploads: size-limited (5MB), type-checked, stored as base64 (migration path to Cloudinary MediaAsset)

---

## 14. Implementation Roadmap

### Milestone 1 — Admin User Management (2 APIs + 1 page)
```
POST   /api/admin/users              (Faculty: create admin)
GET    /api/admin/users              (Faculty: list all)
PATCH  /api/admin/users/[id]         (Faculty: toggle active / change role)
/admin/users page                    (table + create form + deactivate)
```
Zero schema changes. Builds on existing User model.

### Milestone 2 — Event Theme Builder (2 APIs + 2 pages)
```
GET/POST  /api/admin/themes
PATCH/DELETE /api/admin/themes/[id]
/admin/themes page                   (list with category + active badge)
/admin/themes/new + [id]/edit        (section enable/disable/reorder)
EventForm: add Theme picker dropdown
```

### Milestone 3 — FormSchema Builder (2 APIs + 2 pages)
```
GET/POST  /api/admin/form-schemas
PATCH/DELETE /api/admin/form-schemas/[id]
/admin/form-schemas page             (list)
/admin/form-schemas/[id]/edit        (drag-drop field builder)
EventForm: add Form Schema picker
```

### Milestone 4 — Dynamic Public Registration
```
GET /api/events/[slug]/registration-form  (public, returns schema)
src/components/DynamicRegistrationForm.tsx (renders schema fields)
/register or /events/[slug]/register      (dynamic form page)
Replaces hardcoded RegisterForm.tsx
```

### Milestone 5 — Media Library
```
GET /api/admin/media                 (paginated, filtered by refType)
DELETE /api/admin/media/[id]         (delete from Cloudinary + DB)
/admin/media page                    (grid view, upload button, copy URL)
Cloudinary uploader component (uses /api/media/sign → direct upload)
```

### Milestone 6 — Registration Enhancements
```
Add search param to GET /api/admin/registrations
/admin/registrations: add search input + payment verify action
/admin/registrations/analytics: charts (registrations by domain/date/status)
```

### Milestone 7 — CMS Version History UI
```
GET  /api/admin/cms/[type]/[id]/versions
POST /api/admin/cms/[type]/[id]/restore
/admin/cms: add version history drawer per item
```

### Milestone 8 — Contact Messages Inbox
```
GET   /api/admin/messages
PATCH /api/admin/messages/[id]       (mark read)
/admin/messages page                 (table + detail view)
```

### Milestone 9 — Certificate Management
```
GET  /api/admin/certificates         (paginated, search by email/name)
POST /api/admin/certificates/bulk    (batch generate from approved regs)
/admin/certificates page             (table + search + bulk ops)
```

### Milestone 10 — Scheduled Publishing + Analytics
```
Event model: add publishAt/unpublishAt fields
EventForm: scheduled publish datetime pickers
GET /api/admin/analytics/registrations → daily counts, domain breakdown
/admin dashboard: add mini-chart for registrations over time
Audit filter/search enhancements
```

---

## Key Hardcoded → CMS Migration Targets

| Currently Hardcoded | Should Become |
|---------------------|---------------|
| `src/data/events.ts` static array | Events from MongoDB only |
| `/register` "registrations full" text | Driven by `Settings.business.registrationOpen` + active event |
| UPI ID `varunsoni998@okaxis` in RegisterForm | `Settings.business.upiId` |
| Payment amount "150 Rs" in RegisterForm | `event.registration.fee` |
| Domain options in RegisterForm dropdown | `FormSchema` field options |
| WhatsApp group link in success message | `Settings.business.*` or CMS |
| Team size "2 to 3 members" in RegisterForm | `event.registration.teamConfig.{min,max}` |
| Contact page content | CMS `page` type |
| Social links | CMS `social` type (already model exists) |
| Team page members | CMS `team` type (already wired) |

---

## Summary: What to Build vs What Exists

**Already solid (do not rebuild):**
- Auth, RBAC, session, middleware
- Event CRUD APIs + validation
- Registration approval flow + audit
- CMS 7-type system (model, API, service)
- Settings (business + technical) system
- Audit log
- Cloudinary signed upload infrastructure
- SectionRenderer (data-driven event pages)
- EventTheme + FormSchema models

**Build new UI on top of existing infra:**
- User management page + 3 API endpoints
- EventTheme builder page + CRUD API
- FormSchema builder page + CRUD API

**Build new UI + new API:**
- Media library page + GET/DELETE media API
- Messages inbox page (model exists, no admin API)
- Certificate admin page (public API exists, no admin API)
- Registration analytics page (data exists, no aggregation API)
- CMS version history UI (service exists, no UI or version API)

**Replace hardcoded with data-driven:**
- `/register` page → DynamicRegistrationForm from FormSchema
- Static events data → purely from EventModel

**Additive schema changes only:**
- Event: add `publishAt`, `unpublishAt`, `tags`
- No destructive changes to any model
