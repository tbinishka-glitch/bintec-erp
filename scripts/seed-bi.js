const { PrismaClient } = require('@prisma/client')
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3')
const path = require('path')

const dbPath = path.join(process.cwd(), 'prisma', 'leeds_v2.db')
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('--- 🧪 STARTING NATIVE INTELLIGENCE SYNTHESIS (BI SEEDING) ---')

  const branches = await prisma.branch.findMany({ take: 4 })
  const branchIds = branches.map(b => b.id)

  if (branchIds.length === 0) {
    console.error('No branches found to bind intelligence data.')
    return
  }

  // 1. 💰 FINANCIAL INTELLIGENCE (Last 6 Months)
  console.log('Synthesizing Financial Pulse...')
  const financeData = []
  for (let i = 0; i < 6; i++) {
    const monthDate = new Date()
    monthDate.setMonth(monthDate.getMonth() - (5 - i))
    financeData.push({
      type: 'INCOME',
      amount: 1500000 + (Math.random() * 500000),
      category: 'Tuition Fees',
      date: monthDate,
      branchId: branchIds[i % branchIds.length]
    })
    financeData.push({
      type: 'EXPENSE',
      amount: 900000 + (Math.random() * 300000),
      category: 'Operations',
      date: monthDate,
      branchId: branchIds[i % branchIds.length]
    })
  }
  await prisma.financialTransaction.createMany({ data: financeData })

  // 2. 💳 STUDENT PAYMENT PERFORMANCE
  console.log('Synthesizing Collection Summary...')
  const students = ['Amali J', 'Kinithi J', 'Tilina D', 'Hemamala J', 'Binishka N', 'Ruwan P']
  const paymentData = students.map((name, idx) => ({
    studentName: name,
    amountPaid: idx % 3 === 0 ? 50000 : 75000,
    amountDue: idx % 3 === 0 ? 35000 : 0,
    status: idx % 3 === 0 ? 'PARTIAL' : 'PAID',
    branchId: branchIds[idx % branchIds.length]
  }))
  await prisma.studentPayment.createMany({ data: paymentData })

  // 3. 📅 ATTENDANCE REGISTRY
  console.log('Synthesizing Attendance Telemetry...')
  const attendanceData = []
  for (let i = 0; i < 7; i++) {
    const day = new Date()
    day.setDate(day.getDate() - i)
    branchIds.forEach(bid => {
      const total = 50
      const absentees = Math.floor(Math.random() * 4)
      attendanceData.push({
        entityType: 'STAFF',
        branchId: bid,
        totalCount: total,
        presentCount: total - absentees,
        date: day
      })
    })
  }
  await prisma.attendanceRecord.createMany({ data: attendanceData })

  console.log('--- ✅ NATIVE INTELLIGENCE SYNTHESIS COMPLETE ---')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
