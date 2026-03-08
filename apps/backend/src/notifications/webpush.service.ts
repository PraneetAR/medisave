import webpush from "web-push";
import { env } from "../config/env";
import { PushSubscription } from "./push.model";
import { logger } from "../utils/logger";

// Initialize VAPID keys
if (env.VAPID_PUBLIC_KEY && env.VAPID_PRIVATE_KEY && env.VAPID_EMAIL) {
  webpush.setVapidDetails(
    `mailto:${env.VAPID_EMAIL}`,
    env.VAPID_PUBLIC_KEY,
    env.VAPID_PRIVATE_KEY
  );
}

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: Record<string, unknown>;
}

export class WebPushService {

  async sendToUser(userId: string, payload: PushPayload): Promise<void> {
    const subscriptions = await PushSubscription.find({ userId });

    if (subscriptions.length === 0) {
      logger.debug(`No push subscriptions found for user ${userId}`);
      return;
    }

    const results = await Promise.allSettled(
      subscriptions.map((sub) =>
        webpush.sendNotification(
          sub.subscription as webpush.PushSubscription,
          JSON.stringify(payload)
        )
      )
    );

    // Clean up expired subscriptions (410 Gone)
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      if (result.status === "rejected") {
        const err = result.reason as { statusCode?: number };
        if (err.statusCode === 410 || err.statusCode === 404) {
          await PushSubscription.findByIdAndDelete(subscriptions[i]._id);
          logger.info(`Removed expired push subscription for user ${userId}`);
        } else {
          logger.error(`Push notification failed for user ${userId}: ${err}`);
        }
      }
    }
  }

  async saveSubscription(
    userId: string,
    subscription: IPushSubscription["subscription"]
  ): Promise<void> {
    await PushSubscription.findOneAndUpdate(
      { userId, "subscription.endpoint": subscription.endpoint },
      { userId, subscription },
      { upsert: true, new: true }
    );
    logger.info(`Push subscription saved for user ${userId}`);
  }

  async removeSubscription(userId: string, endpoint: string): Promise<void> {
    await PushSubscription.findOneAndDelete({
      userId,
      "subscription.endpoint": endpoint,
    });
    logger.info(`Push subscription removed for user ${userId}`);
  }
}

// Fix: import type for use in saveSubscription param
import type { IPushSubscription } from "./push.model";

export const webPushService = new WebPushService();