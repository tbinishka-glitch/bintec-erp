import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  try {
    const session = await auth()
    
    // 1. Ensure the user is logged into the ERP Shell first
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'ERP Session required' }, { status: 401 })
    }

    const { password } = await req.json()
    if (!password) {
      return NextResponse.json({ error: 'Password required' }, { status: 400 })
    }

    // 2. Fetch the current user's hashed password from the DB
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true }
    })

    if (!user || !user.password) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // 3. Cryptographic Comparison
    const isMatch = await bcrypt.compare(password, user.password)

    if (isMatch) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }
  } catch (error) {
    console.error('[CITADEL_VERIFY_ERROR]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
