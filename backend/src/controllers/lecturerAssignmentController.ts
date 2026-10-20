
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

/*
 * =========================================================
 * ASSIGNMENT DOCUMENT UPLOAD
 * =========================================================
 */

const uploadDirectory = path.join(
  process.cwd(),
  "uploads",
  "assignments"
);

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, {
    recursive: true,
  });
}

const assignmentStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDirectory);
  },

  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname);

    const filename = `assignment-${Date.now()}-${Math.round(
      Math.random() * 1000000
    )}${extension}`;

    cb(null, filename);
  },
});

export const uploadAssignmentDocument = multer({
  storage: assignmentStorage,

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
    ];

    if (!allowedExtensions.includes(extension)) {
      return cb(
        new Error(
          "Only PDF, DOC and DOCX files are allowed."
        )
      );
    }

    cb(null, true);
  },
});


/*
 * =========================================================
 * GET ALL ASSIGNMENTS CREATED BY LECTURER
 * =========================================================
 */

export async function getLecturerAssignments(
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

    const assignments = await prisma.assignment.findMany({
      where: {
        lecturerId,
      },

      include: {
        module: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },

        _count: {
          select: {
            submissions: true,
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
    console.error(
      "Get lecturer assignments error:",
      error
    );

    return res.status(500).json({
      message: "Failed to load lecturer assignments",
    });
  }
}


/*
 * =========================================================
 * GET ONE ASSIGNMENT + STUDENT SUBMISSIONS
 * =========================================================
 */

export async function getLecturerAssignmentById(
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
    const assignmentId = Number(req.params.id);

    if (Number.isNaN(assignmentId)) {
      return res.status(400).json({
        message: "Invalid assignment ID",
      });
    }

    const assignment = await prisma.assignment.findFirst({
      where: {
        id: assignmentId,
        lecturerId,
      },

      include: {
        module: true,

        submissions: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },

          orderBy: {
            submittedAt: "desc",
          },
        },
      },
    });

    if (!assignment) {
      return res.status(404).json({
        message: "Assignment not found",
      });
    }

    return res.json({
      assignment,
    });
  } catch (error) {
    console.error(
      "Get lecturer assignment error:",
      error
    );

    return res.status(500).json({
      message: "Failed to load assignment",
    });
  }
}


/*
 * =========================================================
 * CREATE ASSIGNMENT
 * =========================================================
 */

export async function createLecturerAssignment(
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

    const {
      title,
      description,
      deadline,
      moduleId,
    } = req.body;

    if (!title || !deadline || !moduleId) {
      return res.status(400).json({
        message:
          "Title, deadline and module are required",
      });
    }

    const numericModuleId = Number(moduleId);

    if (Number.isNaN(numericModuleId)) {
      return res.status(400).json({
        message: "Invalid module ID",
      });
    }

    const module = await prisma.module.findFirst({
      where: {
        id: numericModuleId,
        lecturerId,
      },
    });

    if (!module) {
      return res.status(403).json({
        message:
          "You can only create assignments for your own modules",
      });
    }

    const file = req.file;

    const assignment = await prisma.assignment.create({
      data: {
        title,
        description: description || null,
        deadline: new Date(deadline),

        moduleId: numericModuleId,
        lecturerId,

        fileName: file
          ? file.originalname
          : null,

        filePath: file
          ? `/uploads/assignments/${file.filename}`
          : null,
      },

      include: {
        module: true,
      },
    });

    return res.status(201).json({
      message: "Assignment created successfully",
      assignment,
    });
  } catch (error) {
    console.error(
      "Create lecturer assignment error:",
      error
    );

    return res.status(500).json({
      message: "Failed to create assignment",
    });
  }
}


/*
 * =========================================================
 * DOWNLOAD STUDENT SUBMISSION
 * =========================================================
 */

export async function downloadStudentSubmission(
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
    const submissionId = Number(req.params.id);

    if (Number.isNaN(submissionId)) {
      return res.status(400).json({
        message: "Invalid submission ID",
      });
    }

    /*
     * Find the submission.
     *
     * We first find it by ID, then check that its
     * assignment belongs to the logged-in lecturer.
     */

    const submission = await prisma.submission.findUnique({
      where: {
        id: submissionId,
      },

      include: {
        assignment: {
          select: {
            id: true,
            title: true,
            lecturerId: true,
          },
        },

        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!submission) {
      return res.status(404).json({
        message: "Submission not found",
      });
    }

    /*
     * Security check.
     *
     * Lecturer can only access submissions belonging
     * to assignments created by that lecturer.
     */

    if (
      submission.assignment.lecturerId !==
      lecturerId
    ) {
      return res.status(403).json({
        message:
          "You are not allowed to access this submission",
      });
    }

    /*
     * The student's submission file may have been
     * stored as an absolute Windows path or as a
     * relative upload path.
     */

    let filePath = submission.filePath;

    if (path.isAbsolute(filePath)) {
      /*
       * Existing submissions may already contain:
       *
       * C:\Users\nahdi\Desktop\nexus\backend\
       * uploads\submissions\filename.pdf
       */
      filePath = path.normalize(filePath);
    } else {
      /*
       * Newer submissions may contain:
       *
       * /uploads/submissions/filename.pdf
       */

      filePath = path.join(
        process.cwd(),
        filePath.replace(/^[/\\]+/, "")
      );
    }

    /*
     * If the stored path doesn't exist, try the
     * standard submissions folder using the filename.
     */

    if (!fs.existsSync(filePath)) {
      const fileName = path.basename(
        submission.filePath
      );

      const fallbackPath = path.join(
        process.cwd(),
        "uploads",
        "submissions",
        fileName
      );

      if (fs.existsSync(fallbackPath)) {
        filePath = fallbackPath;
      }
    }

    /*
     * Final file existence check.
     */

    if (!fs.existsSync(filePath)) {
      console.error(
        "Student submission file not found:"
      );

      console.error(
        "Stored path:",
        submission.filePath
      );

      console.error(
        "Resolved path:",
        filePath
      );

      return res.status(404).json({
        message:
          "The student's uploaded answer file could not be found on the server.",
      });
    }

    /*
     * Send the actual student answer file.
     */

    return res.download(
      filePath,
      submission.fileName,
      (error) => {
        if (error) {
          console.error(
            "Student answer download error:",
            error
          );

          if (!res.headersSent) {
            res.status(500).json({
              message:
                "Failed to send the student's answer file.",
            });
          }
        }
      }
    );
  } catch (error) {
    console.error(
      "Download student submission error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to download the student's answer.",
    });
  }
}
