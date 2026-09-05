'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
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
import { Trash2, Plus, RotateCcw } from 'lucide-react'
import {
  type ProfileData,
  type SocialLink,
  defaultProfile,
  resetProfile,
  useViews,
  resetViews,
} from '@/lib/profile-storage'
import { AVAILABLE_PLATFORMS, getSocialMeta } from '@/lib/social-icons'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  profile: ProfileData
  onSave: (next: ProfileData) => void
}

export function SettingsPanel({ open, onOpenChange, profile, onSave }: Props) {
  const [draft, setDraft] = useState<ProfileData>(profile)
  const views = useViews()

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

  function handleSave() {
    onSave(draft)
    onOpenChange(false)
  }

  function handleReset() {
    resetProfile()
    setDraft(defaultProfile)
    onSave(defaultProfile)
    onOpenChange(false)
  }

  function handleResetViews() {
    resetViews()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-hidden border-zinc-800/80 bg-zinc-950/95 p-0 text-zinc-100 sm:max-w-[560px] backdrop-blur-xl">
        <DialogHeader className="border-b border-zinc-800/80 px-6 pt-6 pb-4">
          <DialogTitle className="text-lg font-semibold tracking-tight text-white">
            تخصيص الصفحة
          </DialogTitle>
          <DialogDescription className="text-sm text-zinc-400">
            عدّل المعلومات والخلفية والإعدادات، وستُحفظ تلقائياً في متصفحك.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] px-6">
          <div className="space-y-6 py-6">
            {/* Video background */}
            <section className="space-y-3">
              <h3 className="text-sm font-medium text-zinc-300">
                الخلفية
              </h3>
              <div className="space-y-2">
                <Label htmlFor="videoUrl" className="text-xs text-zinc-400">
                  رابط الفيديو (mp4 مباشر)
                </Label>
                <Input
                  id="videoUrl"
                  value={draft.videoUrl}
                  onChange={(e) => update('videoUrl', e.target.value)}
                  placeholder="https://example.com/video.mp4"
                  className="border-zinc-700 bg-zinc-900 text-sm text-white placeholder:text-zinc-500"
                />
                <p className="text-[11px] text-zinc-500">
                  يجب أن يكون رابطاً مباشراً لملف فيديو بصيغة mp4 أو webm.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="posterUrl" className="text-xs text-zinc-400">
                  رابط صورة الغلاف (يظهر قبل تشغيل الفيديو)
                </Label>
                <Input
                  id="posterUrl"
                  value={draft.posterUrl}
                  onChange={(e) => update('posterUrl', e.target.value)}
                  placeholder="https://example.com/poster.jpg"
                  className="border-zinc-700 bg-zinc-900 text-sm text-white placeholder:text-zinc-500"
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2">
                <div>
                  <Label htmlFor="particles" className="text-xs text-zinc-300">
                    تفعيل الجزيئات اللامعة
                  </Label>
                  <p className="text-[11px] text-zinc-500">
                    تأثير الثلج/اللمعان في الخلفية
                  </p>
                </div>
                <Switch
                  id="particles"
                  checked={draft.particles}
                  onCheckedChange={(v) => update('particles', v)}
                />
              </div>
            </section>

            <Separator className="bg-zinc-800" />

            {/* Profile */}
            <section className="space-y-3">
              <h3 className="text-sm font-medium text-zinc-300">
                الملف الشخصي
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-xs text-zinc-400">
                    اسم المستخدم
                  </Label>
                  <Input
                    id="username"
                    value={draft.username}
                    onChange={(e) => update('username', e.target.value)}
                    placeholder="only_7mz"
                    className="border-zinc-700 bg-zinc-900 text-sm text-white placeholder:text-zinc-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-xs text-zinc-400">
                    الموقع
                  </Label>
                  <Input
                    id="location"
                    value={draft.location}
                    onChange={(e) => update('location', e.target.value)}
                    placeholder="germany"
                    className="border-zinc-700 bg-zinc-900 text-sm text-white placeholder:text-zinc-500"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="avatarUrl" className="text-xs text-zinc-400">
                  رابط صورة الأفاتار
                </Label>
                <Input
                  id="avatarUrl"
                  value={draft.avatarUrl}
                  onChange={(e) => update('avatarUrl', e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="border-zinc-700 bg-zinc-900 text-sm text-white placeholder:text-zinc-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="displayName" className="text-xs text-zinc-400">
                    الاسم في البطاقة
                  </Label>
                  <Input
                    id="displayName"
                    value={draft.displayName}
                    onChange={(e) => update('displayName', e.target.value)}
                    placeholder="8n44"
                    className="border-zinc-700 bg-zinc-900 text-sm text-white placeholder:text-zinc-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="statusEmoji" className="text-xs text-zinc-400">
                    إيموجي الحالة
                  </Label>
                  <Input
                    id="statusEmoji"
                    value={draft.statusEmoji}
                    onChange={(e) => update('statusEmoji', e.target.value)}
                    placeholder="😈"
                    className="border-zinc-700 bg-zinc-900 text-sm text-white placeholder:text-zinc-500"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="statusText" className="text-xs text-zinc-400">
                  نص الحالة
                </Label>
                <Input
                  id="statusText"
                  value={draft.statusText}
                  onChange={(e) => update('statusText', e.target.value)}
                  placeholder="شَيْخُ الْمُحِبِّين"
                  className="border-zinc-700 bg-zinc-900 text-sm text-white placeholder:text-zinc-500"
                />
              </div>
            </section>

            <Separator className="bg-zinc-800" />

            {/* Socials */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-zinc-300">
                  روابط التواصل
                </h3>
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
              </div>
              <div className="space-y-2">
                {draft.socials.length === 0 && (
                  <p className="text-xs text-zinc-500">
                    لا توجد روابط. اضغط &quot;إضافة&quot; لإضافة رابط جديد.
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
                      />
                    </div>
                  )
                })}
              </div>
            </section>

            <Separator className="bg-zinc-800" />

            {/* Stats */}
            <section className="space-y-3">
              <h3 className="text-sm font-medium text-zinc-300">إحصائيات</h3>
              <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2">
                <div>
                  <Label htmlFor="showViews" className="text-xs text-zinc-300">
                    إظهار عدّاد الزيارات
                  </Label>
                  <p className="text-[11px] text-zinc-500">
                    يظهر عدد مرات فتح الصفحة في الأسفل
                  </p>
                </div>
                <Switch
                  id="showViews"
                  checked={draft.showViews}
                  onCheckedChange={(v) => update('showViews', v)}
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2">
                <div>
                  <p className="text-xs text-zinc-300">الزيارات الحالية</p>
                  <p className="text-[11px] text-zinc-500">
                    العدد الحالي المخزّن في المتصفح
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono text-white">{views}</span>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={handleResetViews}
                    className="h-8 gap-1 text-zinc-400 hover:bg-zinc-800 hover:text-red-400"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </section>
          </div>
        </ScrollArea>

        <div className="flex items-center justify-between gap-2 border-t border-zinc-800/80 bg-zinc-950/50 px-6 py-4">
          <Button
            type="button"
            variant="ghost"
            onClick={handleReset}
            className="gap-2 text-zinc-400 hover:bg-zinc-900 hover:text-red-400"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            استعادة الافتراضي
          </Button>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-zinc-300 hover:bg-zinc-900 hover:text-white"
            >
              إلغاء
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              className="bg-white text-zinc-900 hover:bg-zinc-200"
            >
              حفظ
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
