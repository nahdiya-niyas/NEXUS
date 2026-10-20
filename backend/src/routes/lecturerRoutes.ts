import { Router } from "express";

import {
  getLecturerDashboard,
  getLecturerModules,
  getLecturerModuleById,
} from "../controllers/lecturerController.js";

import {
  getLecturerAssignments,
  getLecturerAssignmentById,
  createLecturerAssignment,
  uploadAssignmentDocument,
  downloadStudentSubmission,
} from "../controllers/lecturerAssignmentController.js";

import { authenticateToken } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = Router();


/*
 * =========================================================
 * LECTURER DASHBOARD
 * =========================================================
 */

router.get(
  "/dashboard",
  authenticateToken,
  authorizeRoles("LECTURER"),
  getLecturerDashboard
);


/*
 * =========================================================
 * LECTURER MODULES
 * =========================================================
 */

router.get(
  "/modules",
  authenticateToken,
  authorizeRoles("LECTURER"),
  getLecturerModules
);

router.get(
  "/modules/:id",
  authenticateToken,
  authorizeRoles("LECTURER"),
  getLecturerModuleById
);


/*
 * =========================================================
 * LECTURER ASSIGNMENTS
 * =========================================================
 */

router.get(
  "/assignments",
  authenticateToken,
  authorizeRoles("LECTURER"),
  getLecturerAssignments
);

router.get(
  "/assignments/:id",
  authenticateToken,
  authorizeRoles("LECTURER"),
  getLecturerAssignmentById
);

router.post(
  "/assignments",
  authenticateToken,
  authorizeRoles("LECTURER"),
  uploadAssignmentDocument.single("file"),
  createLecturerAssignment
);


/*
 * =========================================================
 * STUDENT SUBMISSION FILE
 * =========================================================
 */

router.get(
  "/submissions/:id/file",
  authenticateToken,
  authorizeRoles("LECTURER"),
  downloadStudentSubmission
);


export default router;