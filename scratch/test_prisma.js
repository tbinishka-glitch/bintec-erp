const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('--- Organizational Decoupling Test ---')
  try {
    const dept = await prisma.department.create({
      data: { name: 'Marketing_Test' }
    })
    console.log('SUCCESS: Department created without branch dependency.')
    console.log('Created ID:', dept.id)
  } catch (err) {
    console.error('FAILED: Validation error detected.')
    console.error(err.message)
  } finally {
    await prisma.$disconnect()
  }
}

main()
