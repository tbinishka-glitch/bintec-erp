import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ status: 'API Subtree Functional', timestamp: new Date().toISOString() })
}
