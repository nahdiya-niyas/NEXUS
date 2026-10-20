import "dotenv/config";

import bcrypt from "bcrypt";
import { prisma } from "./config/prisma.js";

async function main() {
  const password = await bcrypt.hash("Lecturer@123", 10);

  const lecturer = await prisma.user.upsert({
    where: {
      email: "lecturer@nexus.com",
    },

    update: {
      name: "Dr. Sarah Perera",
      password,
      role: "LECTURER",
    },

    create: {
      name: "Dr. Sarah Perera",
      email: "lecturer@nexus.com",
      password,
      role: "LECTURER",
    },
  });

  await prisma.module.updateMany({
    data: {
      lecturerId: lecturer.id,
    },
  });

  await prisma.assignment.updateMany({
    data: {
      lecturerId: lecturer.id,
    },
  });

  console.log("✅ Lecturer account created successfully");
  console.log("Email: lecturer@nexus.com");
  console.log("Password: Lecturer@123");
  console.log(`Lecturer ID: ${lecturer.id}`);
}

main()
  .catch((error) => {
    console.error("❌ Error creating lecturer:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });