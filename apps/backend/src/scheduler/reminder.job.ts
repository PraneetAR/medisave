import cron from "node-cron";
import { reminderService } from "../modules/reminders/reminder.service";
import { webPushService } from "../notifications/webpush.service";
import { logger } from "../utils/logger";
import { IUser } from "../modules/auth/auth.model";

export const startReminderScheduler = (): void => {
  cron.schedule("* * * * *", async () => {
    try {
      const reminders = await reminderService.getActiveReminders();

      for (const reminder of reminders) {
        const user = reminder.userId as unknown as IUser;

        // Convert current UTC time to user's timezone
        const userTimezone = user.timezone ?? "Asia/Kolkata";
        const now = new Date();

        const formatter = new Intl.DateTimeFormat("en-US", {
          timeZone: userTimezone,
          hour:     "numeric",
          minute:   "numeric",
          weekday:  "narrow",
          hour12:   false,
        });

        const parts   = formatter.formatToParts(now);
        const hour    = parseInt(parts.find((p) => p.type === "hour")!.value);
        const minute  = parseInt(parts.find((p) => p.type === "minute")!.value);
        const weekday = parts.find((p) => p.type === "weekday")!.value;

        // Map weekday letter to number (S=0 Sun, M=1 Mon etc)
        const weekdayMap: Record<string, number> = {
          S: now.getDay() === 0 ? 0 : 6, // Sun or Sat
          M: 1, T: now.getDay() === 2 ? 2 : 4, // Tue or Thu
          W: 3, F: 5,
        };
        const currentDay = new Date(
          now.toLocaleString("en-US", { timeZone: userTimezone })
        ).getDay();

        // Check active day
        if (!reminder.activeDays.includes(currentDay)) continue;

        // Check time match
        const isDue = reminder.times.some(
          (t) => t.hour === hour && t.minute === minute
        );
        if (!isDue) continue;

        // Avoid double trigger
        if (reminder.lastTriggeredAt) {
          const diffMs = now.getTime() - reminder.lastTriggeredAt.getTime();
          if (diffMs < 60_000) continue;
        }

        logger.info(
          `⏰ Triggering reminder: ${reminder.medicineName} for user ${user._id}`
        );

        if (reminder.notifyVia.includes("push")) {
          await webPushService.sendToUser(user._id.toString(), {
            title: `💊 Time for ${reminder.medicineName}`,
            body:  `Take ${reminder.dosage} ${reminder.unit}${
              reminder.notes ? ` — ${reminder.notes}` : ""
            }`,
            data: { reminderId: reminder._id },
          });
        }

        await reminder.updateOne({ lastTriggeredAt: now });
      }
    } catch (err) {
      logger.error(`Scheduler error: ${err}`);
    }
  });

  logger.info("⏱️  Reminder scheduler started (timezone-aware)");
};
