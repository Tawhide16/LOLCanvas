# LOLCanvas® — Memes That Make Noise
### Editorial Meme Archive & Full-Screen Canvas Editor

[![Next.js](https://img.shields.io/badge/Next.js-16.4.0-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.3.0-blue?logo=react)](https://react.dev/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)](https://www.postgresql.org/)
[![Neon](https://img.shields.io/badge/Neon-Serverless_Postgres-00E599?logo=neon)](https://neon.tech/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend_&_Storage-3ECF8E?logo=supabase)](https://supabase.com/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?logo=docker)](https://www.docker.com/)

**LOLCanvas®** is an editorial, 100% watermark-free meme template archive and in-browser canvas editor. Built around a Swiss architectural grid and modern neo-brutalist visual language, it provides creators with studio-grade tools to craft, layer, crop, rotate, and export memes with zero forced watermarks.

---

## 👑 Recruiter & Developer Reviewer Access (Admin Credentials)

> **For Hiring Managers & Code Reviewers**:  
> To test the **Admin Command Center**, moderation workflows, and **Role-Based Access Control (RBAC)** without manual setup, use the pre-configured credentials below:
>
> | Credential / Route | Value |
> |---|---|
> | **Login Page** | [`/login`](http://localhost:3002/login) |
> | **Admin Command Center** | [`/admin`](http://localhost:3002/admin) |
> | **Admin Email** | `admin123@gmail.com` |
> | **Admin Password** | `admin123` |
> | **Assigned Role** | `SUPER_ADMIN` *(Highest Tier: Full System & Audit Access)* |
>
> *Seed or reset command:* `node prisma/seed-admin.js`

---

## ✦ Key Features

- **👑 Role-Based Access Control (RBAC) & Admin Command Center (`/admin`)**:
  - **4-Tier Permission Architecture**: `CREATOR` → `CURATOR` → `ADMIN` → `SUPER_ADMIN`.
  - **Full Admin Suite**: Live telemetry & stats, template approval pipeline, user role promotion/suspension, audit trail logging, and meme moderation.
  - **Immediate Reviewer Access**: Pre-seeded demo credentials (`admin123@gmail.com` / `admin123`) ready for recruiters and technical evaluators.
- **Full-Screen Immersive Canvas Editor (`100vw × 100vh`)**: Fixed viewport layout without scrollbars, housing a canvas workbench with live zooming, snapping, and undo/redo history.
- **Multi-Image Overlay & Transformation Engine**:
  - Ingest any image from your computer directly on top of active memes.
  - **Move**: Direct canvas mouse drag or granular `POS X` / `POS Y` sliders.
  - **Rotate**: Full `-180°` to `+180°` angle controls and quick `90°` steps.
  - **Crop & Mask**: `1:1 Square`, `16:9 Widescreen`, and granular percentage sliders.
  - **Scale & Flip**: Seamless scaling (`0.2x` to `3.0x`) and horizontal / vertical flipping.
- **Preset Libraries**: 1-click overlays (Thug Life shades, Doge heads, Laser Eyes, Flame emojis) and platform canvas aspect ratios (Instagram, TikTok, YouTube Shorts, X/Twitter).
- **Clean PNG Exports**: 100% watermark-free high-resolution PNG generation and direct-to-clipboard copying.
- **Enterprise Database & Cloud Storage Ready**: Full integration with **Prisma ORM**, **PostgreSQL**, **Neon Serverless**, and **Supabase** (Database + Storage + Auth).
- **Modern Modular Backend Architecture**:
  - **Zod**: Strict runtime data validation for canvas layers, captions, templates, and auth.
  - **Redis Caching**: Sub-millisecond response caching for trending templates and queries.
  - **JWT Authentication**: Stateless authentication with `jose` and HTTP-only secure session cookies.
  - **Multi-Tier RBAC**: `CREATOR`, `CURATOR`, `ADMIN`, `SUPER_ADMIN` authorization guards.
  - **Rate Limiting**: Sliding window protection against DDoS, bot scraping, and upload flooding.
- **Containerized**: Production-ready **Dockerfile** (multi-stage) and **Docker Compose** with local PostgreSQL service.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (Turbopack, App Router, React 19) |
| **Validation** | Zod v3 |
| **Authentication & RBAC** | Stateless JWT (`jose`), BCrypt password hashing, Multi-Role Access Control |
| **Caching & Rate Limiting** | Redis (Upstash) with In-Memory fallback, Sliding Window Limiter |
| **Styling** | Swiss Neo-Brutalist Design System, TailwindCSS v4, Vanilla CSS |
| **Animation** | Framer Motion |
| **Icons** | Lucide React |
| **ORM** | Prisma ORM |
| **Database** | PostgreSQL, Neon DB (Serverless), Supabase Postgres |
| **Storage & Auth** | Supabase Storage (`@supabase/supabase-js`) |
| **DevOps / Containers** | Docker (Node 20 Alpine), Docker Compose |

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js `20.x` or higher
- npm, pnpm, or yarn
- Git

### 1. Clone & Install
```bash
git clone https://github.com/Tawhide16/LOLCanvas.git
cd LOLCanvas
npm install
```

### 2. Configure Environment Variables
Copy the example environment file:
```bash
cp .env.example .env
```
Update `.env` with your database and Supabase keys (see [Database Configuration](#-database-configuration)).

### 3. Generate Prisma Client
```bash
npx prisma generate
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) (or the port displayed in terminal) in your browser.

---

## 🐳 Docker Deployment

LOLCanvas includes a multi-stage `Dockerfile` and `docker-compose.yml` that provisions both the Next.js web application and a local PostgreSQL database with healthchecks and persistent volumes.

### Run with Docker Compose
```bash
# Build and start all containers in background
docker compose up -d --build

# View logs
docker compose logs -f

# Stop containers
docker compose down
```

The app will be accessible at `http://localhost:3000` and PostgreSQL at `localhost:5432`.

---

## 🗄 Database Configuration

LOLCanvas supports three PostgreSQL options through Prisma ORM:

### Option A: Local / Docker PostgreSQL
```env
DATABASE_URL="postgresql://lolcanvas:lolcanvas_secret@localhost:5432/lolcanvas_db?schema=public"
```

### Option B: Neon DB (Serverless Postgres)
[Neon](https://neon.tech) provides serverless PostgreSQL with connection pooling.

```env
# Connection pooler for serverless queries:
DATABASE_URL="postgresql://[user]:[password]@[endpoint]-pooler.[region].neon.tech/[dbname]?sslmode=require"

# Direct URL for Prisma migrations:
DIRECT_URL="postgresql://[user]:[password]@[endpoint].[region].neon.tech/[dbname]?sslmode=require"
```
*Note: LOLCanvas includes `@neondatabase/serverless` and `@prisma/adapter-neon` pre-configured in [`src/lib/prisma.ts`](src/lib/prisma.ts).*

### Option C: Supabase PostgreSQL
[Supabase](https://supabase.com) provides managed PostgreSQL with built-in Storage and Auth.

```env
# Transaction pooler (Port 6543):
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?sslmode=require"

# Direct connection (Port 5432) for migrations:
DIRECT_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres?sslmode=require"
```

---

## ⚡ Prisma ORM Workflow

Run these commands to manage your database schema and migrations:

```bash
# Generate the Prisma Client
npx prisma generate

# Push schema directly to database (development / prototyping)
npx prisma db push

# Create and apply migrations (production)
npx prisma migrate dev --name init

# Open visual database browser in browser
npx prisma studio
```

### Prisma Schema Models (`prisma/schema.prisma`)
- **`User`**: Creator profiles, roles (CREATOR, CURATOR, ADMIN), collections.
- **`Template`**: Base meme templates with SVG data, tags, categories, and metrics.
- **`Meme`**: User-generated compositions with JSON layer states (positions, rotations, crops).
- **`Collection` & `CollectionItem`**: Curated editorial meme bundles.

---

## ☁️ Supabase Storage & Auth Setup

[`src/lib/supabase.ts`](src/lib/supabase.ts) provides both client-side and server-side utilities for Supabase:

1. Create a project at [supabase.com](https://supabase.com).
2. Create a public Storage bucket named `memes`.
3. Add your keys to `.env`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
   SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
   ```
4. Use `uploadMemeToSupabaseStorage()` in your code to persist user-exported meme files directly to cloud storage.

---

## 📂 Project Architecture

```
LOLCanvas/
├── Dockerfile                   # Multi-stage production container build
├── docker-compose.yml           # Web app + PostgreSQL services
├── .dockerignore                # Build exclusions
├── .env.example                 # Environment variables template
├── prisma/
│   └── schema.prisma            # PostgreSQL / Neon / Supabase schema
├── public/
│   ├── logo-icon.png            # Custom hand-drawn mascot logo
│   └── favicon.ico
├── src/
│   ├── app/
│   │   ├── layout.tsx           # Global root layout & Swiss frame
│   │   ├── page.tsx             # Editorial archive homepage
│   │   ├── edit/                # Canvas editor routing
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── cards/page.tsx       # Archive catalog browse
│   │   ├── collection/page.tsx  # Curated editorial collections
│   │   ├── upload/page.tsx      # Community asset ingestion
│   │   ├── about/page.tsx       # Studio manifesto
│   │   └── contact/page.tsx     # Archive desk contact
│   ├── components/
│   │   ├── editor/              # Full-screen Canvas Editor
│   │   │   ├── EditorClient.tsx # Editor controller & workbench
│   │   │   ├── CanvasStage.tsx  # HTML5 2D interactive canvas renderer
│   │   │   ├── ImageControls.tsx# Move, Crop, Rotate, Scale controls
│   │   │   ├── TextControls.tsx # Typography & captions
│   │   │   └── LayerPanel.tsx   # Layer ordering & stacking
│   │   ├── archive/             # Template grids & meme cards
│   │   ├── home/                # Hero banner & trending dispatch
│   │   └── layout/              # Connected navbar, footer, metadata
│   ├── lib/
│   │   ├── prisma.ts            # Prisma client (Postgres / Neon pooler)
│   │   ├── supabase.ts          # Supabase client & Storage helpers
│   │   ├── data.ts              # Template catalog & initial data
│   │   ├── editorPresets.ts     # Social & video aspect ratios
│   │   └── memeOverlays.ts      # Transparent meme cutout overlays
│   └── types/                   # TypeScript layer & template definitions
└── package.json
```

---

## 📜 Available NPM Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts local Next.js development server |
| `npm run build` | Builds optimized production bundle |
| `npm run start` | Starts production server |
| `npm run prisma:generate` | Generates latest Prisma client |
| `npm run prisma:push` | Syncs schema with PostgreSQL / Neon / Supabase |
| `npm run prisma:migrate` | Runs Prisma migration workflow |
| `npm run prisma:studio` | Launches web UI for database records |
| `node prisma/seed-admin.js` | Seeds the default Super Admin demo account (`admin123@gmail.com`) |

---

## ⚖️ License & Open Archive Policy

All meme templates and exports generated through **LOLCanvas®** are intended to be watermark-free under open culture fair-use commons. Built with pride for creators worldwide.
