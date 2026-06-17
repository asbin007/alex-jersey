import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  ShoppingCart,
  Zap,
  Trophy,
  MapPin,
  Truck,
  Shield,
  Star,
  ChevronRight,
  Sparkles,
  Calendar,
  Users,
} from 'lucide-react'
import { fetchProducts } from '@/services/productService'
import ProductCard from '@/components/products/ProductCard'
import { ProductGridSkeleton } from '@/components/ui/skeleton'
import Reveal from '@/components/ui/Reveal'
import type { Product } from '@/types'

/* ─── Countdown to WC 2026 ─────────────────────────── */
function useCountdown(target: number) {
  const calc = () => {
    const d = Math.max(0, target - Date.now())
    return {
      days: Math.floor(d / 86400000),
      hours: Math.floor((d % 86400000) / 3600000),
      minutes: Math.floor((d % 3600000) / 60000),
      seconds: Math.floor((d % 60000) / 1000),
    }
  }
  const [val, setVal] = useState(calc)
  useEffect(() => {
    const t = setInterval(() => setVal(calc()), 1000)
    return () => clearInterval(t)
  }, []) // eslint-disable-line
  return val
}

function CountUnit({ n, label }: { n: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="countdown-cell relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-sm">
        <span className="relative z-10 text-2xl font-black tabular-nums text-white sm:text-3xl">
          {String(n).padStart(2, '0')}
        </span>
        <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-[#FFD700] to-transparent" />
      </div>
      <span className="text-[9px] font-black uppercase tracking-[0.22em] text-[#555]">{label}</span>
    </div>
  )
}

const hostNations = [
  { name: 'USA', flag: '🇺🇸', cities: 'New York · LA · Miami' },
  { name: 'Mexico', flag: '🇲🇽', cities: 'Mexico City · Guadalajara' },
  { name: 'Canada', flag: '🇨🇦', cities: 'Toronto · Vancouver' },
]

const nations = [
  { name: 'Argentina', flag: '🇦🇷', accent: 'from-sky-400/20 to-blue-900/10' },
  { name: 'Brazil', flag: '🇧🇷', accent: 'from-yellow-400/20 to-green-700/10' },
  { name: 'France', flag: '🇫🇷', accent: 'from-blue-500/20 to-red-600/10' },
  { name: 'Portugal', flag: '🇵🇹', accent: 'from-red-500/20 to-green-700/10' },
  { name: 'Spain', flag: '🇪🇸', accent: 'from-red-500/20 to-yellow-500/10' },
  { name: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', accent: 'from-blue-600/20 to-red-600/10' },
  { name: 'Germany', flag: '🇩🇪', accent: 'from-yellow-400/15 to-red-600/10' },
  { name: 'Netherlands', flag: '🇳🇱', accent: 'from-orange-500/20 to-blue-700/10' },
  { name: 'Morocco', flag: '🇲🇦', accent: 'from-red-600/20 to-green-700/10' },
  { name: 'USA', flag: '🇺🇸', accent: 'from-blue-600/20 to-red-600/10' },
  { name: 'Colombia', flag: '🇨🇴', accent: 'from-yellow-400/20 to-blue-700/10' },
  { name: 'Japan', flag: '🇯🇵', accent: 'from-red-500/15 to-white/5' },
]

const jerseyTypes = [
  { label: 'Home Kits', type: 'home', emoji: '🏠', card: 'kit-card-home' },
  { label: 'Away Kits', type: 'away', emoji: '✈️', card: 'kit-card-away' },
  { label: 'Third Kits', type: 'third', emoji: '⚡', card: 'kit-card-third' },
  { label: 'Retro', type: 'retro', emoji: '🕰️', card: 'kit-card-retro' },
]

const tournamentPhases = [
  { phase: 'Group Stage', dates: 'Jun 11 – Jun 27', desc: '48 teams · 12 groups' },
  { phase: 'Round of 32', dates: 'Jun 28 – Jul 3', desc: 'Knockout begins' },
  { phase: 'Final', dates: 'Jul 19', desc: 'MetLife Stadium, NJ' },
]

const testimonials = [
  { name: 'Suman K.', city: 'Kathmandu', team: '🇦🇷 Argentina', text: 'Argentina home kit quality is top notch. Delivered in 2 days, paid on delivery. Perfect for World Cup season.' },
  { name: 'Rajan T.', city: 'Pokhara', team: '🇧🇷 Brazil', text: 'Ordered Brazil away jersey on WhatsApp — super fast reply and exact sizing. Will order again for friends.' },
  { name: 'Anisha M.', city: 'Biratnagar', team: '🇫🇷 France', text: 'Premium feel and sharp prints. Alex Jersey is my go-to for every tournament. Highly recommend!' },
]

const tickerItems = [
  'FIFA WORLD CUP 2026',
  'USA · MEXICO · CANADA',
  '48 NATIONS',
  'OFFICIAL GRADE JERSEYS',
  'CASH ON DELIVERY',
  'ALL NEPAL DELIVERY',
  'ORDER ON WHATSAPP',
  'ALEX JERSEY SHOP',
]

function SectionHeader({
  eyebrow,
  title,
  href,
  linkLabel = 'View all',
}: {
  eyebrow: string
  title: string
  href?: string
  linkLabel?: string
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4 sm:mb-8">
      <div>
        <p className="mb-1 text-[10px] font-black uppercase tracking-[0.28em] text-[#FFD700]">{eyebrow}</p>
        <h2 className="font-display text-2xl font-black text-white sm:text-3xl lg:text-4xl">{title}</h2>
      </div>
      {href && (
        <Link
          to={href}
          className="group flex shrink-0 items-center gap-1 text-xs font-black text-[#FFD700] hover:underline"
        >
          {linkLabel}
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  )
}

function SpotlightCard({ product }: { product: Product }) {
  const disc = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : null

  return (
    <Link
      to={`/products/${product.slug}`}
      className="group relative block overflow-hidden rounded-3xl border border-[#1f1f1f] bg-[#050505]"
    >
      <div className="grid lg:grid-cols-2">
        <div className="relative aspect-[4/5] overflow-hidden bg-[#0a0a0a] lg:aspect-auto lg:min-h-[420px]">
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            onError={e => {
              ;(e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&q=80'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-black/10 lg:to-black/80" />
          {product.isLimitedDrop && (
            <span className="tag-gold absolute left-4 top-4">⚡ Limited Drop</span>
          )}
        </div>

        <div className="relative flex flex-col justify-center p-6 sm:p-8 lg:p-10">
          <div className="absolute inset-0 opacity-40"
            style={{ background: 'radial-gradient(ellipse 80% 60% at 100% 50%, rgba(255,215,0,0.12) 0%, transparent 70%)' }}
          />
          <div className="relative">
            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.3em] text-[#FFD700]">
              Matchday Spotlight
            </p>
            <p className="mb-1 text-sm font-black uppercase tracking-widest text-[#666]">{product.team}</p>
            <h3 className="mb-4 text-2xl font-black leading-tight text-white sm:text-3xl lg:text-4xl">
              {product.name}
            </h3>
            <p className="mb-6 line-clamp-2 max-w-md text-sm leading-relaxed text-[#777]">
              {product.description}
            </p>

            <div className="mb-6 flex flex-wrap items-center gap-4">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-white sm:text-3xl">
                  Rs.{product.price.toLocaleString()}
                </span>
                {product.compareAtPrice && (
                  <span className="text-sm text-[#555] line-through">
                    Rs.{product.compareAtPrice.toLocaleString()}
                  </span>
                )}
              </div>
              {disc && <span className="tag-red">-{disc}% OFF</span>}
              <div className="flex items-center gap-1 text-sm text-[#aaa]">
                <Star className="h-3.5 w-3.5 fill-[#FFD700] text-[#FFD700]" />
                {product.rating} ({product.reviewCount})
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2 rounded-xl bg-[#FFD700] px-5 py-3 text-sm font-black text-black transition-transform group-hover:-translate-y-0.5">
                Shop Now
                <ChevronRight className="h-4 w-4" />
              </span>
              <span className="inline-flex items-center rounded-xl border border-[#222] px-5 py-3 text-sm font-black text-[#888]">
                {product.jerseyType.toUpperCase()} KIT
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default function Home() {
  const wc = useCountdown(new Date('2026-06-11T00:00:00Z').getTime())

  const [featured, setFeatured] = useState<Product[]>([])
  const [limited, setLimited] = useState<Product[]>([])
  const [newIn, setNewIn] = useState<Product[]>([])

  const [loadF, setLoadF] = useState(true)
  const [loadL, setLoadL] = useState(true)
  const [loadN, setLoadN] = useState(true)

  useEffect(() => {
    fetchProducts({ isFeatured: true, limit: 8 })
      .then(r => setFeatured(r.data))
      .catch(console.error)
      .finally(() => setLoadF(false))
    fetchProducts({ isLimitedDrop: true, limit: 6 })
      .then(r => setLimited(r.data))
      .catch(console.error)
      .finally(() => setLoadL(false))
    fetchProducts({ sortBy: 'newest', limit: 8 })
      .then(r => setNewIn(r.data))
      .catch(console.error)
      .finally(() => setLoadN(false))
  }, [])

  const spotlight = featured[1] ?? featured[0]
  const heroProducts = featured.slice(0, 3)

  return (
    <div className="min-h-screen bg-black text-white">

      {/* ── Ticker ── */}
      <div className="fixed top-16 z-40 w-full overflow-hidden border-b border-[#FFD700]/10 bg-black/90 backdrop-blur-md">
        <div className="marquee-inner py-2">
          {[...tickerItems, ...tickerItems].map((item, i) => (
            <span key={i} className="flex items-center gap-3 px-6 text-[10px] font-black uppercase tracking-[0.25em] text-[#555]">
              <span className="h-1 w-1 rounded-full bg-[#FFD700]" />
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════
          HERO
      ════════════════════════════════════════════════════ */}
      <section className="relative flex min-h-[100svh] flex-col overflow-hidden pt-[7.5rem]">

        {/* Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[#030303]" />
          <div className="hero-mesh absolute inset-0" />
          <div className="stadium-lights absolute inset-0" />
          <div className="noise absolute inset-0 opacity-60" />

          {/* Pitch lines */}
          <div
            className="absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.9) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.9) 1px, transparent 1px)
              `,
              backgroundSize: '72px 72px',
            }}
          />
          <div className="absolute left-1/2 top-[58%] h-[min(90vw,520px)] w-[min(90vw,520px)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.04]" />

          <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black via-black/80 to-transparent" />
        </div>

        <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 sm:px-6 lg:px-8">
          <div className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:py-16">

            {/* Left — copy */}
            <div>
              <div className="fade-up mb-6 flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#FFD700]/25 bg-[#FFD700]/8 px-3 py-1.5">
                  <Trophy className="h-3.5 w-3.5 text-[#FFD700]" />
                  <span className="text-[10px] font-black uppercase tracking-[0.28em] text-[#FFD700]">
                    FIFA World Cup 2026™
                  </span>
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#444]">
                  11 Jun – 19 Jul · North America
                </span>
              </div>

              <div className="fade-up delay-1 relative mb-6">
                <span
                  className="pointer-events-none absolute -left-2 -top-8 select-none font-black leading-none text-white/5 sm:-top-12"
                  style={{ fontSize: 'clamp(5rem, 18vw, 11rem)', letterSpacing: '-0.06em' }}
                  aria-hidden
                >
                  26
                </span>
                <h1
                  className="font-display relative font-black leading-[0.92] tracking-tight"
                  style={{ fontSize: 'clamp(2.8rem, 7.5vw, 5.5rem)' }}
                >
                  <span className="block text-white">Rep Your</span>
                  <span className="block text-white">Nation.</span>
                  <span className="gold-text block">Own The Moment.</span>
                </h1>
              </div>

              <p className="fade-up delay-2 mb-8 max-w-lg text-sm leading-relaxed text-[#777] sm:text-base">
                Premium World Cup 2026 jerseys for all 48 nations — home, away, and third kits.
                Delivered across Nepal with Cash on Delivery. Order online or on WhatsApp.
              </p>

              {/* Host nations */}
              <div className="fade-up delay-2 mb-8 flex flex-wrap gap-2">
                {hostNations.map(h => (
                  <Link
                    key={h.name}
                    to={`/products?team=${h.name === 'USA' ? 'USA' : h.name}`}
                    className="group rounded-2xl border border-[#1a1a1a] bg-white/[0.02] px-3 py-2 transition-all hover:border-[#FFD700]/30 hover:bg-[#FFD700]/5"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{h.flag}</span>
                      <div>
                        <p className="text-xs font-black text-white group-hover:text-[#FFD700]">{h.name}</p>
                        <p className="text-[10px] text-[#555]">{h.cities}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="fade-up delay-3 mb-10 flex flex-wrap gap-3">
                <Link
                  to="/products"
                  className="btn-gold glow-pulse flex items-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-black sm:text-base"
                >
                  <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
                  Shop All Jerseys
                </Link>
                <a
                  href="https://wa.me/9779747235169"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 rounded-2xl border border-[#25D366]/30 bg-[#25D366]/5 px-6 py-3.5 text-sm font-black text-[#25D366] transition-colors hover:bg-[#25D366]/12 sm:text-base"
                >
                  Order on WhatsApp
                </a>
              </div>

              {/* Countdown */}
              <div className="fade-up delay-4">
                <p className="mb-3 text-[9px] font-black uppercase tracking-[0.3em] text-[#444]">
                  Kickoff Countdown
                </p>
                <div className="inline-flex items-end gap-2 rounded-2xl border border-[#1a1a1a] bg-black/40 p-4 sm:gap-3 sm:p-5">
                  <CountUnit n={wc.days} label="Days" />
                  <span className="mb-6 text-lg font-black text-[#333]">:</span>
                  <CountUnit n={wc.hours} label="Hours" />
                  <span className="mb-6 text-lg font-black text-[#333]">:</span>
                  <CountUnit n={wc.minutes} label="Mins" />
                  <span className="mb-6 text-lg font-black text-[#333]">:</span>
                  <CountUnit n={wc.seconds} label="Secs" />
                </div>
              </div>
            </div>

            {/* Right — product showcase */}
            <div className="fade-up delay-3 relative hidden lg:block">
              <div className="relative mx-auto aspect-square max-w-[520px]">
                <div className="absolute inset-8 rounded-full border border-[#FFD700]/10" />
                <div className="absolute inset-16 rounded-full border border-white/[0.04]" />

                {heroProducts.length > 0 ? (
                  <>
                    <Link
                      to={`/products/${heroProducts[0].slug}`}
                      className="float-anim absolute left-1/2 top-1/2 z-20 w-[58%] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl border border-[#FFD700]/20 bg-[#0a0a0a] shadow-[0_24px_80px_rgba(0,0,0,0.8),0_0_40px_rgba(255,215,0,0.08)]"
                    >
                      <img
                        src={heroProducts[0].images[0]}
                        alt={heroProducts[0].name}
                        className="aspect-[3/4] w-full object-cover"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black to-transparent p-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#FFD700]">
                          {heroProducts[0].team}
                        </p>
                        <p className="truncate text-sm font-black text-white">{heroProducts[0].name}</p>
                      </div>
                    </Link>
                    {heroProducts[1] && (
                      <Link
                        to={`/products/${heroProducts[1].slug}`}
                        className="absolute -left-2 top-[18%] z-10 w-[34%] overflow-hidden rounded-2xl border border-[#222] bg-[#0a0a0a] opacity-90 transition-transform hover:scale-105"
                      >
                        <img src={heroProducts[1].images[0]} alt={heroProducts[1].name} className="aspect-[3/4] w-full object-cover" />
                      </Link>
                    )}
                    {heroProducts[2] && (
                      <Link
                        to={`/products/${heroProducts[2].slug}`}
                        className="absolute -right-2 bottom-[16%] z-10 w-[34%] overflow-hidden rounded-2xl border border-[#222] bg-[#0a0a0a] opacity-90 transition-transform hover:scale-105"
                      >
                        <img src={heroProducts[2].images[0]} alt={heroProducts[2].name} className="aspect-[3/4] w-full object-cover" />
                      </Link>
                    )}
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="rounded-3xl border border-dashed border-[#222] px-8 py-12 text-center">
                      <Trophy className="mx-auto mb-3 h-10 w-10 text-[#FFD700]/40" />
                      <p className="text-sm font-black text-[#555]">2026 Collection Loading…</p>
                    </div>
                  </div>
                )}

                <div className="absolute -bottom-2 left-1/2 z-30 -translate-x-1/2 rounded-full border border-[#FFD700]/20 bg-black/80 px-4 py-2 backdrop-blur-md">
                  <p className="whitespace-nowrap text-[10px] font-black uppercase tracking-[0.2em] text-[#FFD700]">
                    Official Tournament Jerseys
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile — featured jersey strip */}
          {!loadF && heroProducts.length > 0 && (
            <div className="fade-up delay-3 pb-6 lg:hidden">
              <p className="mb-3 text-[9px] font-black uppercase tracking-[0.25em] text-[#444]">
                Trending Now
              </p>
              <div className="scrollbar-hide -mx-4 flex gap-3 overflow-x-auto px-4">
                {heroProducts.map(p => (
                  <Link
                    key={p._id}
                    to={`/products/${p.slug}`}
                    className="w-[42vw] shrink-0 overflow-hidden rounded-2xl border border-[#1a1a1a] bg-[#0a0a0a]"
                  >
                    <img src={p.images[0]} alt={p.name} className="aspect-[3/4] w-full object-cover" />
                    <div className="p-2.5">
                      <p className="truncate text-[9px] font-black uppercase tracking-widest text-[#FFD700]">{p.team}</p>
                      <p className="truncate text-xs font-black text-white">{p.name}</p>
                      <p className="mt-0.5 text-xs font-black text-white">Rs.{p.price.toLocaleString()}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Stats strip */}
        <div className="relative z-10 border-t border-[#111] bg-black/60 backdrop-blur-sm">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px bg-[#111] px-4 sm:grid-cols-4 sm:px-6 lg:px-8">
            {[
              { value: '48', label: 'Nations' },
              { value: 'COD', label: 'Cash on Delivery' },
              { value: '2–3', label: 'Day Delivery' },
              { value: '100%', label: 'Premium Quality' },
            ].map(s => (
              <div key={s.label} className="bg-black px-4 py-5 text-center sm:py-6">
                <p className="text-xl font-black text-[#FFD700] sm:text-2xl">{s.value}</p>
                <p className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#555]">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tournament roadmap ── */}
      <section className="section-panel py-10 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="mb-1 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.28em] text-[#FFD700]">
                  <Calendar className="h-3.5 w-3.5" />
                  Road to 2026
                </p>
                <h2 className="font-display text-2xl font-black text-white sm:text-3xl">The Biggest World Cup Ever</h2>
              </div>
              <p className="max-w-sm text-sm text-[#666]">
                104 matches across USA, Mexico & Canada — gear up before kickoff.
              </p>
            </div>
          </Reveal>
          <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
            {tournamentPhases.map((t, i) => (
              <Reveal key={t.phase} delay={(i + 1) as 1 | 2 | 3}>
                <div className="relative overflow-hidden rounded-2xl border border-[#1a1a1a] bg-[#050505] p-5 sm:p-6">
                  <div className="absolute right-4 top-4 text-3xl font-black text-[#FFD700]/10">{String(i + 1).padStart(2, '0')}</div>
                  <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-[#FFD700]">{t.dates}</p>
                  <p className="font-display mb-1 text-lg font-black text-white sm:text-xl">{t.phase}</p>
                  <p className="text-xs text-[#555] sm:text-sm">{t.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Nation quick strip ── */}
      <section className="border-b border-[#111] bg-[#030303] py-4">
        <div className="overflow-hidden">
          <div className="marquee-inner py-1">
            {[...nations, ...nations].map((n, i) => (
              <Link
                key={`${n.name}-${i}`}
                to={`/products?team=${n.name}`}
                className="mx-1.5 flex shrink-0 items-center gap-1.5 rounded-full border border-[#1a1a1a] bg-[#0a0a0a] px-4 py-2 text-xs font-black whitespace-nowrap text-[#777] transition-colors hover:border-[#333] hover:text-white"
              >
                <span>{n.flag}</span>
                <span>{n.name}</span>
              </Link>
            ))}
          </div>
        </div>
        <div className="mt-2 overflow-hidden">
          <div className="marquee-inner-reverse py-1">
            {[...nations.slice().reverse(), ...nations.slice().reverse()].map((n, i) => (
              <Link
                key={`rev-${n.name}-${i}`}
                to={`/products?team=${n.name}`}
                className="mx-1.5 flex shrink-0 items-center gap-1.5 rounded-full border border-[#1a1a1a] bg-[#0a0a0a] px-4 py-2 text-xs font-black whitespace-nowrap text-[#777] transition-colors hover:border-[#333] hover:text-white"
              >
                <span>{n.flag}</span>
                <span>{n.name}</span>
              </Link>
            ))}
          </div>
        </div>
        <div className="mx-auto mt-3 max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 rounded-full bg-[#FFD700] px-4 py-2 text-xs font-black text-black"
          >
            ⚽ Browse All 48 Nations
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* ── Spotlight ── */}
        {!loadF && spotlight && (
          <Reveal>
            <section className="border-b border-[#111] py-12 sm:py-16">
              <SectionHeader eyebrow="Editor's Choice" title="Jersey of the Week" />
              <SpotlightCard product={spotlight} />
            </section>
          </Reveal>
        )}

        {/* ── Limited Drops ── */}
        {(loadL || limited.length > 0) && (
          <Reveal>
            <section className="border-b border-[#111] py-12 sm:py-16">
            <SectionHeader
              eyebrow="Limited Stock"
              title="Drop Zone"
              href="/products?limited=true"
              linkLabel="All drops"
            />
            {loadL ? (
              <ProductGridSkeleton count={4} />
            ) : (
              <div className="scrollbar-hide -mx-4 flex gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3">
                {limited.map(p => (
                  <div key={p._id} className="w-[72vw] shrink-0 sm:w-auto">
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>
            )}
            <div className="mt-6 flex items-center gap-2 rounded-2xl border border-[#ff6b6b]/20 bg-[#ff6b6b]/5 px-4 py-3">
              <Zap className="h-4 w-4 shrink-0 text-[#ff6b6b]" />
              <p className="text-xs font-semibold text-[#aaa]">
                Limited drops sell fast — order via WhatsApp for instant confirmation.
              </p>
            </div>
          </section>
          </Reveal>
        )}

        {/* ── Customization promo ── */}
        <Reveal>
          <section className="border-b border-[#111] py-12 sm:py-16">
            <div className="relative overflow-hidden rounded-3xl border border-[#FFD700]/15 bg-gradient-to-br from-[#FFD700]/8 via-[#050505] to-[#050505] p-6 sm:p-10">
              <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-[#FFD700]/10 blur-3xl" />
              <div className="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
                <div>
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#FFD700]/25 bg-black/40 px-3 py-1">
                    <Sparkles className="h-3.5 w-3.5 text-[#FFD700]" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FFD700]">Custom Printing</span>
                  </div>
                  <h2 className="font-display mb-2 text-2xl font-black text-white sm:text-3xl">
                    Your Name. Your Number.
                  </h2>
                  <p className="max-w-lg text-sm leading-relaxed text-[#777] sm:text-base">
                    Add player names and numbers on select jerseys — perfect for match day.
                    Message us on WhatsApp with your customization details.
                  </p>
                </div>
                <a
                  href="https://wa.me/9779747235169?text=Hi!%20I%20want%20a%20custom%20jersey%20with%20name%20and%20number."
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl border border-[#25D366]/30 bg-[#25D366]/10 px-6 py-3.5 text-sm font-black text-[#25D366] transition-colors hover:bg-[#25D366]/18"
                >
                  Customize on WhatsApp
                  <ChevronRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </section>
        </Reveal>

        {/* ── Shop by kit type ── */}
        <Reveal>
          <section className="border-b border-[#111] py-12 sm:py-16">
          <SectionHeader eyebrow="Find Your Fit" title="Shop by Kit Type" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {jerseyTypes.map(j => (
              <Link
                key={j.type}
                to={`/products?jerseyType=${j.type}`}
                className={`group relative overflow-hidden rounded-2xl border border-[#1a1a1a] p-5 transition-all hover:border-[#FFD700]/35 sm:p-6 ${j.card}`}
              >
                <span className="mb-3 block text-2xl">{j.emoji}</span>
                <p className="text-sm font-black text-white group-hover:text-[#FFD700] sm:text-base">{j.label}</p>
                <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-[#444]">Shop now</p>
                <ChevronRight className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#333] transition-all group-hover:translate-x-0.5 group-hover:text-[#FFD700]" />
              </Link>
            ))}
          </div>
        </section>
        </Reveal>

        {/* ── Featured ── */}
        <Reveal>
          <section className="border-b border-[#111] py-12 sm:py-16">
          <SectionHeader eyebrow="Top Picks" title="Featured Jerseys" href="/products" />
          {loadF ? (
            <ProductGridSkeleton count={8} />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
              {featured.map(p => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}
        </section>
        </Reveal>

        {/* ── New Arrivals ── */}
        <Reveal>
          <section className="border-b border-[#111] py-12 sm:py-16">
          <SectionHeader eyebrow="Just Dropped" title="New Arrivals" href="/products?sortBy=newest" />
          {loadN ? (
            <ProductGridSkeleton count={8} />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
              {newIn.map(p => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}
        </section>
        </Reveal>

        {/* ── Fan reviews ── */}
        <Reveal>
          <section className="border-b border-[#111] py-12 sm:py-16">
            <SectionHeader eyebrow="Fan Love" title="What Supporters Say" />
            <div className="grid gap-4 sm:grid-cols-3">
              {testimonials.map(t => (
                <div
                  key={t.name}
                  className="rounded-2xl border border-[#1a1a1a] bg-[#050505] p-5 sm:p-6"
                >
                  <div className="mb-3 flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-[#FFD700] text-[#FFD700]" />
                    ))}
                  </div>
                  <p className="mb-4 text-sm leading-relaxed text-[#888]">&ldquo;{t.text}&rdquo;</p>
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-black text-white">{t.name}</p>
                      <p className="text-[10px] text-[#555]">{t.city}</p>
                    </div>
                    <span className="text-lg">{t.team}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </Reveal>

        {/* ── Why us ── */}
        <Reveal>
          <section className="py-12 sm:py-16">
            <SectionHeader eyebrow="Why Alex Jersey" title="Built for Fans in Nepal" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: Shield, title: 'Official Grade', sub: 'World Cup 2026 quality fabrics & prints', color: 'text-[#FFD700]' },
                { icon: Truck, title: 'All Nepal Delivery', sub: 'Kathmandu to every district in 2–3 days', color: 'text-sky-400' },
                { icon: MapPin, title: 'Cash on Delivery', sub: 'Pay only when your jersey arrives', color: 'text-green-400' },
                { icon: Users, title: 'WhatsApp Orders', sub: '9747235169 · 9864227012', color: 'text-[#25D366]' },
              ].map(item => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-[#1a1a1a] bg-[#050505] p-5 transition-colors hover:border-[#FFD700]/20 sm:p-6"
                >
                  <item.icon className={`mb-4 h-6 w-6 ${item.color}`} />
                  <p className="text-sm font-black text-white sm:text-base">{item.title}</p>
                  <p className="mt-1.5 text-xs leading-relaxed text-[#555] sm:text-sm">{item.sub}</p>
                </div>
              ))}
            </div>
          </section>
        </Reveal>
      </div>

      {/* ── Bottom CTA ── */}
      <section className="relative overflow-hidden border-t border-[#111] bg-[#030303] py-16 sm:py-24">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 100%, rgba(255,215,0,0.09) 0%, transparent 70%)' }}
        />
        <div className="relative mx-auto max-w-3xl px-4 text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#FFD700]/20 bg-[#FFD700]/5 px-4 py-1.5">
            <Trophy className="h-4 w-4 text-[#FFD700]" />
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#FFD700]">
              World Cup Season 2026
            </span>
          </div>
          <h2 className="font-display mb-4 text-3xl font-black leading-tight text-white sm:text-5xl">
            Your Nation.<br />
            <span className="gold-text">Your Colours.</span>
          </h2>
          <p className="mx-auto mb-8 max-w-md text-sm text-[#666] sm:text-base">
            Browse the full 2026 collection or message us on WhatsApp — we&apos;ll help you pick the perfect kit.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/products" className="btn-gold rounded-2xl px-8 py-3.5 text-sm font-black sm:text-base">
              Browse All Jerseys
            </Link>
            <a
              href="https://wa.me/9779747235169"
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl border border-[#25D366]/30 bg-[#25D366]/5 px-8 py-3.5 text-sm font-black text-[#25D366] transition-colors hover:bg-[#25D366]/10 sm:text-base"
            >
              WhatsApp Order
            </a>
          </div>
          <div className="mt-8 flex items-center justify-center gap-6 text-sm">
            <span className="font-black text-white">9747235169</span>
            <span className="h-4 w-px bg-[#1a1a1a]" />
            <span className="font-black text-white">9864227012</span>
          </div>
          <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-[#333]">
            Alex Jersey Shop · Delivering Pride Across Nepal 🇳🇵
          </p>
        </div>
      </section>
    </div>
  )
}
