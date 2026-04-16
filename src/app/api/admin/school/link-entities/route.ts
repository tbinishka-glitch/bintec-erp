import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { can } from '@/lib/rbac'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const hasAccess = await can('school', 'edit')
  if (!hasAccess) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const body = await req.json()
    const { studentId, parentId, studentInstitutionalId, gradeId } = body

    if (!studentId) {
      return NextResponse.json({ error: 'Student ID is required.' }, { status: 400 })
    }

    // Upsert the StudentProfile
    const profile = await prisma.studentProfile.upsert({
      where: { userId: studentId },
      update: {
        parentId: parentId || null,
        studentId: studentInstitutionalId || undefined,
        gradeId: gradeId || null,
      },
      create: {
        userId: studentId,
        studentId: studentInstitutionalId || `STU-${Date.now()}`,
        parentId: parentId || null,
        gradeId: gradeId || null,
      }
    })

    // Ensure the mapped user is flagged as Student
    await prisma.user.update({
      where: { id: studentId },
      data: { isStudent: true }
    })

    if (parentId) {
      // Ensure the parent is flagged as Parent
      await prisma.user.update({
        where: { id: parentId },
        data: { isParent: true }
      })
      
      // Initialize ParentProfile if it doesn't exist
      await prisma.parentProfile.upsert({
        where: { userId: parentId },
        update: {},
        create: { userId: parentId }
      })
    }

    return NextResponse.json({ success: true, profile })
  } catch (err: any) {
    console.error('[EntityLinker]', err)
    return NextResponse.json({ error: 'Failed to link entities.' }, { status: 500 })
  }
}
