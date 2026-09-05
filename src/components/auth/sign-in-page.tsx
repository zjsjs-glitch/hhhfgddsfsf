'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Loader2,
  Sparkles,
  Shield,
  Eye,
  AlertCircle,
  Lock,
  Mail,
  User,
} from 'lucide-react'
import { DiscordIcon, GoogleIcon } from './oauth-icons'

type Props = {
  callbackUrl?: string
}

type Mode = 'login' | 'register'
type ErrorKey =
  | 'invalid_email'
  | 'invalid_username'
  | 'weak_password'
  | 'email_taken'
  | 'username_taken'
  | 'auth_failed'
  | 'network'
  | null

const ERROR_MESSAGES: Record<NonNullable<ErrorKey>, string> = {
  invalid_email: 'بريد إلكتروني غير صالح',
  invalid_username:
    'اسم المستخدم: 3-20 حرف، حروف إنجليزية أو أرقام أو _ فقط',
  weak_password: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل',
  email_taken: 'هذا البريد مسجّل بالفعل',
  username_taken: 'اسم المستخدم محجوز، جرب اسماً آخر',
  auth_failed: 'بيانات الدخول غير صحيحة',
  network: 'فشل الاتصال بالخادم',
}

export function SignInPage({ callbackUrl = '/' }: Props) {
  const [mode, setMode] = useState<Mode>('register')
  const [identifier, setIdentifier] = useState('')
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState<null | 'local' | 'discord' | 'google'>(null)
  const [error, setError] = useState<ErrorKey>(null)

  const hasDiscord =
    process.env.NEXT_PUBLIC_HAS_DISCORD === 'true' &&
    process.env.NEXT_PUBLIC_DISCORD_ENABLED === 'true'
  const hasGoogle =
    process.env.NEXT_PUBLIC_HAS_GOOGLE === 'true' &&
    process.env.NEXT_PUBLIC_GOOGLE_ENABLED === 'true'

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!email.trim() || !username.trim() || !password.trim()) {
      setError('invalid_email')
      return
    }
    setLoading('local')
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'network')
        setLoading(null)
        return
      }
      // Sign in automatically
      const signRes = await signIn('credentials', {
        identifier: username,
        password,
        redirect: false,
        callbackUrl,
      })
      if (signRes?.error) {
        setError('auth_failed')
        setLoading(null)
      } else if (signRes?.ok && signRes.url) {
        window.location.href = signRes.url
      } else {
        setLoading(null)
      }
    } catch {
      setError('network')
      setLoading(null)
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!identifier.trim() || !password.trim()) {
      setError('auth_failed')
      return
    }
    setLoading('local')
    const res = await signIn('credentials', {
      identifier,
      password,
      redirect: false,
      callbackUrl,
    })
    if (res?.error) {
      setError('auth_failed')
      setLoading(null)
    } else if (res?.ok && res.url) {
      window.location.href = res.url
    } else {
      setLoading(null)
    }
  }

  async function handleOAuth(provider: 'discord' | 'google') {
    setError(null)
    setLoading(provider)
    await signIn(provider, { callbackUrl })
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
          {/* Logo / brand */}
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-2xl backdrop-blur-md">
              ✦
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              bluemace
              <span className="text-violet-400">.xyz</span>
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              صفحتك الشخصية. خلفية فيديو. روابطك في مكان واحد.
            </p>
          </div>

          {/* Sign-in card */}
          <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-6 backdrop-blur-md">
            {/* Tabs */}
            <div className="mb-5 grid grid-cols-2 gap-1 rounded-xl border border-white/10 bg-black/40 p-1">
              <button
                type="button"
                onClick={() => {
                  setMode('register')
                  setError(null)
                }}
                className={`flex h-9 items-center justify-center rounded-lg text-sm font-medium transition ${
                  mode === 'register'
                    ? 'bg-violet-600 text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                حساب جديد
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('login')
                  setError(null)
                }}
                className={`flex h-9 items-center justify-center rounded-lg text-sm font-medium transition ${
                  mode === 'login'
                    ? 'bg-violet-600 text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                تسجيل الدخول
              </button>
            </div>

            {/* OAuth providers (only show real ones) */}
            {(hasDiscord || hasGoogle) && (
              <>
                <div className="space-y-2.5">
                  {hasDiscord && (
                    <Button
                      type="button"
                      disabled={loading !== null}
                      onClick={() => handleOAuth('discord')}
                      className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#5865F2] text-white hover:bg-[#4752c4]"
                    >
                      {loading === 'discord' ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <DiscordIcon className="h-5 w-5" />
                      )}
                      <span className="text-sm font-medium">
                        {mode === 'register' ? 'التسجيل' : 'الدخول'} عبر Discord
                      </span>
                    </Button>
                  )}
                  {hasGoogle && (
                    <Button
                      type="button"
                      disabled={loading !== null}
                      onClick={() => handleOAuth('google')}
                      className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-white text-zinc-900 hover:bg-zinc-100"
                    >
                      {loading === 'google' ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <GoogleIcon className="h-5 w-5" />
                      )}
                      <span className="text-sm font-medium">
                        {mode === 'register' ? 'التسجيل' : 'الدخول'} عبر Google
                      </span>
                    </Button>
                  )}
                </div>

                <div className="my-5 flex items-center gap-3">
                  <div className="h-px flex-1 bg-white/10" />
                  <span className="text-[11px] uppercase tracking-wider text-zinc-500">
                    أو
                  </span>
                  <div className="h-px flex-1 bg-white/10" />
                </div>
              </>
            )}

            {/* Error message */}
            {error && (
              <div className="mb-3 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-200">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>{ERROR_MESSAGES[error]}</span>
              </div>
            )}

            {/* Forms */}
            {mode === 'register' ? (
              <form onSubmit={handleRegister} className="space-y-3">
                <Field
                  icon={<Mail className="h-3.5 w-3.5" />}
                  label="البريد الإلكتروني"
                >
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="h-10 border-zinc-700 bg-zinc-900 text-sm text-white placeholder:text-zinc-500"
                    autoComplete="email"
                    dir="ltr"
                  />
                </Field>
                <Field
                  icon={<User className="h-3.5 w-3.5" />}
                  label="اسم المستخدم"
                >
                  <Input
                    type="text"
                    value={username}
                    onChange={(e) =>
                      setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))
                    }
                    placeholder="yourname"
                    className="h-10 border-zinc-700 bg-zinc-900 text-sm text-white placeholder:text-zinc-500"
                    autoComplete="username"
                    dir="ltr"
                  />
                  <p className="mt-1 text-[11px] text-zinc-500">
                    3-20 حرف: إنجليزي، أرقام، أو _
                  </p>
                </Field>
                <Field
                  icon={<Lock className="h-3.5 w-3.5" />}
                  label="كلمة المرور"
                >
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="•••••••"
                      className="h-10 border-zinc-700 bg-zinc-900 pr-10 text-sm text-white placeholder:text-zinc-500"
                      autoComplete="new-password"
                      dir="ltr"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                      aria-label={showPassword ? 'إخفاء' : 'إظهار'}
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </Field>

                <Button
                  type="submit"
                  disabled={loading !== null}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-violet-600 text-sm font-medium text-white hover:bg-violet-500"
                >
                  {loading === 'local' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  إنشاء حساب
                </Button>
              </form>
            ) : (
              <form onSubmit={handleLogin} className="space-y-3">
                <Field
                  icon={<User className="h-3.5 w-3.5" />}
                  label="البريد الإلكتروني أو اسم المستخدم"
                >
                  <Input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="you@example.com أو yourname"
                    className="h-10 border-zinc-700 bg-zinc-900 text-sm text-white placeholder:text-zinc-500"
                    autoComplete="username"
                    dir="ltr"
                  />
                </Field>
                <Field
                  icon={<Lock className="h-3.5 w-3.5" />}
                  label="كلمة المرور"
                >
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="•••••••"
                      className="h-10 border-zinc-700 bg-zinc-900 pr-10 text-sm text-white placeholder:text-zinc-500"
                      autoComplete="current-password"
                      dir="ltr"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                      aria-label={showPassword ? 'إخفاء' : 'إظهار'}
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </Field>

                <Button
                  type="submit"
                  disabled={loading !== null}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-violet-600 text-sm font-medium text-white hover:bg-violet-500"
                >
                  {loading === 'local' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Lock className="h-4 w-4" />
                  )}
                  دخول
                </Button>
              </form>
            )}

            <p className="mt-4 text-[11px] leading-relaxed text-zinc-500">
              بإنشائك حساب، أنت توافق على شروط الخدمة وسياسة الخصوصية.
              بياناتك محمية بكلمة مرور مشفّرة (bcrypt) وتُحفظ على هذا الخادم فقط.
            </p>
          </div>

          {/* Features */}
          <div className="mt-6 grid grid-cols-3 gap-3 text-center">
            <Feature icon={<Sparkles className="h-4 w-4" />} label="خلفية فيديو" />
            <Feature icon={<Shield className="h-4 w-4" />} label="حساب آمن" />
            <Feature icon={<Eye className="h-4 w-4" />} label="عدّاد الزيارات" />
          </div>
        </div>
      </section>
    </main>
  )
}

function Field({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label className="flex items-center gap-1.5 text-xs text-zinc-300">
        <span className="text-violet-400">{icon}</span>
        {label}
      </Label>
      {children}
    </div>
  )
}

function Feature({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-md">
      <span className="text-violet-300">{icon}</span>
      <span className="text-[11px] text-zinc-300">{label}</span>
    </div>
  )
}
