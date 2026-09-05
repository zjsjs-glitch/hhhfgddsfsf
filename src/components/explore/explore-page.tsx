'use client'

import { useEffect, useState } from 'react'
import { Eye, MapPin, Loader2, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

type ExploreItem = {
  slug: string
  username: string | null
  displayName: string | null
  avatarUrl: string | null
  location: string | null
  views: number
  updatedAt: string
}

type Props = {
  siteUrl: string
  onOpenProfile: (slug: string) => void
}

export function ExplorePage({ siteUrl, onOpenProfile }: Props) {
  const [items, setItems] = useState<ExploreItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    let cancelled = false
    const doFetch = async () => {
      try {
        const r = await fetch('/api/explore')
        const data = await r.json()
        if (!cancelled) setItems(data.profiles ?? [])
      } catch {
        /* ignore */
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    doFetch()
    return () => {
      cancelled = true
    }
  }, [])

  const filtered = items.filter((it) => {
    const q = search.trim().toLowerCase()
    if (!q) return true
    return (
      it.slug.toLowerCase().includes(q) ||
      (it.username ?? '').toLowerCase().includes(q) ||
      (it.displayName ?? '').toLowerCase().includes(q)
    )
  })

  return (
    <main className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-black/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenProfile('')}
              className="text-zinc-400 hover:text-white"
              aria-label="العودة للرئيسية"
            >
              ✦
            </button>
            <span className="text-sm font-semibold">
              bluemace<span className="text-violet-400">.xyz</span>
            </span>
            <span className="ml-2 hidden text-xs text-zinc-500 sm:inline">
              / استكشاف
            </span>
          </div>
          <span className="text-xs text-zinc-500" dir="ltr">
            {filtered.length} صفحة
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            استكشف صفحات الأعضاء
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            شوف آخر الصفحات اللي أنشأها المستخدمون على {siteUrl}
          </p>
        </div>

        <div className="relative mb-8 max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث باسم المستخدم..."
            className="h-11 border-zinc-700 bg-zinc-900 pl-10 text-sm text-white placeholder:text-zinc-500"
            dir="ltr"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-12 text-center">
            <p className="text-sm text-zinc-400">
              {search
                ? 'لا توجد نتائج مطابقة'
                : 'لا توجد صفحات بعد. كن أول من ينشئ صفحة!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {filtered.map((it) => (
              <ProfileCard
                key={it.slug}
                item={it}
                siteUrl={siteUrl}
                onClick={() => onOpenProfile(it.slug)}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

function ProfileCard({
  item,
  siteUrl,
  onClick,
}: {
  item: ExploreItem
  siteUrl: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/60 text-left backdrop-blur-md transition hover:scale-[1.02] hover:border-violet-500/30"
    >
      <div className="flex h-24 items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
        <div
          className="h-16 w-16 overflow-hidden rounded-full ring-2 ring-white/20"
          style={{
            backgroundImage: item.avatarUrl ? `url(${item.avatarUrl})` : undefined,
            backgroundColor: '#27272a',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {!item.avatarUrl && (
            <div className="flex h-full w-full items-center justify-center text-xl font-bold text-zinc-400">
              {(item.username ?? item.slug ?? '?').charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 p-3">
        <p className="truncate text-sm font-semibold text-white" dir="auto">
          {item.username ?? item.slug}
        </p>
        {item.displayName && item.displayName !== item.username && (
          <p className="truncate text-xs text-zinc-400" dir="auto">
            {item.displayName}
          </p>
        )}
        {item.location && (
          <p
            className="mt-1 flex items-center gap-0.5 text-[11px] text-zinc-500"
            dir="auto"
          >
            <MapPin className="h-3 w-3" />
            <span className="truncate">{item.location}</span>
          </p>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-white/5 px-3 py-2 text-[11px] text-zinc-500">
        <span dir="ltr" className="truncate">
          {siteUrl}/{item.slug}
        </span>
        <span className="flex items-center gap-1">
          <Eye className="h-3 w-3" />
          {item.views}
        </span>
      </div>
    </button>
  )
}

export type { ExploreItem }
