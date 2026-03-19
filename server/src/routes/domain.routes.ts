import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  getDomains,
  getDomainById,
  createDomain,
  updateDomain,
  deleteDomain,
} from "../controllers/domain.controller";

const router = Router();

router.use(authMiddleware);

router.get("/", getDomains);
router.post("/", createDomain);
router.get("/:id", getDomainById);
router.put("/:id", updateDomain);
router.delete("/:id", deleteDomain);

export default router;
