import { User, IUser } from "./auth.model";
import { ApiError } from "../../utils/ApiError";
import { generateTokenPair, verifyRefreshToken } from "../../utils/token.service";
import { logger } from "../../utils/logger";
import { RegisterInput, LoginInput } from "./auth.validation";

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
      name: input.name,
      email: input.email,
      passwordHash: input.password, // pre-save hook hashes this
      timezone: input.timezone ?? "Asia/Kolkata",
    });

    const { accessToken, refreshToken } = generateTokenPair(user._id as any, user.email);

    // Store hashed refresh token
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    logger.info(`New user registered: ${user.email}`);

    return { user, accessToken, refreshToken };
  }

  async login(input: LoginInput): Promise<{
    user: IUser;
    accessToken: string;
    refreshToken: string;
  }> {
    // Must explicitly select passwordHash since select: false
    const user = await User.findOne({ email: input.email }).select(
      "+passwordHash +refreshToken"
    );

    if (!user) {
      throw new ApiError(401, "Invalid email or password");
    }

    const isMatch = await user.comparePassword(input.password);
    if (!isMatch) {
      throw new ApiError(401, "Invalid email or password");
    }

    const { accessToken, refreshToken } = generateTokenPair(user._id as any, user.email);

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    logger.info(`User logged in: ${user.email}`);

    return { user, accessToken, refreshToken };
  }

  async refreshTokens(token: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const payload = verifyRefreshToken(token);

    const user = await User.findById(payload.userId).select("+refreshToken");
    if (!user || user.refreshToken !== token) {
      throw new ApiError(401, "Invalid or expired refresh token");
    }

    const { accessToken, refreshToken } = generateTokenPair(user._id as any, user.email);

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  }

  async getMe(userId: string): Promise<IUser> {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    return user;
  }
}

export const authService = new AuthService();