import { User, IUser } from "./auth.model";
import { ApiError } from "../../utils/ApiError";
import { generateTokenPair, verifyRefreshToken } from "../../utils/token.service";
import { logger } from "../../utils/logger";
import { RegisterInput, LoginInput } from "./auth.validation";

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MS    = 15 * 60 * 1000; // 15 minutes

export class AuthService {

  async register(input: RegisterInput): Promise<{
    user: IUser;
    accessToken: string;
    refreshToken: string;
  }> {
    const existingUser = await User.findOne({ email: input.email });
    if (existingUser) {
      throw new ApiError(409, "Email already registered");
    }

    const user = await User.create({
      name:         input.name,
      email:        input.email,
      passwordHash: input.password,
      timezone:     input.timezone ?? "Asia/Kolkata",
    });

    const { accessToken, refreshToken } = generateTokenPair(
      user._id as any,
      user.email
    );

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    logger.info(`New user registered: ${user.email}`);

    return { user, accessToken, refreshToken };
  }

  async login(
    input: LoginInput,
    ip?: string
  ): Promise<{
    user: IUser;
    accessToken: string;
    refreshToken: string;
  }> {
    const user = await User.findOne({ email: input.email }).select(
      "+passwordHash +refreshToken +failedLoginAttempts +lockUntil"
    );

    // ─── Account not found ───────────────────────────────────────
    if (!user) {
      // Log attempt but don't reveal user doesn't exist
      logger.warn(`Failed login — unknown email: ${input.email} [IP: ${ip}]`);
      throw new ApiError(401, "Invalid email or password");
    }

    // ─── Account locked ──────────────────────────────────────────
    if (user.isLocked()) {
      const minutesLeft = Math.ceil(
        (user.lockUntil!.getTime() - Date.now()) / 60000
      );
      logger.warn(
        `Login attempt on locked account: ${input.email} [IP: ${ip}]`
      );
      throw new ApiError(
        423,
        `Account locked due to too many failed attempts. Try again in ${minutesLeft} minute${minutesLeft !== 1 ? "s" : ""}.`
      );
    }

    // ─── Wrong password ──────────────────────────────────────────
    const isMatch = await user.comparePassword(input.password);
    if (!isMatch) {
      user.failedLoginAttempts = (user.failedLoginAttempts ?? 0) + 1;

      if (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
        user.lockUntil = new Date(Date.now() + LOCK_DURATION_MS);
        logger.warn(
          `Account locked after ${MAX_FAILED_ATTEMPTS} failed attempts: ${user.email} [IP: ${ip}]`
        );
      } else {
        const remaining = MAX_FAILED_ATTEMPTS - user.failedLoginAttempts;
        logger.warn(
          `Failed login attempt ${user.failedLoginAttempts}/${MAX_FAILED_ATTEMPTS} for: ${user.email} [IP: ${ip}]`
        );
      }

      await user.save({ validateBeforeSave: false });

      const remaining = MAX_FAILED_ATTEMPTS - user.failedLoginAttempts;
      const message =
        user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS
          ? "Account locked for 15 minutes due to too many failed attempts."
          : `Invalid email or password. ${remaining} attempt${remaining !== 1 ? "s" : ""} remaining.`;

      throw new ApiError(401, message);
    }

    // ─── Successful login ────────────────────────────────────────
    // Reset failed attempts
    user.failedLoginAttempts = 0;
    user.lockUntil           = null;
    user.lastLoginAt         = new Date();
    user.lastLoginIp         = ip ?? null;

    const { accessToken, refreshToken } = generateTokenPair(
      user._id as any,
      user.email
    );

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    logger.info(`User logged in: ${user.email} [IP: ${ip}]`);

    return { user, accessToken, refreshToken };
  }

  async refreshTokens(token: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    let payload;
    try {
      payload = verifyRefreshToken(token);
    } catch {
      throw new ApiError(401, "Invalid or expired refresh token");
    }

    const user = await User.findById(payload.userId).select("+refreshToken");
    if (!user || user.refreshToken !== token) {
      // Possible token reuse attack
      logger.warn(`Refresh token reuse detected for user: ${payload.userId}`);
      // Invalidate all tokens for this user
      if (user) {
        user.refreshToken = null;
        await user.save({ validateBeforeSave: false });
      }
      throw new ApiError(401, "Invalid or expired refresh token");
    }

    const { accessToken, refreshToken } = generateTokenPair(
      user._id as any,
      user.email
    );

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  }

  async getMe(userId: string): Promise<IUser> {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, "User not found");
    return user;
  }
}

export const authService = new AuthService();
