
import { Router } from "express";

import {
  getModuleResources,
  createResource,
  deleteResource,
  uploadResource,
} from "../controllers/resourceController.js";

import { authenticateToken } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = Router();

router.get(
  "/module/:moduleId",
  authenticateToken,
  getModuleResources
);

router.post(
  "/module/:moduleId",
  authenticateToken,
  authorizeRoles("LECTURER"),
  uploadResource.single("file"),
  createResource
);

router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("LECTURER"),
  deleteResource
);

export default router;
