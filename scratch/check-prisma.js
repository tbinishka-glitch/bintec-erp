const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
console.log('Available models:', Object.keys(prisma).filter(k => k.charAt(0) !== '_'));
process.exit(0);
