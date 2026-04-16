import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import path from 'path'

const dbPath = path.join(process.cwd(), 'dev.db')
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` })
const prisma = new PrismaClient({ adapter })

async function main() {
  const users = await prisma.user.findMany({
    where: { 
       OR: [
         { leadershipTier: { not: null } },
         { email: { contains: 'leeds.lk' } }
       ]
    }
  })
  console.log(JSON.stringify(users, null, 2))
}

main().finally(() => prisma.$disconnect())
