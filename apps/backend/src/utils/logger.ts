import winston from "winston";
import { env } from "../config/env";

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

const devFormat = combine(
  colorize({ all: true }),
  timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  errors({ stack: true }),
  printf(({ level, message, timestamp, stack, requestId, ...meta }) => {
    const reqId = requestId ? ` [${requestId}]` : "";
    const metaStr = Object.keys(meta).length
      ? `\n${JSON.stringify(meta, null, 2)}`
      : "";
    return stack
      ? `[${timestamp}]${reqId} ${level}: ${message}\n${stack}`
      : `[${timestamp}]${reqId} ${level}: ${message}${metaStr}`;
  })
);

const prodFormat = combine(
  timestamp(),
  errors({ stack: true }),
  json()
);

export const logger = winston.createLogger({
  level: env.NODE_ENV === "production" ? "info" : "debug",
  format: env.NODE_ENV === "production" ? prodFormat : devFormat,
  transports: [
    new winston.transports.Console(),
  ],
  // Catch uncaught exceptions + unhandled rejections
  exceptionHandlers: [new winston.transports.Console()],
  rejectionHandlers: [new winston.transports.Console()],
});

// Helper to create a child logger with request context
export const createRequestLogger = (requestId: string) =>
  logger.child({ requestId });
