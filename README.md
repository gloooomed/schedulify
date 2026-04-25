<p align="center">
  <!-- Add your logo here -->
</p>

<h1 align="center">Schedulify</h1>

<p align="center">
  College schedule management as a service. One platform, any college, your own data.
</p>

<p align="center">
  <a href="https://github.com/gloooomed/schedulify/issues/new?labels=bug">Report Bug</a>
  ·
  <a href="https://github.com/gloooomed/schedulify/issues/new?labels=enhancement">Request Feature</a>
</p>

<p align="center">
  <a href="https://github.com/gloooomed/schedulify/stargazers">
    <img src="https://img.shields.io/github/stars/gloooomed/schedulify?style=for-the-badge&labelColor=1a1a2e&color=4f8ef7&label=STARS" alt="Stars" />
  </a>
  <a href="https://github.com/gloooomed/schedulify/forks">
    <img src="https://img.shields.io/github/forks/gloooomed/schedulify?style=for-the-badge&labelColor=1a1a2e&color=4f8ef7&label=FORKS" alt="Forks" />
  </a>
  <a href="LICENSE">
    <img src="https://img.shields.io/badge/LICENSE-PROPRIETARY-red?style=for-the-badge&labelColor=1a1a2e" alt="License" />
  </a>
  <img src="https://img.shields.io/badge/STATUS-EARLY_ALPHA-orange?style=for-the-badge&labelColor=1a1a2e" alt="Status" />
</p>

---

## What it does

- **College ID System** - each college gets a short ID like `DIT-K2X9`. Students and faculty use it to instantly connect - no Supabase URLs, no setup on their end.
- **Setup Wizard** - college IT admins run through a guided setup (database, schema, AI, master admin) in minutes.
- **Role-Based Dashboards** - admins manage everything, faculty see their schedule and courses, students see their timetable and enrollments.
- **Vendor Console** - platform owner dashboard at `/vendor` to track all registered colleges, view their College IDs, and copy shareable login links.
- **Your Data, Your Database** - every college brings their own Supabase project. Schedulify never touches their student data.
- **AI Schedule Parsing** - powered by Groq to parse uploaded schedule files and detect timetable conflicts.

---

## Tech Stack

| Category | Technology |
|---|---|
| Frontend | [![React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev) [![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org) |
| Build | [![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev) |
| Styling | [![CSS](https://img.shields.io/badge/Vanilla_CSS-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS) |
| Auth & DB | [![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com) |
| AI | [![Groq](https://img.shields.io/badge/Groq-F55036?style=for-the-badge&logo=groq&logoColor=white)](https://groq.com) |
| Animations | [![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)](https://www.framer.com/motion) |

---

## How it works

Schedulify can run as a single Vercel deployment but serves multiple colleges. Each college has its own isolated Supabase database - the platform owner never touches their data.

```
Your Vercel Deployment  ──▶  Central Vendor Registry (your Supabase)
                                      │
                    ┌─────────────────┼──────────────────┐
                    ▼                 ▼                  ▼
             College A DB       College B DB       College C DB
             (their Supabase)  (their Supabase)  (their Supabase)
```

---

## Getting Started

> **Note:** Schedulify needs two Supabase projects - one for the vendor registry (yours) and one per college (theirs).

```bash
git clone https://github.com/gloooomed/schedulify.git
cd schedulify
npm install
```

Create a `.env` file:

```env
# Your central registry — tracks all registered colleges
VITE_VENDOR_SUPABASE_URL=your_vendor_supabase_url
VITE_VENDOR_SUPABASE_ANON_KEY=your_vendor_supabase_anon_key

# Secret gate — only share with approved colleges
VITE_VENDOR_ACCESS_CODE=your-secret-access-code
```

Run the vendor registry schema in your Supabase SQL editor — file is at `supabase/vendor_registry_schema.sql`.

```bash
npm run dev
```

Visit `localhost:5173/vendor` and enter your access code to see the vendor console.

---

## Project Structure

```
schedulify/
├── src/
│   ├── components/
│   │   ├── admin/                     # Admin panel components
│   │   │   ├── CoursesManager.tsx     # Manage courses
│   │   │   ├── DepartmentsManager.tsx # Manage departments
│   │   │   ├── ClassroomsManager.tsx  # Manage classrooms
│   │   │   └── UsersManager.tsx       # Add faculty & students
│   │   ├── auth/
│   │   │   └── LoginForm.tsx          # Login screen
│   │   ├── layout/
│   │   │   └── DashboardLayout.tsx    # Sidebar + nav shell
│   │   └── ui/                        # Shared UI primitives
│   ├── hooks/
│   │   └── useAuth.tsx                # Auth context + session
│   ├── lib/
│   │   ├── config/
│   │   │   └── store.ts               # localStorage config store
│   │   ├── groq/
│   │   │   └── client.ts              # Groq AI client
│   │   ├── supabase/
│   │   │   └── client.ts              # Dynamic Supabase client
│   │   ├── vendor/
│   │   │   └── registry.ts            # College registry (lookup, register)
│   │   └── services/
│   │       └── db-service.ts          # DB query helpers
│   ├── pages/
│   │   ├── GatewayPage.tsx            # Entry screen (login / setup)
│   │   ├── SetupWizard.tsx            # College onboarding wizard
│   │   └── VendorDashboard.tsx        # Vendor console
│   ├── types/
│   │   └── index.ts                   # Shared TypeScript types
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css                      # Design tokens + global styles
├── supabase/
│   ├── migrations/
│   │   └── 001_schema.sql             # College DB schema + RLS policies
│   └── vendor_registry_schema.sql     # Vendor registry schema
├── .env.example
├── index.html
├── vite.config.ts
└── package.json
```

---

## Deploying

1. Push to GitHub
2. Import the repo on [Vercel](https://vercel.com)
3. Add your three env vars in Vercel → Settings → Environment Variables
4. Deploy — every `git push` auto-redeploys

Each college runs the setup wizard, brings their own Supabase project, and gets a College ID. Students visit `your-domain.vercel.app?college=THEIR-ID` to log in instantly.

---

## Status

Early alpha — v0.0.1. Core flows work, rough edges still being fixed. Not production-ready yet.

---

## License

Proprietary. All rights reserved. Not open for commercial use or redistribution without permission.
