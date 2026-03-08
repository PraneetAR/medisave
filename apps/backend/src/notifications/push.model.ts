import mongoose, { Document, Schema } from "mongoose";

export interface IPushSubscription extends Document {
  userId: mongoose.Types.ObjectId;
  subscription: {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  };
  createdAt: Date;
}

const pushSubscriptionSchema = new Schema<IPushSubscription>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    subscription: {
      endpoint: { type: String, required: true },
      keys: {
        p256dh: { type: String, required: true },
        auth: { type: String, required: true },
      },
    },
  },
  { timestamps: true }
);

// One subscription per endpoint per user
pushSubscriptionSchema.index(
  { userId: 1, "subscription.endpoint": 1 },
  { unique: true }
);

export const PushSubscription = mongoose.model<IPushSubscription>(
  "PushSubscription",
  pushSubscriptionSchema
);