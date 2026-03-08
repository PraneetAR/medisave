import { Router } from "express";
import { priceController } from "./price.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

router.use(authenticate);

router.get("/search", (req, res, next) =>
  priceController.search(req, res, next)
);

router.get("/cache-status", (req, res, next) =>
  priceController.cacheStatus(req, res, next)
);

export default router;