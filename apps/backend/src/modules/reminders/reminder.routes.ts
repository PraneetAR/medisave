import { Router } from "express";
import { reminderController } from "./reminder.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate";
import {
  createReminderSchema,
  updateReminderSchema,
  reminderParamSchema,
} from "./reminder.validation";

const router = Router();

// All reminder routes require authentication
router.use(authenticate);

router.get("/", (req, res, next) =>
  reminderController.getAll(req, res, next)
);

router.post("/", validate(createReminderSchema), (req, res, next) =>
  reminderController.create(req, res, next)
);

router.get("/:id", validate(reminderParamSchema), (req, res, next) =>
  reminderController.getOne(req, res, next)
);

router.put("/:id", validate(updateReminderSchema), (req, res, next) =>
  reminderController.update(req, res, next)
);

router.delete("/:id", validate(reminderParamSchema), (req, res, next) =>
  reminderController.delete(req, res, next)
);

router.patch("/:id/toggle", validate(reminderParamSchema), (req, res, next) =>
  reminderController.toggle(req, res, next)
);

export default router;