import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.idpSubmission.deleteMany();
  await prisma.user.deleteMany();
  await prisma.company.deleteMany();

  const compGroup = await prisma.company.create({
    data: {
      id: "comp-group",
      name: "TechGroup Holding",
      parentId: null,
    },
  });

  const compA = await prisma.company.create({
    data: {
      id: "comp-a",
      name: "TechGroup Alpha",
      parentId: compGroup.id,
    },
  });

  const compB = await prisma.company.create({
    data: {
      id: "comp-b",
      name: "TechGroup Beta",
      parentId: compGroup.id,
    },
  });

  const alice = await prisma.user.create({
    data: {
      id: "user-alice",
      name: "Alice",
      email: "alice@techgroup.com",
      role: "HR_GROUP",
      companyId: compGroup.id,
    },
  });

  const bob = await prisma.user.create({
    data: {
      id: "user-bob",
      name: "Bob",
      email: "bob@alpha.com",
      role: "HR_COMPANY",
      companyId: compA.id,
    },
  });

  const carol = await prisma.user.create({
    data: {
      id: "user-carol",
      name: "Carol",
      email: "carol@alpha.com",
      role: "EMPLOYEE",
      companyId: compA.id,
    },
  });

  const henry = await prisma.user.create({
    data: {
      id: "user-henry",
      name: "Henry",
      email: "henry@beta.com",
      role: "HR_COMPANY",
      companyId: compB.id,
    },
  });

  const frank = await prisma.user.create({
    data: {
      id: "user-frank",
      name: "Frank",
      email: "frank@beta.com",
      role: "EMPLOYEE",
      companyId: compB.id,
    },
  });

  await prisma.idpSubmission.create({
    data: {
      id: "idp-carol-1",
      userId: carol.id,
      year: 2025,
      quarterStart: 4,
      quarterEnd: 4,
      skillGoal: "Advanced TypeScript & React Patterns",
      actionPlan: "Complete online courses and build sample projects",
      status: "IN_PROGRESS",
    },
  });

  await prisma.idpSubmission.create({
    data: {
      id: "idp-carol-2",
      userId: carol.id,
      year: 2025,
      quarterStart: 2,
      quarterEnd: 2,
      skillGoal: "React Testing & E2E with Playwright",
      actionPlan: "Write tests for main flows and fix flaky tests",
      status: "COMPLETED",
    },
  });

  await prisma.idpSubmission.create({
    data: {
      id: "idp-carol-3",
      userId: carol.id,
      year: 2025,
      quarterStart: 3,
      quarterEnd: 3,
      skillGoal: "Node.js & API Design",
      actionPlan: "Build a small REST API and document with OpenAPI",
      status: "TODO",
    },
  });

  await prisma.idpSubmission.create({
    data: {
      id: "idp-frank-1",
      userId: frank.id,
      year: 2025,
      quarterStart: 3,
      quarterEnd: 4,
      skillGoal: "Leadership & Cross-team Communication",
      actionPlan: "Attend workshops and lead team meetings",
      status: "TODO",
    },
  });

  await prisma.idpSubmission.create({
    data: {
      id: "idp-frank-2",
      userId: frank.id,
      year: 2025,
      quarterStart: 1,
      quarterEnd: 1,
      skillGoal: "Presentation & Public Speaking",
      actionPlan: "Deliver 3 internal tech talks and one external meetup",
      status: "COMPLETED",
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
