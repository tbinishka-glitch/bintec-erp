const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'prisma', 'leeds_v2.db');
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

async function check() {
  try {
    const userId = "cmnpak10q0005igu6g5ywnf94";
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true }
    });
    console.log("SESSION USER:", JSON.stringify(user, null, 2));
    
    const allUsers = await prisma.user.findMany({
        select: { id: true, email: true, name: true, role: { select: { name: true } } }
    });
    console.log("ALL USERS:", JSON.stringify(allUsers, null, 2));

  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

check();
