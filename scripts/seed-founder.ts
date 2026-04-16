import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import path from 'path'

const dbPath = path.join(process.cwd(), 'dev.db')
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` })
const prisma = new PrismaClient({ adapter })

async function main() {
  const founderMessage = `As I reflect on our journey that began in September 1999—with just 77 students and 16 teachers in a modest leased building in Panadura—I am reminded of the old Chinese proverb: “The journey of a thousand miles begins with a single step.” That first step, taken with purpose and quiet determination, has brought us to where we stand today: a family of 16 schools across the Western and Southern provinces, serving over 8,000 students.

LEEDS was driven by a simple but unwavering vision: to provide a quality English-medium education, rooted in Sri Lankan values, and accessible beyond the traditional urban centers. In the early years, this meant taking on challenges others hesitated to face—finding the right teachers, creating safe and inspiring learning environments, and earning the trust of parents who believed in what we stood for.

Today, LEEDS International School offers both the Pearson Edexcel curriculum and the National curriculum in English medium, guiding students through their academic journeys. From our youngest learners in the Early Childhood Development centers to secondary students preparing for their futures, we aim to nurture not only academic brilliance but also the character and resilience needed for life.`

  const founder = await prisma.user.upsert({
    where: { email: 'founder@leeds.lk' },
    update: {
      name: 'Dr. Sarath Jayatissa',
      leadershipTitle: 'FOUNDER CHAIRMAN',
      leadershipTier: 'EXECUTIVE',
      image: '/founder.JPG',
      leadershipQuote: founderMessage,
      bio: 'Visionary founder of LEEDS International Schools, dedicated to quality education accessible to all.',
    },
    create: {
      email: 'founder@leeds.lk',
      name: 'Dr. Sarath Jayatissa',
      leadershipTitle: 'FOUNDER CHAIRMAN',
      leadershipTier: 'EXECUTIVE',
      image: '/founder.JPG',
      leadershipQuote: founderMessage,
      bio: 'Visionary founder of LEEDS International Schools, dedicated to quality education accessible to all.',
    },
  })

  console.log('Founder profile upserted:', founder.id)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
