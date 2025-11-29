import { PrismaClient, Role, TestType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = "admin@example.com";
  const adminPassword = "AdminPass123";

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash,
      role: Role.ADMIN,
      name: "Admin User"
    }
  });

  const mcqTest = await prisma.test.create({
    data: {
      title: "Sample MCQ Reading Test",
      description: "A sample MCQ test for demo purposes.",
      type: TestType.MCQ,
      durationMinutes: 20,
      priceCents: 50000,
      isPublished: true,
      questions: {
        create: [
          {
            prompt: "What is the capital of France?",
            options: ["Berlin", "London", "Paris", "Madrid"],
            correctIndex: 2,
            order: 1
          },
          {
            prompt: "Which is a prime number?",
            options: ["9", "15", "17", "21"],
            correctIndex: 2,
            order: 2
          }
        ]
      }
    }
  });

  const writingTest = await prisma.test.create({
    data: {
      title: "Sample Writing Task",
      description: "Describe your favorite book in detail.",
      type: TestType.WRITING,
      durationMinutes: 40,
      priceCents: 70000,
      isPublished: true,
      writingRubricJson: {
        keywords: ["character", "plot", "theme", "author"],
        keywordWeight: 0.4,
        structureWeight: 0.3,
        styleWeight: 0.3
      }
    }
  });

  console.log("Seed completed.");
  console.log("Admin credentials:");
  console.log(`Email: ${admin.email}`);
  console.log(`Password: ${adminPassword}`);
  console.log(`MCQ Test ID: ${mcqTest.id}`);
  console.log(`Writing Test ID: ${writingTest.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

