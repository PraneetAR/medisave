import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";
import { logger } from "../utils/logger";
import { env } from "../config/env";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof ApiError) {
    logger.warn(`[${req.method}] ${req.path} - ${err.statusCode}: ${err.message}`);
    res.status(err.statusCode).json({
      success: false,
      statusCode: err.statusCode,
      message: err.message,
    });
    return;
  }

  // Unexpected errors
  logger.error(`Unhandled error on [${req.method}] ${req.path}:`, err);
  res.status(500).json({
    success: false,
    statusCode: 500,
    message: env.NODE_ENV === "production" ? "Internal server error" : err.message,
  });
};

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    statusCode: 404,
    message: `Route ${req.method} ${req.path} not found`,
  });
};