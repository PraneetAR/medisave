import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";
import { CONSTANTS } from "../../config/constants";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  timezone: string;
  refreshToken: string | null;
  failedLoginAttempts: number;
  lockUntil: Date | null;
  lastLoginAt: Date | null;
  lastLoginIp: string | null;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  isLocked(): boolean;
  otp: string | null;            
  otpExpiresAt: Date | null;      
  isEmailVerified: boolean; 
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
    failedLoginAttempts: {
      type: Number,
      default: 0,
      select: false,
    },
    lockUntil: {
      type: Date,
      default: null,
      select: false,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
    lastLoginIp: {
      type: String,
      default: null,
    },

    // OTP and email verification
    otp: {
      type: String,
      default: null,
      select: false,
    },
    otpExpiresAt: {
      type: Date,
      default: null,
      select: false,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("passwordHash")) return;
  this.passwordHash = await bcrypt.hash(
    this.passwordHash,
    CONSTANTS.SALT_ROUNDS
  );
});

// Check if account is locked
userSchema.methods.isLocked = function (): boolean {
  return !!(this.lockUntil && this.lockUntil > new Date());
};

// Compare password
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Remove sensitive fields from JSON output
userSchema.set("toJSON", {
  transform: (_doc: any, ret: any) => {
    delete ret.passwordHash;
    delete ret.refreshToken;
    delete ret.failedLoginAttempts;
    delete ret.lockUntil;
    delete ret.otp;             
    delete ret.otpExpiresAt;    
    delete ret.__v;
    return ret;
  },
});

export const User = mongoose.model<IUser>("User", userSchema);