import { Router, Request, Response, NextFunction } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { User } from "../auth/auth.model";
import { Reminder } from "../reminders/reminder.model";
import { PushSubscription } from "../../notifications/push.model";
import { ApiResponse } from "../../utils/ApiResponse";
import { ApiError } from "../../utils/ApiError";
import { logger } from "../../utils/logger";

const router = Router();

router.use(authenticate);

// GET /api/users/profile
router.get("/profile", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user!.userId);
    if (!user) throw new ApiError(404, "User not found");
    res.json(new ApiResponse(200, "Profile fetched", user));
  } catch (err) { next(err); }
});

// PUT /api/users/profile
router.put("/profile", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, timezone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user!.userId,
      { $set: { name, timezone } },
      { new: true, runValidators: true }
    );
    if (!user) throw new ApiError(404, "User not found");
    res.json(new ApiResponse(200, "Profile updated", user));
  } catch (err) { next(err); }
});

// DELETE /api/users/account  ← new
router.delete("/account", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;

    // Delete all user data
    await Promise.all([
      Reminder.deleteMany({ userId }),
      PushSubscription.deleteMany({ userId }),
      User.findByIdAndDelete(userId),
    ]);

    logger.info(`Account deleted for user: ${userId}`);
    res.json(new ApiResponse(200, "Account deleted successfully", null));
  } catch (err) { next(err); }
});

export default router;
