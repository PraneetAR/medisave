import { Router } from "express";
import { authController } from "./auth.controller";
import { validate } from "../../middlewares/validate";
import { authenticate } from "../../middlewares/auth.middleware";
import { registerSchema, loginSchema, refreshSchema } from "./auth.validation";

const router = Router();

router.post("/register", validate(registerSchema), (req, res, next) =>
  authController.register(req, res, next)
);

router.post("/login", validate(loginSchema), (req, res, next) =>
  authController.login(req, res, next)
);

router.post("/refresh", validate(refreshSchema), (req, res, next) =>
  authController.refresh(req, res, next)
);

router.post("/verify-otp", authController.verifyOtp);

router.get("/me", authenticate, (req, res, next) =>
  authController.me(req, res, next)
);

export default router;