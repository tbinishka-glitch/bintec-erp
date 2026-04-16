const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
const db = new Database(dbPath);

const executives = [
  {
    email: 'founder@leeds.lk',
    name: 'Dr. Sarath Jayatissa',
    title: 'FOUNDER CHAIRMAN',
    tier: 'EXECUTIVE',
    image: '/founder.JPG',
    bio: 'Visionary founder of LEEDS International Schools.',
  },
  {
    email: 'chairperson@leeds.lk',
    name: 'Mrs. Malithi Jayatissa',
    title: 'CHAIRPERSON',
    tier: 'EXECUTIVE',
    image: '/chairperson.JPG',
    bio: 'Strategic leader guiding the corporate governance of LEEDS International Group.',
  },
  {
    email: 'md@leeds.lk',
    name: 'Mr. Tilina Diyagama',
    title: 'MANAGING DIRECTOR',
    tier: 'DIRECTOR',
    image: '/tilina.JPG',
    bio: 'Overseeing the operational excellence and growth across all branches.',
  },
  {
    email: 'hemamala@leeds.lk',
    name: 'Mrs. Hemamala Jayatissa',
    title: 'DIRECTRESS',
    tier: 'DIRECTOR',
    image: '/hemamala.JPG',
    bio: 'Dedicated to curriculum development and academic standards.',
  },
  {
    email: 'kinithi@leeds.lk',
    name: 'Ms. Kinithi Jayatissa',
    title: 'DIRECTRESS',
    tier: 'DIRECTOR',
    image: '/kinithi.JPG',
    bio: 'Focusing on innovation and early childhood development.',
  },
];

console.log('Seeding leadership profiles via raw SQL...');

const id_prefix = 'user_seed_';

executives.forEach((exec, index) => {
  const id = id_prefix + index;
  // Using INSERT OR REPLACE (equivalent to upsert for our purposes)
  // We need to make sure the columns exist. db push said they are in sync.
  try {
    const stmt = db.prepare(`
      INSERT INTO User (id, email, name, leadershipTitle, leadershipTier, image, bio, password, isActive, forcePasswordChange)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(email) DO UPDATE SET
        name=excluded.name,
        leadershipTitle=excluded.leadershipTitle,
        leadershipTier=excluded.leadershipTier,
        image=excluded.image,
        bio=excluded.bio
    `);
    
    stmt.run(id, exec.email, exec.name, exec.title, exec.tier, exec.image, exec.bio, 'password123', 1, 0);
    console.log(`Successfully upserted: ${exec.name}`);
  } catch (err) {
    console.error(`Error upserting ${exec.name}:`, err.message);
  }
});

db.close();
console.log('Raw SQL Seeding completed.');
