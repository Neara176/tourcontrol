# Phnom Penh Tour Tracker (Neara Tour)

[![Deploy with Vercel](https://vercel.com/button)](https://tourcontrol.vercel.app/)
[![Live Production](https://img.shields.io/badge/Production-Live-success?style=flat&logo=vercel)](https://tourcontrol.vercel.app/)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Neara176%2Ftourcontrol-blue?logo=github)](https://github.com/Neara176/tourcontrol)

> **Live Application URL:** [https://tourcontrol.vercel.app/](https://tourcontrol.vercel.app/)

A clean, responsive web application for managing tour bookings, guest details, seasonal pricing, operational expenses, and net profit calculations.

---

## Live Deployment & CI/CD

- **Production URL:** [https://tourcontrol.vercel.app/](https://tourcontrol.vercel.app/)
- **Hosting Platform:** [Vercel](https://vercel.com)
- **Continuous Deployment:** Any commit pushed to the `main` branch on GitHub automatically deploys directly to the live site.

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

## Pushing Updates

Whenever you make changes to the app:

```bash
# 1. Check changed files
git status

# 2. Stage and commit changes
git add .
git commit -m "Description of changes"

# 3. Push to GitHub (triggers automatic Vercel deployment)
git push origin main
```
