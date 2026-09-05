'use client'

import { Volume2, VolumeX, MapPin, Eye } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { ProfileData } from '@/lib/profile-types'
import { getSocialMeta } from '@/lib/social-icons'
import { Particles } from '@/components/profile/particles'

type Props = {
  profile: ProfileData
  incrementViews?: boolean
}

export function ProfilePreview({ profile }: Props) {
  const [muted, setMuted] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = muted
  }, [muted])

  useEffect(() => {
    if (!profile.videoUrl) return
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
  }, [profile.videoUrl])

  return (
    <div className="relative h-full w-full overflow-hidden bg-black text-white">
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

      {profile.particles && <Particles count={50} color="255,255,255" />}

      {/* Mute button */}
      <button
        type="button"
        onClick={() => setMuted((m) => !m)}
        className="absolute left-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-white backdrop-blur-md transition hover:bg-white/15"
        aria-label={muted ? 'تشغيل الصوت' : 'كتم الصوت'}
      >
        {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
      </button>

      {/* Center content */}
      <section className="relative z-10 flex h-full flex-col items-center justify-center px-6 py-8 text-center">
        <h1
          className="text-2xl font-bold tracking-tight text-white drop-shadow-lg sm:text-3xl"
          dir="auto"
        >
          {profile.username || 'username'}
        </h1>

        {profile.location && (
          <p
            className="mt-1.5 flex items-center gap-1 text-xs text-white/80 sm:text-sm"
            dir="auto"
          >
            <MapPin className="h-3 w-3" />
            <span>{profile.location}</span>
          </p>
        )}

        {/* Profile card */}
        <div className="mt-6 w-full max-w-xs rounded-2xl border border-white/10 bg-black/50 p-4 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <div
                className="h-14 w-14 overflow-hidden rounded-full ring-2 ring-white/20"
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
              <span className="absolute bottom-0.5 right-0.5 h-3 w-3 rounded-full border-2 border-black bg-emerald-500" />
            </div>
            <div className="min-w-0 flex-1 text-left">
              <p className="truncate text-base font-semibold text-white" dir="auto">
                {profile.displayName || 'display name'}
              </p>
              {profile.statusText && (
                <p
                  className="mt-0.5 flex items-center gap-1 text-xs text-white/80"
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
                className="mt-0.5 flex items-center gap-1 text-[11px] text-white/70"
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
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
            {profile.socials.map((s) => {
              if (!s.url) return null
              const meta = getSocialMeta(s.platform)
              const Icon = meta.Icon
              return (
                <div
                  key={s.id}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-white backdrop-blur-md"
                  aria-label={meta.label}
                  title={meta.label}
                >
                  <Icon className="h-4.5 w-4.5" />
                </div>
              )
            })}
          </div>
        )}

        {profile.showViews && (
          <div className="mt-4 flex items-center gap-1.5 text-[11px] text-white/60">
            <Eye className="h-3 w-3" />
            <span dir="ltr">{profile.views}</span>
            <span>زيارة</span>
          </div>
        )}
      </section>
    </div>
  )
}
