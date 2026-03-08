import { z } from "zod";

const timeSchema = z.object({
  hour: z.number().int().min(0).max(23),
  minute: z.number().int().min(0).max(59),
});

const reminderBody = z.object({
  medicineName: z.string().min(1, "Medicine name is required").max(100),
  dosage: z.number().positive("Dosage must be positive"),
  unit: z.enum(["mg", "ml", "tablet", "capsule", "drop"]).default("tablet"),
  times: z
    .array(timeSchema)
    .min(1, "At least one reminder time is required"),
  frequency: z.enum(["daily", "weekly", "custom"]).default("daily"),
  activeDays: z
    .array(z.number().int().min(0).max(6))
    .default([0, 1, 2, 3, 4, 5, 6]),
  startDate: z.string().optional(),
  endDate: z.string().nullable().optional(),
  notifyVia: z.array(z.enum(["push", "email"])).default(["push"]),
  notes: z.string().max(300).optional().default(""),
});

export const createReminderSchema = z.object({
  body: reminderBody,
});

export const updateReminderSchema = z.object({
  body: reminderBody.partial(),
  params: z.object({ id: z.string().min(1) }),
});

export const reminderParamSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
});

export type CreateReminderInput = z.infer<typeof createReminderSchema>["body"];
export type UpdateReminderInput = z.infer<typeof updateReminderSchema>["body"];