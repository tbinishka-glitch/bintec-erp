import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import bcrypt from 'bcryptjs'
import path from 'path'

const dbPath = path.join(process.cwd(), 'dev.db')
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` })
const prisma = new PrismaClient({ adapter })

async function main() {
  // Create Branches
  const colomboBranch = await prisma.branch.upsert({
    where: { name: 'Colombo Main' },
    update: {},
    create: { name: 'Colombo Main', location: 'Colombo 07' },
  })

  const kandyBranch = await prisma.branch.upsert({
    where: { name: 'Kandy Branch' },
    update: {},
    create: { name: 'Kandy Branch', location: 'Kandy City' },
  })

  // Create Roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'SUPER_ADMIN' },
    update: {},
    create: { name: 'SUPER_ADMIN', permissions: 'ALL' },
  })

  const hrRole = await prisma.role.upsert({
    where: { name: 'HR_ADMIN' },
    update: {},
    create: { name: 'HR_ADMIN', permissions: 'HR' },
  })

  const staffRole = await prisma.role.upsert({
    where: { name: 'STAFF' },
    update: {},
    create: { name: 'STAFF', permissions: 'MEMBER' },
  })

  // Hash password
  const passwordHash = await bcrypt.hash('password123', 10)

  // Create Users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@leeds.lk' },
    update: {},
    create: {
      email: 'admin@leeds.lk',
      name: 'Admin User',
      firstName: 'Admin',
      lastName: 'User',
      password: passwordHash,
      roleId: adminRole.id,
      branchId: colomboBranch.id,
    },
  })

  await prisma.user.upsert({
    where: { email: 'staff@leeds.lk' },
    update: {},
    create: {
      email: 'staff@leeds.lk',
      name: 'John Doe',
      firstName: 'John',
      lastName: 'Doe',
      password: passwordHash,
      roleId: staffRole.id,
      branchId: kandyBranch.id,
      dateOfBirth: new Date('1990-05-15'),
    },
  })

  await prisma.user.upsert({
    where: { email: 'hr@leeds.lk' },
    update: {},
    create: {
      email: 'hr@leeds.lk',
      name: 'Priya Silva',
      firstName: 'Priya',
      lastName: 'Silva',
      password: passwordHash,
      roleId: hrRole.id,
      branchId: colomboBranch.id,
      dateOfBirth: new Date('1988-03-22'),
    },
  })

  // Create Announcements
  const existingAnnouncements = await prisma.announcement.count()
  if (existingAnnouncements === 0) {
    await prisma.announcement.createMany({
      data: [
        {
          title: 'Welcome to Leeds Connect!',
          content: 'We are thrilled to launch our new multi-branch intranet. This platform will help us stay connected across all branches of the Leeds network in Sri Lanka.',
          authorId: admin.id,
          isPinned: true,
        },
        {
          title: 'Annual Sports Meet 2026',
          content: 'The Annual Sports Meet is scheduled for next month. Please ensure all teams submit their registrations by April 20th.',
          authorId: admin.id,
          branchId: colomboBranch.id,
        },
        {
          title: 'New Staff Welfare Programme',
          content: 'We are launching a comprehensive welfare programme for all staff members. Details will be shared via the Welfare Hub module.',
          authorId: admin.id,
        },
      ],
    })
  }

  console.log('✅ Database seeded successfully!')
  console.log('   - Branches: Colombo Main, Kandy Branch')
  console.log('   - Users: admin@leeds.lk, staff@leeds.lk, hr@leeds.lk (password: password123)')
  console.log('   - Sample announcements created')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
