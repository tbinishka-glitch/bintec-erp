const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // We need to find the organization... assuming 'leeds' or first one
  const org = await prisma.organization.findFirst();
  if (!org) {
    console.error("No organization found to attach module to.");
    return;
  }

  await prisma.module.upsert({
    where: { 
      slug_organizationId: {
        slug: 'intranet',
        organizationId: org.id
      }
    },
    update: {
      name: 'Intranet Hub',
      description: 'Centralized publishing, SOP management, and employee engagement.',
      icon: 'Megaphone',
      isActive: true
    },
    create: {
      slug: 'intranet',
      organizationId: org.id,
      name: 'Intranet Hub',
      description: 'Centralized publishing, SOP management, and employee engagement.',
      icon: 'Megaphone',
      isActive: true
    }
  });

  console.log('✅ Intranet Hub module upserted successfully in Modular ERP section.');
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
