import { Request, Response } from "express";
import { prisma } from "../config/prisma.js";

interface AuthRequest extends Request {
  user?: {
    userId: number;
    email: string;
    role: "STUDENT" | "LECTURER" | "ADMIN";
  };
}

export async function getDashboard(
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

    const now = new Date();

    // --------------------------------------------------
    // PROFILE
    // --------------------------------------------------

    const profile = await prisma.user.findUnique({
      where: {
        id: studentId,
      },

      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!profile) {
      return res.status(404).json({
        message: "User profile not found",
      });
    }

    // --------------------------------------------------
    // ENROLLED MODULES
    // --------------------------------------------------

    const enrollments =
      await prisma.enrollment.findMany({
        where: {
          studentId,
        },

        include: {
          module: {
            select: {
              id: true,
              code: true,
              name: true,
              credits: true,
            },
          },
        },

        orderBy: {
          enrolledAt: "desc",
        },
      });

    const enrolledModules = enrollments.map(
      (enrollment) => enrollment.module
    );

    const moduleIds = enrolledModules.map(
      (module) => module.id
    );

    // --------------------------------------------------
    // UPCOMING ASSIGNMENTS ONLY
    // --------------------------------------------------

    const assignments =
      await prisma.assignment.findMany({
        where: {
          moduleId: {
            in: moduleIds,
          },

          // IMPORTANT:
          // Past assignments are NOT shown
          // on the dashboard.
          deadline: {
            gt: now,
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
        },

        orderBy: {
          deadline: "asc",
        },

        take: 5,
      });

    return res.json({
      profile,

      enrolledModules,

      assignments,
    });
  } catch (error) {
    console.error(
      "Dashboard error:",
      error
    );

    return res.status(500).json({
      message: "Failed to load dashboard",
    });
  }
}