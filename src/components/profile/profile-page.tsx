'use client'

import { useEffect, useRef, useState } from 'react'
import { Volume2, VolumeX, Settings, MapPin, Eye } from 'lucide-react'
import {
  type ProfileData,
  useProfile,
  useViews,
  incrementViews,
  saveProfile,
} from '@/lib/profile-storage'
import { getSocialMeta } from '@/lib/social-icons'
import { Particles } from './particles'
import { SettingsPanel } from './settings-panel'

export function ProfilePage() {
  const profile = useProfile()
  const views = useViews()
  const [muted, setMuted] = useState(true)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [settingsKey, setSettingsKey] = useState(0)
  const [videoError, setVideoError] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Increment views once on mount
  useEffect(() => {
    incrementViews()
  }, [])

  // Sync mute state to video element
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = muted
    }
  }, [muted])

  // Try to play the video once it's mounted / URL changes
  useEffect(() => {
    if (!profile.videoUrl) return
    const v = videoRef.current
    if (!v) return
    v.load()
    const tryPlay = async () => {
      try {
        await v.play()
      } catch {
        // Autoplay may fail silently if not muted; muted should succeed
      }
    }
    tryPlay()
  }, [profile.videoUrl])

  function openSettings() {
    setSettingsKey((k) => k + 1)
    setSettingsOpen(true)
  }

  function handleSave(next: ProfileData) {
    saveProfile(next)
    setSettingsOpen(false)
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
            poster={profile.posterUrl || undefined}
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
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/80" />
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Particles */}
      {profile.particles && <Particles count={70} color="255,255,255" />}

      {/* Top bar */}
      <header className="absolute inset-x-0 top-0 z-20 flex items-start justify-between p-4 sm:p-6">
        <button
          type="button"
          onClick={() => setMuted((m) => !m)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-white backdrop-blur-md transition hover:bg-white/15"
          aria-label={muted ? 'تشغيل الصوت' : 'كتم الصوت'}
        >
          {muted ? (
            <VolumeX className="h-4.5 w-4.5" />
          ) : (
            <Volume2 className="h-4.5 w-4.5" />
          )}
        </button>

        <button
          type="button"
          onClick={openSettings}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-white backdrop-blur-md transition hover:bg-white/15"
          aria-label="تخصيص الصفحة"
        >
          <Settings className="h-4.5 w-4.5" />
        </button>
      </header>

      {/* Center content */}
      <section className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-20 text-center">
        {/* Username */}
        <h1
          className="text-3xl font-bold tracking-tight text-white drop-shadow-lg sm:text-4xl md:text-5xl"
          dir="auto"
        >
          {profile.username || 'username'}
        </h1>

        {/* Location */}
        {profile.location && (
          <p
            className="mt-2 flex items-center gap-1 text-sm text-white/80 sm:text-base"
            dir="auto"
          >
            <MapPin className="h-3.5 w-3.5" />
            <span>{profile.location}</span>
          </p>
        )}

        {/* Profile card */}
        <div className="mt-8 w-full max-w-sm rounded-2xl border border-white/10 bg-black/50 p-5 backdrop-blur-md">
          <div className="flex items-center gap-4">
            {/* Avatar */}
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
              {/* Online dot */}
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

        {/* Spacer */}
        <div className="flex-1" />

        {/* Social links */}
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

        {/* Views counter */}
        {profile.showViews && (
          <div className="mt-6 flex items-center gap-1.5 text-xs text-white/60">
            <Eye className="h-3.5 w-3.5" />
            <span dir="ltr">{views}</span>
            <span>زيارة</span>
          </div>
        )}
      </section>

      {/* Video error toast (inline, subtle) */}
      {videoError && profile.videoUrl && (
        <div className="pointer-events-none absolute inset-x-0 bottom-4 z-30 flex justify-center px-6">
          <div className="pointer-events-auto rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs text-amber-200 backdrop-blur-md">
            تعذّر تشغيل الفيديو. تأكد من أن الرابط مباشر بصيغة mp4، أو افتح الإعدادات لتعديله.
          </div>
        </div>
      )}

      <SettingsPanel
        key={settingsKey}
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        profile={profile}
        onSave={handleSave}
      />
    </main>
  )
}
