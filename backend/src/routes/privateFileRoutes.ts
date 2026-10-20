import { Router } from "express";

import {
  getPrivateFiles,
  createPrivateFile,
  downloadPrivateFile,
  deletePrivateFile,
  uploadPrivateFile,
} from "../controllers/privateFileController.js";

import { authenticateToken } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = Router();

router.get(
  "/",
  authenticateToken,
  authorizeRoles("STUDENT"),
  getPrivateFiles
);

router.post(
  "/",
  authenticateToken,
  authorizeRoles("STUDENT"),
  uploadPrivateFile.single("file"),
  createPrivateFile
);

router.get(
  "/:id/download",
  authenticateToken,
  authorizeRoles("STUDENT"),
  downloadPrivateFile
);

router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("STUDENT"),
  deletePrivateFile
);

export default router;