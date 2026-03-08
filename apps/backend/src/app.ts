import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { env } from "./config/env";
import { CONSTANTS } from "./config/constants";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware";
import { logger } from "./utils/logger";
import authRoutes from "./modules/auth/auth.routes";
import reminderRoutes from "./modules/reminders/reminder.routes";
import pushRoutes from "./notifications/push.routes";
import priceRoutes from "./modules/prices/price.routes";
import userRoutes from "./modules/users/user.routes";

const app: Application = express();

// ─── Security Middlewares ───────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
}));

// ─── Rate Limiting ──────────────────────────────────────────────
app.use(rateLimit({
  windowMs: CONSTANTS.RATE_LIMIT_WINDOW_MS,
  max: CONSTANTS.RATE_LIMIT_MAX,
  message: { success: false, message: "Too many requests. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
}));

// ─── Body Parser ────────────────────────────────────────────────
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

// ─── HTTP Logger ────────────────────────────────────────────────
app.use(morgan("dev", {
  stream: { write: (message) => logger.http(message.trim()) },
}));

// ─── Health Check ───────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "MediSave API is running",
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ─── Routes (to be added per phase) ─────────────────────────────
app.use(`${CONSTANTS.API_PREFIX}/auth`, authRoutes);
app.use(`${CONSTANTS.API_PREFIX}/reminders`, reminderRoutes);
app.use(`${CONSTANTS.API_PREFIX}/push`, pushRoutes);
app.use(`${CONSTANTS.API_PREFIX}/prices`, priceRoutes);
  app.use(`${CONSTANTS.API_PREFIX}/users`, userRoutes);

// ─── Error Handling ─────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

export default app;