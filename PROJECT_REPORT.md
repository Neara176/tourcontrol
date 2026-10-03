# Project Status & Handover Report: Neara Tour (TourControl)

**Status:** 🟡 **LEGACY VERSION LIVE; NEXT.JS APP READY FOR VERCEL CONFIGURATION**  
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

---

## 2. File Map & Project Structure

| Path | Purpose | Notes |
| :--- | :--- | :--- |
| `/tour-control/app` | **Next.js App Router.** Contains all pages and layout. | Home, Bookings, Tours, and Report pages. |
| `/tour-control/components` | **Reusable UI Components.** | Navigation, BookingModal, etc. |
| `/tour-control/hooks` | **Custom React Hooks.** | `useStorage.ts` handles all localStorage logic. |
| `/tour-control/types` | **TypeScript Definitions.** | Interfaces for Tour and Booking objects. |
| `/tour-control/app/globals.css` | **Global Styles.** | Tailwind CSS v4 configuration and project variables. |
| `index.html` | **Legacy Version.** | Preserved as the original source baseline. |
| `PROJECT_REPORT.md` | **Handover documentation.** | Kept up-to-date for tracking project progress. |

---

## 3. Architecture & Data Model

- **Architecture:** Modern React SPA using Next.js.
- **Styling:** Tailwind CSS v4 using a custom theme mapping to original project colors (`--ink`, `--gold`, etc.).
- **Font:** Google Font *Bricolage Grotesque*.
- **Data Persistence:** Browser `localStorage` (managed via `useStorage` hook):
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
- **GitHub/Vercel Deployment Preparation**: Updated the root README with Next.js setup and deployment instructions. Vercel must use `tour-control` as its Root Directory; PostgreSQL is not integrated and no database credentials belong in the repository.
- **Release Validation**: `npm run lint` and `npm run build` both pass in `tour-control`; lint currently reports one non-blocking Next.js custom-font warning.

---

## 6. Potential Enhancements & Ready-to-Use AI Prompts

### Prompt Option 1: Multi-Device Cloud Sync (Supabase or Firebase)
> *"Please integrate Supabase into the Next.js app so that bookings, tours, and season settings sync across all my devices in real time instead of relying only on local storage."*

### Prompt Option 2: WhatsApp Guest Message Generator
> *"Add a WhatsApp quick-action button inside each booking card and detail modal that opens WhatsApp with a pre-filled confirmation message."*

### Prompt Option 3: Currency Toggle (USD & Cambodian Riel - KHR)
> *"Add support for Cambodian Riel (KHR). Include a toggle for the USD/KHR exchange rate and show Riel equivalents in the summaries."*

### Prompt Option 4: PDF Invoice / Booking Voucher Download
> *"Add a feature to download a formatted, printable PDF receipt or tour voucher using jsPDF."*
