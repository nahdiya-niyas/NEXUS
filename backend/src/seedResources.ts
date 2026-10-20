
import "dotenv/config";
import { prisma } from "./config/prisma.js";
import path from "path";

async function main() {
  const modules = await prisma.module.findMany({
    orderBy: {
      code: "asc",
    },
  });

  if (modules.length === 0) {
    console.log("No modules found.");

    return;
  }

  const resources = [
    {
      title: "Linux Administration Notes",
      fileName: "linux-administration-notes.txt",
      moduleId: modules[0].id,
    },
    {
      title: "Web Development Guide",
      fileName: "web-development-guide.txt",
      moduleId: modules[1]?.id ?? modules[0].id,
    },
    {
      title: "Database Design Guide",
      fileName: "database-design-guide.txt",
      moduleId: modules[2]?.id ?? modules[0].id,
    },
  ];

  for (const resource of resources) {
    const filePath = path.join(
      process.cwd(),
      "uploads",
      "resources",
      resource.fileName
    );

    await prisma.resource.upsert({
      where: {
        id: resources.indexOf(resource) + 1,
      },
      update: {
        title: resource.title,
        fileName: resource.fileName,
        filePath,
        moduleId: resource.moduleId,
      },
      create: {
        title: resource.title,
        fileName: resource.fileName,
        filePath,
        moduleId: resource.moduleId,
      },
    });
  }

  console.log(
    "NEXUS resources seeded successfully."
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });