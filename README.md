# Pathgrid Agency

A world-class corporate agency platform built with Next.js, TypeScript, Tailwind CSS, and Prisma. Features a complete admin dashboard with CRM pipeline, accounting module, interactive charts, and a client portal.

## Tech Stack

- **Framework:** Next.js 15 (App Router) + TypeScript
- **Styling:** Tailwind CSS 4 + Framer Motion
- **Database:** SQLite (dev) / PostgreSQL (prod) via Prisma ORM
- **Auth:** NextAuth.js (Credentials + OAuth)
- **CMS:** Sanity (optional - can also manage via admin dashboard)
- **Charts:** Recharts
- **i18n:** Custom EN/FR/AR with full RTL support
- **State:** Zustand

## Features

- 🌍 **Trilingual** - English, French, Arabic with RTL layout mirroring
- 🎨 **Dynamic Landing Page** - Animated hero, services, testimonials, CTA
- 📁 **Portfolio** - Sortable case studies with filter by industry
- 📝 **Blog** - SEO-friendly articles with categories
- 📬 **Contact Form** - Functional email submission API
- 🔐 **Authentication** - Login, register, role-based access (admin/staff/client)
- 📊 **Admin Dashboard** - Full CRUD for all data + interactive charts
- 🏆 **CRM Pipeline** - Drag-and-drop Kanban board (Cold → Won/Lost)
- 💰 **Accounting Module** - Income/expense tracking, invoices, profit/loss charts
- 📅 **Calendar** - Event management
- 👥 **Staff Management** - Roles and time tracking
- 🔑 **Client Portal** - Project tracking, invoices, messaging, asset downloads
- 🌙 **Dark/Light Mode** - Theme toggle
- 📱 **Fully Responsive** - Mobile-optimized
- 🚀 **Vercel Ready** - Optimized for deployment

## Getting Started

### 1. Clone & Install

```bash
git clone <repo-url>
cd pathgrid
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env` and configure:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

For SQLite (default), no database setup is needed. For PostgreSQL, update the URL.

### 3. Database Setup

```bash
npx prisma generate
npx prisma db push
```

### 4. Seed Data

```bash
npm run seed
```

This creates:
- **Admin:** admin@pathgrid.agency / admin123
- **Client:** john@techventures.com / client123
- Sample services, portfolio, blog posts, testimonials, leads, invoices

### 5. Run Development

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Project Structure

```
├── prisma/                  # Database schema
├── public/locales/          # i18n translation files (en, fr, ar)
├── sanity/schemas/          # Sanity CMS schema definitions
├── scripts/                 # Seed and utility scripts
├── src/
│   ├── app/
│   │   ├── [locale]/        # Localized routes
│   │   │   ├── page.tsx     # Homepage
│   │   │   ├── about/       # About page
│   │   │   ├── services/    # Services page
│   │   │   ├── portfolio/   # Portfolio page
│   │   │   ├── blog/        # Blog pages
│   │   │   ├── contact/     # Contact page
│   │   │   ├── auth/        # Login, register, reset password
│   │   │   ├── admin/       # Admin dashboard (CRUD, pipeline, accounting)
│   │   │   └── client-portal/ # Client portal
│   │   └── api/             # API routes
│   ├── components/
│   │   ├── ui/              # Reusable UI components
│   │   ├── layout/          # Header, footer, navigation
│   │   ├── home/            # Homepage sections
│   │   ├── admin/           # Admin sidebar, tables
│   │   ├── charts/          # Dashboard charts
│   │   └── pipeline/        # Kanban board
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utilities (auth, prisma, i18n, sanity)
│   ├── store/               # Zustand state management
│   ├── types/               # TypeScript types
│   └── middleware.ts        # i18n routing
├── vercel.json              # Vercel deployment config
└── package.json
```

## Admin Dashboard

Access at `/en/admin/dashboard` after logging in with admin credentials.

### Sections:
- **Dashboard** - Stats overview with interactive charts (revenue, pipeline, traffic)
- **Services** - CRUD for service offerings
- **Portfolio** - Manage case studies
- **Blog** - Write and publish articles
- **Team** - Manage team members
- **Testimonials** - Client testimonials
- **Clients** - Client management
- **Pipeline** - Drag-and-drop Kanban CRM
- **Accounting** - Income/expense tracking, invoices, P&L charts
- **Invoices** - Invoice management
- **Calendar** - Event scheduling
- **Staff** - Staff roles and hours
- **Settings** - Theme, site name, security

## Client Portal

Clients can log in at `/en/client-portal` to:
- View project progress
- Download invoices (PDF)
- Send messages
- Download assets and reports

## API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/contact` - Contact form submission
- `POST /api/seed` - Seed database with sample data

## i18n & Localization

Three languages supported:
- **English** (LTR)
- **French** (LTR)
- **Arabic** (RTL)

Translation files: `/public/locales/{en,fr,ar}.json`
Layout automatically mirrors for RTL when Arabic is selected.
Dedicated Arabic font (Noto Naskh Arabic) loaded for Arabic locale.

## Deployment on Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Connect to Vercel

- Import repository
- Set environment variables in Vercel dashboard:
  - `DATABASE_URL` - Use a PostgreSQL provider (e.g., Neon, Supabase)
  - `NEXTAUTH_SECRET` - Generate with `openssl rand -base64 32`
  - `NEXTAUTH_URL` - Your Vercel domain

### 3. Deploy

Vercel auto-deploys from the `main` branch.

The `vercel.json` automatically runs Prisma migrations during build.

## Sanity CMS (Optional)

To use Sanity as a headless CMS:

1. Create a Sanity project at [sanity.io](https://sanity.io)
2. Set environment variables:
   - `NEXT_PUBLIC_SANITY_PROJECT_ID`
   - `NEXT_PUBLIC_SANITY_DATASET`
   - `SANITY_API_TOKEN`
3. Deploy Sanity Studio by running `npx sanity deploy` in the `sanity/` directory

## License

MIT
