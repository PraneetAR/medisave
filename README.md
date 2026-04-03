# 💊 MediSave: Modern Medicine Management & Price Tracker

🔗 **Live:** https://medisave-ashy.vercel.app  
💻 **GitHub:** https://github.com/PraneetAR/medisave  

MediSave is a high-performance, full-stack healthcare application designed to help users manage their medication schedules while finding the best prices for their prescriptions. Built with a focus on security, scalability, and modern DevOps practices.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)  
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)  
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)  
![MongoDB](https://img.shields.io/badge/MongoDB-47A045?style=for-the-badge&logo=mongodb&logoColor=white)  
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)  
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

---

## 🚀 Key Features

### 🛡️ Advanced Authentication & Security
- Multi-Factor Auth: Secure 2FA via Email OTP (One-Time Password) powered by Brevo  
- JWT Rotation: Production-grade access/refresh token logic with automatic rotation in Axios interceptors  
- Account Protection: Automated account locking after 5 failed login attempts to prevent brute-force attacks  
- Secure Password Recovery: OTP-based "Forgot Password" flow for zero-friction account recovery  

### 🏥 Core Healthcare Functionality
- Medicine Reminders: Interactive dashboard to manage and track medication timings  
- Price Comparison Engine: Intelligent search to find the most affordable medicine prices  
- Smart Notifications: Support for push notifications and email alerts for upcoming doses  

### ⚙️ Senior-Level Architecture
- Monorepo-Style Structure: Clean separation between `apps/frontend` and `apps/backend`  
- Zod Validation: Unified schema validation for API requests and environment variables  
- Resilient API: Global error handling, health checks, and request ID tracking for debugging  

---

## 🛠️ Tech Stack

### Frontend
- Framework: Next.js (App Router)  
- Styling: Tailwind CSS  
- State Management: Zustand  
- Icons: Lucide React  

### Backend
- Runtime: Node.js (TypeScript)  
- Framework: Express.js  
- Database: MongoDB (via Mongoose)  
- Mailing: Brevo (formerly Sendinblue)  
- Logging: Winston & Morgan  

### DevOps & Infrastructure
- Containerization: Docker & Docker Compose  
- CI/CD: GitHub Actions for automated testing and deployment  
- Middleware: Helmet (Security Headers), Express Rate Limit, CORS  

---

## 🚦 Getting Started

### Prerequisites
- Node.js (v18+)  
- MongoDB (Local or Atlas)  
- Brevo Account (for Email OTP)  

### Installation

#### 1. Clone the repository
```bash
git clone https://github.com/PraneetAR/medisave.git
cd medisave
```

#### 2. Setup Backend
```bash
cd apps/backend
npm install
cp .env.example .env
# Add your MONGODB_URI, BREVO_API_KEY, and EMAIL_FROM
npm run dev
```

#### 3. Setup Frontend
```bash
cd ../frontend
npm install
npm run dev
```

---

## 🐳 Docker Deployment

Run the entire stack with a single command:

```bash
docker-compose up --build
```

Frontend: http://localhost:3000  
Backend: http://localhost:5000  

---

## 📁 Project Structure

```bash
medisave/
├── apps/
│   ├── frontend/         # Next.js Application
│   │   ├── src/app/      # App Router & Pages
│   │   └── src/services/ # API Interceptors & Logic
│   └── backend/          # Express API
│       ├── src/modules/  # Feature-based Modular Logic
│       ├── src/config/   # Env & Global Config
│       └── src/utils/    # Email, Logger, & Helpers
├── .github/workflows/    # CI/CD Pipelines
└── docker-compose.yml    # Container Orchestration
```

---

Developed with ❤️ as a modern healthcare solution.

---

## 👤 Author

**Praneet AR**  
[GitHub](https://github.com/PraneetAR) · [LinkedIn](https://linkedin.com/in/praneetar)
