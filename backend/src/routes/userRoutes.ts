import { Router } from "express";
import {
  getMe,
  updateMe,
  changePassword,
} from "../controllers/userController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = Router();

router.get("/me", authenticateToken, getMe);

router.put("/me", authenticateToken, updateMe);

router.put(
  "/change-password",
  authenticateToken,
  changePassword
);

// Temporary role-protected test routes
router.get(
  "/student-test",
  authenticateToken,
  authorizeRoles("STUDENT"),
  (req, res) => {
    res.json({
      message: "Student access granted",
      role: req.user?.role,
    });
  }
);

router.get(
  "/lecturer-test",
  authenticateToken,
  authorizeRoles("LECTURER"),
  (req, res) => {
    res.json({
      message: "Lecturer access granted",
      role: req.user?.role,
    });
  }
);

router.get(
  "/admin-test",
  authenticateToken,
  authorizeRoles("ADMIN"),
  (req, res) => {
    res.json({
      message: "Admin access granted",
      role: req.user?.role,
    });
  }
);

export default router;