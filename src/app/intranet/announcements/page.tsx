import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { AnnouncementsClient } from '@/components/announcements/AnnouncementsClient'

export default async function AnnouncementsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  
  const currentUserId = session.user.id

  const me = await prisma.user.findUnique({
    where: { id: currentUserId },
    include: { branch: true, role: true }
  })
  
  const roleName = (session.user as any)?.roleName || ''
  const isAdmin = ['Super Admin', 'Corporate Admin', 'IT Admin', 'Network Admin'].includes(roleName)
  const isBranchAdmin = roleName === 'Branch Admin'

  // Fetch announcements with specific scoping
  const announcementsRaw = await prisma.announcement.findMany({
    where: {
      AND: [
        // Role/Branch scoping
        isAdmin ? {} : (isBranchAdmin ? { branchId: me?.branchId } : { OR: [{ branchId: me?.branchId }, { branchId: null }] }),
        
        // Category targeting: Show if none targeted OR user is in targeted category
        !isAdmin ? {
          OR: [
            { targetCategories: { none: {} } },
            { targetCategories: { some: { id: me?.employeeCategoryId || '' } } }
          ]
        } : {}
      ]
    },
    orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
    include: {
      author: { select: { name: true, firstName: true, lastName: true, image: true } },
      branch: { select: { name: true } },
      targetCategories: { select: { name: true } }
    },
  })

  // Pre-calculate reactions and comments for client speed
  const annIds = announcementsRaw.map(a => a.id)
  
  const [allReactions, allComments] = await Promise.all([
    prisma.reaction.findMany({ 
      where: { entityType: 'Announcement', entityId: { in: annIds } }, 
      select: { emoji: true, userId: true, entityId: true } 
    }),
    prisma.comment.findMany({
      where: { entityType: 'Announcement', entityId: { in: annIds } },
      orderBy: { createdAt: 'asc' },
      include: { user: { select: { name: true, firstName: true, lastName: true } } },
    })
  ])

  // Map to fully hydrated instances for the client
  const announcements = announcementsRaw.map(a => {
    const rawReactions = allReactions.filter(r => r.entityId === a.id);
    const summaryReactions: Record<string, { count: number; reacted: boolean }> = {};
    for (const r of rawReactions) {
      if (!summaryReactions[r.emoji]) summaryReactions[r.emoji] = { count: 0, reacted: false };
      summaryReactions[r.emoji].count++;
      if (r.userId === currentUserId) summaryReactions[r.emoji].reacted = true;
    }
    
    return {
      ...a,
      summaryReactions,
      comments: allComments.filter(c => c.entityId === a.id),
    }
  })

  return (
    <AnnouncementsClient 
      announcements={announcements} 
      currentUserId={currentUserId}
      userBranchName={me?.branch?.name}
    />
  )
}
