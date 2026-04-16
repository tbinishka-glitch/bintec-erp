const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCategories() {
  const categories = await prisma.employeeCategory.findMany();
  console.log('--- EMPLOYEE CATEGORIES IN DB ---');
  console.log(JSON.stringify(categories, null, 2));
  console.log('Total:', categories.length);
}

checkCategories()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
