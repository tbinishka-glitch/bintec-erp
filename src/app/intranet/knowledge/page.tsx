import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { KnowledgeClient } from '@/components/knowledge/KnowledgeClient'

export default async function KnowledgePage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const me = await prisma.user.findUnique({ 
    where: { id: session.user.id },
    include: { role: true, branch: true }
  })
  const roleName = me?.role?.name || ''
  const isAdmin = ['Super Admin', 'Corporate Admin', 'IT Admin', 'Network Admin'].includes(roleName)
  const isBranchAdmin = roleName === 'Branch Admin'

  // Construct robust where clause
  let where: any = {}
  
  if (!isAdmin) {
    where.AND = [
      // Status Filter
      { status: 'APPROVED' },
      
      // Branch Scoping
      isBranchAdmin 
        ? { branchId: me?.branchId } 
        : { OR: [{ branchId: me?.branchId }, { branchId: null }] },
      
      // Category Targeting
      {
        OR: [
          { targetCategories: { none: {} } },
          { targetCategories: { some: { id: me?.employeeCategoryId || '' } } }
        ]
      }
    ]
  }

  const articlesRaw = await prisma.article.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { 
      author: { select: { name: true, firstName: true, lastName: true, image: true } },
      targetCategories: { select: { id: true, name: true } }
    },
  })

  // Manual Join for Polymorphic Relations (Comments & Reactions)
  const allComments = await prisma.comment.findMany({
    where: { entityType: 'ARTICLE' },
    include: { user: { select: { name: true, image: true } } },
    orderBy: { createdAt: 'asc' }
  })

  const allReactions = await prisma.reaction.findMany({
    where: { entityType: 'ARTICLE' },
    include: { user: { select: { name: true } } }
  })

  const articlesWithData = articlesRaw.map(a => ({
    ...a,
    comments: allComments.filter(c => c.entityId === a.id),
    reactions: allReactions.filter(r => r.entityId === a.id)
  }))

  return <KnowledgeClient articles={articlesWithData} session={session} />
}
