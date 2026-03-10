import { Request, Response, NextFunction } from "express";
import { authService } from "./auth.service";
import { ApiResponse } from "../../utils/ApiResponse";

export class AuthController {

  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user, accessToken, refreshToken } = await authService.register(req.body);
      res.status(201).json(
        new ApiResponse(201, "Registration successful", {
          user,
          accessToken,
          refreshToken,
        })
      );
    } catch (err) { next(err); }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Get real IP (works behind Render proxy)
      const ip =
        (req.headers["x-forwarded-for"] as string)?.split(",")[0].trim() ??
        req.socket.remoteAddress ??
        "unknown";

      const { user, accessToken, refreshToken } = await authService.login(
        req.body,
        ip
      );

      res.status(200).json(
        new ApiResponse(200, "Login successful", {
          user,
          accessToken,
          refreshToken,
        })
      );
    } catch (err) { next(err); }
  }

  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      const tokens = await authService.refreshTokens(refreshToken);
      res.status(200).json(new ApiResponse(200, "Tokens refreshed", tokens));
    } catch (err) { next(err); }
  }

  async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await authService.getMe(req.user!.userId);
      res.status(200).json(new ApiResponse(200, "User fetched", user));
    } catch (err) { next(err); }
  }
}

export const authController = new AuthController();
