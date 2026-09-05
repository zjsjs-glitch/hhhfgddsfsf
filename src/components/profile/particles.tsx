'use client'

import { useEffect, useRef } from 'react'

type ParticlesProps = {
  count?: number
  color?: string
}

type Particle = {
  x: number
  y: number
  r: number
  vy: number
  vx: number
  alpha: number
  twinkle: number
  twinkleSpeed: number
}

export function Particles({
  count = 60,
  color = '255,255,255',
}: ParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    let particles: Particle[] = []
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    function resize() {
      if (!canvas || !ctx) return
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      particles = Array.from({ length: count }, () => createParticle(w, h))
    }

    function createParticle(w: number, h: number): Particle {
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 2 + 0.4,
        vy: Math.random() * 0.4 + 0.08,
        vx: (Math.random() - 0.5) * 0.3,
        alpha: Math.random() * 0.6 + 0.2,
        twinkle: Math.random() * Math.PI * 2,
        twinkleSpeed: Math.random() * 0.03 + 0.005,
      }
    }

    function tick() {
      if (!canvas || !ctx) return
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      ctx.clearRect(0, 0, w, h)
      for (const p of particles) {
        p.y += p.vy
        p.x += p.vx
        p.twinkle += p.twinkleSpeed
        if (p.y > h + 5) {
          p.y = -5
          p.x = Math.random() * w
        }
        if (p.x < -5) p.x = w + 5
        if (p.x > w + 5) p.x = -5
        const tw = (Math.sin(p.twinkle) + 1) / 2
        const a = Math.max(0, Math.min(1, p.alpha * (0.5 + tw * 0.5)))
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${color},${a})`
        ctx.fill()
      }
      raf = requestAnimationFrame(tick)
    }

    resize()
    tick()
    window.addEventListener('resize', resize)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [count, color])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  )
}
