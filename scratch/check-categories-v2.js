const { PrismaClient } = require('@prisma/client')
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3')
const path = require('path')

async function check() {
  const dbPath = path.join(process.cwd(), 'prisma', 'dev.db')
  const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` })
  const prisma = new PrismaClient({ adapter })

  const categories = await prisma.employeeCategory.findMany()
  console.log('--- DATABASE CHECK: EMPLOYEE CATEGORIES ---')
  if (categories.length === 0) {
    console.log('❌ NO CATEGORIES FOUND IN DB')
  } else {
    categories.forEach(c => console.log(`✅ [${c.slug}] ${c.name}`))
  }
  console.log('Total Count:', categories.length)
  
  await prisma.$disconnect()
}

check().catch(console.error)
