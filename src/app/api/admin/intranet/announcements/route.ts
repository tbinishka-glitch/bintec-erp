import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { can } from '@/lib/rbac'
import { revalidatePath } from 'next/cache'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const hasAccess = await can('intranet', 'create')
  if (!hasAccess) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const body = await req.json()
    const { title, content, type, priority, targetBranches } = body

    if (!title || !content) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
    }

    // We use the existing Article model with a special 'ANNOUNCEMENT' type if possible,
    // or just assume Intranet announcements are highly visible articles.
    // For now, let's create a dedicated 'Announcement' category if it doesn't exist.
    
    const announcement = await prisma.article.create({
      data: {
        title,
        content,
        authorId: session.user.id,
        organizationId: 'leeds',
        status: 'APPROVED', // Admin announcements are auto-approved
        tags: priority || 'NORMAL',
      }
    })

    revalidatePath('/')
    revalidatePath('/intranet')

    return NextResponse.json({ success: true, id: announcement.id })
  } catch (err: any) {
    console.error('[AnnouncementCreate]', err)
    return NextResponse.json({ error: 'Failed to broadcast announcement.' }, { status: 500 })
  }
}
