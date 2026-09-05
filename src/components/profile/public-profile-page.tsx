'use client'

import { useEffect, useRef, useState } from 'react'
import { Volume2, VolumeX, MapPin, Eye, AlertTriangle, ArrowLeft } from 'lucide-react'
import type { ProfileData } from '@/lib/profile-types'
import { getSocialMeta } from '@/lib/social-icons'
import { Particles } from '@/components/profile/particles'

type Props = {
  slug: string
  siteUrl: string
  onBack: () => void
}

export function PublicProfilePage({ slug, siteUrl, onBack }: Props) {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'not_found' | 'error'>('loading')
  const [muted, setMuted] = useState(true)
  const [videoError, setVideoError] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    let cancelled = false
    const doFetch = async () => {
      try {
        const r = await fetch(`/api/profile/${encodeURIComponent(slug)}`)
        if (!r.ok) {
          if (r.status === 404) {
            if (!cancelled) setStatus('not_found')
            return
          }
          throw new Error('fetch_failed')
        }
        const data = await r.json()
        if (cancelled) return
        setProfile(data.profile)
        setStatus('ready')
      } catch {
        if (!cancelled) setStatus('error')
      }
    }
    doFetch()
    return () => {
      cancelled = true
    }
  }, [slug])

  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = muted
  }, [muted])

  useEffect(() => {
    if (!profile?.videoUrl) return
    const v = videoRef.current
    if (!v) return
    v.load()
    const tryPlay = async () => {
      try {
        await v.play()
      } catch {
        /* ignore */
      }
    }
    tryPlay()
  }, [profile?.videoUrl])

  if (status === 'loading') {
    return (
      <Centered>
        <div className="flex flex-col items-center gap-3 text-white">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
          <p className="text-sm text-zinc-300">جارٍ التحميل...</p>
        </div>
      </Centered>
    )
  }

  if (status === 'not_found') {
    return (
      <Centered>
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-950/60 p-8 text-center backdrop-blur-md">
          <AlertTriangle className="mx-auto mb-3 h-10 w-10 text-amber-400" />
          <h1 className="text-xl font-bold text-white">الصفحة غير موجودة</h1>
          <p className="mt-2 text-sm text-zinc-400" dir="ltr">
            {siteUrl}/{slug}
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            ربما تم حذف الصفحة أو تغيير اسمها.
          </p>
          <button
            onClick={onBack}
            className="mt-5 inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            العودة للرئيسية
          </button>
        </div>
      </Centered>
    )
  }

  if (status === 'error' || !profile) {
    return (
      <Centered>
        <div className="w-full max-w-md rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center backdrop-blur-md">
          <AlertTriangle className="mx-auto mb-3 h-10 w-10 text-red-400" />
          <h1 className="text-xl font-bold text-white">حدث خطأ</h1>
          <p className="mt-2 text-sm text-zinc-400">
            تعذّر تحميل الصفحة. حاول مرة أخرى لاحقاً.
          </p>
        </div>
      </Centered>
    )
  }

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-black text-white">
      {/* Video background */}
      <div className="absolute inset-0 h-full w-full">
        {profile.videoUrl ? (
          <video
            ref={videoRef}
            key={profile.videoUrl}
            className="h-full w-full object-cover"
            autoPlay
            loop
            muted={muted}
            playsInline
            poster={profile.posterUrl ?? undefined}
            onError={() => setVideoError(true)}
            aria-hidden="true"
            tabIndex={-1}
          >
            <source src={profile.videoUrl} type="video/mp4" />
          </video>
        ) : (
          <div
            className="h-full w-full bg-cover bg-center"
            style={{
              backgroundImage: profile.posterUrl
                ? `url(${profile.posterUrl})`
                : 'linear-gradient(135deg,#1a1a1a,#000)',
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/80" />
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {profile.particles && <Particles count={70} color="255,255,255" />}

      {/* Mute button */}
      <button
        type="button"
        onClick={() => setMuted((m) => !m)}
        className="absolute left-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-white backdrop-blur-md transition hover:bg-white/15"
        aria-label={muted ? 'تشغيل الصوت' : 'كتم الصوت'}
      >
        {muted ? <VolumeX className="h-4.5 w-4.5" /> : <Volume2 className="h-4.5 w-4.5" />}
      </button>

      <section className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-20 text-center">
        <h1
          className="text-3xl font-bold tracking-tight text-white drop-shadow-lg sm:text-4xl md:text-5xl"
          dir="auto"
        >
          {profile.username || 'username'}
        </h1>

        {profile.location && (
          <p
            className="mt-2 flex items-center gap-1 text-sm text-white/80 sm:text-base"
            dir="auto"
          >
            <MapPin className="h-3.5 w-3.5" />
            <span>{profile.location}</span>
          </p>
        )}

        <div className="mt-8 w-full max-w-sm rounded-2xl border border-white/10 bg-black/50 p-5 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <div
                className="h-16 w-16 overflow-hidden rounded-full ring-2 ring-white/20"
                style={{
                  backgroundImage: profile.avatarUrl
                    ? `url(${profile.avatarUrl})`
                    : undefined,
                  backgroundColor: '#18181b',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
                aria-hidden="true"
              />
              <span className="absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full border-2 border-black bg-emerald-500" />
            </div>
            <div className="min-w-0 flex-1 text-left">
              <p
                className="truncate text-lg font-semibold text-white"
                dir="auto"
              >
                {profile.displayName || 'display name'}
              </p>
              {profile.statusText && (
                <p
                  className="mt-0.5 flex items-center gap-1 text-sm text-white/80"
                  dir="auto"
                >
                  <span aria-hidden="true">❤️</span>
                  <span className="truncate">{profile.statusText}</span>
                  {profile.statusEmoji && (
                    <span className="ml-1" aria-hidden="true">
                      {profile.statusEmoji}
                    </span>
                  )}
                </p>
              )}
              <p
                className="mt-0.5 flex items-center gap-1 text-xs text-white/70"
                dir="auto"
              >
                <span className="font-medium">only ME</span>
                <span aria-hidden="true">🔒</span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1" />

        {profile.socials.length > 0 && (
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            {profile.socials.map((s) => {
              const meta = getSocialMeta(s.platform)
              const Icon = meta.Icon
              if (!s.url) return null
              return (
                <a
                  key={s.id}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-white backdrop-blur-md transition hover:scale-105 hover:bg-white/15"
                  aria-label={meta.label}
                  title={meta.label}
                >
                  <Icon className="h-5 w-5" />
                </a>
              )
            })}
          </div>
        )}

        {profile.showViews && (
          <div className="mt-6 flex items-center gap-1.5 text-xs text-white/60">
            <Eye className="h-3.5 w-3.5" />
            <span dir="ltr">{profile.views}</span>
            <span>زيارة</span>
          </div>
        )}
      </section>

      {videoError && profile.videoUrl && (
        <div className="pointer-events-none absolute inset-x-0 bottom-4 z-30 flex justify-center px-6">
          <div className="pointer-events-auto rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs text-amber-200 backdrop-blur-md">
            تعذّر تشغيل الفيديو — تأكد من أن الرابط مباشر بصيغة mp4.
          </div>
        </div>
      )}

      {/* Brand footer */}
      <a
        href={`https://${siteUrl}/`}
        onClick={(e) => {
          e.preventDefault()
          onBack()
        }}
        className="absolute bottom-4 right-4 z-20 flex items-center gap-1 text-[11px] text-white/40 hover:text-white/70"
        dir="ltr"
      >
        <span>made with</span>
        <span className="font-semibold">✦ {siteUrl}</span>
      </a>
    </main>
  )
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-6">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/40 via-black to-violet-950/30" />
      <div className="relative z-10 w-full max-w-md">{children}</div>
    </main>
  )
}
