import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import path from 'path'

// Robust Path Resolution for Enterprise Bootstrap
const dbPath = path.resolve(process.cwd(), 'prisma', 'leeds_v2.db')
console.log(`Connecting to database at: ${dbPath}`)

const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('--- ENTERPRISE BOOTSTRAP START ---')
  
  // 1. Provision Leeds International School (Org 1)
  const org = await prisma.organization.upsert({
    where: { slug: 'leeds' },
    update: {},
    create: {
      id: 'leeds',
      name: 'Leeds International School',
      slug: 'leeds',
      brandColor: '#5A2D82', // Platinum Purple
      brandGold: '#D4AF37',  // Leeds Gold
      brandGray: '#F8F9FA',
      brandText: '#000000',
      isActive: true
    }
  })

  const orgId = org.id
  console.log(`Provisioned Organization: ${org.name} [ID: ${orgId}]`)

  // 2. Global Data Anchoring
  console.log('Anchoring legacy institution data...')
  
  const models = [
    'user', 'role', 'branch', 'department', 'employeeCategory', 
    'announcement', 'article', 'chatGroup', 'chatGroupCategory', 
    'virtualMeeting', 'welfareResource', 'auditLog'
  ]

  for (const model of models) {
    try {
      const result = await (prisma as any)[model].updateMany({
        where: { organizationId: null },
        data: { organizationId: orgId }
      })
      console.log(`  - Anchored ${result.count} records in [${model}]`)
    } catch (e) {
      console.warn(`  - Skip [${model}]: ${e instanceof Error ? e.message : 'Unknown error'}`)
    }
  }

  // 3. Provision Organizational Settings
  await prisma.organizationSetting.upsert({
    where: { organizationId: orgId },
    update: {},
    create: {
      organizationId: orgId,
      activeTheme: 'default',
      snowfallEnabled: false
    }
  })
  console.log('Provisioned Organization Settings [OK]')

  console.log('--- ENTERPRISE BOOTSTRAP SUCCESS ---')
}

main()
  .catch((e) => {
    console.error('--- BOOTSTRAP FAILURE ---')
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
