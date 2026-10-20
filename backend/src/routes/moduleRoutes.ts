import { Router } from "express";

import {
  getModules,
  getMyModules,
  getModuleById,
} from "../controllers/moduleController.js";

import { authenticateToken } from "../middleware/authMiddleware.js";

const router = Router();

router.get(
  "/",
  authenticateToken,
  getModules
);

router.get(
  "/my",
  authenticateToken,
  getMyModules
);

router.get(
  "/:id",
  authenticateToken,
  getModuleById
);

export default router;