import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// POST /api/check-slug - check if slug is available for current user
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  const userId = (session.user as any).id as string
  let body: { slug?: string } = {}
  try {
    body = await req.json()
  } catch {
    /* ignore */
  }
  const slug = sanitizeSlug(body.slug ?? '')
  if (!slug) {
    return NextResponse.json({ error: 'invalid_slug' }, { status: 400 })
  }
  if (slug.length < 2 || slug.length > 32) {
    return NextResponse.json({ error: 'length', available: false })
  }
  const existing = await db.profile.findUnique({ where: { slug } })
  if (existing && existing.userId !== userId) {
    return NextResponse.json({ available: false, slug })
  }
  return NextResponse.json({ available: true, slug })
}

function sanitizeSlug(s: string) {
  return s
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '')
    .slice(0, 32)
}
