import { Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

import { prisma } from "../config/prisma.js";

interface AuthRequest extends Request {
  user?: {
    userId: number;
    email: string;
    role: "STUDENT" | "LECTURER" | "ADMIN";
  };
}

const uploadDirectory = path.join(
  process.cwd(),
  "uploads",
  "resources"
);

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, {
    recursive: true,
  });
}

const resourceStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDirectory);
  },

  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname);

    const filename = `resource-${Date.now()}-${Math.round(
      Math.random() * 1000000
    )}${extension}`;

    cb(null, filename);
  },
});

export const uploadResource = multer({
  storage: resourceStorage,

  limits: {
    fileSize: 20 * 1024 * 1024,
  },

  fileFilter: (_req, file, cb) => {
    const extension = path
      .extname(file.originalname)
      .toLowerCase();

    const allowedExtensions = [
      ".pdf",
      ".doc",
      ".docx",
      ".ppt",
      ".pptx",
      ".xls",
      ".xlsx",
    ];

    if (!allowedExtensions.includes(extension)) {
      return cb(
        new Error(
          "Only PDF, DOC, DOCX, PPT, PPTX, XLS and XLSX files are allowed."
        )
      );
    }

    cb(null, true);
  },
});

export async function getModuleResources(
  req: AuthRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const moduleId = Number(req.params.moduleId);

    if (Number.isNaN(moduleId)) {
      return res.status(400).json({
        message: "Invalid module ID",
      });
    }

    const module = await prisma.module.findUnique({
      where: {
        id: moduleId,
      },
    });

    if (!module) {
      return res.status(404).json({
        message: "Module not found",
      });
    }

    if (req.user.role === "STUDENT") {
      const enrollment =
        await prisma.enrollment.findUnique({
          where: {
            studentId_moduleId: {
              studentId: req.user.userId,
              moduleId,
            },
          },
        });

      if (!enrollment) {
        return res.status(403).json({
          message:
            "You haven't enrolled in this module yet.",
        });
      }
    }

    if (req.user.role === "LECTURER") {
      if (module.lecturerId !== req.user.userId) {
        return res.status(403).json({
          message:
            "You can only access resources from your own modules.",
        });
      }
    }

    const resources = await prisma.resource.findMany({
      where: {
        moduleId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json({
      resources,
    });
  } catch (error) {
    console.error(
      "Get module resources error:",
      error
    );

    return res.status(500).json({
      message: "Failed to load resources",
      error:
        error instanceof Error
          ? error.message
          : String(error),
    });
  }
}

export async function createResource(
  req: AuthRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const lecturerId = req.user.userId;
    const moduleId = Number(req.params.moduleId);
    const title = req.body.title?.trim();

    if (Number.isNaN(moduleId)) {
      return res.status(400).json({
        message: "Invalid module ID",
      });
    }

    if (!title) {
      return res.status(400).json({
        message: "Resource title is required",
      });
    }

    const module = await prisma.module.findFirst({
      where: {
        id: moduleId,
        lecturerId,
      },
    });

    if (!module) {
      return res.status(403).json({
        message:
          "You can only add resources to your own modules",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Resource file is required",
      });
    }

    const resource = await prisma.resource.create({
      data: {
        title,
        fileName: req.file.originalname,
        filePath: `/uploads/resources/${req.file.filename}`,
        moduleId,
      },
    });

    return res.status(201).json({
      message: "Resource uploaded successfully",
      resource,
    });
  } catch (error) {
    console.error(
      "Create resource error:",
      error
    );

    return res.status(500).json({
      message: "Failed to upload resource",
    });
  }
}

export async function deleteResource(
  req: AuthRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const lecturerId = req.user.userId;
    const resourceId = Number(req.params.id);

    if (Number.isNaN(resourceId)) {
      return res.status(400).json({
        message: "Invalid resource ID",
      });
    }

    const resource = await prisma.resource.findUnique({
      where: {
        id: resourceId,
      },
      include: {
        module: {
          select: {
            lecturerId: true,
          },
        },
      },
    });

    if (!resource) {
      return res.status(404).json({
        message: "Resource not found",
      });
    }

    if (resource.module.lecturerId !== lecturerId) {
      return res.status(403).json({
        message:
          "You are not allowed to delete this resource",
      });
    }

    let filePath = resource.filePath;

    if (path.isAbsolute(filePath)) {
      filePath = path.normalize(filePath);
    } else {
      filePath = path.join(
        process.cwd(),
        filePath.replace(/^[/\\]+/, "")
      );
    }

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await prisma.resource.delete({
      where: {
        id: resourceId,
      },
    });

    return res.json({
      message: "Resource deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete resource error:",
      error
    );

    return res.status(500).json({
      message: "Failed to delete resource",
    });
  }
}