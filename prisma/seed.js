const { PrismaClient } = require("../src/generated/prisma"); // path to your custom generated client
const prisma = new PrismaClient();

async function main() {
  // Delete in order to avoid foreign key constraint issues
  await prisma.student.deleteMany();
  // await prisma.lecturer.deleteMany();
  await prisma.department.deleteMany();

  // Create 4 departments
  const departments = await Promise.all([
    prisma.department.create({ data: { name: "Computer Science" } }),
    prisma.department.create({ data: { name: "Mathematics" } }),
    prisma.department.create({ data: { name: "Physics" } }),
    prisma.department.create({ data: { name: "Chemistry" } }),
  ]);

  // Create 4 students, each in a different department
  const students = await Promise.all([
    prisma.student.create({
      data: {
        firstName: "Alice",
        lastName: "Johnson",
        email: "alice.johnson@example.com",
        phone: "111-111-1111",
        departmentId: departments[0].id,
      },
    }),
    prisma.student.create({
      data: {
        firstName: "Bob",
        lastName: "Smith",
        email: "bob.smith@example.com",
        phone: "222-222-2222",
        departmentId: departments[1].id,
      },
    }),
    prisma.student.create({
      data: {
        firstName: "Charlie",
        lastName: "Brown",
        email: "charlie.brown@example.com",
        phone: "333-333-3333",
        departmentId: departments[2].id,
      },
    }),
    prisma.student.create({
      data: {
        firstName: "Diana",
        lastName: "Prince",
        email: "diana.prince@example.com",
        phone: "444-444-4444",
        departmentId: departments[3].id,
      },
    }),
  ]);

  // Create 4 lecturers, each in a different department
  const lecturers = await Promise.all([
    prisma.student.create({
      data: {
        firstName: "Ethan",
        lastName: "Hunt",
        email: "ethan.hunt@example.com",
        phone: "555-555-5555",
        departmentId: departments[0].id,
      },
    }),
    prisma.student.create({
      data: {
        firstName: "Fiona",
        lastName: "Gallagher",
        email: "fiona.g@example.com",
        phone: "666-666-6666",
        departmentId: departments[1].id,
      },
    }),
    prisma.student.create({
      data: {
        firstName: "George",
        lastName: "Miller",
        email: "george.m@example.com",
        phone: "777-777-7777",
        departmentId: departments[2].id,
      },
    }),
    prisma.student.create({
      data: {
        firstName: "Helen",
        lastName: "Mirren",
        email: "helen.mirren@example.com",
        phone: "888-888-8888",
        departmentId: departments[3].id,
      },
    }),
  ]);

  console.log("🌱 Seeded successfully!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seeding error:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
