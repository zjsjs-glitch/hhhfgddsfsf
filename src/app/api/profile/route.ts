import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { Prisma } from '@prisma/client'

export const dynamic = 'force-dynamic'

// POST /api/profile - create or update current user's profile
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  const userId = (session.user as any).id as string
  const user = await db.user.findUnique({ where: { id: userId } })
  if (!user) {
    return NextResponse.json({ error: 'user_not_found' }, { status: 404 })
  }

  let body: any = {}
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 })
  }

  // Slug: required for create, optional for update
  const slug = sanitizeSlug(body.slug ?? '')
  if (!slug || slug.length < 2 || slug.length > 32) {
    return NextResponse.json({ error: 'invalid_slug' }, { status: 400 })
  }

  // Check slug availability (excluding self)
  const slugOwner = await db.profile.findUnique({ where: { slug } })
  if (slugOwner && slugOwner.userId !== userId) {
    return NextResponse.json({ error: 'slug_taken' }, { status: 409 })
  }

  const profileData = {
    slug,
    videoUrl: stringOrNull(body.videoUrl),
    posterUrl: stringOrNull(body.posterUrl),
    username: stringOrNull(body.username),
    location: stringOrNull(body.location),
    avatarUrl: stringOrNull(body.avatarUrl),
    displayName: stringOrNull(body.displayName),
    statusText: stringOrNull(body.statusText),
    statusEmoji: stringOrNull(body.statusEmoji),
    bio: stringOrNull(body.bio),
    particles: bool(body.particles, true),
    showViews: bool(body.showViews, true),
    socials: JSON.stringify(Array.isArray(body.socials) ? body.socials : []),
  }

  const existing = await db.profile.findUnique({ where: { userId } })
  let profile
  if (existing) {
    profile = await db.profile.update({
      where: { userId },
      data: profileData,
    })
  } else {
    try {
      profile = await db.profile.create({
        data: {
          userId,
          ...profileData,
        },
      })
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          return NextResponse.json({ error: 'slug_taken' }, { status: 409 })
        }
      }
      throw e
    }
  }

  return NextResponse.json({ ok: true, profile: { ...profile, socials: safeParse(profile.socials) } })
}

// GET /api/profile - get current user's profile
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  const userId = (session.user as any).id as string
  const profile = await db.profile.findUnique({ where: { userId } })
  if (!profile) return NextResponse.json({ profile: null })
  return NextResponse.json({
    profile: { ...profile, socials: safeParse(profile.socials) },
  })
}

function sanitizeSlug(s: string) {
  return s
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '')
    .slice(0, 32)
}
function stringOrNull(v: any): string | null {
  if (v === null || v === undefined) return null
  const s = String(v).trim()
  return s === '' ? null : s.slice(0, 2048)
}
function bool(v: any, def: boolean): boolean {
  if (v === true || v === false) return v
  return def
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
