# 💊 MediSave

> Cloud-based medicine reminder and price comparison SaaS — built on a zero budget using free-tier services.

🔗 **Live:** https://medisave-ashy.vercel.app  
💻 **GitHub:** https://github.com/PraneetAR/medisave

---

## ✨ Features

- 🔔 **Medicine Reminders** — Set daily reminders, get push notifications on any device
- 💰 **Price Comparison** — Compare medicine prices across PharmEasy, Netmeds & Medkart instantly
- 🤖 **Auto Scraper** — GitHub Actions scrapes 3,900+ medicine prices twice daily
- 🔐 **Secure Auth** — JWT + refresh tokens, account lockout, IP logging
- 📱 **PWA Ready** — Service worker, web push notifications

---

## 🏗️ Architecture
```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Next.js 14    │────▶│  Express.js API  │────▶│  MongoDB Atlas  │
│   (Vercel)      │     │  (Render)        │     │  (Free Tier)    │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                │
                    ┌───────────┴───────────┐
                    │   GitHub Actions      │
                    │   Scraper (2x/day)    │
                    │   PharmEasy           │
                    │   Netmeds             │
                    │   Medkart             │
                    └───────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Backend | Express.js, TypeScript, Node.js 22 |
| Database | MongoDB Atlas (Mongoose) |
| Auth | JWT (access + refresh tokens) |
| Scraping | Axios, Cheerio |
| Notifications | Web Push API, VAPID, Service Workers |
| Scheduler | node-cron |
| CI/CD | GitHub Actions |
| Containers | Docker, docker-compose |
| Logging | Winston |
| Validation | Zod |
| Deployment | Vercel (frontend), Render (backend) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 22+
- MongoDB Atlas account (free)
- VAPID keys (generate with `npx web-push generate-vapid-keys`)

### Local Development
```bash
# Clone
git clone https://github.com/PraneetAR/medisave.git
cd medisave

# Backend
cd apps/backend
cp .env.example .env   # fill in your values
npm install
npm run dev

# Frontend (new terminal)
cd apps/frontend
cp .env.example .env.local
npm install
npm run dev
```

### Docker
```bash
docker-compose up --build
```

---

## 📁 Project Structure
```
medisave/
├── apps/
│   ├── backend/
│   │   └── src/
│   │       ├── modules/        # auth, reminders, prices, medicines
│   │       ├── scrapers/       # PharmEasy, Netmeds, Medkart
│   │       ├── notifications/  # Web Push
│   │       ├── scheduler/      # node-cron jobs
│   │       └── middlewares/    # auth, error, rate limit
│   └── frontend/
│       └── src/
│           ├── app/            # Next.js App Router
│           ├── components/     # Sidebar, AuthGuard, NotificationBell
│           ├── hooks/          # usePushNotification
│           └── store/          # Zustand auth store
├── .github/
│   └── workflows/
│       ├── backend-ci.yml      # CI on push
│       └── scraper.yml         # Price scraper cron
└── docker-compose.yml
```

---

## 🔐 Environment Variables

### Backend (`apps/backend/.env`)
```
MONGODB_URI=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_EMAIL=
FRONTEND_URL=
NODE_ENV=development
```

### Frontend (`apps/frontend/.env.local`)
```
NEXT_PUBLIC_API_URL=https://medisave.onrender.com/api
```

---

## 📊 Scraper Stats

| Platform | Records | Method |
|---|---|---|
| PharmEasy | ~1,337 | `__NEXT_DATA__` JSON |
| Netmeds | ~1,294 | `window.__INITIAL_STATE__` JSON |
| Medkart | ~1,296 | Cheerio HTML parsing |
| **Total** | **~3,927** | |

Scraper runs automatically at **7:30 AM** and **7:30 PM IST** via GitHub Actions.

---

## 👤 Author

**Praneet AR**  
[GitHub](https://github.com/PraneetAR) · [LinkedIn](https://linkedin.com/in/praneetar)

---

## 📄 License

MIT
EOF
