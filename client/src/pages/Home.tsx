import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Crown, Zap, ShoppingCart } from 'lucide-react'
import { wc2026Nations } from '@/data/mockData'
import { fetchProducts } from '@/services/productService'
import ProductCard from '@/components/products/ProductCard'
import type { Product } from '@/types'

/* ─── Live countdown ─── */
function useCountdown() {
  const target = new Date('2026-06-11T00:00:00Z').getTime()
  const calc = () => {
    const diff = Math.max(0, target - Date.now())
    return {
      d: Math.floor(diff / 86400000),
      h: Math.floor((diff % 86400000) / 3600000),
      m: Math.floor((diff % 3600000) / 60000),
      s: Math.floor((diff % 60000) / 1000),
    }
  }
  const [val, setVal] = useState(calc)
  useEffect(() => {
    const id = setInterval(() => setVal(calc()), 1000)
    return () => clearInterval(id)
  }, []) // eslint-disable-line
  return val
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

const marqItems = [
  '🏆 FIFA WORLD CUP 2026', '🇦🇷 ARGENTINA', '🇧🇷 BRAZIL', '🇫🇷 FRANCE',
  '🇵🇹 PORTUGAL', '🇪🇸 SPAIN', '⚽ ALL NATIONS', '🚚 DELIVERY ALL NEPAL',
  '💵 CASH ON DELIVERY', '📱 WHATSAPP ORDER', '👑 ALEX JERSEY SHOP',
]

export default function Home() {
  const { d, h, m, s } = useCountdown()

  const [featured, setFeatured] = useState<Product[]>([])
  const [limited, setLimited] = useState<Product[]>([])
  const [all, setAll] = useState<Product[]>([])

  useEffect(() => {
    fetchProducts({ isFeatured: true, limit: 4 })
      .then(res => setFeatured(res.data))
      .catch(console.error)

    fetchProducts({ isLimitedDrop: true, limit: 8 })
      .then(res => setLimited(res.data))
      .catch(console.error)

    fetchProducts({ limit: 8 })
      .then(res => setAll(res.data))
      .catch(console.error)
  }, [])

  return (
    <div className="min-h-screen bg-black text-white">

      {/* ══════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden" style={{ minHeight: '100svh' }}>

        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=1800&q=85"
            alt=""
            className="w-full h-full object-cover object-center"
            style={{ filter: 'brightness(0.28) saturate(0.6)' }}
          />
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 100% 100% at 50% 0%, transparent 30%, rgba(0,0,0,0.7) 100%)' }} />
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 50% 80% at 0% 50%, rgba(255,215,0,0.07) 0%, transparent 60%)' }} />
          <div className="absolute bottom-0 inset-x-0 h-48" style={{ background: 'linear-gradient(to top, #000 0%, transparent 100%)' }} />
        </div>

        <div className="absolute top-16 inset-x-0 h-px" style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,215,0,0.5) 30%, rgba(255,215,0,0.8) 50%, rgba(255,215,0,0.5) 70%, transparent 100%)' }} />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16"
          style={{ minHeight: '100svh', display: 'grid', gridTemplateRows: '1fr auto', alignItems: 'stretch' }}>

          <div className="grid lg:grid-cols-[1fr_420px] xl:grid-cols-[1fr_500px] gap-0 items-center py-16">

            {/* LEFT: Copy */}
            <div className="flex flex-col justify-center lg:pr-16">
              <div className="fade-up delay-1 flex items-center gap-3 mb-7">
                <div className="h-px w-8" style={{ background: '#FFD700' }} />
                <span className="text-[11px] font-black text-[#FFD700] uppercase tracking-[0.3em]">
                  Alex Jersey Shop · Nepal
                </span>
              </div>

              <h1 className="fade-up delay-2 font-black tracking-tight leading-none mb-6"
                style={{ fontSize: 'clamp(3.2rem, 9.5vw, 8rem)' }}>
                <span className="block text-white">WEAR</span>
                <span className="block text-white">YOUR</span>
                <span className="block" style={{
                  background: 'linear-gradient(100deg, #ffe566 0%, #FFD700 40%, #e6a800 80%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>PRIDE.</span>
              </h1>

              <p className="fade-up delay-3 font-black uppercase tracking-[0.08em] mb-3"
                style={{ fontSize: 'clamp(0.9rem, 2.5vw, 1.5rem)', color: '#333' }}>
                LIVE THE GAME.
              </p>

              <p className="fade-up delay-3 text-[#777] leading-relaxed mb-10 max-w-md"
                style={{ fontSize: 'clamp(0.9rem, 1.8vw, 1.1rem)' }}>
                Official FIFA World Cup 2026 jerseys for every nation.
                Delivered across Nepal — Cash on Delivery, WhatsApp confirmed.
              </p>

              <div className="fade-up delay-4 flex flex-wrap gap-3 mb-12">
                <Link to="/products"
                  className="btn-gold flex items-center gap-2.5 rounded-2xl font-black"
                  style={{ padding: '14px 28px', fontSize: '15px' }}>
                  <ShoppingCart className="w-5 h-5" />
                  Shop All Jerseys
                </Link>
                <a href="https://wa.me/9779747235169" target="_blank" rel="noreferrer"
                  className="flex items-center gap-2.5 rounded-2xl font-black transition-all"
                  style={{ padding: '14px 28px', fontSize: '15px', background: 'rgba(37,211,102,0.07)', border: '1px solid rgba(37,211,102,0.35)', color: '#25D366' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(37,211,102,0.15)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(37,211,102,0.07)' }}>
                  📱 Order on WhatsApp
                </a>
              </div>

              <div className="fade-up delay-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-px flex-1 max-w-[40px]" style={{ background: '#222' }} />
                  <p className="text-[10px] font-black text-[#444] uppercase tracking-[0.3em]">World Cup Kicks Off</p>
                  <div className="h-px flex-1 max-w-[40px]" style={{ background: '#222' }} />
                </div>
                <div className="flex items-end gap-2 sm:gap-3">
                  <Pad v={d} label="Days" />
                  <span className="font-black text-[#2a2a2a] mb-4 text-xl">:</span>
                  <Pad v={h} label="Hours" />
                  <span className="font-black text-[#2a2a2a] mb-4 text-xl">:</span>
                  <Pad v={m} label="Mins" />
                  <span className="font-black text-[#2a2a2a] mb-4 text-xl">:</span>
                  <Pad v={s} label="Secs" />
                </div>
              </div>
            </div>

            {/* RIGHT: Jersey product wall */}
            {all.length > 0 && (
              <div className="hidden lg:block relative">
                <div className="absolute inset-0 pointer-events-none"
                  style={{ background: 'radial-gradient(ellipse 80% 80% at 50% 50%, rgba(255,200,0,0.1) 0%, transparent 70%)' }} />

                <div className="relative grid grid-cols-2 gap-3 p-4">
                  {all.slice(0, 6).map((product, i) => (
                    <Link key={product._id} to={`/products/${product.slug}`}
                      className="group relative rounded-xl overflow-hidden transition-all duration-500"
                      style={{
                        aspectRatio: '3/4',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        transform: i % 2 === 0 ? 'translateY(0px)' : 'translateY(16px)',
                      }}>
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=300&q=80' }}
                      />
                      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)' }} />
                      <div className="absolute bottom-0 inset-x-0 p-2.5">
                        <p className="text-[9px] font-black text-[#FFD700] uppercase tracking-[0.15em]">{product.team}</p>
                        <p className="text-xs font-bold text-white leading-tight">Rs. {product.price.toLocaleString()}</p>
                      </div>
                      {product.isLimitedDrop && (
                        <div className="absolute top-2 left-2">
                          <span className="text-[8px] font-black bg-[#FFD700] text-black px-1.5 py-0.5 rounded-md">LIMITED</span>
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ background: 'rgba(0,0,0,0.4)' }}>
                        <span className="text-[11px] font-black bg-[#FFD700] text-black px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                          <ShoppingCart className="w-3 h-3" /> View
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>

                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap"
                  style={{ background: 'rgba(255,59,59,0.12)', border: '1px solid rgba(255,59,59,0.3)', borderRadius: 100, padding: '5px 14px' }}>
                  <span className="text-[10px] font-black text-[#ff6b6b] uppercase tracking-widest">🔥 Selling Fast — Limited Stock</span>
                </div>
              </div>
            )}
          </div>

          {/* Stats bar */}
          <div className="fade-up delay-5 border-t pb-8 pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4"
            style={{ borderColor: '#111' }}>
            {[
              { v: '48', l: 'Nations', e: '🌍' },
              { v: '500+', l: 'Jerseys Sold', e: '👕' },
              { v: 'COD', l: 'Cash on Delivery', e: '💵' },
              { v: '2-3 Days', l: 'Nepal Delivery', e: '🚚' },
            ].map(stat => (
              <div key={stat.l} className="flex items-center gap-3">
                <span className="text-2xl">{stat.e}</span>
                <div>
                  <p className="font-black text-white leading-none" style={{ fontSize: 'clamp(1rem,2.5vw,1.5rem)' }}>{stat.v}</p>
                  <p className="text-[#444] text-[11px] font-semibold">{stat.l}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Marquee */}
      <div className="border-y border-[#111] bg-[#050505] py-3 overflow-hidden">
        <div className="marquee-inner">
          {[...marqItems, ...marqItems].map((item, i) => (
            <span key={i} className="text-[11px] font-black text-[#444] uppercase tracking-[0.2em] px-8 whitespace-nowrap">
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Featured Jerseys */}
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
          {featured.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {featured.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl animate-pulse" style={{ aspectRatio: '3/4' }} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Limited Drops */}
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

      {/* Shop by Nation */}
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

      {/* Latest Arrivals */}
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

      {/* World Cup Favourites */}
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

      {/* Final CTA */}
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
          <div className="mt-8 flex justify-center gap-6">
            <div className="text-center">
              <p className="font-black text-white">9747235169</p>
              <p className="text-xs text-[#555]">Call / WhatsApp</p>
            </div>
            <div className="w-px bg-[#1a1a1a]" />
            <div className="text-center">
              <p className="font-black text-white">9864227012</p>
              <p className="text-xs text-[#555]">Call / WhatsApp</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
