# Project Status & Handover Report: Neara Tour (TourControl)

**Status:** 🟢 **LIVE IN PRODUCTION**  
**Live Application URL:** [https://tourcontrol.vercel.app/](https://tourcontrol.vercel.app/)  
**GitHub Repository:** [https://github.com/Neara176/tourcontrol](https://github.com/Neara176/tourcontrol)  
**Main Branch:** `main`  
**Hosting & CI/CD:** Vercel (Auto-deploys on every `git push origin main`)  

---

## 1. Quick Context for Future AI Models & Developers

> **To any AI assistant reading this file:**
> This repository is a single-page web app for **Neara Tour (TourControl)**, managing Phnom Penh tour bookings, guest lists, and profit margins.
> - **Production URL:** `https://tourcontrol.vercel.app/`
> - **Primary Code File:** `index.html` (contains HTML structure, CSS styles in `<style>`, and JavaScript logic in `<script>`).
> - **Deployment Pipeline:** Fully automated. Any commit pushed to the `main` branch on GitHub (`Neara176/tourcontrol`) automatically triggers a production deployment on Vercel within ~15 seconds.

---

## 2. File Map & Project Structure

| File | Purpose | Notes |
| :--- | :--- | :--- |
| `index.html` | **Core Application File.** Contains full SPA code (UI, styles, logic). | Edit this file when adding features or fixing bugs. |
| `vercel.json` | Vercel deployment configuration. | Has `cleanUrls: true` and SPA rewrite to `index.html`. |
| `package.json` | Metadata & scripts. | Run `npm start` to test locally with `npx serve .`. |
| `.gitignore` | Ignored files. | Excludes `.vercel`, `node_modules`, OS files, logs. |
| `README.md` | Public repository documentation. | Badges, live link, features, and setup instructions. |
| `PROJECT_REPORT.md` | **Handover documentation.** | Kept up-to-date for tracking project progress and AI context. |
| `phnom-penh-tour-tracker-v3 (1).html` | Original source snapshot. | Preserved as baseline backup. |

---

## 3. Architecture & Data Model

- **Architecture:** Zero-dependency, purely client-side Single Page Application (SPA).
- **Styling:** Vanilla CSS using CSS variables (`--ink`, `--bg`, `--card`, `--gold`, etc.), responsive flexbox & grid with mobile navigation.
- **Font:** Google Font *Bricolage Grotesque*.
- **Data Persistence:** Browser `localStorage`:
  - `ppt3_tours`: Array of tours (`id`, `name`, `color`, `price`, `priceHigh`).
  - `ppt3_bookings`: Array of booking objects:
    ```javascript
    {
      id: 1727800000000,
      tourId: "t1",
      tourName: "Food Tour",
      color: "#1f8a4c",
      datetime: "2026-10-05T18:00",
      guest: "John Doe",
      phone: "+85512345678",
      pax: 2,
      revenue: 70,
      paid: true,
      expense: 30, // null until completed
      notes: "Vegetarian",
      cancelled: false
    }
    ```
  - `ppt3_season`: Array of month numbers considered high season (e.g. `[11, 12, 1, 2, 3]`).

---

## 4. How to Make Updates & Deploy

Whenever you or an AI model makes improvements to this project, follow this exact 3-step workflow:

1. **Edit Code:** Make changes in `index.html`.
2. **Commit:**
   ```powershell
   git add .
   git commit -m "Brief description of changes made"
   ```
3. **Push & Auto-Deploy:**
   ```powershell
   git push origin main
   ```
   *Vercel detects the push immediately and updates `https://tourcontrol.vercel.app/` automatically.*

---

## 5. Potential Enhancements & Ready-to-Use AI Prompts

If you want to continue extending the app, you can copy-paste any of these prompts to an AI assistant:

### Prompt Option 1: Multi-Device Cloud Sync (Supabase or Firebase)
> *"Please integrate Supabase into index.html so that bookings, tours, and season settings sync across all my devices (phone, laptop) in real time instead of relying only on local storage."*

### Prompt Option 2: WhatsApp Guest Message Generator
> *"Add a WhatsApp quick-action button inside each booking card and detail modal that opens WhatsApp with a pre-filled confirmation message including the guest name, tour name, date, time, and pickup details."*

### Prompt Option 3: Currency Toggle (USD & Cambodian Riel - KHR)
> *"Add support for Cambodian Riel (KHR). Include a toggle or setting for the USD/KHR exchange rate (e.g. $1 = 4,100 KHR) and show Riel equivalents in the revenue, expense, and profit summaries."*

### Prompt Option 4: PDF Invoice / Booking Voucher Download
> *"Add a feature to download a formatted, printable PDF receipt or tour voucher for any selected booking using a lightweight client-side library like jsPDF or html2pdf."*
