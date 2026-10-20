import { Router } from "express";

import {
  enrollInModule,
  dropModule,
  getMyEnrollments,
} from "../controllers/enrollmentController.js";

import { authenticateToken } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = Router();

router.post(
  "/",
  authenticateToken,
  authorizeRoles("STUDENT"),
  enrollInModule
);

router.get(
  "/my",
  authenticateToken,
  authorizeRoles("STUDENT"),
  getMyEnrollments
);

router.delete(
  "/:moduleId",
  authenticateToken,
  authorizeRoles("STUDENT"),
  dropModule
);

export default router;