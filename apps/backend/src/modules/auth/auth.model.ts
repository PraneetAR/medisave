import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";
import { CONSTANTS } from "../../config/constants";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  timezone: string;
  refreshToken: string | null;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    timezone: {
      type: String,
      default: "Asia/Kolkata",
    },
    refreshToken: {
      type: String,
      default: null,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

// ✅ Fix 1: removed `next` param — use async pre hook without it
userSchema.pre("save", async function () {
  if (!this.isModified("passwordHash")) return;
  this.passwordHash = await bcrypt.hash(this.passwordHash, CONSTANTS.SALT_ROUNDS);
});

// Compare password method
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// ✅ Fix 2: cast ret to Record<string, unknown> so delete is allowed
userSchema.set("toJSON", {
  transform: (_doc: any, ret: any) => {
    delete ret.passwordHash;
    delete ret.refreshToken;
    delete ret.__v;
    return ret;
  },
});

export const User = mongoose.model<IUser>("User", userSchema);