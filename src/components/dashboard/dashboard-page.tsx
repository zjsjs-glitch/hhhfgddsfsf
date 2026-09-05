'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Trash2,
  Plus,
  Loader2,
  LogOut,
  ExternalLink,
  Eye,
  Copy,
  Check,
} from 'lucide-react'
import type { ProfileData, SocialLink, SessionUser } from '@/lib/profile-types'
import { AVAILABLE_PLATFORMS, getSocialMeta } from '@/lib/social-icons'
import { ProfilePreview } from './profile-preview'

type Props = {
  user: SessionUser
  profile: ProfileData
  siteUrl: string
  onSaved: (next: ProfileData) => void
  onSignOut: () => void
  onViewPublic: (slug: string) => void
  onExplore: () => void
}

export function DashboardPage({
  user,
  profile,
  siteUrl,
  onSaved,
  onSignOut,
  onViewPublic,
  onExplore,
}: Props) {
  const [draft, setDraft] = useState<ProfileData>(profile)
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Sync draft when profile prop changes (e.g. after external update)
  useEffect(() => {
    setDraft(profile)
  }, [profile])

  // Auto-save with debounce
  useEffect(() => {
    if (draft === profile) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      await save(draft)
    }, 800)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [draft, profile])

  async function save(next: ProfileData) {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(next),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.error === 'slug_taken') {
          setError('الرابط محجوز من مستخدم آخر')
        } else {
          setError('فشل الحفظ')
        }
        return
      }
      if (data.profile) {
        onSaved(data.profile)
        setSavedAt(Date.now())
      }
    } catch {
      setError('فشل الاتصال')
    } finally {
      setSaving(false)
    }
  }

  function update<K extends keyof ProfileData>(key: K, value: ProfileData[K]) {
    setDraft((d) => ({ ...d, [key]: value }))
  }

  function addSocial() {
    const platform = AVAILABLE_PLATFORMS[0]
    const newLink: SocialLink = {
      id: Math.random().toString(36).slice(2, 9),
      platform,
      url: '',
    }
    update('socials', [...draft.socials, newLink])
  }

  function updateSocial(id: string, key: keyof SocialLink, value: string) {
    update(
      'socials',
      draft.socials.map((s) => (s.id === id ? { ...s, [key]: value } : s)),
    )
  }

  function removeSocial(id: string) {
    update(
      'socials',
      draft.socials.filter((s) => s.id !== id),
    )
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(`${siteUrl}/${draft.slug}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* ignore */
    }
  }

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Top nav */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-black/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-lg">
              ✦
            </div>
            <span className="text-sm font-semibold">
              bluemace<span className="text-violet-400">.xyz</span>
            </span>
            <span className="ml-2 hidden text-xs text-zinc-500 sm:inline">
              / لوحة التحكم
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onViewPublic(draft.slug)}
              className="gap-1.5 text-xs text-zinc-300 hover:bg-white/5 hover:text-white"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">عرض الصفحة</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={onExplore}
              className="gap-1.5 text-xs text-zinc-300 hover:bg-white/5 hover:text-white"
            >
              <Eye className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">استكشف</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={onSignOut}
              className="gap-1.5 text-xs text-zinc-300 hover:bg-white/5 hover:text-red-400"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">خروج</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Left: editor */}
          <div className="space-y-6">
            {/* Profile URL card */}
            <Card>
              <CardHeader title="رابطك" subtitle="هذا الرابط سيراه الزوّار" />
              <div className="flex items-stretch gap-2" dir="ltr">
                <div className="flex flex-1 items-stretch overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900">
                  <span className="flex items-center px-3 text-xs text-zinc-400 select-none whitespace-nowrap">
                    {siteUrl}/
                  </span>
                  <input
                    type="text"
                    value={draft.slug}
                    onChange={(e) => update('slug', sanitize(e.target.value))}
                    placeholder="username"
                    className="flex-1 bg-transparent py-2.5 pr-3 text-sm text-white placeholder:text-zinc-500 outline-none"
                    dir="ltr"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={copyLink}
                  className="h-auto border-zinc-700 bg-zinc-900 px-3 text-zinc-200 hover:bg-zinc-800"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-zinc-500">
                  {saving
                    ? 'جارٍ الحفظ...'
                    : savedAt
                      ? 'تم الحفظ ✓'
                      : 'كل التغييرات تُحفظ تلقائياً'}
                </span>
                <a
                  href={`${siteUrl}/${draft.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-violet-300 hover:text-violet-200"
                  dir="ltr"
                >
                  {siteUrl}/{draft.slug}
                </a>
              </div>
              {error && (
                <p className="mt-2 text-xs text-red-400">{error}</p>
              )}
            </Card>

            {/* Background */}
            <Card>
              <CardHeader title="الخلفية" />
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-zinc-400">
                    رابط الفيديو (mp4 مباشر)
                  </Label>
                  <Input
                    value={draft.videoUrl ?? ''}
                    onChange={(e) => update('videoUrl', e.target.value || null)}
                    placeholder="https://example.com/video.mp4"
                    className="border-zinc-700 bg-zinc-900 text-sm text-white placeholder:text-zinc-500"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-zinc-400">
                    رابط صورة الغلاف
                  </Label>
                  <Input
                    value={draft.posterUrl ?? ''}
                    onChange={(e) => update('posterUrl', e.target.value || null)}
                    placeholder="https://example.com/poster.jpg"
                    className="border-zinc-700 bg-zinc-900 text-sm text-white placeholder:text-zinc-500"
                    dir="ltr"
                  />
                </div>
                <ToggleRow
                  checked={draft.particles}
                  onChange={(v) => update('particles', v)}
                  label="تفعيل الجزيئات اللامعة"
                  hint="تأثير الثلج/اللمعان في الخلفية"
                />
              </div>
            </Card>

            {/* Profile */}
            <Card>
              <CardHeader title="الملف الشخصي" />
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-zinc-400">اسم المستخدم</Label>
                    <Input
                      value={draft.username ?? ''}
                      onChange={(e) => update('username', e.target.value || null)}
                      placeholder="only_7mz"
                      className="border-zinc-700 bg-zinc-900 text-sm text-white placeholder:text-zinc-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-zinc-400">الموقع</Label>
                    <Input
                      value={draft.location ?? ''}
                      onChange={(e) => update('location', e.target.value || null)}
                      placeholder="germany"
                      className="border-zinc-700 bg-zinc-900 text-sm text-white placeholder:text-zinc-500"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-zinc-400">رابط الأفاتار</Label>
                  <Input
                    value={draft.avatarUrl ?? ''}
                    onChange={(e) => update('avatarUrl', e.target.value || null)}
                    placeholder="https://example.com/avatar.jpg"
                    className="border-zinc-700 bg-zinc-900 text-sm text-white placeholder:text-zinc-500"
                    dir="ltr"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-zinc-400">الاسم في البطاقة</Label>
                    <Input
                      value={draft.displayName ?? ''}
                      onChange={(e) => update('displayName', e.target.value || null)}
                      placeholder="8n44"
                      className="border-zinc-700 bg-zinc-900 text-sm text-white placeholder:text-zinc-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-zinc-400">إيموجي الحالة</Label>
                    <Input
                      value={draft.statusEmoji ?? ''}
                      onChange={(e) => update('statusEmoji', e.target.value || null)}
                      placeholder="😈"
                      className="border-zinc-700 bg-zinc-900 text-sm text-white placeholder:text-zinc-500"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-zinc-400">نص الحالة</Label>
                  <Input
                    value={draft.statusText ?? ''}
                    onChange={(e) => update('statusText', e.target.value || null)}
                    placeholder="شَيْخُ الْمُحِبِّين"
                    className="border-zinc-700 bg-zinc-900 text-sm text-white placeholder:text-zinc-500"
                    dir="auto"
                  />
                </div>
              </div>
            </Card>

            {/* Socials */}
            <Card>
              <CardHeader
                title="روابط التواصل"
                action={
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={addSocial}
                    className="h-8 gap-1 border-zinc-700 bg-zinc-900 text-xs text-zinc-100 hover:bg-zinc-800"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    إضافة
                  </Button>
                }
              />
              <div className="space-y-2">
                {draft.socials.length === 0 && (
                  <p className="text-xs text-zinc-500">
                    لا توجد روابط بعد. اضغط &quot;إضافة&quot;.
                  </p>
                )}
                {draft.socials.map((s) => {
                  const meta = getSocialMeta(s.platform)
                  return (
                    <div
                      key={s.id}
                      className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3"
                    >
                      <div className="flex items-center gap-2">
                        <Select
                          value={s.platform}
                          onValueChange={(v) => updateSocial(s.id, 'platform', v)}
                        >
                          <SelectTrigger className="h-8 w-[140px] border-zinc-700 bg-zinc-900 text-xs text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="border-zinc-700 bg-zinc-900 text-white">
                            {AVAILABLE_PLATFORMS.map((p) => {
                              const m = getSocialMeta(p)
                              return (
                                <SelectItem
                                  key={p}
                                  value={p}
                                  className="text-xs hover:bg-zinc-800"
                                >
                                  <span className="flex items-center gap-2">
                                    <m.Icon className="h-3.5 w-3.5" />
                                    {m.label}
                                  </span>
                                </SelectItem>
                              )
                            })}
                          </SelectContent>
                        </Select>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => removeSocial(s.id)}
                          className="ml-auto h-8 w-8 p-0 text-zinc-400 hover:bg-zinc-800 hover:text-red-400"
                          aria-label="حذف"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <Input
                        value={s.url}
                        onChange={(e) => updateSocial(s.id, 'url', e.target.value)}
                        placeholder={meta.placeholder}
                        className="mt-2 border-zinc-700 bg-zinc-900 text-xs text-white placeholder:text-zinc-500"
                        dir="ltr"
                      />
                    </div>
                  )
                })}
              </div>
            </Card>

            {/* Stats */}
            <Card>
              <CardHeader title="إحصائيات" />
              <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2">
                <div>
                  <Label className="text-xs text-zinc-300">
                    إظهار عدّاد الزيارات
                  </Label>
                  <p className="text-[11px] text-zinc-500">
                    يظهر عدد الزيارات في صفحتك
                  </p>
                </div>
                <Switch
                  checked={draft.showViews}
                  onCheckedChange={(v) => update('showViews', v)}
                />
              </div>
              <div className="mt-2 flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2">
                <div>
                  <p className="text-xs text-zinc-300">الزيارات</p>
                  <p className="text-[11px] text-zinc-500">إجمالي زيارات صفحتك</p>
                </div>
                <span className="flex items-center gap-1.5 text-sm font-mono text-white">
                  <Eye className="h-3.5 w-3.5 text-zinc-400" />
                  {profile.views}
                </span>
              </div>
            </Card>
          </div>

          {/* Right: preview */}
          <div className="lg:sticky lg:top-20 lg:h-fit">
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-950">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
                <span className="text-xs text-zinc-400">معاينة مباشرة</span>
                {saving && (
                  <span className="flex items-center gap-1 text-[11px] text-zinc-500">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    حفظ
                  </span>
                )}
              </div>
              <div className="aspect-[9/16] sm:aspect-[16/10]">
                <ProfilePreview profile={draft} />
              </div>
              <div className="border-t border-white/10 px-4 py-2 text-center text-[11px] text-zinc-500">
                هذه المعاينة مطابقة لما سيراه الزوّار
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-5 backdrop-blur-md">
      {children}
    </div>
  )
}

function CardHeader({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle?: string
  action?: React.ReactNode
}) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <div>
        <h3 className="text-sm font-medium text-zinc-100">{title}</h3>
        {subtitle && <p className="text-[11px] text-zinc-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

function ToggleRow({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  hint?: string
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2">
      <div>
        <Label className="text-xs text-zinc-300">{label}</Label>
        {hint && <p className="text-[11px] text-zinc-500">{hint}</p>}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  )
}

function sanitize(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '').slice(0, 32)
}
