import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  getModules,
  getModuleById,
  createModule,
  updateModule,
  deleteModule,
} from "../controllers/module.controller";

const router = Router();

router.use(authMiddleware);

router.get("/", getModules);
router.post("/", createModule);
router.get("/:id", getModuleById);
router.put("/:id", updateModule);
router.delete("/:id", deleteModule);

export default router;
