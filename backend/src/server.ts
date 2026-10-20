
import "dotenv/config";

import express from "express";
import cors from "cors";
import path from "path";

import { prisma } from "./config/prisma.js";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import moduleRoutes from "./routes/moduleRoutes.js";
import enrollmentRoutes from "./routes/enrollmentRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import resourceRoutes from "./routes/resourceRoutes.js";
import assignmentRoutes from "./routes/assignmentRoutes.js";
import privateFileRoutes from "./routes/privateFileRoutes.js";
import lecturerRoutes from "./routes/lecturerRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

import { errorHandler } from "./middleware/errorMiddleware.js";

const app = express();

const PORT = 3001;

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "uploads"))
);

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/modules", moduleRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/private-files", privateFileRoutes);
app.use("/api/lecturer", lecturerRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "NEXUS backend is running 🚀",
  });
});

app.get("/api/test-db", async (req, res) => {
  try {
    const users = await prisma.user.findMany();

    res.json({
      message: "Database connected successfully",
      users,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Database connection failed",
    });
  }
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(
    `NEXUS backend running on http://localhost:${PORT}`
  );
});
