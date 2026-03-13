import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { env } from "./config/env";
import { CONSTANTS } from "./config/constants";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware";
import { requestId } from "./middlewares/requestId.middleware";
import { logger } from "./utils/logger";
import authRoutes from "./modules/auth/auth.routes";
import reminderRoutes from "./modules/reminders/reminder.routes";
import priceRoutes from "./modules/prices/price.routes";
import pushRoutes from "./notifications/push.routes";
import userRoutes from "./modules/users/user.routes";
import medicineRoutes from "./modules/medicines/medicine.routes";

const app: Application = express();

// ─── Request ID ─────────────────────────────────────────────────
app.use(requestId);

// ─── Security ───────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: [env.FRONTEND_URL, "http://localhost:3000"],
  credentials: true,
}));

// ─── Rate Limiting ──────────────────────────────────────────────
app.use(rateLimit({
  windowMs: CONSTANTS.RATE_LIMIT_WINDOW_MS,
  max:      CONSTANTS.RATE_LIMIT_MAX,
  message:  { success: false, message: "Too many requests. Please try again later." },
  standardHeaders: true,
  legacyHeaders:   false,
}));

// ─── Body Parser ────────────────────────────────────────────────
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

// ─── HTTP Logger ────────────────────────────────────────────────
morgan.token("reqid", (req) => req.headers["x-request-id"] as string ?? "-");
morgan.token("body",  (req: express.Request) => {
  const b = { ...req.body };
  if (b.password)     b.password     = "***";
  if (b.refreshToken) b.refreshToken = "***";
  return Object.keys(b).length ? JSON.stringify(b) : "";
});

app.use(
  morgan(
    env.NODE_ENV === "production"
      ? '{"time":":date[iso]","method":":method","url":":url","status":":status","ms":":response-time","reqId":":reqid"}'
      : ":method :url :status :response-time ms [:reqid]",
    { stream: { write: (msg) => logger.http(msg.trim()) } }
  )
);

// ─── Health Check ────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.status(200).json({
    success:     true,
    message:     "MediSave API is running",
    environment: env.NODE_ENV,
    timestamp:   new Date().toISOString(),
    uptime:      `${Math.floor(process.uptime())}s`,
  });
});

// ─── Routes ──────────────────────────────────────────────────────
app.use(`${CONSTANTS.API_PREFIX}/auth`,      authRoutes);
app.use(`${CONSTANTS.API_PREFIX}/reminders`, reminderRoutes);
app.use(`${CONSTANTS.API_PREFIX}/prices`,    priceRoutes);
app.use(`${CONSTANTS.API_PREFIX}/push`,      pushRoutes);
app.use(`${CONSTANTS.API_PREFIX}/users`,     userRoutes);
app.use(`${CONSTANTS.API_PREFIX}/medicines`, medicineRoutes);

// ─── Error Handling ──────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
