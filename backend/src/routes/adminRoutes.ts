import { Router } from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import {
  getAdminStats,
  getAllUsers,
  createUser,
  updateUserRole,
  deleteUser,
  getAdminModules,
  createModule,
  deleteModule,
  getLecturers,
  getStudents,
  getAllEnrollments,
  enrollStudent,
  removeEnrollment,
  getReports,
} from "../controllers/adminController.js";

const router = Router();

// All admin routes require authentication + ADMIN role
router.use(authenticateToken);
router.use(authorizeRoles("ADMIN"));

// Stats
router.get("/stats", getAdminStats);

// Users
router.get("/users", getAllUsers);
router.post("/users", createUser);
router.patch("/users/:id/role", updateUserRole);
router.delete("/users/:id", deleteUser);

// Modules
router.get("/modules", getAdminModules);
router.post("/modules", createModule);
router.delete("/modules/:id", deleteModule);

// Dropdowns
router.get("/lecturers", getLecturers);
router.get("/students", getStudents);

// Enrollments
router.get("/enrollments", getAllEnrollments);
router.post("/enrollments", enrollStudent);
router.delete("/enrollments/:id", removeEnrollment);

// Reports
router.get("/reports", getReports);

export default router;
