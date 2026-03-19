import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  getPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan,
} from "../controllers/plan.controller";

const router = Router();

router.use(authMiddleware);

router.get("/", getPlans);
router.post("/", createPlan);
router.get("/:id", getPlanById);
router.put("/:id", updatePlan);
router.delete("/:id", deletePlan);

export default router;
