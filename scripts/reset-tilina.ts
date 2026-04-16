import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import path from 'path'
import bcrypt from 'bcryptjs'

const dbPath = path.join(process.cwd(), 'dev.db')
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` })
const prisma = new PrismaClient({ adapter })

async function main() {
  const password = 'password123'
  const hashedPassword = await bcrypt.hash(password, 10)

  const updatedUser = await prisma.user.update({
    where: { email: 'md@leeds.lk' },
    data: {
      password: hashedPassword,
      staffId: 'MD-001',
      isActive: true,
      forcePasswordChange: false
    }
  })

  console.log('✅ Tilina Diyagama (MD) Credentials Reset:')
  console.log(`   - Email: ${updatedUser.email}`)
  console.log(`   - EMP No: ${updatedUser.staffId}`)
  console.log(`   - Password: ${password}`)
  console.log('---')
  console.log('Please advise Mr. Tilina to log in using these exact values.')
}

main()
  .catch((e) => {
    console.error('❌ Reset failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
