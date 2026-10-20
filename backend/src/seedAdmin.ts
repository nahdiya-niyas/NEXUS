import "dotenv/config";
import bcrypt from "bcrypt";
import { prisma } from "./config/prisma.js";

async function main() {
  const hash = await bcrypt.hash("Admin@123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@nexus.com" },
    update: { password: hash, role: "ADMIN", name: "Admin" },
    create: {
      name: "Admin",
      email: "admin@nexus.com",
      password: hash,
      role: "ADMIN",
    },
  });

  console.log("✅ Admin account ready:");
  console.log("   Email:   ", admin.email);
  console.log("   Password: Admin@123");
  console.log("   Role:    ", admin.role);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
