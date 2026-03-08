import cron from "node-cron";
import { reminderService } from "../modules/reminders/reminder.service";
import { webPushService } from "../notifications/webpush.service";
import { logger } from "../utils/logger";
import { IUser } from "../modules/auth/auth.model";

// Runs every minute — checks for reminders due right now
export const startReminderScheduler = (): void => {
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();
      const currentDay = now.getDay();         // 0-6
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();

      const reminders = await reminderService.getActiveReminders();

      for (const reminder of reminders) {
        // Check if today is an active day
        if (!reminder.activeDays.includes(currentDay)) continue;

        // Check if any scheduled time matches current time
        const isDue = reminder.times.some(
          (t) => t.hour === currentHour && t.minute === currentMinute
        );

        if (!isDue) continue;

        // Avoid double-triggering within same minute
        if (reminder.lastTriggeredAt) {
          const diffMs = now.getTime() - reminder.lastTriggeredAt.getTime();
          if (diffMs < 60_000) continue;
        }

        const user = reminder.userId as unknown as IUser;

        logger.info(
          `⏰ Triggering reminder: ${reminder.medicineName} for user ${user._id}`
        );

        // Send push notification
        if (reminder.notifyVia.includes("push")) {
          await webPushService.sendToUser(user._id.toString(), {
            title: `💊 Time for ${reminder.medicineName}`,
            body: `Take ${reminder.dosage} ${reminder.unit}${
              reminder.notes ? ` — ${reminder.notes}` : ""
            }`,
            data: { reminderId: reminder._id },
          });
        }

        // Update lastTriggeredAt
        await reminder.updateOne({ lastTriggeredAt: now });
      }
    } catch (err) {
      logger.error(`Scheduler error: ${err}`);
    }
  });

  logger.info("⏱️  Reminder scheduler started");
};