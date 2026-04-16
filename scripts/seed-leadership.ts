import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import path from 'path'

const dbPath = path.join(process.cwd(), 'prisma', 'dev.db')
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` })
const prisma = new PrismaClient({ adapter })

async function main() {
  const executives = [
    {
      email: 'founder@leeds.lk',
      name: 'Dr. Sarath Jayatissa',
      leadershipTitle: 'FOUNDER CHAIRMAN',
      leadershipTier: 'EXECUTIVE',
      image: '/founder.JPG',
      bio: 'Visionary founder of LEEDS International Schools.',
    },
    {
      email: 'chairperson@leeds.lk',
      name: 'Mrs. Malithi Jayatissa',
      leadershipTitle: 'CHAIRPERSON',
      leadershipTier: 'EXECUTIVE',
      image: '/chairperson.JPG',
      bio: 'Strategic leader guiding the corporate governance of LEEDS International Group.',
    },
    {
      email: 'md@leeds.lk',
      name: 'Mr. Tilina Diyagama',
      leadershipTitle: 'MANAGING DIRECTOR',
      leadershipTier: 'DIRECTOR',
      image: '/tilina.JPG',
      bio: 'Overseeing the operational excellence and growth across all branches.',
    },
    {
      email: 'hemamala@leeds.lk',
      name: 'Mrs. Hemamala Jayatissa',
      leadershipTitle: 'DIRECTRESS',
      leadershipTier: 'DIRECTOR',
      image: '/hemamala.JPG',
      bio: 'Dedicated to curriculum development and academic standards.',
    },
    {
      email: 'kinithi@leeds.lk',
      name: 'Ms. Kinithi Jayatissa',
      leadershipTitle: 'DIRECTRESS',
      leadershipTier: 'DIRECTOR',
      image: '/kinithi.JPG',
      bio: 'Focusing on innovation and early childhood development.',
    },
  ]

  console.log('Seeding leadership profiles...')

  for (const exec of executives) {
    const user = await prisma.user.upsert({
      where: { email: exec.email },
      update: {
        name: exec.name,
        leadershipTitle: exec.leadershipTitle,
        leadershipTier: exec.leadershipTier,
        image: exec.image,
        bio: exec.bio,
      },
      create: {
        email: exec.email,
        name: exec.name,
        leadershipTitle: exec.leadershipTitle,
        leadershipTier: exec.leadershipTier,
        image: exec.image,
        bio: exec.bio,
        password: 'password123', // Default password for new seeded users
      },
    })
    console.log(`Upserted: ${user.name} (${user.leadershipTitle})`)
  }

  console.log('Seeding completed successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
