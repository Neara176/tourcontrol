# Project Status & Handover Report: Neara Tour (TourControl)

**Date:** October 2026  
**Repository:** [https://github.com/Neara176/tourcontrol.git](https://github.com/Neara176/tourcontrol.git)  
**Main Branch:** `main`  
**Deployment Target:** Vercel  

---

## 1. Executive Summary

This project is **Neara Tour / TourControl** (Phnom Penh Tour Tracker), a responsive single-page web application designed to manage tour bookings, guest lists, pricing (low & high season), operational expenses, and net profit calculations.

The codebase has been fully prepared for deployment on **Vercel** and connected to the GitHub repository **`Neara176/tourcontrol`**.

---

## 2. Completed Work & File Structure

| File | Purpose | Status |
| :--- | :--- | :--- |
| `index.html` | The primary entry point for Vercel and web browsers. Duplicated from the v3 tracker so Vercel can serve root `/` automatically. | ✅ Ready & Committed |
| `phnom-penh-tour-tracker-v3 (1).html` | Original standalone single-file source preserved for reference. | ✅ Preserved |
| `vercel.json` | Vercel deployment configuration with `cleanUrls: true` and SPA root rewrite rules. | ✅ Configured |
| `package.json` | Project metadata and local preview command (`npm start` -> `npx serve .`). | ✅ Configured |
| `.gitignore` | Prevents `.vercel`, `node_modules`, OS files, and logs from being committed to Git. | ✅ Configured |
| `README.md` | Public repository documentation including features, local preview, and deployment instructions. | ✅ Written |
| `PROJECT_REPORT.md` | This handover report for you and any subsequent AI assistant to immediately resume work. | ✅ Current |

### Git State
- **Branch:** `main`
- **Remote Origin:** `https://github.com/Neara176/tourcontrol.git`
- **Initial Commit:** Created with all files staged and committed.

---

## 3. How the Application Works (Technical Specs)

- **Technology Stack:** Pure Vanilla HTML5, CSS3, and modern JavaScript (ES6+). Zero build-step required.
- **Styling:** Custom CSS with responsive breakpoints (desktop sidebar navigation, mobile bottom navigation bar).
- **Data Persistence:** Client-side `localStorage`:
  - `ppt3_tours`: Array of tours (`id`, `name`, `color`, `price`, `priceHigh`).
  - `ppt3_bookings`: Array of bookings (`id`, `tourId`, `tourName`, `datetime`, `guest`, `phone`, `pax`, `revenue`, `paid`, `expense`, `notes`, `cancelled`).
  - `ppt3_season`: Months marked as high season (e.g. `[11, 12, 1, 2, 3]`).
- **Key Modules:**
  - **Home Dashboard:** Upcoming bookings filter (Today, 7 days, Month, All), visual calendar (weekly/monthly), and monthly profit metrics.
  - **Bookings Management:** Create, view, search guest names, update status, and log expenses.
  - **Tours Catalog:** Configure tours with distinct color tags and low/high season rates.
  - **Financial Reports:** Aggregated tables (daily, weekly, monthly) and CSV export.
  - **Export & Backup:** Generates Apple Calendar `.ics` files and JSON database backup/restore.

---

## 4. Immediate Next Steps

### Step 1: Push Code to GitHub

The repository is staged and committed locally, and remote `origin` is set to `https://github.com/Neara176/tourcontrol.git`.

Because pushing requires interactive GitHub login (browser window or Personal Access Token), run this single command in your **PowerShell** or **Command Prompt**:

```powershell
cd "D:\Neara Tour"
git push -u origin main
```

> **Note on Authentication:**
> When the prompt appears:
> - If a browser window opens, click **"Sign in with your browser"** and authorize Git.
> - Or use your GitHub username and a **Personal Access Token (PAT)** as your password (generated in GitHub *Settings > Developer Settings > Personal access tokens*).

---

### Step 2: Deploy on Vercel

Once your code is pushed to GitHub, you have two simple ways to deploy:

#### Method A: Automatic Deployment via Vercel Dashboard (Recommended)
1. Go to [vercel.com](https://vercel.com) and log in with your GitHub account.
2. Click **"Add New..."** > **"Project"**.
3. Locate **`Neara176/tourcontrol`** and click **"Import"**.
4. Leave all settings at default:
   - **Framework Preset:** Other
   - **Root Directory:** `./`
5. Click **"Deploy"**.
6. Vercel will give you a live production URL (e.g., `https://tourcontrol.vercel.app`). Any future `git push` will auto-deploy.

#### Method B: Deploy using Vercel CLI
If you prefer terminal deployment:
```powershell
npx vercel
# Follow prompts, then deploy to production:
npx vercel --prod
```

---

## 5. Guide for Future AI Models or Developers

If you open this project in another AI session or assign a new developer, here are ready-to-use continuation prompts:

### Optional Feature Enhancements to Consider:
1. **Cloud Database Sync (e.g., Supabase / Firebase):**
   - *Prompt:* `"Connect this tour tracker to Supabase so that bookings and tours sync across multiple phones and computers instead of using local storage only."`
2. **WhatsApp Direct Message / Reminder:**
   - *Prompt:* `"Add a button in the booking details modal to send a WhatsApp confirmation or reminder message directly to the guest's phone number."`
3. **Invoice / Receipt Generation (PDF):**
   - *Prompt:* `"Add a feature to generate a downloadable PDF receipt or invoice for a booking."`
4. **Multi-Currency Support (USD and KHR - Cambodian Riel):**
   - *Prompt:* `"Add a currency toggle or dual display for USD and Cambodian Riel (KHR) with a configurable exchange rate."`
