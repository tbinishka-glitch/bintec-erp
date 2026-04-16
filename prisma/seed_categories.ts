import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import path from 'path'

async function seed() {
  const dbPath = path.join(process.cwd(), 'prisma', 'dev.db')
  const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` })
  const prisma = new PrismaClient({ adapter })

  const categories = [
    { name: 'Academic', slug: 'academic' },
    { name: 'Academic Operations', slug: 'academic-operations' },
    { name: 'Operations', slug: 'operations' },
    { name: 'Support Staff', slug: 'support-staff' },
    { name: 'Security Staff', slug: 'security-staff' },
    { name: 'Academic Leadership', slug: 'academic-leadership' },
    { name: 'Branch Leadership', slug: 'branch-leadership' },
    { name: 'Network Leadership', slug: 'network-leadership' },
    { name: 'Senior Leadership', slug: 'senior-leadership' },
    { name: 'Corporate Leadership', slug: 'corporate-leadership' }
  ]

  console.log('Seeding employee categories...')

  for (const cat of categories) {
    await prisma.employeeCategory.upsert({
      where: { slug: cat.slug },
      update: {},
      create: {
        name: cat.name,
        slug: cat.slug,
        description: `Staff category for ${cat.name}`
      }
    })
  }

  console.log('Successfully seeded categories.')
  await prisma.$disconnect()
}

seed().catch((e) => {
  console.error(e)
  process.exit(1)
})
