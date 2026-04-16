import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { format, isThisMonth, differenceInDays } from 'date-fns'
import { Cake } from 'lucide-react'
import { BirthdayWallClient } from '@/components/birthday-wall/BirthdayWallClient'

function getNextBirthday(dob: Date): Date {
  const today = new Date()
  const upcoming = new Date(today.getFullYear(), dob.getMonth(), dob.getDate())
  if (upcoming < today) upcoming.setFullYear(today.getFullYear() + 1)
  return upcoming
}

const CONFETTI_EMOJIS = ['🎂', '🎉', '🎈', '🥳', '🎊', '✨', '🌟', '🎁']

export default async function BirthdayWallPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const me = await prisma.user.findUnique({ where: { id: session.user.id } })
  const roleName = (session.user as any)?.roleName
  const isAdmin = roleName === 'Corporate Admin' || roleName === 'Super Admin'

  const allUsers = await prisma.user.findMany({
    where: {
      dateOfBirth: { not: null },
      ...(me?.branchId && !isAdmin ? { branchId: me.branchId } : {})
    },
    include: { branch: true }
  })

  const today = new Date()
  const birthdays = allUsers
    .map(u => ({ ...u, nextBirthday: getNextBirthday(u.dateOfBirth!), daysLeft: 0 }))
    .map(u => ({ ...u, daysLeft: differenceInDays(u.nextBirthday, today) }))
    .sort((a, b) => a.daysLeft - b.daysLeft)

  const todayBirthdays = birthdays.filter(b => b.daysLeft === 0)
  const upcomingBirthdays = birthdays.filter(b => b.daysLeft > 0 && b.daysLeft <= 30)

  return (
    <div className="min-h-screen bg-[#F8F9FC] pt-8">
      <BirthdayWallClient 
        todayBirthdays={todayBirthdays}
        upcomingBirthdays={upcomingBirthdays}
      />
    </div>
  )
}
