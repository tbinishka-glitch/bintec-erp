/*
  Wipe Dummy Entities Script
  
  This script moves entities to the System Trash Bin or permanently deletes them.
  Run via: npx ts-node scripts/wipe-dummy-entities.ts
*/
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Initiating Dummy Data Cleanup...')

  // Strategy: Move all users without a system role or with 'dummy'/'test' in their name to TRASH.
  // We avoid permanently deleting them instantly to let Super Admin review in Trash.
  
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { email: { contains: 'test' } },
        { email: { contains: 'dummy' } },
        { firstName: { contains: 'test' } },
        { firstName: { contains: 'dummy' } },
        { name: { contains: 'test' } },
        { name: { contains: 'dummy' } },
      ],
      deletedAt: null 
    },
    include: { role: true }
  })

  let count = 0
  for (const user of users) {
    // Safety check: Never delete a Super Admin
    if (user.role?.name === 'Super Admin' || user.email === 'admin@leeds.lk') {
      continue
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { deletedAt: new Date() }
    })
    console.log(`🗑️  Sent to Trash: ${user.name || user.email} (Entity ID: ${user.entityId || 'N/A'})`)
    count++
  }

  console.log(`\n✅ Operation Complete: ${count} dummy entities successfully moved to System Trash Bin.`)
  console.log(`You can now permanently wipe them by visiting /admin/super/trash and clicking 'Empty Trash'.`)
}

main()
  .catch(e => {
    console.error('❌ Error shutting down dummy entities:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
