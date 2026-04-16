import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import path from 'path'

const dbPath = path.join(process.cwd(), 'dev.db')
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` })
const prisma = new PrismaClient({ adapter })

async function main() {
  const admin = await prisma.user.findFirst({ where: { email: 'admin@leeds.lk' } })
  const staff = await prisma.user.findFirst({ where: { email: 'staff@leeds.lk' } })
  const hr = await prisma.user.findFirst({ where: { email: 'hr@leeds.lk' } })
  if (!admin || !staff || !hr) throw new Error('Run main seed.ts first.')

  // Add missing branch head info
  const colombo = await prisma.branch.findFirst({ where: { name: 'Colombo Main' } })
  const kandy = await prisma.branch.findFirst({ where: { name: 'Kandy Branch' } })

  // Seed more diverse users for the directory & leadership
  const leadershipRole = await prisma.role.upsert({
    where: { name: 'BRANCH_HEAD' },
    update: {},
    create: { name: 'BRANCH_HEAD', permissions: 'BRANCH' },
  })
  const deptRole = await prisma.role.upsert({
    where: { name: 'DEPT_HEAD' },
    update: {},
    create: { name: 'DEPT_HEAD', permissions: 'DEPT' },
  })

  const bcrypt = await import('bcryptjs')
  const pw = await bcrypt.hash('password123', 10)

  const leader1 = await prisma.user.upsert({
    where: { email: 'binishka@leeds.lk' },
    update: { image: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=200&h=200' },
    create: {
      email: 'binishka@leeds.lk', name: 'Binishka Perera',
      firstName: 'Binishka', lastName: 'Perera',
      image: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=200&h=200',
      password: pw, roleId: leadershipRole.id, branchId: colombo?.id,
      dateOfBirth: new Date('1982-07-10'),
    },
  })

  const leader2 = await prisma.user.upsert({
    where: { email: 'rajan@leeds.lk' },
    update: { image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&h=200' },
    create: {
      email: 'rajan@leeds.lk', name: 'Rajan Fernando',
      firstName: 'Rajan', lastName: 'Fernando',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&h=200',
      password: pw, roleId: leadershipRole.id, branchId: kandy?.id,
      dateOfBirth: new Date('1979-11-22'),
    },
  })

  await prisma.user.upsert({
    where: { email: 'amali@leeds.lk' },
    update: { image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200&h=200' },
    create: {
      email: 'amali@leeds.lk', name: 'Amali Jayawardena',
      firstName: 'Amali', lastName: 'Jayawardena',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200&h=200',
      password: pw, roleId: deptRole.id, branchId: colombo?.id,
      dateOfBirth: new Date('1991-02-14'),
    },
  })

  await prisma.user.upsert({
    where: { email: 'nimal@leeds.lk' },
    update: { image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200&h=200' },
    create: {
      email: 'nimal@leeds.lk', name: 'Nimal Wijesekara',
      firstName: 'Nimal', lastName: 'Wijesekara',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200&h=200',
      password: pw, roleId: deptRole.id, branchId: kandy?.id,
      dateOfBirth: new Date('1987-09-05'),
    },
  })

  // Update branches with branch heads
  await prisma.branch.update({ where: { id: colombo!.id }, data: { branchHeadId: leader1.id } })
  await prisma.branch.update({ where: { id: kandy!.id }, data: { branchHeadId: leader2.id } })

  // Seed Milestones
  const existingMilestones = await prisma.milestone.count()
  if (existingMilestones === 0) {
    await prisma.milestone.createMany({
      data: [
        { userId: admin.id, type: 'Work Anniversary', description: '5 Years of leadership excellence at Leeds Connect!', },
        { userId: staff.id, type: 'Work Anniversary', description: 'Celebrating 3 wonderful years with the Leeds family!', },
        { userId: hr.id, type: 'Award', description: 'HR Excellence Award — for outstanding contribution to staff welfare.', },
        { userId: leader1.id, type: 'Award', description: 'Branch of the Year — Colombo Main achieves highest student satisfaction.', },
        { userId: leader2.id, type: 'Work Anniversary', description: '10 Years leading the Kandy Branch — a decade of dedication!', },
        { userId: admin.id, type: 'Promotion', description: 'Congratulations on your promotion to Network Director!', },
      ],
    })
    console.log('✅ Milestones seeded.')
  } else {
    console.log('⏭️  Milestones already exist, skipping.')
  }

  console.log('✅ Expanded user/leadership seed complete.')
}

main()
  .catch((e) => { console.error('❌', e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
