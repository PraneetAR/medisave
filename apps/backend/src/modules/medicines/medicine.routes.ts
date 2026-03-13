import { Router } from "express";
import { medicineController } from "./medicine.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();

router.get("/search", authMiddleware, medicineController.search.bind(medicineController));
router.get("/stats",                  medicineController.stats.bind(medicineController));

export default router;
