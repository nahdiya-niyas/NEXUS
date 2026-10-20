import { Response } from "express";
import bcrypt from "bcrypt";
import { AuthRequest } from "../middleware/authMiddleware.js";
import { prisma } from "../config/prisma.js";

// ─── GET STATS ───────────────────────────────────────────────────────────────

export async function getAdminStats(
  req: AuthRequest,
  res: Response
) {
  try {
    const [
      totalStudents,
      totalLecturers,
      totalAdmins,
      totalModules,
      totalAssignments,
      totalSubmissions,
      totalEnrollments,
    ] = await Promise.all([
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.user.count({ where: { role: "LECTURER" } }),
      prisma.user.count({ where: { role: "ADMIN" } }),
      prisma.module.count(),
      prisma.assignment.count(),
      prisma.submission.count(),
      prisma.enrollment.count(),
    ]);

    // Recent users (last 5)
    const recentUsers = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    // Recent modules (last 5)
    const recentModules = await prisma.module.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        code: true,
        name: true,
        credits: true,
        createdAt: true,
        lecturer: { select: { name: true } },
        _count: { select: { enrollments: true } },
      },
    });

    return res.json({
      stats: {
        totalStudents,
        totalLecturers,
        totalAdmins,
        totalModules,
        totalAssignments,
        totalSubmissions,
        totalEnrollments,
      },
      recentUsers,
      recentModules,
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return res.status(500).json({ message: "Failed to load admin stats" });
  }
}

// ─── GET ALL USERS ────────────────────────────────────────────────────────────

export async function getAllUsers(
  req: AuthRequest,
  res: Response
) {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            enrollments: true,
            submissions: true,
          },
        },
      },
    });

    return res.json({ users });
  } catch (error) {
    console.error("Get all users error:", error);
    return res.status(500).json({ message: "Failed to load users" });
  }
}

// ─── UPDATE USER ROLE ─────────────────────────────────────────────────────────

export async function updateUserRole(
  req: AuthRequest,
  res: Response
) {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!["STUDENT", "LECTURER", "ADMIN"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // Prevent admin from changing their own role
    if (req.user?.userId === Number(id)) {
      return res.status(400).json({ message: "You cannot change your own role" });
    }

    const user = await prisma.user.update({
      where: { id: Number(id) },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    });

    return res.json({ message: "Role updated successfully", user });
  } catch (error) {
    console.error("Update user role error:", error);
    return res.status(500).json({ message: "Failed to update role" });
  }
}

// ─── DELETE USER ──────────────────────────────────────────────────────────────

export async function deleteUser(
  req: AuthRequest,
  res: Response
) {
  try {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (req.user?.userId === Number(id)) {
      return res.status(400).json({ message: "You cannot delete your own account" });
    }

    await prisma.user.delete({ where: { id: Number(id) } });

    return res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    return res.status(500).json({ message: "Failed to delete user" });
  }
}

// ─── GET ALL MODULES ──────────────────────────────────────────────────────────

export async function getAdminModules(
  req: AuthRequest,
  res: Response
) {
  try {
    const modules = await prisma.module.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        lecturer: { select: { id: true, name: true, email: true } },
        _count: {
          select: {
            enrollments: true,
            assignments: true,
          },
        },
      },
    });

    return res.json({ modules });
  } catch (error) {
    console.error("Get admin modules error:", error);
    return res.status(500).json({ message: "Failed to load modules" });
  }
}

// ─── CREATE MODULE ────────────────────────────────────────────────────────────

export async function createModule(
  req: AuthRequest,
  res: Response
) {
  try {
    const { code, name, description, credits, lecturerId } = req.body;

    if (!code || !name || !credits) {
      return res.status(400).json({ message: "Code, name, and credits are required" });
    }

    const module = await prisma.module.create({
      data: {
        code: code.trim().toUpperCase(),
        name: name.trim(),
        description: description?.trim() || null,
        credits: Number(credits),
        lecturerId: lecturerId ? Number(lecturerId) : null,
      },
      include: {
        lecturer: { select: { id: true, name: true } },
      },
    });

    return res.status(201).json({ message: "Module created successfully", module });
  } catch (error: any) {
    console.error("Create module error:", error);
    if (error.code === "P2002") {
      return res.status(400).json({ message: "A module with this code already exists" });
    }
    return res.status(500).json({ message: "Failed to create module" });
  }
}

// ─── DELETE MODULE ────────────────────────────────────────────────────────────

export async function deleteModule(
  req: AuthRequest,
  res: Response
) {
  try {
    const { id } = req.params;

    await prisma.module.delete({ where: { id: Number(id) } });

    return res.json({ message: "Module deleted successfully" });
  } catch (error) {
    console.error("Delete module error:", error);
    return res.status(500).json({ message: "Failed to delete module" });
  }
}

// ─── GET ALL LECTURERS (for assign dropdown) ─────────────────────────────────

export async function getLecturers(
  req: AuthRequest,
  res: Response
) {
  try {
    const lecturers = await prisma.user.findMany({
      where: { role: "LECTURER" },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    });

    return res.json({ lecturers });
  } catch (error) {
    console.error("Get lecturers error:", error);
    return res.status(500).json({ message: "Failed to load lecturers" });
  }
}

// ─── CREATE USER (Admin adds a user directly) ────────────────────────────────

export async function createUser(
  req: AuthRequest,
  res: Response
) {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "Name, email, password, and role are required" });
    }

    if (!["STUDENT", "LECTURER", "ADMIN"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: "A user with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        role,
      },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    return res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    console.error("Create user error:", error);
    return res.status(500).json({ message: "Failed to create user" });
  }
}

// ─── GET ALL ENROLLMENTS ──────────────────────────────────────────────────────

export async function getAllEnrollments(
  req: AuthRequest,
  res: Response
) {
  try {
    const enrollments = await prisma.enrollment.findMany({
      orderBy: { enrolledAt: "desc" },
      include: {
        student: { select: { id: true, name: true, email: true } },
        module: { select: { id: true, code: true, name: true } },
      },
    });

    return res.json({ enrollments });
  } catch (error) {
    console.error("Get enrollments error:", error);
    return res.status(500).json({ message: "Failed to load enrollments" });
  }
}

// ─── ENROLL STUDENT ───────────────────────────────────────────────────────────

export async function enrollStudent(
  req: AuthRequest,
  res: Response
) {
  try {
    const { studentId, moduleId } = req.body;

    if (!studentId || !moduleId) {
      return res.status(400).json({ message: "studentId and moduleId are required" });
    }

    // Check student exists and is a STUDENT
    const student = await prisma.user.findUnique({ where: { id: Number(studentId) } });
    if (!student || student.role !== "STUDENT") {
      return res.status(400).json({ message: "User not found or is not a student" });
    }

    // Check module exists
    const module = await prisma.module.findUnique({ where: { id: Number(moduleId) } });
    if (!module) {
      return res.status(400).json({ message: "Module not found" });
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        studentId: Number(studentId),
        moduleId: Number(moduleId),
      },
      include: {
        student: { select: { id: true, name: true, email: true } },
        module: { select: { id: true, code: true, name: true } },
      },
    });

    return res.status(201).json({ message: "Student enrolled successfully", enrollment });
  } catch (error: any) {
    if (error.code === "P2002") {
      return res.status(400).json({ message: "Student is already enrolled in this module" });
    }
    console.error("Enroll student error:", error);
    return res.status(500).json({ message: "Failed to enroll student" });
  }
}

// ─── REMOVE ENROLLMENT ────────────────────────────────────────────────────────

export async function removeEnrollment(
  req: AuthRequest,
  res: Response
) {
  try {
    const { id } = req.params;

    await prisma.enrollment.delete({ where: { id: Number(id) } });

    return res.json({ message: "Enrollment removed successfully" });
  } catch (error) {
    console.error("Remove enrollment error:", error);
    return res.status(500).json({ message: "Failed to remove enrollment" });
  }
}

// ─── GET ALL STUDENTS (for enrollment dropdown) ───────────────────────────────

export async function getStudents(
  req: AuthRequest,
  res: Response
) {
  try {
    const students = await prisma.user.findMany({
      where: { role: "STUDENT" },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    });

    return res.json({ students });
  } catch (error) {
    console.error("Get students error:", error);
    return res.status(500).json({ message: "Failed to load students" });
  }
}

// ─── GET REPORTS DATA ─────────────────────────────────────────────────────────

export async function getReports(
  req: AuthRequest,
  res: Response
) {
  try {
    // Top modules by enrollment — fetch all, sort in JS
    const allModules = await prisma.module.findMany({
      select: {
        id: true,
        code: true,
        name: true,
        lecturer: { select: { name: true } },
        _count: { select: { enrollments: true, assignments: true } },
      },
    });
    const topModules = allModules
      .sort((a, b) => b._count.enrollments - a._count.enrollments)
      .slice(0, 10);

    // Submission stats — on time vs late
    const [onTimeCount, lateCount] = await Promise.all([
      prisma.submission.count({ where: { status: "SUBMITTED" } }),
      prisma.submission.count({ where: { status: "LATE" } }),
    ]);

    // Students with most submissions — fetch all students, sort in JS
    const allStudents = await prisma.user.findMany({
      where: { role: "STUDENT" },
      select: {
        id: true,
        name: true,
        email: true,
        _count: { select: { submissions: true, enrollments: true } },
      },
    });
    const activeStudents = allStudents
      .sort((a, b) => b._count.submissions - a._count.submissions)
      .slice(0, 10);

    // Assignments per module — reuse allModules, sort by assignment count
    const assignmentsByModule = [...allModules]
      .sort((a, b) => b._count.assignments - a._count.assignments)
      .slice(0, 10)
      .map((m) => ({ code: m.code, name: m.name, _count: m._count }));

    // Recent submissions
    const recentSubmissions = await prisma.submission.findMany({
      orderBy: { submittedAt: "desc" },
      take: 10,
      include: {
        student: { select: { name: true, email: true } },
        assignment: {
          select: {
            title: true,
            module: { select: { code: true, name: true } },
          },
        },
      },
    });

    return res.json({
      topModules,
      submissionStats: { onTime: onTimeCount, late: lateCount },
      activeStudents,
      assignmentsByModule,
      recentSubmissions,
    });
  } catch (error) {
    console.error("Reports error:", error);
    return res.status(500).json({ message: "Failed to load reports" });
  }
}
