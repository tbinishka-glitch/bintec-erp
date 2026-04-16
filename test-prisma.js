const c = require('@prisma/client');
const p = new c.PrismaClient();
console.log('PrismaClient constructed OK');
p.$disconnect();
