import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { DashboardClient } from '@/components/dashboard/DashboardClient'

export default async function IntranetHomePage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email as string },
    include: { role: true, branch: true, department: true }
  })

  if (!dbUser) redirect('/login')

  const trueUserId = dbUser.id
  const now = new Date()
  
  // Define Windows for New Joiners and Celebrations
  const fourteenDaysAgo = new Date(now.getTime() - (14 * 24 * 60 * 60 * 1000))
  const sevenDaysAhead = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000))

  const [
    announcements,
    upcomingBirthdays,
    articles,
    newTeamMembers,
    userCount,
    unreadNotifs,
    celebrationPopup
  ] = await Promise.all([
    prisma.announcement.findMany({
      take: 4,
      orderBy: { createdAt: 'desc' },
      include: { author: { select: { name: true, image: true } } }
    }),
    prisma.user.findMany({
      where: {
        dateOfBirth: { not: null },
        isInIntranet: true
      },
      select: { id: true, name: true, image: true, dateOfBirth: true, joinedDate: true }
    }),
    prisma.article.findMany({
      where: { status: 'APPROVED' },
      take: 3,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.user.findMany({
      where: {
        joinedDate: { gte: fourteenDaysAgo }
      },
      take: 6,
      orderBy: { joinedDate: 'desc' },

      include: { role: true, department: true, branch: true }
    }),
    prisma.user.count(),
    prisma.notification.count({
      where: { userId: trueUserId, isRead: false }
    }),
    prisma.celebration.findFirst({
      where: { 
        showAsPopup: true,
        status: 'APPROVED',
        publishDate: { lte: now }
      },
      orderBy: { publishDate: 'desc' },
      select: { id: true, type: true, title: true, message: true, imageUrl: true, priority: true }
    })
  ])

  // Process Birthdays for "Upcoming" (Next 7 days ignoring year)
  const sortedBirthdays = (upcomingBirthdays || [])
    .filter(u => {
      const dob = new Date(u.dateOfBirth!)
      const birthdayThisYear = new Date(now.getFullYear(), dob.getMonth(), dob.getDate())
      const diff = birthdayThisYear.getTime() - now.getTime()
      return diff >= -86400000 && diff <= (7 * 86400000)
    })
    .sort((a, b) => {
      const dobA = new Date(a.dateOfBirth!)
      const dobB = new Date(b.dateOfBirth!)
      return dobA.getMonth() - dobB.getMonth() || dobA.getDate() - dobB.getDate()
    })

  // Process Work Anniversaries
  const workAnniversaries = (upcomingBirthdays || [])
    .filter(u => {
      if (!u.joinedDate) return false
      const joint = new Date(u.joinedDate)
      const thisYearAnn = new Date(now.getFullYear(), joint.getMonth(), joint.getDate())
      const diff = thisYearAnn.getTime() - now.getTime()
      return diff >= -86400000 && diff <= (14 * 86400000) // 14 days window for anniversaries
    })
    .map(u => ({ ...u, years: now.getFullYear() - new Date(u.joinedDate!).getFullYear() }))
    .filter(u => u.years > 0) // Only show if they've completed at least 1 year

  const stats = {
    userCount,
    unreadNotifs,
    birthdayTodayCount: sortedBirthdays.filter(u => {
      const dob = new Date(u.dateOfBirth!)
      return dob.getMonth() === now.getMonth() && dob.getDate() === now.getDate()
    }).length,
    anniversaryTodayCount: workAnniversaries.filter(u => {
      const joint = new Date(u.joinedDate!)
      return joint.getMonth() === now.getMonth() && joint.getDate() === now.getDate()
    }).length
  }

  return (
    <DashboardClient 
      user={dbUser}
      announcements={announcements || []}
      upcomingBirthdays={sortedBirthdays}
      upcomingAnniversaries={workAnniversaries}
      articles={articles || []}
      recentAwards={[]} // Placeholder for future enhancement
      stats={stats}
      newTeamMembers={newTeamMembers || []}
      celebrationPopup={celebrationPopup}
    />
  )
}
