'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Check, X, ArrowLeft } from 'lucide-react'

type Props = {
  siteUrl: string
  userEmail: string | null
  onComplete: (slug: string) => void
  onBack: () => void
}

export function SlugSetup({ siteUrl, userEmail, onComplete, onBack }: Props) {
  const [slug, setSlug] = useState('')
  const [checking, setChecking] = useState(false)
  const [status, setStatus] = useState<'idle' | 'available' | 'taken' | 'invalid'>('idle')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function sanitize(v: string) {
    return v
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9_-]/g, '')
      .slice(0, 32)
  }

  async function handleChange(v: string) {
    const clean = sanitize(v)
    setSlug(clean)
    setStatus('idle')
    setError(null)
    if (clean.length < 2) return
    setChecking(true)
    try {
      const res = await fetch('/api/check-slug', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: clean }),
      })
      const data = await res.json()
      if (data.available) setStatus('available')
      else setStatus('taken')
    } catch {
      /* ignore */
    } finally {
      setChecking(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const clean = sanitize(slug)
    if (clean.length < 2 || clean.length > 32) {
      setStatus('invalid')
      return
    }
    setSubmitting(true)
    try {
      // Save profile with just slug (other fields default)
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: clean,
          username: null,
          videoUrl: null,
          posterUrl: null,
          avatarUrl: null,
          displayName: null,
          location: null,
          statusText: null,
          statusEmoji: null,
          bio: null,
          particles: true,
          showViews: true,
          socials: [],
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.error === 'slug_taken') {
          setStatus('taken')
        } else {
          setError('حدث خطأ، حاول مرة أخرى')
        }
        setSubmitting(false)
        return
      }
      onComplete(clean)
    } catch {
      setError('فشل الاتصال بالخادم')
      setSubmitting(false)
    }
  }

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-black text-white">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/40 via-black to-violet-950/30" />
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 25% 25%, rgba(139,92,246,0.5) 0, transparent 40%), radial-gradient(circle at 75% 75%, rgba(99,102,241,0.5) 0, transparent 40%)',
        }}
      />

      <section className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <button
            type="button"
            onClick={onBack}
            className="mb-6 flex items-center gap-1 text-xs text-zinc-400 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            تسجيل الخروج
          </button>

          <div className="mb-6 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-2xl backdrop-blur-md mx-auto">
              ✦
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              اختر رابطك
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              {userEmail ? `مرحباً ${userEmail.split('@')[0]}! ` : ''}
              هذا سيكون رابط صفحتك العامة.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-white/10 bg-zinc-950/60 p-6 backdrop-blur-md"
          >
            <div className="space-y-2">
              <Label htmlFor="slug" className="text-xs text-zinc-300">
                رابط صفحتك
              </Label>
              <div
                className="flex items-stretch rounded-xl border border-zinc-700 bg-zinc-900 overflow-hidden focus-within:border-violet-500 transition"
                dir="ltr"
              >
                <span className="flex items-center px-3 text-sm text-zinc-400 select-none whitespace-nowrap">
                  {siteUrl}/
                </span>
                <input
                  id="slug"
                  type="text"
                  value={slug}
                  onChange={(e) => handleChange(e.target.value)}
                  placeholder="username"
                  autoComplete="off"
                  spellCheck={false}
                  className="flex-1 bg-transparent py-2.5 pr-3 text-sm text-white placeholder:text-zinc-500 outline-none"
                  dir="ltr"
                />
                <div className="flex w-12 items-center justify-center">
                  {checking && <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />}
                  {!checking && status === 'available' && (
                    <Check className="h-4 w-4 text-emerald-400" />
                  )}
                  {!checking && status === 'taken' && (
                    <X className="h-4 w-4 text-red-400" />
                  )}
                </div>
              </div>
              <p className="text-[11px] text-zinc-500">
                حروف إنجليزية، أرقام، _ أو - فقط (2 إلى 32 حرف).
              </p>
              {status === 'taken' && (
                <p className="text-xs text-red-400">
                  هذا الرابط محجوز. جرب رابطاً آخر.
                </p>
              )}
              {status === 'invalid' && (
                <p className="text-xs text-red-400">
                  الرابط غير صالح.
                </p>
              )}
              {error && <p className="text-xs text-red-400">{error}</p>}
            </div>

            <Button
              type="submit"
              disabled={submitting || status !== 'available'}
              className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-violet-600 text-white hover:bg-violet-500 disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              إنشاء الصفحة
            </Button>
          </form>

          <p className="mt-4 text-center text-[11px] text-zinc-500">
            يمكنك تغيير الرابط لاحقاً من لوحة التحكم.
          </p>
        </div>
      </section>
    </main>
  )
}
