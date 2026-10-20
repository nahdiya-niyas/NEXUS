import { Request, Response } from "express";
import { prisma } from "../config/prisma.js";

interface AuthRequest extends Request {
  user?: {
    userId: number;
    email: string;
    role: "STUDENT" | "LECTURER" | "ADMIN";
  };
}

export async function getModules(
  req: AuthRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const modules = await prisma.module.findMany({
      orderBy: {
        code: "asc",
      },
    });

    return res.json({
      modules,
    });
  } catch (error) {
    console.error("Get modules error:", error);

    return res.status(500).json({
      message: "Failed to load modules",
    });
  }
}

export async function getMyModules(
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

    const modules = enrollments.map(
      (enrollment) => enrollment.module
    );

    return res.json({
      modules,
    });
  } catch (error) {
    console.error("Get my modules error:", error);

    return res.status(500).json({
      message: "Failed to load enrolled modules",
    });
  }
}

export async function getModuleById(
  req: AuthRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const moduleId = Number(req.params.id);

    if (Number.isNaN(moduleId)) {
      return res.status(400).json({
        message: "Invalid module ID",
      });
    }

    const module = await prisma.module.findUnique({
      where: {
        id: moduleId,
      },
      include: {
        lecturer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignments: {
          orderBy: {
            deadline: "asc",
          },
        },
      },
    });

    if (!module) {
      return res.status(404).json({
        message: "Module not found",
      });
    }

    let enrolled = false;

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

      enrolled = !!enrollment;
    } else if (req.user.role === "LECTURER") {
      enrolled =
        module.lecturer?.id === req.user.userId;
    } else if (req.user.role === "ADMIN") {
      enrolled = true;
    }

    return res.json({
      module,
      enrolled,
    });
  } catch (error) {
    console.error("Get module by ID error:", error);

    return res.status(500).json({
      message: "Failed to load module",
    });
  }
}