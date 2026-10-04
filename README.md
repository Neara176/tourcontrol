# Phnom Penh Tour Tracker (Neara Tour)

[![Live Production](https://img.shields.io/badge/Production-Live-success?style=flat&logo=vercel)](https://tourcontrol.vercel.app/)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Neara176%2Ftourcontrol-blue?logo=github)](https://github.com/Neara176/tourcontrol)

Tour booking and pricing management app for Phnom Penh tours. The current application is a Next.js App Router project in `tour-control`; the root `index.html` is the preserved legacy version.

## Features

- Home dashboard with upcoming bookings, calendar, and monthly summaries.
- Booking management with guest details, payment state, expenses, and profit.
- Tour catalog with low/high-season pricing and configurable high-season months.
- Daily, weekly, and monthly financial reports with CSV export.
- Booking detail actions for expenses, cancellation/restoration, deletion, and adding an `.ics` event to iPhone or another calendar.
- JSON backup and restore for moving booking data between browsers or devices.
- Responsive desktop and mobile layouts.
- Supabase Auth and row-level-secured cloud storage for tours, bookings, and season settings.

## Local development

```powershell
cd tour-control
npm ci
npm run dev
```

Open <http://localhost:3000>. Validate a production build with `npm run build`; run lint with `npm run lint`.

### Configure Supabase

Run these commands from the `tour-control` directory:

```powershell
Copy-Item .env.example .env.local
```

1. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in `.env.local` from Supabase Project Settings → API (the legacy anon-key variable is also accepted). These are public client values; never put a service-role key in the app.
2. Run `supabase/schema.sql` in the Supabase SQL Editor. It creates the tables and owner-only row-level security policies.
3. In Supabase Dashboard → Authentication settings, disable **Allow new users to sign up**; then create the owner account under Authentication → Users and sign in at `/login`.
4. For Vercel, set the same two environment variables in Project Settings → Environment Variables.

On the first authenticated visit, existing app-local tours, bookings, and season settings are imported into that owner's cloud account. The legacy `index.html` and Next.js app use separate browser storage origins; use **Report > Save backup file** in one app and **Restore from backup** in the other to move data.

## Deploy the Next.js app on Vercel

The Next.js project is nested in `tour-control`, so configure the Vercel project to use that folder:

1. Import `Neara176/tourcontrol` (or open its existing Vercel project settings).
2. Set **Root Directory** to `tour-control`.
3. Use the Next.js framework preset and the default install/build settings (`npm install` / `npm run build`).
4. Deploy the `main` branch.

If the existing Vercel project is still rooted at the repository root, change its Root Directory before relying on Git pushes to deploy the Next.js application. The root `vercel.json` and `index.html` are for the legacy static app.

Do not commit `.env` files or database credentials. `.env.local` is ignored by Git. Set the two public client variables in Vercel Project Settings; do not add a Supabase service-role key to Vercel for this browser-only integration.
