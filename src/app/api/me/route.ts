import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET /api/me - return current user's session + profile
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ user: null, profile: null }, { status: 200 })
  }
  const userId = (session.user as any).id as string
  const profile = await db.profile.findUnique({
    where: { userId },
    select: {
      id: true,
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
  return NextResponse.json({
    user: {
      id: userId,
      email: session.user.email,
      name: session.user.name,
      image: session.user.image,
    },
    profile: profile
      ? {
          ...profile,
          socials: safeParseSocials(profile.socials),
        }
      : null,
  })
}

function safeParseSocials(raw: string | null | undefined) {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}
