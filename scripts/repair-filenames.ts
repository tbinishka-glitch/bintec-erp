import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import path from 'path'

const dbPath = path.join(process.cwd(), 'dev.db')
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('--- STARTING FILENAME REPAIR ---')
  
  const messages = await prisma.message.findMany({
    where: {
      fileUrl: { not: null }
    }
  })

  console.log(`Checking ${messages.length} messages for corrupted filenames...`)

  let fixedCount = 0
  for (const msg of messages) {
    if (!msg.fileUrl) continue

    // Extract filename from URL: /uploads/chat/UUID-OriginalName.ext
    const parts = msg.fileUrl.split('/')
    const diskName = parts[parts.length - 1]
    
    // UUID is 36 chars + 1 dash = 37 chars
    let recoveredName = diskName
    if (diskName.includes('-')) {
       // Precise stripping: skip the UUID first segment and reconstruct
       // Actually, we can just find the first 36-char segment followed by a dash
       if (diskName.length > 37 && diskName.charAt(36) === '-') {
           recoveredName = diskName.substring(37)
       } else {
           // Fallback: take everything after the first dash
           const dashIdx = diskName.indexOf('-')
           recoveredName = diskName.substring(dashIdx + 1)
       }
    }

    if (msg.fileName !== recoveredName) {
      await prisma.message.update({
        where: { id: msg.id },
        data: { fileName: recoveredName }
      })
      fixedCount++
    }
  }

  console.log(`--- REPAIR COMPLETE: Fixed ${fixedCount} filenames ---`)
}

main()
  .catch(e => {
    console.error('Repair failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
