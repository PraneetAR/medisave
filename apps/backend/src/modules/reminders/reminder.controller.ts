import { Request, Response, NextFunction } from "express";
import { reminderService } from "./reminder.service";
import { ApiResponse } from "../../utils/ApiResponse";

export class ReminderController {

  async getAll(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const reminders = await reminderService.getAllByUser(
        req.user!.userId
      );

      res.json(new ApiResponse(200, "Reminders fetched", reminders));
    } catch (err) {
      next(err);
    }
  }

  async getOne(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = req.params.id as string;

      const reminder = await reminderService.getById(
        id,
        req.user!.userId
      );

      res.json(new ApiResponse(200, "Reminder fetched", reminder));
    } catch (err) {
      next(err);
    }
  }

  async create(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const reminder = await reminderService.create(
        req.user!.userId,
        req.body
      );

      res.status(201).json(
        new ApiResponse(201, "Reminder created", reminder)
      );
    } catch (err) {
      next(err);
    }
  }

  async update(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = req.params.id as string;

      const reminder = await reminderService.update(
        id,
        req.user!.userId,
        req.body
      );

      res.json(new ApiResponse(200, "Reminder updated", reminder));
    } catch (err) {
      next(err);
    }
  }

  async delete(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = req.params.id as string;

      await reminderService.delete(id, req.user!.userId);

      res.json(new ApiResponse(200, "Reminder deleted", null));
    } catch (err) {
      next(err);
    }
  }

  async toggle(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = req.params.id as string;

      const reminder = await reminderService.toggle(
        id,
        req.user!.userId
      );

      res.json(
        new ApiResponse(
          200,
          `Reminder ${reminder.isActive ? "enabled" : "disabled"}`,
          reminder
        )
      );
    } catch (err) {
      next(err);
    }
  }
}

export const reminderController = new ReminderController();