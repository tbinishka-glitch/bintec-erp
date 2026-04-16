import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

// Simple Prisma without adapter since we're in node directly?
// Actually if schema has adapter configuration... Let's just create a quick direct SQLite insert using better-sqlite3
import Database from 'better-sqlite3'

async function main() {
  const db = new Database('prisma/leeds_v2.db')
  const pw = await bcrypt.hash('password123', 10)
  
  // get org
  const org = db.prepare("SELECT id FROM Organization LIMIT 1").get()
  const role = db.prepare("SELECT id FROM Role WHERE name = 'Super Admin' LIMIT 1").get()
  const branch = db.prepare("SELECT id FROM Branch LIMIT 1").get()
  
  const id = 'cm0xyz_' + Date.now()
  const entityId = 'LIS-ENT-000000'
  
  db.prepare(`
    INSERT INTO User (id, entityId, email, name, firstName, lastName, password, roleId, organizationId, branchId, isActive, entityStatus, isEmployee, joinedDate)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'ACTIVE', 1, ?)
  `).run(id, entityId, 'admin@leeds.lk', 'Binishka Nayananda', 'Binishka', 'Nayananda', pw, role.id, org.id, branch.id, new Date().toISOString())
  
  console.log("Successfully recovered Binishka's Super Admin account!")
}

main().catch(console.error)
