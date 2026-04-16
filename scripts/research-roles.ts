import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import path from 'path'

const dbPath = path.join(process.cwd(), 'dev.db')
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` })
const prisma = new PrismaClient({ adapter })

async function main() {
  const roles = await prisma.role.findMany()
  console.log('Roles found:', JSON.stringify(roles, null, 2))
  
  const tilina = await prisma.user.findFirst({
    where: { name: { contains: 'Tilina' } },
    include: { role: true }
  })
  console.log('Tilina current profile:', JSON.stringify(tilina, null, 2))
}

main().finally(() => prisma.$disconnect())
