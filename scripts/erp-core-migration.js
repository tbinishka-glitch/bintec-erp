const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const path = require('path');
require('dotenv').config();

// Replicating the application's native adapter initialization
function getPrisma() {
  const rawUrl = process.env.DATABASE_URL ?? 'file:./prisma/leeds_v2.db';
  const rawPath = rawUrl.replace('file:', '');
  const dbPath = path.isAbsolute(rawPath) ? rawPath : path.join(process.cwd(), rawPath);
  
  console.log(`[ERP Migration] Initializing Native Adapter for: ${dbPath}`);
  
  const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
  return new PrismaClient({ adapter });
}

const prisma = getPrisma();

async function main() {
  console.log('🚀 Starting ERP Core Migration...');

  // 1. Migrate Users to Employees
  const userCount = await prisma.user.count();
  console.log(`- Identified ${userCount} existing records for entity migration.`);
  
  const updatedUsers = await prisma.user.updateMany({
    data: { isEmployee: true }
  });
  console.log(`✅ Successfully promoted ${updatedUsers.count} users to 'Employee' entities.`);

  // 2. Initialize Core Organization Modules
  const org = await prisma.organization.findFirst();
  if (!org) {
    console.error('❌ No organization found. Migration aborted.');
    return;
  }

  const coreModules = [
    { 
      name: 'Intranet Hub', 
      slug: 'intranet', 
      icon: 'Megaphone', 
      desc: 'Central staff communications, knowledge base, and social interaction.'
    },
    { 
      name: 'HR Management', 
      slug: 'hr', 
      icon: 'UserSquare2', 
      desc: 'Comprehensive employee lifecycle, payroll, and performance governance.'
    },
    { 
      name: 'Finance Hub', 
      slug: 'finance', 
      icon: 'Wallet', 
      desc: 'Accounting, supplier management, and institutional financial oversight.'
    },
    { 
      name: 'School Management', 
      slug: 'school', 
      icon: 'GraduationCap', 
      desc: 'Student records, parent links, and academic administration.'
    }
  ];

  console.log('- Initializing core ERP modules...');
  for (const mod of coreModules) {
    await prisma.module.upsert({
      where: { slug: mod.slug },
      update: { 
        name: mod.name, 
        icon: mod.icon, 
        description: mod.desc,
        isActive: true 
      },
      create: {
        name: mod.name,
        slug: mod.slug,
        icon: mod.icon,
        description: mod.desc,
        organizationId: org.id,
        isActive: true
      }
    });
  }
  console.log('✅ Core modules initialized successfully.');

  // 3. Initialize Default Permission Matrix for Super Admin
  const saRole = await prisma.role.findFirst({
    where: { name: 'Super Admin' }
  });

  if (saRole) {
    console.log('- Bootstrapping Super Admin permission matrix...');
    for (const mod of coreModules) {
      await prisma.permissionMatrix.upsert({
        where: { roleId_moduleSlug: { roleId: saRole.id, moduleSlug: mod.slug } },
        update: {
          canView: true, canCreate: true, canEdit: true, canDelete: true, canApprove: true, canConfig: true
        },
        create: {
          roleId: saRole.id,
          moduleSlug: mod.slug,
          canView: true, canCreate: true, canEdit: true, canDelete: true, canApprove: true, canConfig: true
        }
      });
    }
    console.log('✅ Super Admin permission matrix established.');
  }

  console.log('🏁 ERP Core Migration Complete.');
}

main()
  .catch(e => {
    console.error('❌ Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
