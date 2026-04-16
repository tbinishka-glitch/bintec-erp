import Database from 'better-sqlite3'

function main() {
  const db = new Database('prisma/leeds_v2.db')
  
  // Delete the blank ghost entity LIS-ENT-0000002
  const result = db.prepare("DELETE FROM User WHERE entityId = 'LIS-ENT-0000002'").run()
  console.log('Deleted ghost records:', result.changes)
  
  // Show remaining users
  const remaining = db.prepare("SELECT id, entityId, name FROM User WHERE deletedAt IS NULL").all()
  console.log('Remaining entities:', remaining)
}

main()
