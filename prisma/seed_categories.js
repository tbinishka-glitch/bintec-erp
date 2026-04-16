const { PrismaClient } = require('@prisma/client')
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3')
const path = require('path')

async function seed() {
  const dbPath = path.join(process.cwd(), 'prisma', 'dev.db')
  const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` })
  const prisma = new PrismaClient({ adapter })

  // List of mandatory categories from the prompt
  const categories = [
    { name: 'Academic', slug: 'academic' },
    { name: 'Academic Operations', slug: 'academic-operations' },
    { name: 'Operations', slug: 'operations' },
    { name: 'Facilities Management', slug: 'facilities-management' },
    { name: 'Security & Surveillance', slug: 'security-surveillance' },
    { name: 'Driver', slug: 'driver' },
    { name: 'Branch Leadership', slug: 'branch-leadership' },
    { name: 'Network Leadership', slug: 'network-leadership' },
    { name: 'Senior Leadership', slug: 'senior-leadership' },
    { name: 'Corporate Leadership', slug: 'corporate-leadership' }
  ]

  console.log('Verifying Prisma client models...')
  console.log('Available models:', Object.keys(prisma).filter(k => k[0] === k[0].toLowerCase()))

  if (!prisma.employeeCategory) {
    console.error('CRITICAL: employeeCategory model not found on Prisma client. Did you run prisma generate?')
    process.exit(1)
  }

  console.log('Seeding employee categories...')

  for (const cat of categories) {
    try {
      await prisma.employeeCategory.upsert({
        where: { slug: cat.slug },
        update: { name: cat.name },
        create: {
          name: cat.name,
          slug: cat.slug,
          description: `Staff category for ${cat.name}`
        }
      })
      console.log(`✅ ${cat.name}`)
    } catch (err) {
      console.error(`❌ Failed to seed ${cat.name}:`, err.message)
    }
  }

  console.log('Finished seeding.')
  await prisma.$disconnect()
}

seed().catch(err => {
  console.error('Seed process failed:', err)
  process.exit(1)
})
