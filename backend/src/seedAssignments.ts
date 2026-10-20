
import "dotenv/config";
import { prisma } from "./config/prisma.js";

async function main() {
  const modules = await prisma.module.findMany({
    orderBy: {
      code: "asc",
    },
  });

  if (modules.length === 0) {
    console.log(
      "No modules found. Run the module seed first."
    );

    return;
  }

  await prisma.assignment.deleteMany();

  const now = new Date();

  const assignments = [
    {
      title: "Linux Administration Practical",
      description:
        "Complete the Linux administration practical exercises and submit your report.",
      deadline: new Date(
        now.getTime() + 3 * 24 * 60 * 60 * 1000
      ),
      moduleId: modules[0].id,
    },

    {
      title: "Web Application Development Project",
      description:
        "Develop and document a full-stack web application.",
      deadline: new Date(
        now.getTime() + 6 * 24 * 60 * 60 * 1000
      ),
      moduleId: modules[1]?.id ?? modules[0].id,
    },

    {
      title: "Database Design Assignment",
      description:
        "Design a relational database and provide the required SQL implementation.",
      deadline: new Date(
        now.getTime() + 9 * 24 * 60 * 60 * 1000
      ),
      moduleId: modules[2]?.id ?? modules[0].id,
    },
  ];

  for (const assignment of assignments) {
    await prisma.assignment.create({
      data: assignment,
    });
  }

  console.log(
    "NEXUS assignments seeded successfully."
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
