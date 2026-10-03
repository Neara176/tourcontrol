# Phnom Penh Tour Tracker (Neara Tour)

[![Live Production](https://img.shields.io/badge/Production-Live-success?style=flat&logo=vercel)](https://tourcontrol.vercel.app/)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Neara176%2Ftourcontrol-blue?logo=github)](https://github.com/Neara176/tourcontrol)

Tour booking and pricing management app for Phnom Penh tours. The current application is a Next.js App Router project in `tour-control`; the root `index.html` is the preserved legacy version.

## Features

- Home dashboard with upcoming bookings, calendar, and monthly summaries.
- Booking management with guest details, payment state, expenses, and profit.
- Tour catalog with low/high-season pricing and configurable high-season months.
- Daily, weekly, and monthly financial reports with CSV export.
- Responsive desktop and mobile layouts.
- Current persistence is browser `localStorage`; PostgreSQL is not connected.

## Local development

```powershell
cd tour-control
npm ci
npm run dev
```

Open <http://localhost:3000>. Validate a production build with `npm run build`; run lint with `npm run lint`.

## Deploy the Next.js app on Vercel

The Next.js project is nested in `tour-control`, so configure the Vercel project to use that folder:

1. Import `Neara176/tourcontrol` (or open its existing Vercel project settings).
2. Set **Root Directory** to `tour-control`.
3. Use the Next.js framework preset and the default install/build settings (`npm install` / `npm run build`).
4. Deploy the `main` branch.

If the existing Vercel project is still rooted at the repository root, change its Root Directory before relying on Git pushes to deploy the Next.js application. The root `vercel.json` and `index.html` are for the legacy static app.

Do not commit `.env` files or database credentials. Add secrets only in local ignored environment files and Vercel Project Settings after the app has a database integration.
