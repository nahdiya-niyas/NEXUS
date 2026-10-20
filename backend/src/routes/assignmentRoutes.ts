import { Router } from "express";

import {
  getAssignments,
  getAssignmentById,
  submitAssignment,
  uploadSubmission,
} from "../controllers/assignmentController.js";

import { authenticateToken } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = Router();

router.get(
  "/",
  authenticateToken,
  authorizeRoles("STUDENT"),
  getAssignments
);

router.get(
  "/:id",
  authenticateToken,
  authorizeRoles("STUDENT"),
  getAssignmentById
);

router.post(
  "/:id/submit",
  authenticateToken,
  authorizeRoles("STUDENT"),
  uploadSubmission.single("file"),
  submitAssignment
);

export default router;