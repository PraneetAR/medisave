import { Router, Request, Response, NextFunction } from "express";
import { webPushService } from "./webpush.service";
import { authenticate } from "../middlewares/auth.middleware";
import { ApiResponse } from "../utils/ApiResponse";
import { env } from "../config/env";

const router = Router();

// Get VAPID public key (frontend needs this to subscribe)
router.get("/vapid-public-key", (_req, res) => {
  res.json(new ApiResponse(200, "VAPID public key", {
    publicKey: env.VAPID_PUBLIC_KEY ?? null,
  }));
});

// Save a push subscription
router.post("/subscribe", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await webPushService.saveSubscription(req.user!.userId, req.body.subscription);
    res.status(201).json(new ApiResponse(201, "Subscribed to push notifications", null));
  } catch (err) { next(err); }
});

// Remove a push subscription
router.delete("/unsubscribe", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await webPushService.removeSubscription(req.user!.userId, req.body.endpoint);
    res.json(new ApiResponse(200, "Unsubscribed from push notifications", null));
  } catch (err) { next(err); }
});

export default router;