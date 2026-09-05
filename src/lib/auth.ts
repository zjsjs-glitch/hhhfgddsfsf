import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import DiscordProvider from 'next-auth/providers/discord'
import GoogleProvider from 'next-auth/providers/google'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'

// Custom minimal adapter for NextAuth v4 + our Prisma schema
const prismaAdapter = {
  createUser: async (data: any) => {
    return await db.user.create({
      data: {
        email: data.email,
        name: data.name,
        image: data.image,
        emailVerified: data.emailVerified ?? null,
      },
    })
  },
  getUser: async (id: string) => {
    return (await db.user.findUnique({ where: { id } })) as any
  },
  getUserByEmail: async (email: string) => {
    return (await db.user.findUnique({ where: { email } })) as any
  },
  getUserByAccount: async ({
    provider,
    providerAccountId,
  }: {
    provider: string
    providerAccountId: string
  }) => {
    const account = await db.account.findUnique({
      where: {
        provider_providerAccountId: { provider, providerAccountId },
      },
      include: { user: true },
    })
    return (account as any)?.user ?? null
  },
  updateUser: async (data: any) => {
    return (await db.user.update({
      where: { id: data.id },
      data: {
        name: data.name,
        email: data.email,
        image: data.image,
        emailVerified: data.emailVerified ?? null,
      },
    })) as any
  },
  deleteUser: async (id: string) => {
    await db.user.delete({ where: { id } })
    return null as any
  },
  linkAccount: async (data: any) => {
    await db.account.create({
      data: {
        userId: data.userId,
        type: data.type,
        provider: data.provider,
        providerAccountId: data.providerAccountId,
        refresh_token: data.refresh_token ?? null,
        access_token: data.access_token ?? null,
        expires_at: data.expires_at ?? null,
        token_type: data.token_type ?? null,
        scope: data.scope ?? null,
        id_token: data.id_token ?? null,
        session_state: data.session_state ?? null,
      },
    })
    return null as any
  },
  unlinkAccount: async ({
    provider,
    providerAccountId,
  }: {
    provider: string
    providerAccountId: string
  }) => {
    await db.account.delete({
      where: {
        provider_providerAccountId: { provider, providerAccountId },
      },
    })
    return null as any
  },
  createSession: async (data: any) => {
    return (await db.session.create({
      data: {
        sessionToken: data.sessionToken,
        userId: data.userId,
        expires: data.expires,
      },
    })) as any
  },
  getSession: async (sessionToken: string) => {
    const session = await db.session.findUnique({
      where: { sessionToken },
    })
    if (!session) return null
    if (session.expires < new Date()) {
      await db.session.delete({ where: { id: session.id } })
      return null
    }
    return session as any
  },
  updateSession: async (data: any) => {
    return (await db.session.update({
      where: { sessionToken: data.sessionToken },
      data: { expires: data.expires },
    })) as any
  },
  deleteSession: async (sessionToken: string) => {
    await db.session.delete({ where: { sessionToken } })
    return null as any
  },
  createVerificationToken: async (data: any) => {
    return (await db.verificationToken.create({
      data: {
        identifier: data.identifier,
        token: data.token,
        expires: data.expires,
      },
    })) as any
  },
  useVerificationToken: async ({
    identifier,
    token,
  }: {
    identifier: string
    token: string
  }) => {
    const vt = await db.verificationToken.findUnique({
      where: { identifier_token: { identifier, token } },
    })
    if (!vt) return null
    await db.verificationToken.delete({
      where: { identifier_token: { identifier, token } },
    })
    return vt as any
  },
}

export const authOptions: NextAuthOptions = {
  // @ts-expect-error - custom adapter matches NextAuth's adapter contract
  adapter: prismaAdapter,
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/?view=signin',
  },
  providers: [
    // Primary provider: email/username + password
    CredentialsProvider({
      id: 'credentials',
      name: 'bluemace',
      credentials: {
        identifier: {
          label: 'Email or Username',
          type: 'text',
          placeholder: 'you@example.com or yourname',
        },
        password: {
          label: 'Password',
          type: 'password',
        },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) return null
        const identifier = credentials.identifier.trim().toLowerCase()
        // Find user by email or username
        const user = await db.user.findFirst({
          where: {
            OR: [{ email: identifier }, { username: identifier }],
          },
        })
        if (!user || !user.password) return null
        const ok = await bcrypt.compare(credentials.password, user.password)
        if (!ok) return null
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        }
      },
    }),
    // Conditionally included Discord provider
    ...(process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET
      ? [
          DiscordProvider({
            clientId: process.env.DISCORD_CLIENT_ID,
            clientSecret: process.env.DISCORD_CLIENT_SECRET,
          }),
        ]
      : []),
    // Conditionally included Google provider
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
  ],
  callbacks: {
    async session({ session, token, user }) {
      if (session.user) {
        // @ts-expect-error - augment user with id
        session.user.id = token.sub ?? (user as any)?.id
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id
      }
      return token
    },
  },
}

export default authOptions
