import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// POST /api/auth/register - register new user with email + username + password
export async function POST(req: NextRequest) {
  let body: any = {}
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 })
  }

  const email = String(body.email ?? '').trim().toLowerCase()
  const username = String(body.username ?? '').trim().toLowerCase()
  const password = String(body.password ?? '')

  // Validate email
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'invalid_email' }, { status: 400 })
  }
  // Validate username
  if (!username || !/^[a-z0-9_]{3,20}$/.test(username)) {
    return NextResponse.json({ error: 'invalid_username' }, { status: 400 })
  }
  // Validate password (min 6 chars)
  if (!password || password.length < 6) {
    return NextResponse.json({ error: 'weak_password' }, { status: 400 })
  }

  // Check email uniqueness
  const existingEmail = await db.user.findUnique({ where: { email } })
  if (existingEmail) {
    return NextResponse.json({ error: 'email_taken' }, { status: 409 })
  }
  // Check username uniqueness
  const existingUsername = await db.user.findUnique({ where: { username } })
  if (existingUsername) {
    return NextResponse.json({ error: 'username_taken' }, { status: 409 })
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10)

  // Create user
  const user = await db.user.create({
    data: {
      email,
      username,
      password: passwordHash,
      name: username,
    },
    select: { id: true, email: true, username: true },
  })

  return NextResponse.json({ ok: true, user })
}
