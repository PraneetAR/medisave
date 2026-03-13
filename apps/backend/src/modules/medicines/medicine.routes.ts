import { Router } from "express";
import { medicineController } from "./medicine.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

router.get("/search", authenticate, medicineController.search.bind(medicineController));
router.get("/stats",                  medicineController.stats.bind(medicineController));

export default router;
