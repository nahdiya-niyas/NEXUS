import { Response } from "express";
import path from "path";
import fs from "fs";
import multer from "multer";

import { prisma } from "../config/prisma.js";
import { AuthRequest } from "../middleware/authMiddleware.js";

const uploadDirectory = path.join(
  process.cwd(),
  "uploads",
  "submissions"
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

export const uploadSubmission = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

export async function getAssignments(
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
        message: "Student access only",
      });
    }

    const assignments = await prisma.assignment.findMany({
      where: {
        module: {
          enrollments: {
            some: {
              studentId: req.user.userId,
            },
          },
        },
      },

      include: {
        module: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },

        submissions: {
          where: {
            studentId: req.user.userId,
          },

          select: {
            id: true,
            submittedAt: true,
            status: true,
            fileName: true,
          },
        },
      },

      orderBy: {
        deadline: "asc",
      },
    });

    return res.json({
      assignments,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to fetch assignments",
    });
  }
}

export async function getAssignmentById(
  req: AuthRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const assignmentId = Number(req.params.id);

    if (Number.isNaN(assignmentId)) {
      return res.status(400).json({
        message: "Invalid assignment ID",
      });
    }

    const assignment = await prisma.assignment.findUnique({
      where: {
        id: assignmentId,
      },

      include: {
        module: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },

        submissions: {
          where: {
            studentId: req.user.userId,
          },

          select: {
            id: true,
            fileName: true,
            submittedAt: true,
            status: true,
          },
        },
      },
    });

    if (!assignment) {
      return res.status(404).json({
        message: "Assignment not found",
      });
    }

    if (req.user.role === "STUDENT") {
      const enrollment = await prisma.enrollment.findUnique({
        where: {
          studentId_moduleId: {
            studentId: req.user.userId,
            moduleId: assignment.moduleId,
          },
        },
      });

      if (!enrollment) {
        return res.status(403).json({
          message: "You are not enrolled in this module",
        });
      }
    }

    return res.json({
      assignment,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to fetch assignment",
    });
  }
}

export async function submitAssignment(
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
        message: "Only students can submit assignments",
      });
    }

    const assignmentId = Number(req.params.id);

    if (Number.isNaN(assignmentId)) {
      return res.status(400).json({
        message: "Invalid assignment ID",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Please select a file to submit",
      });
    }

    const assignment = await prisma.assignment.findUnique({
      where: {
        id: assignmentId,
      },
    });

    if (!assignment) {
      fs.unlinkSync(req.file.path);

      return res.status(404).json({
        message: "Assignment not found",
      });
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_moduleId: {
          studentId: req.user.userId,
          moduleId: assignment.moduleId,
        },
      },
    });

    if (!enrollment) {
      fs.unlinkSync(req.file.path);

      return res.status(403).json({
        message: "You are not enrolled in this module",
      });
    }

    const existingSubmission =
      await prisma.submission.findUnique({
        where: {
          assignmentId_studentId: {
            assignmentId,
            studentId: req.user.userId,
          },
        },
      });

    if (existingSubmission) {
      fs.unlinkSync(req.file.path);

      return res.status(409).json({
        message:
          "You have already submitted this assignment",
      });
    }

    const status =
      new Date() > assignment.deadline
        ? "LATE"
        : "SUBMITTED";

    const submission = await prisma.submission.create({
      data: {
        assignmentId,
        studentId: req.user.userId,
        fileName: req.file.originalname,
        filePath: req.file.path,
        status,
      },
    });

    return res.status(201).json({
      message: "Assignment submitted successfully",
      submission: {
        id: submission.id,
        fileName: submission.fileName,
        submittedAt: submission.submittedAt,
        status: submission.status,
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
      message: "Failed to submit assignment",
    });
  }
}