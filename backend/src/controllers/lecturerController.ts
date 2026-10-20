import { Response } from "express";

import { prisma } from "../config/prisma.js";
import { AuthRequest } from "../middleware/authMiddleware.js";

export async function getLecturerDashboard(
  req: AuthRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    if (req.user.role !== "LECTURER") {
      return res.status(403).json({
        message: "Lecturer access required",
      });
    }

    const lecturerId = req.user.userId;

    const lecturer = await prisma.user.findUnique({
      where: {
        id: lecturerId,
      },

      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!lecturer) {
      return res.status(404).json({
        message: "Lecturer not found",
      });
    }

    const modules = await prisma.module.findMany({
      where: {
        lecturerId,
      },

      include: {
        _count: {
          select: {
            enrollments: true,
            assignments: true,
            resources: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

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

    const totalStudents = await prisma.enrollment.count({
      where: {
        module: {
          lecturerId,
        },
      },
    });

    const totalResources = await prisma.resource.count({
      where: {
        module: {
          lecturerId,
        },
      },
    });

    const totalAssignments = await prisma.assignment.count({
      where: {
        lecturerId,
      },
    });

    return res.json({
      profile: lecturer,

      statistics: {
        modules: modules.length,
        students: totalStudents,
        assignments: totalAssignments,
        resources: totalResources,
      },

      modules,
      assignments,
    });
  } catch (error) {
    console.error(
      "Lecturer dashboard error:",
      error
    );

    return res.status(500).json({
      message: "Failed to load lecturer dashboard",
    });
  }
}


/*
 * Get modules belonging to the logged-in lecturer.
 */
export async function getLecturerModules(
  req: AuthRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    if (req.user.role !== "LECTURER") {
      return res.status(403).json({
        message: "Lecturer access required",
      });
    }

    const lecturerId = req.user.userId;

    const modules = await prisma.module.findMany({
      where: {
        lecturerId,
      },

      include: {
        _count: {
          select: {
            enrollments: true,
            assignments: true,
            resources: true,
          },
        },
      },

      orderBy: {
        code: "asc",
      },
    });

    return res.json({
      modules,
    });
  } catch (error) {
    console.error(
      "Get lecturer modules error:",
      error
    );

    return res.status(500).json({
      message: "Failed to load lecturer modules",
    });
  }
}


/*
 * Get one module belonging to the logged-in lecturer.
 */
export async function getLecturerModuleById(
  req: AuthRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    if (req.user.role !== "LECTURER") {
      return res.status(403).json({
        message: "Lecturer access required",
      });
    }

    const lecturerId = req.user.userId;

    const moduleId = Number(req.params.id);

    if (Number.isNaN(moduleId)) {
      return res.status(400).json({
        message: "Invalid module ID",
      });
    }

    const module = await prisma.module.findFirst({
      where: {
        id: moduleId,
        lecturerId,
      },

      include: {
        _count: {
          select: {
            enrollments: true,
            assignments: true,
            resources: true,
          },
        },

        enrollments: {
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
            enrolledAt: "asc",
          },
        },

        assignments: {
          include: {
            _count: {
              select: {
                submissions: true,
              },
            },
          },

          orderBy: {
            deadline: "asc",
          },
        },

        resources: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!module) {
      return res.status(404).json({
        message: "Module not found or access denied",
      });
    }

    return res.json({
      module,
    });
  } catch (error) {
    console.error(
      "Get lecturer module error:",
      error
    );

    return res.status(500).json({
      message: "Failed to load module",
    });
  }
}