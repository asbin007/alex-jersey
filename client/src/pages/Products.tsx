import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, X, SlidersHorizontal, Loader2 } from 'lucide-react'
import { fetchProducts } from '@/services/productService'
import ProductCard from '@/components/products/ProductCard'
import type { Product } from '@/types'
import type { JerseyType, Size } from '@/types'

type Sort = 'newest' | 'price' | 'popular'

const nations = ['Argentina', 'Brazil', 'France', 'Portugal', 'Spain', 'England', 'Germany', 'Netherlands', 'Morocco', 'Colombia', 'USA']
const sizes: Size[] = ['S', 'M', 'L', 'XL', 'XXL']

export default function Products() {
  const [sp] = useSearchParams()

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)

  const [q, setQ] = useState(sp.get('search') || '')
  const [team, setTeam] = useState(sp.get('team') || '')
  const [size, setSize] = useState<Size | ''>('')
  const [type, setType] = useState<JerseyType | ''>('')
  const [maxP, setMaxP] = useState(5000)
  const [sort, setSort] = useState<Sort>('newest')
  const [showFilters, setShowFilters] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    fetchProducts({
      search: q || undefined,
      team: team || undefined,
      size: (size as Size) || undefined,
      jerseyType: (type as JerseyType) || undefined,
      priceMax: maxP < 5000 ? maxP : undefined,
      sortBy: sort,
      page: 1,
      limit: 50,
    })
      .then(result => {
        setProducts(result.data)
        setTotal(result.total)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [q, team, size, type, maxP, sort])

  // Debounce search
  useEffect(() => {
    const id = setTimeout(load, q ? 400 : 0)
    return () => clearTimeout(id)
  }, [load, q])

  const hasFilter = !!(q || team || type || size || maxP < 5000)
  const clear = () => { setQ(''); setTeam(''); setSize(''); setType(''); setMaxP(5000) }

  return (
    <div className="min-h-screen bg-black text-white pt-16">
      <div className="border-b border-[#111] bg-[#050505] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[11px] font-black text-[#FFD700] uppercase tracking-[0.25em] mb-2">FIFA World Cup 2026</p>
          <div className="flex items-end justify-between">
            <h1 className="text-4xl sm:text-5xl font-black text-white">All Jerseys</h1>
            <p className="text-[#444] font-bold">{loading ? '...' : `${total} found`}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search + sort */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#444]" />
            <input value={q} onChange={e => setQ(e.target.value)}
              placeholder="Search nation, player, edition..."
              className="w-full bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl pl-11 pr-10 py-3.5 text-sm text-white placeholder-[#444] focus:outline-none focus:border-[#FFD700]/50 transition-colors" />
            {q && <button onClick={() => setQ('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#444] hover:text-white"><X className="w-4 h-4" /></button>}
          </div>
          <select value={sort} onChange={e => setSort(e.target.value as Sort)}
            className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-[#FFD700]/50 cursor-pointer">
            <option value="newest">Newest</option>
            <option value="popular">Popular</option>
            <option value="price">Price ↑</option>
          </select>
          <button onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-3.5 rounded-xl border text-sm font-bold transition-all ${showFilters || hasFilter ? 'border-[#FFD700]/50 text-[#FFD700] bg-[#FFD700]/5' : 'border-[#1f1f1f] text-[#555] bg-[#0a0a0a] hover:border-[#333]'}`}>
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Filter</span>
            {hasFilter && <span className="w-2 h-2 bg-[#FFD700] rounded-full" />}
          </button>
        </div>

        {/* Nation pills */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide">
          {['All', ...nations].map(n => (
            <button key={n}
              onClick={() => setTeam(n === 'All' ? '' : (n === team ? '' : n))}
              className={`px-4 py-2 rounded-full text-xs font-black whitespace-nowrap flex-shrink-0 transition-all ${
                (n === 'All' && !team) || team === n
                  ? 'bg-[#FFD700] text-black shadow-[0_0_16px_rgba(255,215,0,0.4)]'
                  : 'bg-[#0a0a0a] border border-[#1a1a1a] text-[#666] hover:border-[#333] hover:text-white'
              }`}>
              {n}
            </button>
          ))}
        </div>

        <div className="flex gap-6">
          {/* Filters sidebar */}
          {showFilters && (
            <aside className="hidden lg:block w-52 flex-shrink-0">
              <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-5 sticky top-24">
                <div className="flex items-center justify-between mb-5">
                  <p className="font-black text-white text-sm">Filters</p>
                  {hasFilter && <button onClick={clear} className="text-xs text-[#FFD700] hover:underline flex items-center gap-1"><X className="w-3 h-3" /> Clear</button>}
                </div>

                <div className="mb-5">
                  <p className="text-[9px] font-black text-[#444] uppercase tracking-[0.2em] mb-3">Kit Type</p>
                  <div className="space-y-1">
                    {[{ v: '', l: 'All Kits' }, { v: 'home', l: 'Home' }, { v: 'away', l: 'Away' }, { v: 'third', l: 'Third' }].map(jt => (
                      <button key={jt.v} onClick={() => setType(jt.v as JerseyType | '')}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${type === jt.v ? 'text-[#FFD700] font-bold' : 'text-[#555] hover:text-white'}`}>
                        {jt.l}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-5">
                  <p className="text-[9px] font-black text-[#444] uppercase tracking-[0.2em] mb-3">Size</p>
                  <div className="grid grid-cols-5 gap-1.5">
                    {sizes.map(s => (
                      <button key={s} onClick={() => setSize(s === size ? '' : s)}
                        className={`h-9 rounded-lg border text-xs font-bold transition-all ${size === s ? 'border-[#FFD700] bg-[#FFD700]/10 text-[#FFD700]' : 'border-[#1a1a1a] text-[#555] hover:border-[#333]'}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[9px] font-black text-[#444] uppercase tracking-[0.2em] mb-1">
                    Max Price: <span className="text-[#FFD700]">Rs. {maxP.toLocaleString()}</span>
                  </p>
                  <input type="range" min={1000} max={5000} step={100} value={maxP}
                    onChange={e => setMaxP(Number(e.target.value))}
                    className="w-full mt-2 accent-[#FFD700]" />
                </div>
              </div>
            </aside>
          )}

          {/* Grid */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="flex justify-center py-24">
                <Loader2 className="w-10 h-10 animate-spin text-[#FFD700]" />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-24">
                <div className="text-5xl mb-4">⚽</div>
                <p className="text-2xl font-black text-white mb-2">No jerseys found</p>
                <p className="text-[#444] mb-6">Try different filters</p>
                <button onClick={clear} className="btn-gold px-6 py-2.5 rounded-xl font-bold">Clear Filters</button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map(p => <ProductCard key={p._id} product={p} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
