
const { PrismaClient } = require('@prisma/client')
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3')
const path = require('path')

async function main() {
  const dbPath = path.join(process.cwd(), 'prisma', 'dev.db')
  const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` })
  const prisma = new PrismaClient({ adapter })

  try {
    // Try to query a user and see if the columns exist
    const user = await prisma.user.findFirst()
    console.log('User columns:', Object.keys(user || {}))
  } catch (error) {
    console.error('Error Details:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

main()
