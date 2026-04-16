import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('--- 🧪 STARTING INTELLIGENCE SYNTHESIS (BI SEEDING) ---')

  const branches = await prisma.branch.findMany({ take: 4 })
  const branchIds = branches.map(b => b.id)

  if (branchIds.length === 0) {
    console.error('No branches found to bind intelligence data. Please seed branches first.')
    return
  }

  // 1. 💰 FINANCIAL INTELLIGENCE (Last 6 Months)
  console.log('Synthesizing Financial Pulse...')
  const financeData = []
  const months = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar']
  
  for (let i = 0; i < 6; i++) {
    const monthDate = new Date()
    monthDate.setMonth(monthDate.getMonth() - (5 - i))
    
    // Income
    financeData.push({
      type: 'INCOME',
      amount: 1500000 + (Math.random() * 500000),
      category: 'Tuition Fees',
      date: monthDate,
      branchId: branchIds[i % branchIds.length]
    })
    
    // Expenses
    financeData.push({
      type: 'EXPENSE',
      amount: 900000 + (Math.random() * 300000),
      category: 'Operations',
      date: monthDate,
      branchId: branchIds[i % branchIds.length]
    })
  }
  
  await prisma.financialTransaction.createMany({ data: financeData })

  // 2. 💳 STUDENT PAYMENT PERFORMANCE (Collection Summary)
  console.log('Synthesizing Collection Summary...')
  const students = [
    'Amali Jayawardena', 'Kinithi Jayatissa', 'Tilina Diyagama', 'Hemamala Jayatissa', 
    'Binishka Nayananda', 'Ruwan Perera', 'Kasun Silva', 'Nimali Fonseka'
  ]
  
  const paymentData = students.map((name, idx) => ({
    studentName: name,
    amountPaid: idx % 3 === 0 ? 50000 : 75000,
    amountDue: idx % 3 === 0 ? 35000 : 0,
    status: idx % 3 === 0 ? 'PARTIAL' : 'PAID',
    branchId: branchIds[idx % branchIds.length]
  }))
  
  await prisma.studentPayment.createMany({ data: paymentData })

  // 3. 📅 ATTENDANCE REGISTRY (Staff Absenteeism)
  console.log('Synthesizing Attendance Telemetry...')
  const attendanceData = []
  for (let i = 0; i < 14; i++) {
    const day = new Date()
    day.setDate(day.getDate() - i)
    
    branchIds.forEach(bid => {
      const total = 40 + Math.floor(Math.random() * 20)
      const absentees = Math.floor(Math.random() * 4) // 0-3 absentees
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

  // 4. 🎓 ACADEMIC SCOREBOARD (Exam results)
  console.log('Synthesizing Academic Success Data...')
  const examData = []
  const exams = ['Mid-Year Assessment 2026', 'Annual Examination 2025']
  
  exams.forEach((exam, eIdx) => {
    branchIds.forEach(bid => {
      const total = 120 + Math.floor(Math.random() * 50)
      const passRate = 0.85 + (Math.random() * 0.12)
      examData.push({
        examName: exam,
        year: eIdx === 0 ? 2026 : 2025,
        branchId: bid,
        totalStudents: total,
        passCount: Math.floor(total * passRate),
        averageScore: 65 + (Math.random() * 15)
      })
    })
  })
  await prisma.examReport.createMany({ data: examData })

  console.log('--- ✅ INTELLIGENCE SYNTHESIS COMPLETE ---')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
