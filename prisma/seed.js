const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean up existing data
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  // Hash password
  const passwordHash = await bcrypt.hash('password123', 10);

  // Create Admin
  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@ethara.com',
      passwordHash,
      role: 'ADMIN',
    },
  });

  // Create Members
  const alice = await prisma.user.create({
    data: {
      name: 'Alice Smith',
      email: 'alice@ethara.com',
      passwordHash,
      role: 'MEMBER',
    },
  });

  const bob = await prisma.user.create({
    data: {
      name: 'Bob Jones',
      email: 'bob@ethara.com',
      passwordHash,
      role: 'MEMBER',
    },
  });

  // Create Projects
  const project1 = await prisma.project.create({
    data: {
      name: 'Website Redesign',
      description: 'Overhauling the corporate site with modern glassmorphism UI.',
      ownerId: admin.id,
      members: {
        connect: [{ id: admin.id }, { id: alice.id }],
      },
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: 'Mobile App Launch',
      description: 'Preparing the API and backend systems for the Q3 app release.',
      ownerId: admin.id,
      members: {
        connect: [{ id: admin.id }, { id: bob.id }, { id: alice.id }],
      },
    },
  });

  // Create Tasks for Project 1
  await prisma.task.createMany({
    data: [
      {
        title: 'Design Figma Mockups',
        description: 'Create high-fidelity mockups for homepage and dashboard.',
        status: 'DONE',
        projectId: project1.id,
        assigneeId: alice.id,
        dueDate: new Date(Date.now() - 86400000 * 2), // 2 days ago
      },
      {
        title: 'Implement Next.js Frontend',
        description: 'Code the responsive layout and animations.',
        status: 'IN_PROGRESS',
        projectId: project1.id,
        assigneeId: admin.id,
        dueDate: new Date(Date.now() + 86400000 * 3), // in 3 days
      },
      {
        title: 'User Testing',
        description: 'Conduct A/B testing on the new landing page.',
        status: 'TODO',
        projectId: project1.id,
        assigneeId: alice.id,
        dueDate: new Date(Date.now() + 86400000 * 7), // in 7 days
      },
    ],
  });

  // Create Tasks for Project 2
  await prisma.task.createMany({
    data: [
      {
        title: 'Setup PostgreSQL Database',
        description: 'Initialize Prisma and configure schemas.',
        status: 'DONE',
        projectId: project2.id,
        assigneeId: bob.id,
        dueDate: new Date(Date.now() - 86400000 * 5),
      },
      {
        title: 'Build REST APIs',
        description: 'Create endpoints for auth, projects, and tasks.',
        status: 'IN_PROGRESS',
        projectId: project2.id,
        assigneeId: bob.id,
        dueDate: new Date(), // due today
      },
      {
        title: 'QA Security Audit',
        description: 'Ensure RBAC is perfectly implemented before launch.',
        status: 'TODO',
        projectId: project2.id,
        assigneeId: admin.id,
        dueDate: new Date(Date.now() - 86400000 * 1), // overdue by 1 day
      },
    ],
  });

  console.log('Seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
