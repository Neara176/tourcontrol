# Project Status & Handover Report: Neara Tour (TourControl)

**Status:** 🟡 **NEXT.JS APP PUSHED; VERCEL ROOT DIRECTORY CONFIGURATION PENDING**
**Live Application URL:** [https://tourcontrol.vercel.app/](https://tourcontrol.vercel.app/)  
**GitHub Repository:** [https://github.com/Neara176/tourcontrol](https://github.com/Neara176/tourcontrol)  
**Main Branch:** `main`  
**Hosting & CI/CD:** Vercel (Auto-deploys on every `git push origin main`)  

---

## 1. Quick Context for Future AI Models & Developers

> **To any AI assistant reading this file:**
> The active application is a **Next.js 16** app; the original single-page HTML app remains at the repository root.
> - **Framework:** Next.js 16 (App Router), TypeScript, Tailwind CSS v4.
> - **Project Root:** The Next.js app is located in the `tour-control` directory.
> - **Production URL:** `https://tourcontrol.vercel.app/`
> - **Deployment Pipeline:** Vercel is connected to the repository. Set its **Root Directory** to `tour-control` for Next.js deployments; the repository-root Vercel config is for the legacy static app.

### Current Handover Checkpoint (Oct 4, 2026)

- **Current local work:** UI and behavior parity updates are in the working tree and have not been committed. Do not assume these changes are pushed to GitHub or deployed.
- **Legacy UI parity:** The Next.js Home page now includes the legacy calendar (month/week views, date selection, booking markers), upcoming-booking filters, monthly tour summary, financial totals, and waiting-for-expense actions. Navigation, responsive layouts, Tours, Reports, and booking forms have been aligned toward the root `index.html` design.
- **Booking actions:** Both Home and Bookings open a booking-detail dialog with edit, expense save/update, cancel/restore, delete, and “Add to iPhone” calendar export. New bookings can be created from Home or Bookings; default tour pricing responds to tour/date/guest count and high-season settings.
- **Calendar export issue fixed:** Some browsers throw from `navigator.canShare` or `navigator.share` for `.ics` files. The share attempt is now guarded and falls back to downloading `tour.ics`, matching the legacy HTML approach. The dialog reports successful download rather than showing a false share error. On iPhone, use the share sheet when available or open the downloaded `.ics` file with Calendar.
- **Reports and data transfer:** Reports include daily/weekly/monthly views, CSV export, and JSON backup/restore for tours, bookings, and season settings. The legacy `file://` app and `http://localhost:3000` have separate browser storage origins; transfer data by saving a backup from one app and restoring it in the other.
- **Validation:** `npm run lint` and `npm run build` both pass from `tour-control`. Browser verification covered creating a booking, calendar marker and monthly totals, expense updates, booking deletion, `.ics` fallback when native sharing fails, and backup-file generation.
- **Local app:** Next.js dev server was running at `http://localhost:3000` at this checkpoint. If unavailable, run `cd D:\Neara Tour\tour-control; npm run dev -- --hostname 0.0.0.0 --port 3000`.
- **GitHub:** Latest previously documented pushed commit is `6cf157c` (`Document GitHub push and Vercel root setting`); verify current remote history before assuming anything newer is pushed.
- **Vercel:** Configure the existing Vercel project’s **Root Directory** as `tour-control`, then redeploy the latest `main` commit. Until this is done, the live URL may still serve the legacy root HTML app; do not assume the Next.js release is live.
- **Database:** Supabase integration has been added; it is not live until project environment values are configured and the schema is applied.
- **Credential safety:** A database password was shared in chat; rotate it before using it for any deployment. Store any future credentials only in ignored local environment files and Vercel environment settings.
- **Handover maintenance:** For future code changes, update this `PROJECT_REPORT.md` with the date, changed behavior/files, validation, local/deployment status, and any remaining action so another developer or AI session can continue safely.

### Supabase Connection Checkpoint (Oct 4, 2026)

- **Integration added:** Next.js now has Supabase browser client setup, email/password sign-in, a protected app shell, cloud storage for tours/bookings/season settings, and owner-scoped RLS schema in `tour-control/supabase/schema.sql`.
- **Privacy:** All application tables are restricted to authenticated owners with RLS. Disable **Allow new users to sign up** in Supabase Auth settings and create the owner account in the Dashboard. Never use a service-role key in browser code or commit credentials.
- **First-login migration:** The first owner sign-in imports local `ppt3_tours`, `ppt3_bookings`, and `ppt3_season` values when available, otherwise seeds starter tours and the default season. A local owner marker prevents a second signed-in account from importing another owner's cached data. Subsequent loads use Supabase as the source of truth.
- **Required setup status:** Project URL and publishable key are present in ignored `tour-control/.env.local`. Schema is now confirmed applied (see verification below). Set matching environment variables in Vercel before deployment.
- **Validation:** `npm run lint` and `npm run build` pass from `tour-control`; all three Supabase REST table endpoints return HTTP 200. Authenticated application reads/writes still need a browser session signed in as the project owner.

### Supabase Project Configuration (Oct 4, 2026)

- **Environment:** The provided Supabase project URL and publishable key have been configured in ignored `tour-control/.env.local`; key material is not tracked. The client now accepts `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` and retains support for the anon-key variable name.
- **Database check (Oct 4, 2026 17:07 +07):** The configured Supabase REST API returns HTTP 200 for all expected columns in `tours`, `bookings`, and `app_settings`, confirming the app schema is present and reachable. The earlier HTTP 404 results below are historical; the schema was subsequently applied in Supabase.
- **Local runtime:** Next.js is using `.env.local`; localhost `/` redirects to `/login` because the browser session available to this workspace is signed out. Sign in with the app's Supabase Auth owner account to verify authenticated reads/writes and first-login data migration.
- **Setup attempt (Oct 4, 2026 15:13 +07):** The initial browser attempt encountered the Dashboard sign-in page and an invalid GitHub login attempt. No remote SQL was run.
- **Dashboard access follow-up (Oct 4, 2026 15:37 +07):** User supplied a screenshot confirming their own browser is signed into the `tourtracker` project. The browser page available to automation remains a separate unauthenticated session (opening the project SQL Editor redirects to Dashboard sign-in). Rechecked Supabase REST: `tours`, `bookings`, and `app_settings` still return HTTP 404. No remote schema change is confirmed. Next: user must execute `tour-control/supabase/schema.sql` in their signed-in Dashboard SQL Editor, then recheck table endpoints and sign-in. The app's "Invalid login credentials" is separate from Dashboard access; create/reset the app owner under Authentication → Users. Do not send passwords in chat.
- **Dashboard link follow-up (Oct 4, 2026 15:52 +07):** User shared the project URL (not an authentication credential). Opening that URL in the browser tool still redirects to the Dashboard sign-in page, so the signed-in browser session is not shared with the tool. No schema SQL was executed and the application tables remain unverified/missing. Continue only after the signed-in SQL Editor is shared or the owner executes `tour-control/supabase/schema.sql` and confirms completion.
- **Publishable-key resend (Oct 4, 2026 16:24 +07):** User resent the same project URL and publishable key. These remain correctly stored in ignored `.env.local`, but a publishable key is not Dashboard authentication or database-admin access and cannot create schema. Opening SQL Editor again in a fresh browser tool session still redirects to Dashboard sign-in. Rechecked REST endpoints: `tours`, `bookings`, and `app_settings` all return HTTP 404. Local app `/login` responds HTTP 200. Remote schema remains unapplied; the user must run `tour-control/supabase/schema.sql` in the signed-in Dashboard or provide an authorized secure setup path. No password/service-role credential should be sent in chat.
- **Database schema applied and verified (Oct 4, 2026 17:07 +07):** All app table endpoints now respond HTTP 200. The exact SQL application event was not observable from this workspace's dashboard session, but the public REST API confirms the required table names are available. Lint and production build pass. The available localhost browser is signed out and redirects to `/login`; complete signed-in read/write verification after owner login.
- **Nullable phone save fix (Oct 4, 2026 17:03 +07):** User reported Supabase error `null value in column "phone" of relation "bookings" violates not-null constraint`. Normalize missing/null phone and notes to empty strings when loading database rows, migrating local bookings, and serializing writes. This preserves the database non-null constraint and supports older browser data where optional fields may be null. Re-run lint/build and check booking save in the connected app.

### Handover Update (Oct 4, 2026 17:52 +07)

- **Current database status:** Supabase project `xqzucmtbhtxrlvzjmiso` is configured locally through ignored `tour-control/.env.local`. REST checks returned HTTP 200 for all expected columns in `tours`, `bookings`, and `app_settings`. Do not copy or disclose the local publishable key in this report.
- **Current app status:** The local Next.js app serves on `http://localhost:3000`; the available browser session is signed out and displays `/login`. Supabase Auth sign-in and authenticated app reads/writes have not been end-to-end verified in this session.
- **Implemented data handling:** `useStorage` uses Supabase for tours/bookings/settings, imports browser-local values on first owner login, serializes complete snapshots through owner-scoped database functions, and normalizes absent phone/notes values to `''` to satisfy table constraints.
- **Security model:** Tables use row-level security tied to `auth.uid()`. Only use the publishable key in the client; never commit `.env.local` or use a service-role key in browser code. Dashboard owner login and the app's Supabase Auth user are separate.
- **Validation:** `npm run lint` and `npm run build` passed after the null-phone fix. REST table/column checks succeeded. Booking CRUD with an authenticated app session remains the next verification step.
- **Deployment:** Configure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in Vercel for the `tour-control` root directory before expecting the deployed app to use this database.

### Final Vercel Deployment Handover (Oct 4, 2026 18:11 +07)

- **Environment template:** `tour-control/.env.example` documents `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` with placeholders and warns against a service-role key. The real local `.env.local` is Git-ignored; do not copy its values into tracked files or this report.
- **Build scripts:** `tour-control/package.json` has `build: next build`, `start: next start`, `dev: next dev`, and `lint: eslint`. Vercel's standard Next.js install/build defaults are suitable when the project Root Directory is set to `tour-control`.
- **Build validation:** `npm run lint` and `npm run build` passed on Oct 4, 2026 after Supabase integration and booking null-field normalization.
- **Supabase status:** The configured project REST API returned HTTP 200 for the expected columns in `tours`, `bookings`, and `app_settings`. Authenticated production sign-in and CRUD still need verification after deploy.
- **Vercel actions required:** Set Root Directory to `tour-control`; configure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` for Production (and Preview/Development if desired); ensure Supabase Auth redirect URLs include the production domain; deploy the latest changes.
- **Release state:** Current changes are in the working tree and have not been committed/pushed by this session. Do not assume the Vercel deployment is updated until changes are pushed and the Vercel deployment succeeds.
- **Security:** Use only the publishable/anon key in `NEXT_PUBLIC_*`. Never deploy a service-role key in this client-side app. A database password was previously shared in chat; rotate it before any server-side use.

---

## 2. File Map & Project Structure

| Path | Purpose | Notes |
| :--- | :--- | :--- |
| `/tour-control/app` | **Next.js App Router.** Contains all pages and layout. | Home, Bookings, Tours, and Report pages. |
| `/tour-control/components` | **Reusable UI Components.** | Navigation, BookingModal, etc. |
| `/tour-control/hooks` | **Custom React Hooks.** | `useStorage.ts` loads and saves Supabase data and imports legacy localStorage records on first sign-in. |
| `/tour-control/types` | **TypeScript Definitions.** | Interfaces for Tour and Booking objects. |
| `/tour-control/app/globals.css` | **Global Styles.** | Tailwind CSS v4 configuration and project variables. |
| `index.html` | **Legacy Version.** | Preserved as the original source baseline. |
| `PROJECT_REPORT.md` | **Handover documentation.** | Kept up-to-date for tracking project progress. |

---

## 3. Architecture & Data Model

- **Architecture:** Modern React SPA using Next.js.
- **Styling:** Tailwind CSS v4 using a custom theme mapping to original project colors (`--ink`, `--gold`, etc.).
- **Font:** Google Font *Bricolage Grotesque*.
- **Data Persistence:** Supabase tables with owner-only RLS; `useStorage` imports existing browser-local records on first sign-in and maintains a local cache:
  - `ppt3_tours`: Array of tours (`id`, `name`, `color`, `price`, `priceHigh`).
  - `ppt3_bookings`: Array of booking objects.
  - `ppt3_season`: Array of high-season month numbers.

---

## 4. How to Make Updates & Deploy

Whenever you or an AI model makes improvements to this project:

1. **Edit Code:** Make changes within the `/tour-control` directory.
2. **Commit:**
   ```powershell
   git add .
   git commit -m "Brief description of changes made"
   ```
3. **Push & Auto-Deploy:**
   ```powershell
   git push origin main
   ```
   *Vercel detects the push and updates the production URL automatically.*

---

## 5. Recent Updates (Oct 2026)
- **Full Framework Migration**: Migrated the application from a single `index.html` file to **Next.js 16**.
- **TypeScript Integration**: Implemented strict typing for all data models (Bookings, Tours) to prevent runtime errors.
- **Tailwind CSS v4**: Modernized the styling system while preserving the original brand colors and aesthetic.
- **Componentization**: Split the monolithic script into modular components (`Navigation`, `BookingModal`) and hooks (`useStorage`).
- **Optimized Routing**: Implemented Next.js App Router for faster page transitions between Home, Bookings, Tours, and Reports.
- **Vercel UI Parity Pass**: Rebuilt the global layout and sidebar navigation to match the live production styling more closely, including the dark navy sidebar, gold active state, and spacing between sections.
- **Legacy UI Matching Pass (Oct 3, 2026)**: Reworked the local Next.js UI styling to align closely with the legacy root `index.html` browser app, matching the `Phnom Penh Tour Tracker` branding, dormant neutral-toned background, dark navy sidebar, gold active nav state, and general spacing/layout proportions.
- **Local Validation**: Confirmed the app runs locally in `tour-control` and passes `npm run lint` and `npm run build` without errors.
- **GitHub/Vercel Deployment Preparation**: Updated the root README with Next.js setup and deployment instructions. Vercel must use `tour-control` as its Root Directory; no database credentials belong in the repository.
- **Release Validation**: `npm run lint` and `npm run build` both pass in `tour-control` with no lint warnings.
- **GitHub History Integration**: Preserved the existing remote legacy-app commit in branch history and pushed the Next.js app to `main` without force-overwriting remote work.
- **Vercel Action Required**: Set the Vercel project Root Directory to `tour-control` so the deployment builds the Next.js app instead of the legacy root HTML app.
- **Handover Checkpoint Saved**: Recorded the pushed revision, passing lint/build checks, UI parity refinement against the legacy app, pending Vercel Root Directory change, current localStorage persistence, and credential rotation reminder above.
- **UI and Functional Parity Pass (Oct 4, 2026)**: Restored Home calendar/monthly summary and booking actions in the Next.js app. Added iPhone `.ics` export with native share when supported and download fallback, plus JSON backup/restore. Fixed local date handling and report granularity labels; disabled the Next.js development indicator so it does not obscure mobile navigation.
- **Calendar Export Follow-up (Oct 4, 2026)**: Reproduced browsers where native calendar-file share capability checks throw. Moved those checks inside error handling, safely fall back to downloading `tour.ics`, and show success guidance in the booking detail dialog. Verified output includes booking date/time, summary, location, description, and reminder; build and lint pass.

---

## 6. Potential Enhancements & Ready-to-Use AI Prompts

### Prompt Option 1: Complete Supabase Setup
> *"Configure the Supabase environment variables, apply the schema, create the owner account, and verify cross-device sync for tours, bookings, and season settings."*

### Prompt Option 2: WhatsApp Guest Message Generator
> *"Add a WhatsApp quick-action button inside each booking card and detail modal that opens WhatsApp with a pre-filled confirmation message."*

### Prompt Option 3: Currency Toggle (USD & Cambodian Riel - KHR)
> *"Add support for Cambodian Riel (KHR). Include a toggle for the USD/KHR exchange rate and show Riel equivalents in the summaries."*

### Prompt Option 4: PDF Invoice / Booking Voucher Download
> *"Add a feature to download a formatted, printable PDF receipt or tour voucher using jsPDF."*
