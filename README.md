# Phnom Penh Tour Tracker (Neara Tour)

A clean, responsive web application for managing tour bookings, guest details, seasonal pricing, expenses, and profits.

---

## Features

- 🏠 **Home Dashboard:** Upcoming bookings filter (Today, 7 days, This month, All), dynamic calendar (week & month view), and monthly revenue/profit summaries.
- 🧾 **Bookings Manager:** Add, view, search, edit, cancel, and track expense/payment status for guest bookings.
- 🛺 **Tours & Pricing:** Configure tour catalogs with custom colors, low season prices, high season prices, and customizable high-season months.
- 📈 **Financial Reports & Analytics:** Daily, weekly, and monthly breakdown of tours, guests, revenue, expenses, and net profit.
- 📥 **Export & Backup:**
  - Export reports to CSV.
  - Export bookings directly to Apple Calendar (`.ics`).
  - Full JSON backup and restore capabilities.
- 📱 **Mobile & Desktop Friendly:** Fully responsive design built with clean vanilla HTML, CSS, and modern JavaScript.

---

## Local Development & Preview

To run and test the app locally, you can open `index.html` directly in any web browser, or run a local web server:

```bash
# Using npx serve
npx serve .

# Or using Python
python -m http.server 3000
```

---

## Pushing to GitHub

Follow these steps to push this project to your GitHub repository:

1. **Create a new repository on GitHub:**
   - Go to [github.com/new](https://github.com/new).
   - Enter a repository name (e.g. `phnom-penh-tour-tracker` or `neara-tour`).
   - Leave it empty (do **not** check "Initialize with README" or `.gitignore`).

2. **Add the GitHub remote and push:**
   ```bash
   # Add your GitHub repository as the remote origin
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git

   # Push to GitHub
   git push -u origin main
   ```

---

## Deploying to Vercel

### Option 1: Automatic Deployment with GitHub (Recommended)

1. Go to [vercel.com](https://vercel.com) and log in.
2. Click **"Add New..."** > **"Project"**.
3. Import your GitHub repository (`<your-repo-name>`).
4. Keep the default settings (Framework Preset: **Other**, Root Directory: `./`).
5. Click **"Deploy"**.

Every time you push new commits to `main`, Vercel will automatically deploy an updated version!

### Option 2: Deploy via Vercel CLI

You can also deploy directly from your terminal using Vercel CLI:

```bash
# Log in and deploy
npx vercel

# Deploy to production
npx vercel --prod
```
