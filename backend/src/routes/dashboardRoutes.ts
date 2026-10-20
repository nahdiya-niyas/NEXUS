import { Router } from "express";

import { getDashboard } from "../controllers/dashboardController.js";

import { authenticateToken } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = Router();

router.get(
  "/",
  authenticateToken,
  authorizeRoles("STUDENT"),
  getDashboard
);

export default router;