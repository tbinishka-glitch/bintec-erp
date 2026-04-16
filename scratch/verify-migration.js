
const Database = require('better-sqlite3')
const path = require('path')

try {
  const dbPath = path.join(process.cwd(), 'prisma', 'leeds_v2.db')
  const db = new Database(dbPath)
  
  const columns = db.prepare("PRAGMA table_info(User)").all()
  console.log('Columns in NEW User table (leeds_v2):')
  console.log(columns.map(c => c.name).join(', '))
  
  db.close()
} catch (error) {
  console.error('Error:', error.message)
}
