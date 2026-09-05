'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { SessionProvider, signOut, useSession } from 'next-auth/react'
import type { SessionUser, MeResponse } from '@/lib/profile-types'
import { SignInPage } from '@/components/auth/sign-in-page'
import { SlugSetup } from '@/components/auth/slug-setup'
import { DashboardPage } from '@/components/dashboard/dashboard-page'
import { PublicProfilePage } from '@/components/profile/public-profile-page'
import { LandingPage } from '@/components/landing/landing-page'
import { ExplorePage } from '@/components/explore/explore-page'
import { Loader2 } from 'lucide-react'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'bluemace.xyz'

export function HomePage() {
  return (
    <SessionProvider>
      <HomeInner />
    </SessionProvider>
  )
}

type Render =
  | { kind: 'public-profile'; slug: string }
  | { kind: 'explore' }
  | { kind: 'loader' }
  | { kind: 'signin' }
  | { kind: 'landing' }
  | { kind: 'slug-setup' }
  | { kind: 'dashboard' }

function HomeInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { status } = useSession()

  const view = searchParams.get('view')
  const u = searchParams.get('u')

  const [me, setMe] = useState<MeResponse | null>(null)
  const [meLoading, setMeLoading] = useState(true)

  // Pending redirect target (use effect to actually trigger)
  const [pendingRedirect, setPendingRedirect] = useState<string | null>(null)

  // Fetch /api/me when authenticated
  useEffect(() => {
    if (status !== 'authenticated') return
    let cancelled = false
    setMeLoading(true)
    const doFetch = async () => {
      try {
        const r = await fetch('/api/me')
        const data: MeResponse = await r.json()
        if (!cancelled) setMe(data)
      } catch {
        if (!cancelled) setMe({ user: null, profile: null })
      } finally {
        if (!cancelled) setMeLoading(false)
      }
    }
    doFetch()
    return () => {
      cancelled = true
    }
  }, [status])

  // Reset me when session changes
  useEffect(() => {
    if (status === 'unauthenticated') {
      setMe(null)
      setMeLoading(false)
    } else if (status === 'loading') {
      setMeLoading(true)
    }
  }, [status])

  // Execute any pending redirect
  useEffect(() => {
    if (pendingRedirect) {
      router.replace(pendingRedirect)
      setPendingRedirect(null)
    }
  }, [pendingRedirect, router])

  // ---------- Decide what to render ----------

  // Public profile (highest priority - no auth required)
  if (u) {
    return (
      <PublicProfilePage
        slug={u}
        siteUrl={SITE_URL}
        onBack={() => setPendingRedirect('/')}
      />
    )
  }

  // Explore view (no auth required)
  if (view === 'explore') {
    return (
      <ExplorePage
        siteUrl={SITE_URL}
        onOpenProfile={(slug) => {
          if (slug) setPendingRedirect(`/?u=${encodeURIComponent(slug)}`)
          else setPendingRedirect('/')
        }}
      />
    )
  }

  // Loading state
  if (status === 'loading' || (status === 'authenticated' && meLoading)) {
    return <FullScreenLoader />
  }

  // Force sign-in view
  if (view === 'signin') {
    if (status === 'authenticated') {
      const target = me?.profile ? '/?view=dashboard' : '/?view=setup'
      if (me) setPendingRedirect(target)
      return <FullScreenLoader />
    }
    return (
      <SignInPage
        callbackUrl={me?.profile ? '/?view=dashboard' : '/?view=setup'}
      />
    )
  }

  // If not authenticated → show landing (with sign-in CTA + explore link)
  if (status === 'unauthenticated') {
    return (
      <LandingPage
        siteUrl={SITE_URL}
        onSignIn={() => setPendingRedirect('/?view=signin')}
        onExplore={() => setPendingRedirect('/?view=explore')}
      />
    )
  }

  // Authenticated: ensure we have me data
  if (!me) {
    return <FullScreenLoader />
  }

  // Setup view: user must not have a profile yet
  if (view === 'setup') {
    if (me.profile) {
      setPendingRedirect('/?view=dashboard')
      return <FullScreenLoader />
    }
    return (
      <SlugSetup
        siteUrl={SITE_URL}
        userEmail={me.user?.email ?? null}
        onComplete={(_slug) => {
          setPendingRedirect('/?view=dashboard')
        }}
        onBack={() => {
          signOut({ callbackUrl: '/' })
        }}
      />
    )
  }

  // Dashboard view
  if (view === 'dashboard') {
    if (!me.profile) {
      setPendingRedirect('/?view=setup')
      return <FullScreenLoader />
    }
    return (
      <DashboardPage
        user={me.user as SessionUser}
        profile={me.profile}
        siteUrl={SITE_URL}
        onSaved={(next) => {
          setMe({ user: me.user, profile: next })
        }}
        onSignOut={() => {
          signOut({ callbackUrl: '/' })
        }}
        onViewPublic={(slug) => {
          setPendingRedirect(`/?u=${encodeURIComponent(slug)}`)
        }}
        onExplore={() => {
          setPendingRedirect('/?view=explore')
        }}
      />
    )
  }

  // Default: redirect
  setPendingRedirect(me.profile ? '/?view=dashboard' : '/?view=setup')
  return <FullScreenLoader />
}

function FullScreenLoader() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-white/70" />
        <p className="text-sm text-zinc-400">جارٍ التحميل...</p>
      </div>
    </main>
  )
}
