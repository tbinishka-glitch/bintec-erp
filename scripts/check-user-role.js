const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const roles = await prisma.role.findMany();
    console.log('--- ALL ROLES ---');
    roles.forEach(r => console.log(`'${r.name}' (ID: ${r.id})`));

    const user = await prisma.user.findFirst({
      where: { 
        OR: [
          { email: 'tilina.id@leedscampus.com' },
          { name: { contains: 'Tilina' } }
        ]
      },
      include: { role: true }
    });

    if (user) {
      console.log('--- USER FOUND ---');
      console.log(`Name: ${user.name}`);
      console.log(`Email: ${user.email}`);
      console.log(`Role: '${user.role?.name}'`);
    } else {
      console.log('--- USER NOT FOUND ---');
    }
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

check();
