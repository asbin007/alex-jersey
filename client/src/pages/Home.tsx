import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Crown, Zap, Star, ShoppingCart } from 'lucide-react'
import { mockProducts, wc2026Nations } from '@/data/mockData'
import ProductCard from '@/components/products/ProductCard'
import { useCart } from '@/context/CartContext'

/* ─── Live countdown ─── */
function useCountdown() {
  const [t, setT] = useState(Date.now())
  useEffect(() => {
    const id = setInterval(() => setT(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])
  const diff = Math.max(0, new Date('2026-06-11T00:00:00Z').getTime() - t)
  return {
    d: Math.floor(diff / 86400000),
    h: Math.floor((diff % 86400000) / 3600000),
    m: Math.floor((diff % 3600000) / 60000),
    s: Math.floor((diff % 60000) / 1000),
  }
}

function Pad({ v, label }: { v: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-2xl overflow-hidden flex items-center justify-center"
        style={{ background: 'linear-gradient(145deg,#111 0%,#0a0a0a 100%)', border: '1px solid #2a2a2a', boxShadow: '0 0 20px rgba(255,215,0,0.08), inset 0 1px 0 rgba(255,255,255,0.05)' }}>
        <span className="font-black text-3xl sm:text-4xl text-white tabular-nums leading-none">
          {String(v).padStart(2, '0')}
        </span>
        <div className="absolute bottom-0 inset-x-0 h-px" style={{ background: 'linear-gradient(90deg,transparent,#FFD700,transparent)' }} />
      </div>
      <span className="text-[9px] font-black text-[#555] uppercase tracking-[0.25em]">{label}</span>
    </div>
  )
}

/* ─── Jersey showcase card (hero right side) ─── */
const heroJerseys = [
  { id: 'arg-home-26', team: 'Argentina', flag: '🇦🇷', img: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=500&q=90', price: 2999, hot: true, rotate: '-6deg', z: 30, offsetX: '-80px', offsetY: '20px' },
  { id: 'bra-home-26', team: 'Brazil', flag: '🇧🇷', img: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=500&q=90', price: 2999, hot: false, rotate: '4deg', z: 20, offsetX: '0px', offsetY: '-30px' },
  { id: 'por-home-26', team: 'Portugal', flag: '🇵🇹', img: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=500&q=90', price: 2799, hot: false, rotate: '14deg', z: 10, offsetX: '80px', offsetY: '30px' },
]

const nations = [
  { n: 'Argentina', f: '🇦🇷', c: '#74c0fc', desc: 'Defending Champions' },
  { n: 'Brazil', f: '🇧🇷', c: '#f9c74f', desc: '5× World Champions' },
  { n: 'France', f: '🇫🇷', c: '#748ffc', desc: '#1 Ranked Nation' },
  { n: 'Portugal', f: '🇵🇹', c: '#ff6b6b', desc: "CR7's Final Run" },
  { n: 'Spain', f: '🇪🇸', c: '#ff8787', desc: 'Euro 2024 Winners' },
  { n: 'England', f: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', c: '#e9ecef', desc: 'Golden Generation' },
  { n: 'Germany', f: '🇩🇪', c: '#dee2e6', desc: 'Die Mannschaft' },
  { n: 'Netherlands', f: '🇳🇱', c: '#fd7e14', desc: 'Total Football' },
  { n: 'Morocco', f: '🇲🇦', c: '#51cf66', desc: 'Host Nation' },
  { n: 'USA', f: '🇺🇸', c: '#74c0fc', desc: 'Home Ground' },
  { n: 'Colombia', f: '🇨🇴', c: '#f9c74f', desc: 'South America' },
]

const marqItems = ['🏆 FIFA WORLD CUP 2026','🇦🇷 ARGENTINA','🇧🇷 BRAZIL','🇫🇷 FRANCE','🇵🇹 PORTUGAL','🇪🇸 SPAIN','⚽ ALL NATIONS','🚚 DELIVERY ALL NEPAL','💵 CASH ON DELIVERY','📱 WHATSAPP ORDER','👑 ALEX JERSEY SHOP']

export default function Home() {
  const { d, h, m, s } = useCountdown()
  const { addToCart } = useCart()
  const [activeJersey, setActiveJersey] = useState(0)
  const featured = mockProducts.filter(p => p.isFeatured).slice(0, 4)
  const limited = mockProducts.filter(p => p.isLimitedDrop)
  const all = mockProducts.slice(0, 8)

  return (
    <div className="min-h-screen bg-black text-white">

      {/* ══════════════════════════════════════════════
          HERO — Split layout: text left, jerseys right
      ══════════════════════════════════════════════ */}
      <section className="relative min-h-screen overflow-hidden pt-16">

        {/* ── Deep background layers ── */}
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 120% 80% at 70% 50%, #0d0900 0%, #000 60%)' }} />

        {/* Stadium texture */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 40px,rgba(255,255,255,0.3) 40px,rgba(255,255,255,0.3) 41px),repeating-linear-gradient(90deg,transparent,transparent 40px,rgba(255,255,255,0.3) 40px,rgba(255,255,255,0.3) 41px)' }} />

        {/* Left gold spotlight */}
        <div className="absolute top-0 left-0 w-1/2 h-full pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 80% at 20% 40%, rgba(255,215,0,0.04) 0%, transparent 70%)' }} />

        {/* Right jersey spotlight — intense warm beam from above */}
        <div className="absolute top-0 right-0 w-[55%] h-full pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 70% 90% at 80% 30%, rgba(255,200,50,0.10) 0%, rgba(255,150,0,0.05) 40%, transparent 75%)' }} />

        {/* Vertical gold line */}
        <div className="absolute top-16 bottom-0 left-1/2 w-px hidden lg:block pointer-events-none"
          style={{ background: 'linear-gradient(180deg,rgba(255,215,0,0.15) 0%,transparent 100%)' }} />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen flex items-center">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-0 items-center w-full py-12 lg:py-0">

            {/* ── LEFT: Text content ── */}
            <div className="lg:pr-12 xl:pr-20">

              {/* Crown badge */}
              <div className="fade-up delay-1 inline-flex items-center gap-2 mb-6"
                style={{ background: 'rgba(255,215,0,0.08)', border: '1px solid rgba(255,215,0,0.25)', borderRadius: 100, padding: '6px 14px' }}>
                <Crown className="w-3.5 h-3.5 text-[#FFD700]" />
                <span className="text-[10px] font-black text-[#FFD700] uppercase tracking-[0.2em]">Alex Jersey Shop · Nepal</span>
              </div>

              {/* Giant headline */}
              <h1 className="fade-up delay-2 font-black leading-[0.85] tracking-[-0.03em] mb-5">
                <span className="block text-white" style={{ fontSize: 'clamp(2.8rem,8vw,6.5rem)' }}>OFFICIAL</span>
                <span className="block" style={{ fontSize: 'clamp(2.8rem,8vw,6.5rem)', background: 'linear-gradient(135deg,#ffe566 0%,#FFD700 45%,#c8960c 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  WORLD CUP
                </span>
                <span className="block text-white" style={{ fontSize: 'clamp(2.8rem,8vw,6.5rem)' }}>2026</span>
                <span className="block text-[#2a2a2a]" style={{ fontSize: 'clamp(1.2rem,3.5vw,2.8rem)', letterSpacing: '0.12em', marginTop: '4px' }}>
                  JERSEYS
                </span>
              </h1>

              {/* Description */}
              <p className="fade-up delay-3 text-[#666] text-base sm:text-lg leading-relaxed mb-8 max-w-md">
                Every nation. Every kit. Delivered to your door across Nepal.
                <span className="text-[#aaa] font-semibold"> Cash on Delivery · WhatsApp Orders.</span>
              </p>

              {/* CTA row */}
              <div className="fade-up delay-4 flex flex-wrap gap-3 mb-10">
                <Link to="/products"
                  className="btn-gold flex items-center gap-2.5 px-7 py-4 rounded-2xl font-black text-[15px]">
                  <ShoppingCart className="w-5 h-5" /> Shop All Jerseys
                </Link>
                <a href="https://wa.me/9779747235169" target="_blank" rel="noreferrer"
                  className="flex items-center gap-2.5 px-7 py-4 rounded-2xl font-black text-[15px] transition-all"
                  style={{ background: 'rgba(37,211,102,0.08)', border: '1px solid rgba(37,211,102,0.3)', color: '#25D366' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(37,211,102,0.16)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(37,211,102,0.08)')}>
                  📱 9747235169
                </a>
              </div>

              {/* Countdown */}
              <div className="fade-up delay-5">
                <p className="text-[10px] font-black text-[#333] uppercase tracking-[0.3em] mb-4">⚽ World Cup Kicks Off In</p>
                <div className="flex items-end gap-2 sm:gap-3">
                  <Pad v={d} label="Days" />
                  <span className="text-2xl font-black text-[#2a2a2a] mb-5">:</span>
                  <Pad v={h} label="Hours" />
                  <span className="text-2xl font-black text-[#2a2a2a] mb-5">:</span>
                  <Pad v={m} label="Mins" />
                  <span className="text-2xl font-black text-[#2a2a2a] mb-5">:</span>
                  <Pad v={s} label="Secs" />
                </div>
              </div>

              {/* Social proof */}
              <div className="fade-up delay-5 flex items-center gap-4 mt-8 pt-8 border-t border-[#111]">
                <div className="flex -space-x-2">
                  {['S','P','D','A','R'].map((l, i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-black flex items-center justify-center text-black text-[10px] font-black"
                      style={{ background: `hsl(${i * 40 + 30},80%,55%)` }}>{l}</div>
                  ))}
                </div>
                <div>
                  <div className="flex gap-0.5 mb-0.5">
                    {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 fill-[#FFD700] text-[#FFD700]" />)}
                  </div>
                  <p className="text-xs text-[#555] font-semibold">500+ fans trust Alex Jersey Shop</p>
                </div>
              </div>
            </div>

            {/* ── RIGHT: Stacked jersey showcase ── */}
            <div className="relative flex items-center justify-center h-[380px] sm:h-[480px] lg:h-[600px]">

              {/* Glow blob behind jerseys */}
              <div className="absolute inset-0 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(255,180,0,0.12) 0%, transparent 70%)' }} />

              {/* Trophy watermark */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                <span className="text-[180px] sm:text-[220px] opacity-[0.04] leading-none">🏆</span>
              </div>

              {/* Stacked jersey cards — fanned out */}
              <div className="relative w-56 sm:w-64 h-72 sm:h-80">
                {heroJerseys.map((jersey, i) => {
                  const isActive = activeJersey === i
                  return (
                    <div key={jersey.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => setActiveJersey(i)}
                      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActiveJersey(i) } }}
                      className="absolute transition-all duration-500 cursor-pointer group"
                      style={{
                        left: '50%',
                        top: '50%',
                        transform: `translate(-50%,-50%) translateX(${jersey.offsetX}) translateY(${isActive ? '-20px' : jersey.offsetY}) rotate(${isActive ? '0deg' : jersey.rotate}) scale(${isActive ? 1.08 : 0.92})`,
                        zIndex: isActive ? 50 : jersey.z,
                        width: '11rem',
                      }}>
                      <div className="rounded-2xl overflow-hidden"
                        style={{
                          boxShadow: isActive
                            ? '0 32px 80px rgba(0,0,0,0.9), 0 0 40px rgba(255,215,0,0.25)'
                            : '0 16px 40px rgba(0,0,0,0.7)',
                          border: isActive ? '1px solid rgba(255,215,0,0.4)' : '1px solid rgba(255,255,255,0.05)',
                        }}>
                        <div className="relative aspect-[3/4]">
                          <img src={jersey.img} alt={jersey.team}
                            className="w-full h-full object-cover"
                            onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400&q=80' }} />
                          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top,rgba(0,0,0,0.9) 0%,rgba(0,0,0,0.2) 50%,transparent 100%)' }} />
                          {isActive && (
                            <div className="absolute inset-x-0 bottom-0 p-3">
                              <p className="text-[10px] font-black text-[#FFD700] uppercase tracking-widest">{jersey.flag} {jersey.team}</p>
                              <div className="flex items-center justify-between mt-1">
                                <p className="font-black text-white text-base">Rs. {jersey.price.toLocaleString()}</p>
                                <button
                                  onClick={e => {
                                    e.stopPropagation()
                                    const product = mockProducts.find(p => p._id === jersey.id)
                                    if (product) addToCart(product, 'M')
                                  }}
                                  className="btn-gold w-8 h-8 rounded-xl flex items-center justify-center text-black">
                                  <ShoppingCart className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          )}
                          {jersey.hot && !isActive && (
                            <div className="absolute top-2 right-2">
                              <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-[#FFD700] text-black">HOT</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Dot selectors below */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
                {heroJerseys.map((_, i) => (
                  <button key={i} onClick={() => setActiveJersey(i)}
                    className="transition-all duration-300 rounded-full"
                    style={{ width: activeJersey === i ? 20 : 6, height: 6, background: activeJersey === i ? '#FFD700' : '#333' }} />
                ))}
              </div>

              {/* Side labels */}
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-2 hidden xl:flex">
                {heroJerseys.map((j, i) => (
                  <button key={i} onClick={() => setActiveJersey(i)}
                    className="text-right transition-all duration-300"
                    style={{ opacity: activeJersey === i ? 1 : 0.25 }}>
                    <p className="text-[9px] font-black text-[#FFD700] uppercase tracking-widest">{j.flag}</p>
                    <p className="text-[9px] font-semibold text-[#555]">{j.team}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom fade to black */}
        <div className="absolute bottom-0 inset-x-0 h-32 pointer-events-none"
          style={{ background: 'linear-gradient(to top,#000 0%,transparent 100%)' }} />
      </section>

      {/* ── Marquee ── */}
      <div className="border-y border-[#111] bg-[#050505] py-3 overflow-hidden">
        <div className="marquee-inner">
          {[...marqItems, ...marqItems].map((item, i) => (
            <span key={i} className="text-[11px] font-black text-[#444] uppercase tracking-[0.2em] px-8 whitespace-nowrap">
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ── Featured ── */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-[10px] font-black text-[#FFD700] uppercase tracking-[0.25em] mb-2">Editor&apos;s Pick</p>
              <h2 className="text-3xl sm:text-4xl font-black text-white">Featured Jerseys</h2>
            </div>
            <Link to="/products" className="hidden sm:flex items-center gap-2 text-sm font-black text-[#FFD700] hover:gap-3 transition-all">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {featured.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        </div>
      </section>

      {/* ── Limited drops ── */}
      {limited.length > 0 && (
        <section className="py-20 bg-[#050505] border-y border-[#111]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 rounded-xl bg-[#FFD700]/10 border border-[#FFD700]/30 flex items-center justify-center">
                <Zap className="w-5 h-5 text-[#FFD700]" />
              </div>
              <div>
                <p className="text-[10px] font-black text-[#ff6b6b] uppercase tracking-[0.25em]">Limited Stock</p>
                <h2 className="text-3xl sm:text-4xl font-black text-white">Drop Zone</h2>
              </div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {limited.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── Shop by nation ── */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[10px] font-black text-[#FFD700] uppercase tracking-[0.25em] mb-2 text-center">48 Nations</p>
          <h2 className="text-3xl sm:text-4xl font-black text-white text-center mb-12">Pick Your Nation</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {nations.map(n => (
              <Link key={n.n} to={`/products?team=${n.n}`}
                className="group rounded-2xl p-4 transition-all duration-300 hover:-translate-y-1"
                style={{ background: '#0a0a0a', border: '1px solid #1a1a1a' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = n.c + '55' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#1a1a1a' }}>
                <span className="text-3xl block mb-2">{n.f}</span>
                <p className="font-black text-white text-sm">{n.n}</p>
                <p className="text-[10px] text-[#555] font-semibold mt-0.5">{n.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── All jerseys ── */}
      <section className="py-20 bg-[#050505] border-t border-[#111]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <h2 className="text-3xl sm:text-4xl font-black text-white">Latest Arrivals</h2>
            <Link to="/products" className="btn-gold flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black">
              Shop All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {all.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        </div>
      </section>

      {/* ── World Cup odds ── */}
      <section className="py-16 border-t border-[#111]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[10px] font-black text-[#FFD700] uppercase tracking-[0.25em] mb-2 text-center">FIFA World Cup 2026</p>
          <h2 className="text-2xl sm:text-3xl font-black text-white text-center mb-8">Favourites to Win</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {wc2026Nations.map(n => (
              <Link key={n.name} to={`/products?team=${n.name}`}
                className="flex items-center justify-between rounded-xl px-4 py-3 transition-colors hover:bg-[#111]"
                style={{ background: '#0a0a0a', border: '1px solid #151515' }}>
                <span className="text-sm font-bold text-white">{n.flag} {n.name}</span>
                <span className="text-[10px] font-black text-[#FFD700]">{n.odds}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 100%, rgba(255,215,0,0.08) 0%, transparent 70%)' }} />
        <div className="relative max-w-2xl mx-auto px-4 text-center">
          <Crown className="w-10 h-10 text-[#FFD700] mx-auto mb-4" />
          <h2 className="text-3xl sm:text-5xl font-black text-white mb-4">Wear Your Nation&apos;s Colours</h2>
          <p className="text-[#666] mb-8">Order via WhatsApp · Cash on Delivery · Delivery across Nepal</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/products" className="btn-gold px-8 py-4 rounded-2xl font-black text-[15px]">
              Browse All Jerseys
            </Link>
            <a href="https://wa.me/9779747235169" target="_blank" rel="noreferrer"
              className="px-8 py-4 rounded-2xl font-black text-[15px]"
              style={{ background: 'rgba(37,211,102,0.08)', border: '1px solid rgba(37,211,102,0.3)', color: '#25D366' }}>
              📱 WhatsApp Order
            </a>
          </div>
        </div>
      </section>

    </div>
  )
}
