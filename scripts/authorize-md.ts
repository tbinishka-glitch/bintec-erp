import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import path from 'path'

const dbPath = path.join(process.cwd(), 'dev.db')
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` })
const prisma = new PrismaClient({ adapter })

async function main() {
  // 1. Ensure the ADMIN role exists (with basic permissions as the user will define them)
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: { 
      name: 'ADMIN', 
      permissions: 'HR' // Basic admin template
    }
  })

  // 2. Assign this role and MD-001 credentials to Tilina Diyagama
  const updatedUser = await prisma.user.update({
    where: { email: 'md@leeds.lk' },
    data: {
      staffId: 'MD-001',
      roleId: adminRole.id,
      isActive: true,
      forcePasswordChange: false
    }
  })

  console.log('✅ Managing Director authorized as ADMIN successfully:')
  console.log(`   - Name: ${updatedUser.name}`)
  console.log(`   - Email: ${updatedUser.email}`)
  console.log(`   - EMP No: ${updatedUser.staffId}`)
  console.log(`   - Role: ADMIN (${adminRole.id})`)
}

main()
  .catch((e) => {
    console.error('❌ Authorization failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
