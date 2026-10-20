import { Response } from "express";
import path from "path";
import fs from "fs";
import multer from "multer";

import { prisma } from "../config/prisma.js";
import { AuthRequest } from "../middleware/authMiddleware.js";

const uploadDirectory = path.join(
  process.cwd(),
  "uploads",
  "private"
);

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, {
    recursive: true,
  });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDirectory);
  },

  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname);

    const uniqueName = `${Date.now()}-${Math.round(
      Math.random() * 1_000_000_000
    )}${extension}`;

    cb(null, uniqueName);
  },
});

export const uploadPrivateFile = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024,
  },
});

export async function getPrivateFiles(
  req: AuthRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    // Private files are ONLY available to the owner.
    // No lecturer, admin, or other student can use this endpoint.
    if (req.user.role !== "STUDENT") {
      return res.status(403).json({
        message: "Private files are only available to students",
      });
    }

    const files = await prisma.privateFile.findMany({
      where: {
        studentId: req.user.userId,
      },

      select: {
        id: true,
        fileName: true,
        uploadedAt: true,
      },

      orderBy: {
        uploadedAt: "desc",
      },
    });

    return res.json({
      files,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to fetch private files",
    });
  }
}

export async function createPrivateFile(
  req: AuthRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    if (req.user.role !== "STUDENT") {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }

      return res.status(403).json({
        message: "Only students can upload private files",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Please select a file",
      });
    }

    const privateFile = await prisma.privateFile.create({
      data: {
        fileName: req.file.originalname,
        filePath: req.file.path,
        studentId: req.user.userId,
      },
    });

    return res.status(201).json({
      message: "Private file uploaded successfully",

      file: {
        id: privateFile.id,
        fileName: privateFile.fileName,
        uploadedAt: privateFile.uploadedAt,
      },
    });
  } catch (error) {
    console.error(error);

    if (req.file) {
      try {
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
      } catch {
        // Ignore cleanup errors
      }
    }

    return res.status(500).json({
      message: "Failed to upload private file",
    });
  }
}

export async function downloadPrivateFile(
  req: AuthRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    if (req.user.role !== "STUDENT") {
      return res.status(403).json({
        message: "Private files are only available to students",
      });
    }

    const fileId = Number(req.params.id);

    if (Number.isNaN(fileId)) {
      return res.status(400).json({
        message: "Invalid file ID",
      });
    }

    const file = await prisma.privateFile.findUnique({
      where: {
        id: fileId,
      },
    });

    if (!file) {
      return res.status(404).json({
        message: "Private file not found",
      });
    }

    // CRITICAL SECURITY CHECK:
    // The file owner must be the currently authenticated student.
    if (file.studentId !== req.user.userId) {
      return res.status(403).json({
        message: "You do not have access to this file",
      });
    }

    if (!fs.existsSync(file.filePath)) {
      return res.status(404).json({
        message: "File no longer exists on the server",
      });
    }

    return res.download(
      file.filePath,
      file.fileName
    );
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to download private file",
    });
  }
}

export async function deletePrivateFile(
  req: AuthRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    if (req.user.role !== "STUDENT") {
      return res.status(403).json({
        message: "Private files are only available to students",
      });
    }

    const fileId = Number(req.params.id);

    if (Number.isNaN(fileId)) {
      return res.status(400).json({
        message: "Invalid file ID",
      });
    }

    const file = await prisma.privateFile.findUnique({
      where: {
        id: fileId,
      },
    });

    if (!file) {
      return res.status(404).json({
        message: "Private file not found",
      });
    }

    // CRITICAL SECURITY CHECK:
    // Only the owner can delete the file.
    if (file.studentId !== req.user.userId) {
      return res.status(403).json({
        message: "You do not have access to this file",
      });
    }

    if (fs.existsSync(file.filePath)) {
      fs.unlinkSync(file.filePath);
    }

    await prisma.privateFile.delete({
      where: {
        id: file.id,
      },
    });

    return res.json({
      message: "Private file deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to delete private file",
    });
  }
}