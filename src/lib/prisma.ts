import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import path from 'path'

const globalForPrisma = global as unknown as { prisma_v8: PrismaClient }

/**
 * Prisma 7 Initialization Strategy for Leeds ERP
 * Using the native Better-SQLite3 adapter to avoid WASM engine instability in Next.js 16/React 19.
 */
function createPrismaClient() {
  try {
    const rawUrl = process.env.DATABASE_URL ?? 'file:./prisma/leeds_v2.db'
    const rawPath = rawUrl.replace('file:', '')
    const dbPath = path.isAbsolute(rawPath) ? rawPath : path.join(process.cwd(), rawPath)
    
    console.log(`[ERP Database] Connecting via Native Adapter: ${path.basename(dbPath)}`)
    
    const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` })
    return new PrismaClient({ adapter })
  } catch (error) {
    console.error('[ERP Database] Critical: Native adapter failed. Falling back to default.', error)
    return new PrismaClient()
  }
}

export const prisma = globalForPrisma.prisma_v8 || createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma_v8 = prisma
