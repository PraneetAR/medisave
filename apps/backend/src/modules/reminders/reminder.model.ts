import mongoose, { Document, Schema } from "mongoose";

export type Frequency = "daily" | "weekly" | "custom";
export type DosageUnit = "mg" | "ml" | "tablet" | "capsule" | "drop";
export type NotifyVia = "push" | "email";

export interface IReminderTime {
  hour: number;   // 0-23
  minute: number; // 0-59
}

export interface IReminder extends Document {
  userId: mongoose.Types.ObjectId;
  medicineName: string;
  dosage: number;
  unit: DosageUnit;
  times: IReminderTime[];
  frequency: Frequency;
  activeDays: number[];       // 0=Sun, 1=Mon ... 6=Sat
  startDate: Date;
  endDate: Date | null;
  isActive: boolean;
  notifyVia: NotifyVia[];
  notes: string;
  lastTriggeredAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const reminderTimeSchema = new Schema<IReminderTime>(
  {
    hour: { type: Number, required: true, min: 0, max: 23 },
    minute: { type: Number, required: true, min: 0, max: 59 },
  },
  { _id: false }
);

const reminderSchema = new Schema<IReminder>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    medicineName: {
      type: String,
      required: [true, "Medicine name is required"],
      trim: true,
      maxlength: 100,
    },
    dosage: {
      type: Number,
      required: [true, "Dosage is required"],
      min: 0,
    },
    unit: {
      type: String,
      enum: ["mg", "ml", "tablet", "capsule", "drop"],
      default: "tablet",
    },
    times: {
      type: [reminderTimeSchema],
      required: true,
      validate: {
        validator: (v: IReminderTime[]) => v.length > 0,
        message: "At least one reminder time is required",
      },
    },
    frequency: {
      type: String,
      enum: ["daily", "weekly", "custom"],
      default: "daily",
    },
    activeDays: {
      type: [Number],
      default: [0, 1, 2, 3, 4, 5, 6], // all days by default
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    notifyVia: {
      type: [String],
      enum: ["push", "email"],
      default: ["push"],
    },
    notes: {
      type: String,
      default: "",
      maxlength: 300,
    },
    lastTriggeredAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for scheduler queries
reminderSchema.index({ isActive: 1, userId: 1 });

export const Reminder = mongoose.model<IReminder>("Reminder", reminderSchema);