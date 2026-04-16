const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const categories = [
  'Academic',
  'Academic Operations',
  'Operations',
  'Facilities Management',
  'Security & Surveillance',
  'Driver',
  'Branch Leadership',
  'Network Leadership',
  'Senior Leadership',
  'Corporate Leadership'
];

async function seedCategories() {
  console.log('Upserting Employee Categories...');
  for (const name of categories) {
    const slug = name.toLowerCase().replace(/ & /g, '-').replace(/\s+/g, '-');
    await prisma.employeeCategory.upsert({
      where: { name },
      update: {},
      create: { name, slug, description: `System category: ${name}` }
    });
    console.log(` - ${name} (${slug})`);
  }
  console.log('Seeding complete.');
}

seedCategories()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
