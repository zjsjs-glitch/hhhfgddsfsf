import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET /api/explore - return recent public profiles (with username/displayName set)
export async function GET() {
  const profiles = await db.profile.findMany({
    where: {
      // Only include profiles that have at least a username or displayName
      OR: [{ username: { not: null } }, { displayName: { not: null } }],
    },
    select: {
      slug: true,
      username: true,
      displayName: true,
      avatarUrl: true,
      location: true,
      views: true,
      updatedAt: true,
    },
    orderBy: { updatedAt: 'desc' },
    take: 24,
  })
  return NextResponse.json({ profiles })
}
