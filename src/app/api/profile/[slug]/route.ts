import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET /api/profile/[slug] - return public profile, increment views
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const safeSlug = sanitizeSlug(slug)
  if (!safeSlug) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }
  const profile = await db.profile.findUnique({
    where: { slug: safeSlug },
    select: {
      slug: true,
      videoUrl: true,
      posterUrl: true,
      username: true,
      location: true,
      avatarUrl: true,
      displayName: true,
      statusText: true,
      statusEmoji: true,
      bio: true,
      particles: true,
      showViews: true,
      socials: true,
      views: true,
    },
  })
  if (!profile) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }

  // Increment views (non-blocking)
  try {
    await db.profile.update({
      where: { slug: safeSlug },
      data: { views: { increment: 1 } },
    })
  } catch {
    /* ignore */
  }

  return NextResponse.json({
    profile: {
      ...profile,
      socials: safeParse(profile.socials),
      views: profile.views + 1,
    },
  })
}

function sanitizeSlug(s: string) {
  return s
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '')
    .slice(0, 32)
}
function safeParse(raw: string | null) {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}
