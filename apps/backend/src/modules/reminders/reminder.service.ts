import mongoose from "mongoose";
import { Reminder, IReminder } from "./reminder.model";
import { ApiError } from "../../utils/ApiError";
import { logger } from "../../utils/logger";
import { CreateReminderInput, UpdateReminderInput } from "./reminder.validation";

export class ReminderService {

  async getAllByUser(userId: string): Promise<IReminder[]> {
    return Reminder.find({ userId }).sort({ createdAt: -1 });
  }

  async getById(id: string, userId: string): Promise<IReminder> {
    if (!mongoose.isValidObjectId(id)) {
      throw new ApiError(400, "Invalid reminder ID");
    }

    const reminder = await Reminder.findOne({ _id: id, userId });
    if (!reminder) {
      throw new ApiError(404, "Reminder not found");
    }

    return reminder;
  }

  async create(userId: string, input: CreateReminderInput): Promise<IReminder> {
    const reminder = await Reminder.create({
      ...input,
      userId,
      startDate: input.startDate ? new Date(input.startDate) : new Date(),
      endDate: input.endDate ? new Date(input.endDate) : null,
    });

    logger.info(`Reminder created: ${reminder.medicineName} for user ${userId}`);
    return reminder;
  }

  async update(
    id: string,
    userId: string,
    input: UpdateReminderInput
  ): Promise<IReminder> {
    if (!mongoose.isValidObjectId(id)) {
      throw new ApiError(400, "Invalid reminder ID");
    }

    const reminder = await Reminder.findOneAndUpdate(
      { _id: id, userId },
      { $set: input },
      { new: true, runValidators: true }
    );

    if (!reminder) {
      throw new ApiError(404, "Reminder not found");
    }

    logger.info(`Reminder updated: ${id}`);
    return reminder;
  }

  async delete(id: string, userId: string): Promise<void> {
    if (!mongoose.isValidObjectId(id)) {
      throw new ApiError(400, "Invalid reminder ID");
    }

    const result = await Reminder.findOneAndDelete({ _id: id, userId });
    if (!result) {
      throw new ApiError(404, "Reminder not found");
    }

    logger.info(`Reminder deleted: ${id}`);
  }

  async toggle(id: string, userId: string): Promise<IReminder> {
    if (!mongoose.isValidObjectId(id)) {
      throw new ApiError(400, "Invalid reminder ID");
    }

    const reminder = await Reminder.findOne({ _id: id, userId });
    if (!reminder) {
      throw new ApiError(404, "Reminder not found");
    }

    reminder.isActive = !reminder.isActive;
    await reminder.save();

    logger.info(`Reminder ${id} toggled to ${reminder.isActive}`);
    return reminder;
  }

  // Used by the scheduler — fetch all active reminders due right now
  async getActiveReminders(): Promise<IReminder[]> {
    const now = new Date();
    return Reminder.find({
      isActive: true,
      startDate: { $lte: now },
      $or: [
        { endDate: null },
        { endDate: { $gte: now } },
      ],
    }).populate("userId", "email name timezone");
  }
}

export const reminderService = new ReminderService();