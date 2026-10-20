import "dotenv/config";
import { prisma } from "./config/prisma.js";

async function main() {
  const modules = [
    {
      code: "N3462",
      name: "Systems Administration II",
      description: "Advanced systems administration and Linux-based system management.",
      credits: 3,
    },
    {
      code: "N3463",
      name: "Web Application Development",
      description: "Full-stack web application development using modern technologies.",
      credits: 3,
    },
    {
      code: "N3464",
      name: "Database Systems",
      description: "Database design, SQL, relational databases and database management.",
      credits: 3,
    },
    {
      code: "N3465",
      name: "Computer Networks",
      description: "Computer networking concepts, protocols and network administration.",
      credits: 3,
    },
    {
      code: "N3466",
      name: "Human Computer Interaction",
      description: "User interface design, usability and human-computer interaction principles.",
      credits: 3,
    },
  ];

  for (const module of modules) {
    await prisma.module.upsert({
      where: {
        code: module.code,
      },
      update: {},
      create: module,
    });
  }

  console.log("NEXUS modules seeded successfully.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
