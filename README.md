 💊 MediSave: Modern Medicine Management & Price Tracker

 🔗 **Live:** https://medisave-ashy.vercel.app  
💻 **GitHub:** https://github.com/PraneetAR/medisave


  MediSave is a high-performance, full-stack healthcare application designed to 
  help users manage their medication schedules while finding the best prices for
  their prescriptions. Built with a focus on security, scalability, and modern  
  DevOps practices.

  !TypeScript
  (https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=types
  cript&logoColor=white)
  !Next.js
  (https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotj
  s&logoColor=white)
  !Node.js
  (https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotj
  s&logoColor=white)
  !MongoDB
  (https://img.shields.io/badge/MongoDB-47A045?style=for-the-badge&logo=mongodb&
  logoColor=white)
  !TailwindCSS
  (https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tai
  lwind-css&logoColor=white)
  !Docker
  (https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&lo
  goColor=white)

  ---

  🚀 Key Features

  🛡️ Advanced Authentication & Security
   - Multi-Factor Auth: Secure 2FA via Email OTP (One-Time Password) powered by
     Brevo.
   - JWT Rotation: Production-grade access/refresh token logic with automatic
     rotation in Axios interceptors.
   - Account Protection: Automated account locking after 5 failed login attempts
     to prevent brute-force attacks.
   - Secure Password Recovery: OTP-based "Forgot Password" flow for
     zero-friction account recovery.

  🏥 Core Healthcare Functionality
   - Medicine Reminders: Interactive dashboard to manage and track medication
     timings.
   - Price Comparison Engine: Intelligent search to find the most affordable
     medicine prices.
   - Smart Notifications: Support for push notifications and email alerts for
     upcoming doses.

  ⚙️ Senior-Level Architecture
   - Monorepo-Style Structure: Clean separation between apps/frontend and
     apps/backend.
   - Zod Validation: Unified schema validation for API requests and environment
     variables.
   - Resilient API: Global error handling, health checks, and request ID
     tracking for debugging.

  ---

  🛠️ Tech Stack

  Frontend
   - Framework: Next.js 16 (App Router)
   - Styling: Tailwind CSS 4.0
   - State Management: Zustand
   - Icons: Lucide React

  Backend
   - Runtime: Node.js (TypeScript)
   - Framework: Express.js
   - Database: MongoDB (via Mongoose)
   - Mailing: Brevo (formerly Sendinblue)
   - Logging: Winston & Morgan

  DevOps & Infrastructure
   - Containerization: Docker & Docker Compose
   - CI/CD: GitHub Actions for automated testing and deployment.
   - Middleware: Helmet (Security Headers), Express Rate Limit, CORS.

  ---

  🚦 Getting Started

  Prerequisites
   - Node.js (v18+)
   - MongoDB (Local or Atlas)
   - Brevo Account (for Email OTP)

  Installation
   1. Clone the repository:
   1     git clone https://github.com/yourusername/medisave.git
   2     cd medisave

   2. Setup Backend:
   1     cd apps/backend
   2     npm install
   3     cp .env.example .env
   4     # Add your MONGODB_URI, BREVO_API_KEY, and EMAIL_FROM
   5     npm run dev

   3. Setup Frontend:

   1     cd ../frontend
   2     npm install
   3     npm run dev

  ---

  🐳 Docker Deployment

  Run the entire stack with a single command:

   1 docker-compose up --build

  The frontend will be available at http://localhost:3000 and the backend at
  http://localhost:5000.

  ---

  📁 Project Structure

    1 medisave/
    2 ├── apps/
    3 │   ├── frontend/         # Next.js Application
    4 │   │   ├── src/app/      # App Router & Pages
    5 │   │   └── src/services/ # API Interceptors & Logic
    6 │   └── backend/          # Express API
    7 │       ├── src/modules/  # Feature-based Modular Logic
    8 │       ├── src/config/   # Env & Global Config
    9 │       └── src/utils/    # Email, Logger, & Helpers
   10 ├── .github/workflows/    # CI/CD Pipelines
   11 └── docker-compose.yml    # Container Orchestration
  ---
  Developed with ❤️ as a modern healthcare solution.

## 👤 Author

**Praneet AR**  
[GitHub](https://github.com/PraneetAR) · [LinkedIn](https://linkedin.com/in/praneetar)

