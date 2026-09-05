import { Suspense } from 'react'
import { HomePage } from '@/components/home/home-page'

export const dynamic = 'force-dynamic'

export default function Home() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-black">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
        </main>
      }
    >
      <HomePage />
    </Suspense>
  )
}
