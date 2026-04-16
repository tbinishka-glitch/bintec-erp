import Database from 'better-sqlite3'

function main() {
  const db = new Database('prisma/leeds_v2.db')
  
  // Show all users with blank name
  const blanks = db.prepare("SELECT id, entityId, firstName, lastName, name FROM User WHERE (name IS NULL OR name = '') AND deletedAt IS NULL").all()
  console.log('Users with blank name:', blanks)
  
  // Fix any blank names by concatenating firstName + lastName
  const result = db.prepare(`
    UPDATE User 
    SET name = TRIM(COALESCE(firstName, '') || ' ' || COALESCE(lastName, ''))
    WHERE (name IS NULL OR name = '') AND deletedAt IS NULL
  `).run()
  
  console.log('Fixed', result.changes, 'records')
  
  // Verify
  const fixed = db.prepare("SELECT id, entityId, firstName, lastName, name FROM User WHERE deletedAt IS NULL ORDER BY joinedDate DESC LIMIT 5").all()
  console.log('Latest entities:', fixed)
}

main()
