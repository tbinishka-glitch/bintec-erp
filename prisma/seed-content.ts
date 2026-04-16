import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import path from 'path'

const dbPath = path.join(process.cwd(), 'dev.db')
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` })
const prisma = new PrismaClient({ adapter })

async function main() {
  const admin = await prisma.user.findFirst({ where: { email: 'admin@leeds.lk' } })
  if (!admin) throw new Error('Admin user not found. Run seed.ts first.')

  // -- Knowledge Hub Articles --
  const existingArticles = await prisma.article.count()
  if (existingArticles === 0) {
    await prisma.article.createMany({
      data: [
        {
          title: 'Staff Leave Policy 2026',
          content: 'This document outlines the leave entitlements for all full-time and part-time staff members across all branches. Annual leave entitlement is 21 working days per calendar year. Staff must submit leave requests at least 5 working days in advance through the HR portal.',
          category: 'Policy',
          authorId: admin.id,
          tags: 'HR, Leave, Annual Leave',
        },
        {
          title: 'Classroom Best Practices for Differentiated Learning',
          content: 'Differentiated instruction is a teaching approach that tailors instruction to meet individual needs. Whether teachers differentiate content, process, products, or the learning environment, the use of ongoing assessment and flexible grouping makes this a successful approach to instruction.',
          category: 'Best Practice',
          authorId: admin.id,
          tags: 'Teaching, Pedagogy, Classroom',
        },
        {
          title: 'New Employee Onboarding Guide',
          content: 'Welcome to Leeds International School! This guide will walk you through your first 30 days. You will meet your department head on Day 1, complete HR paperwork by Day 3, shadow a senior colleague for Week 1, and take ownership of your responsibilities from Week 2 onwards.',
          category: 'Guide',
          authorId: admin.id,
          tags: 'Onboarding, New Staff, HR',
        },
        {
          title: 'Digital Tools and Technology Resources',
          content: 'Leeds provides a suite of digital tools to support teaching and administration. This article covers access to Google Workspace for Education, the Leeds LMS (Learning Management System), attendance tracking software, and the parent communication portal.',
          category: 'Resource',
          authorId: admin.id,
          tags: 'Tech, Digital, Tools',
        },
        {
          title: 'Code of Conduct and Professional Standards',
          content: 'All staff members are expected to uphold the highest standards of professional conduct. This policy covers dress code, social media usage, relationships with students and parents, and conflict resolution procedures.',
          category: 'Policy',
          authorId: admin.id,
          tags: 'Conduct, Policy, HR',
        },
      ],
    })
    console.log('✅ Knowledge Hub articles seeded.')
  } else {
    console.log('⏭️  Knowledge Hub articles already exist, skipping.')
  }

  // -- Welfare Resources --
  const existingWelfare = await prisma.welfareResource.count()
  if (existingWelfare === 0) {
    await prisma.welfareResource.createMany({
      data: [
        {
          title: 'Employee Medical Insurance',
          description: 'All permanent staff are covered under our group medical insurance plan. Coverage includes inpatient, outpatient, and dental for employee and immediate family.',
          category: 'Healthcare',
          link: '#',
        },
        {
          title: 'Employee Assistance Programme (EAP)',
          description: 'Free, confidential counselling and mental health support available to all staff. Access up to 6 sessions per year at no cost through our EAP provider.',
          category: 'Mental',
          link: '#',
        },
        {
          title: 'Staff Provident Fund',
          description: 'Details on your EPF contributions, employer matching, and how to access your statements. Both employee (8%) and employer (12%) contributions are made monthly.',
          category: 'Finance',
          link: '#',
        },
        {
          title: 'Annual & Casual Leave Entitlements',
          description: 'Summary of all leave types available: Annual Leave (21 days), Casual Leave (7 days), Medical Leave (14 days), Maternity Leave (84 days), and Study Leave.',
          category: 'Leave',
          link: '#',
        },
        {
          title: 'Staff Fitness & Wellness Programme',
          description: 'Access discounted gym memberships at partner gyms island-wide. Monthly wellness challenges and a yearly health screening are available to all staff.',
          category: 'Fitness',
          link: '#',
        },
        {
          title: 'Staff Events & Celebrations Calendar',
          description: 'View upcoming staff events, annual dinner & dance, sports meets, and team-building events. Nominations for Staff of the Term awards are also managed here.',
          category: 'Events',
          link: '#',
        },
      ],
    })
    console.log('✅ Welfare resources seeded.')
  } else {
    console.log('⏭️  Welfare resources already exist, skipping.')
  }
}

main()
  .catch((e) => { console.error('❌ Seed failed:', e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
