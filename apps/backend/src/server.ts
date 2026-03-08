import app from "./app";
import { connectDB } from "./config/db";
import { env } from "./config/env";
import { logger } from "./utils/logger";
import { startReminderScheduler } from "./scheduler/reminder.job";

const startServer = async (): Promise<void> => {
  await connectDB();

  // ✅ Start scheduler after DB is connected
  startReminderScheduler();

  const server = app.listen(Number(env.PORT), () => {
    logger.info(`🚀 MediSave server running on port ${env.PORT} [${env.NODE_ENV}]`);
  });

  const shutdown = (signal: string) => {
    logger.warn(`${signal} received. Shutting down gracefully...`);
    server.close(() => {
      logger.info("Server closed.");
      process.exit(0);
    });
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  process.on("unhandledRejection", (reason: Error) => {
    logger.error(`Unhandled Rejection: ${reason.message}`);
    server.close(() => process.exit(1));
  });
};

startServer();
