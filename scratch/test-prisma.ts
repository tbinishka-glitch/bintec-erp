import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import path from 'path'

const dbPath = path.join(process.cwd(), 'prisma', 'leeds_v2.db')
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('--- DB PATH:', dbPath)
  try {
    const user = await prisma.user.findFirst({
      where: {
        isInIntranet: true
      }
    })
    console.log('--- SUCCESS: Found user or empty array (no error)')
  } catch (err: any) {
    console.log('--- ERROR:', err.message)
  } finally {
    await prisma.$disconnect()
  }
}

main()
