import { Request, Response } from "express";
import { prisma } from "../config/prisma.js";

interface AuthRequest extends Request {
  user?: {
    userId: number;
    email: string;
    role: "STUDENT" | "LECTURER" | "ADMIN";
  };
}

export async function enrollInModule(
  req: AuthRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const studentId = req.user.userId;
    const code = req.body.code?.trim().toUpperCase();

    if (!code) {
      return res.status(400).json({
        message: "Module code is required",
      });
    }

    const module = await prisma.module.findUnique({
      where: {
        code,
      },
    });

    if (!module) {
      return res.status(404).json({
        message: "Invalid module code",
      });
    }

    const existingEnrollment =
      await prisma.enrollment.findUnique({
        where: {
          studentId_moduleId: {
            studentId,
            moduleId: module.id,
          },
        },
      });

    if (existingEnrollment) {
      return res.status(409).json({
        message: "You are already enrolled in this module",
      });
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        studentId,
        moduleId: module.id,
      },
      include: {
        module: true,
      },
    });

    return res.status(201).json({
      message: "Successfully enrolled in module",
      enrollment,
    });
  } catch (error) {
    console.error("Enroll module error:", error);

    return res.status(500).json({
      message: "Failed to enroll in module",
    });
  }
}

export async function dropModule(
  req: AuthRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const studentId = req.user.userId;
    const moduleId = Number(req.params.moduleId);

    if (Number.isNaN(moduleId)) {
      return res.status(400).json({
        message: "Invalid module ID",
      });
    }

    const enrollment =
      await prisma.enrollment.findUnique({
        where: {
          studentId_moduleId: {
            studentId,
            moduleId,
          },
        },
      });

    if (!enrollment) {
      return res.status(404).json({
        message: "You are not enrolled in this module",
      });
    }

    await prisma.enrollment.delete({
      where: {
        id: enrollment.id,
      },
    });

    return res.json({
      message: "Successfully dropped module",
    });
  } catch (error) {
    console.error("Drop module error:", error);

    return res.status(500).json({
      message: "Failed to drop module",
    });
  }
}

export async function getMyEnrollments(
  req: AuthRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const studentId = req.user.userId;

    const enrollments =
      await prisma.enrollment.findMany({
        where: {
          studentId,
        },
        include: {
          module: true,
        },
        orderBy: {
          enrolledAt: "desc",
        },
      });

    return res.json({
      enrollments,
    });
  } catch (error) {
    console.error("Get enrollments error:", error);

    return res.status(500).json({
      message: "Failed to load enrollments",
    });
  }
}