'use client'

import { Button } from '@/components/ui/button'
import { Sparkles, Link2, Eye, Palette, ArrowLeft } from 'lucide-react'

type Props = {
  siteUrl: string
  onSignIn: () => void
  onExplore: () => void
}

export function LandingPage({ siteUrl, onSignIn, onExplore }: Props) {
  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-black text-white">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/40 via-black to-violet-950/30" />
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 25% 25%, rgba(139,92,246,0.5) 0, transparent 40%), radial-gradient(circle at 75% 75%, rgba(99,102,241,0.5) 0, transparent 40%)',
        }}
      />

      <section className="relative z-10 mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 py-16 text-center">
        {/* Logo */}
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/15 bg-white/5 text-3xl backdrop-blur-md">
          ✦
        </div>

        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          bluemace<span className="text-violet-400">.xyz</span>
        </h1>
        <p className="mt-4 max-w-xl text-base text-zinc-300 sm:text-lg">
          أنشئ صفحتك الشخصية في ثوانٍ. خلفية فيديو، روابطك في مكان واحد،
          وعدّاد زيارات. تماماً مثلما تريد.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <Button
            type="button"
            onClick={onSignIn}
            className="h-12 gap-2 rounded-xl bg-violet-600 px-8 text-base font-medium text-white hover:bg-violet-500"
          >
            ابدأ الآن
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            onClick={onExplore}
            variant="outline"
            className="h-12 gap-2 rounded-xl border-white/15 bg-white/5 px-6 text-base font-medium text-white hover:bg-white/10"
          >
            <Eye className="h-4 w-4" />
            استكشف الصفحات
          </Button>
        </div>
        <span className="mt-3 text-xs text-zinc-500" dir="ltr">
          مجاناً • بدون بطاقة ائتمان
        </span>

        {/* Features grid */}
        <div className="mt-16 grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
          <Feature
            icon={<Sparkles className="h-5 w-5" />}
            title="خلفية فيديو"
            desc="ضع رابط أي فيديو mp4 ليصبح خلفية لصفحتك."
          />
          <Feature
            icon={<Link2 className="h-5 w-5" />}
            title="روابطك في مكان واحد"
            desc="Instagram, Discord, TikTok, YouTube وأكثر من 11 منصة."
          />
          <Feature
            icon={<Eye className="h-5 w-5" />}
            title="عدّاد الزيارات"
            desc="تابع عدد من شاهد صفحتك لحظة بلحظة."
          />
          <Feature
            icon={<Palette className="h-5 w-5" />}
            title="تخصيص كامل"
            desc="اسمك، موقعك، أفاتارك، نص حالتك — كل شيء قابل للتعديل."
          />
        </div>

        {/* Sample URL preview */}
        <div
          className="mt-12 flex w-full max-w-md items-center justify-center gap-2 rounded-xl border border-white/10 bg-zinc-950/60 p-4 text-center backdrop-blur-md"
          dir="ltr"
        >
          <span className="text-sm text-zinc-400">{siteUrl}/</span>
          <span className="text-sm font-semibold text-violet-300">yourname</span>
        </div>

        <p className="mt-12 text-[11px] text-zinc-600">
          سجّل دخولك للمتابعة • نستخدم Discord و Google لتسجيل دخول آمن
        </p>
      </section>
    </main>
  )
}

function Feature({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode
  title: string
  desc: string
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-5 text-left backdrop-blur-md">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-violet-500/30 bg-violet-500/10 text-violet-300">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <p className="mt-1 text-xs leading-relaxed text-zinc-400">{desc}</p>
    </div>
  )
}
