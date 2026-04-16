require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3')
const path = require('path')

async function seed() {
  const rawPath = process.env.DATABASE_URL?.replace('file:', '') ?? 'prisma/leeds_v2.db'
  const dbPath = path.isAbsolute(rawPath) ? rawPath : path.join(process.cwd(), rawPath)
  
  console.log(`Connecting to database at: ${dbPath}`)
  
  const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` })
  const prisma = new PrismaClient({ adapter })

  const structure = [
    {
      category: 'Academic',
      subCategories: [
        'Intern Teacher', 'Trainee Teacher', 'Class Teacher', 'Assistant Teacher', 
        'Subject Teacher', 'IT Coordinator', 'SEN Teacher', 'Speech Therapist', 
        'Sports Coach', 'Swimming Instructor', 'Art Teacher', 'Dancing Teacher', 
        'Music Teacher', 'Drama Teacher', 'Librarian', 'Assistant Librarian', 
        'Lab In-Charge', 'Nursing Officer'
      ]
    },
    {
      category: 'Academic Heads',
      subCategories: [
        'Sectional Head', 'Grade Coordinator', 'Subject Head', 
        'Head of Department (HOD)', 'Exam Coordinator', 'Academic Assistant'
      ]
    },
    {
      category: 'Branch Leadership',
      subCategories: [
        'Principal', 'Head Mistress', 'Head Master', 'Head of the Branch', 
        'Deputy Principal', 'General Coordinator – Operations', 
        'General Coordinator – Academic', 'Academic Manager', 'Branch Registrar'
      ]
    },
    {
      category: 'Administration / Operations',
      subCategories: [
        'Operations Manager', 'Operations Executive', 'Executive HR', 
        'Executive Finance', 'Executive Marketing', 'Executive IT', 
        'Parent Service Officer', 'Manager – Parent Services', 'Accounts Officer', 
        'Receptionist', 'Secretary', 'Transport Coordinator', 
        'Maintenance Manager', 'Security In-Charge', 'Inventory Officer'
      ]
    },
    {
      category: 'Network Leadership',
      subCategories: [
        'Network Head of HR', 'Network Head of Finance', 'Group Manager', 
        'Network Head of IT', 'Network Head of Sports', 'Network Head of Art', 
        'Network Head of Dancing', 'Network Head of Music', 'Network Head of Science', 
        'Network Head of Audit', 'Network Head of Academic', 'Network Head of Admissions'
      ]
    },
    {
      category: 'Senior Leadership',
      subCategories: [
        'Head of Operations – Western', 'Head of Operations – Southern', 
        'Head of Operations – Sabaragamuwa', 'General Manager – Operations', 
        'Coordinating Principal', 'Deputy Coordinating Principal', 
        'Assistant Coordinating Principal', 'Head of Academic & Examination', 
        'Head of Examination', 'Chief Operating Officer (COO)'
      ]
    },
    {
      category: 'Corporate Leadership',
      subCategories: [
        'Founder', 'Chairperson', 'Deputy Chairperson', 'Managing Director', 
        'Director', 'Directress', 'Chief Executive Officer (CEO)'
      ]
    }
  ]

  console.log('Seeding Multi-Level Organizational Structure...')

  const organization = await prisma.organization.findFirst()
  if (!organization) {
    console.error('No organization found. Please run base seed first.')
    return
  }

  for (const item of structure) {
    const categoryName = item.category
    const categorySlug = categoryName.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s/_-]+/g, '-').replace(/^-+|-+$/g, '')
    
    const category = await prisma.employeeCategory.upsert({
      where: { slug: categorySlug },
      update: { name: categoryName },
      create: { 
        name: categoryName, 
        slug: categorySlug,
        organizationId: organization.id,
        description: `Strategic category: ${categoryName}`
      }
    })
    console.log(`📦 Category: ${category.name}`)

    for (const subName of item.subCategories) {
      const subSlug = `${category.slug}-${subName.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s/_-]+/g, '-').replace(/^-+|-+$/g, '')}`
      await prisma.employeeSubCategory.upsert({
        where: { slug: subSlug },
        update: { name: subName },
        create: {
          name: subName,
          slug: subSlug,
          categoryId: category.id,
          description: `Professional position: ${subName}`
        }
      })
      console.log(`  🔹 Position: ${subName}`)
    }
  }

  console.log('Seeding completed successfully.')
  await prisma.$disconnect()
}

seed().catch(err => {
  console.error('Seed process failed:', err)
  process.exit(1)
})
