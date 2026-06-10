import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, ShoppingCart, Check, Star, Zap, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import ProductCard from '@/components/products/ProductCard'
import type { Size, Product, Review } from '@/types'
import { fetchProduct, fetchRelatedProducts, fetchProductReviews } from '@/services/productService'
import { normalizeReview } from '@/lib/normalize'

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>()
  const { addToCart } = useCart()

  const [product, setProduct] = useState<Product | undefined>(undefined)
  const [reviews, setReviews] = useState<Review[]>([])
  const [related, setRelated] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const [selSize, setSelSize] = useState<Size | ''>('')
  const [custName, setCustName] = useState('')
  const [custNum, setCustNum] = useState('')
  const [imgIdx, setImgIdx] = useState(0)
  const [added, setAdded] = useState(false)
  const [sizeErr, setSizeErr] = useState(false)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    fetchProduct(slug)
      .then(async prod => {
        setProduct(prod)
        setLoading(false)
        // Load reviews and related in parallel
        fetchProductReviews(prod._id)
          .then((revs: unknown[]) => setReviews(
            revs.map(r => normalizeReview(r as Record<string, unknown>)).filter(r => r.isApproved)
          ))
          .catch(console.error)
        fetchRelatedProducts(prod._id)
          .then(setRelated)
          .catch(console.error)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [slug])

  if (!product) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      {loading ? (
        <Loader2 className="w-10 h-10 animate-spin text-[#FFD700]" />
      ) : (
        <div className="text-center">
          <div className="text-6xl mb-4">😞</div>
          <p className="text-xl font-black text-white mb-3">Jersey not found</p>
          <Link to="/products" className="text-[#FFD700] hover:underline">← Back to Shop</Link>
        </div>
      )}
    </div>
  )

  const disc = product.compareAtPrice ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100) : null

  const handleAdd = () => {
    if (!selSize) { setSizeErr(true); return }
    setSizeErr(false)
    addToCart(product, selSize as Size, 1, custName || undefined, custNum || undefined)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="min-h-screen bg-black text-white pt-16">

      {/* Breadcrumb */}
      <div className="border-b border-[#0f0f0f] bg-[#050505] px-4 py-3">
        <div className="max-w-7xl mx-auto">
          <Link to="/products" className="inline-flex items-center gap-1.5 text-sm text-[#555] hover:text-[#FFD700] transition-colors font-semibold">
            <ArrowLeft className="w-3.5 h-3.5" /> All Jerseys
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid lg:grid-cols-2 gap-12 mb-20">

          {/* ── IMAGE ── */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="relative rounded-2xl overflow-hidden bg-[#080808] border border-[#1a1a1a] group" style={{ aspectRatio: '1' }}>
              <img src={product.images[imgIdx]} alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=700&q=80' }} />

              {product.images.length > 1 && (
                <>
                  <button onClick={() => setImgIdx(i => Math.max(0, i - 1))}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/70 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-black transition-colors opacity-0 group-hover:opacity-100">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button onClick={() => setImgIdx(i => Math.min(product.images.length - 1, i + 1))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/70 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-black transition-colors opacity-0 group-hover:opacity-100">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}

              <div className="absolute top-3 left-3 flex flex-col gap-2">
                {product.isLimitedDrop && <span className="tag-gold"><Zap className="w-2.5 h-2.5 inline mr-1" />Limited</span>}
                {disc && <span className="tag-red">-{disc}%</span>}
              </div>
            </div>

            {product.images.length > 1 && (
              <div className="flex gap-2 mt-3">
                {product.images.map((img, i) => (
                  <button key={i} onClick={() => setImgIdx(i)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${imgIdx === i ? 'border-[#FFD700]' : 'border-[#1a1a1a] opacity-50 hover:opacity-100'}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── INFO ── */}
          <div>
            {/* Team badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="tag-gold">{product.team}</span>
              <span className="text-[10px] font-bold px-3 py-1 bg-[#111] border border-[#1f1f1f] rounded-full text-[#555] uppercase tracking-wider capitalize">
                {product.jerseyType} Kit
              </span>
              {product.player && (
                <span className="text-[10px] font-bold px-3 py-1 bg-[#111] border border-[#1f1f1f] rounded-full text-[#555] uppercase tracking-wider">
                  {product.player}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight mb-4">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} className={`w-4 h-4 ${s <= Math.round(product.rating) ? 'fill-[#FFD700] text-[#FFD700]' : 'fill-[#222] text-[#222]'}`} />
                ))}
              </div>
              <span className="text-sm font-bold text-white">{product.rating}</span>
              <span className="text-sm text-[#555]">({product.reviewCount} reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 pb-5 mb-5 border-b border-[#111]">
              <span className="text-4xl font-black gold-text">Rs. {product.price.toLocaleString()}</span>
              {product.compareAtPrice && (
                <>
                  <span className="text-xl text-[#444] line-through">Rs. {product.compareAtPrice.toLocaleString()}</span>
                  <span className="tag-red">Save Rs. {(product.compareAtPrice - product.price).toLocaleString()}</span>
                </>
              )}
            </div>

            <p className="text-[#666] text-sm leading-relaxed mb-7">{product.description}</p>

            {/* Size */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <p className="font-black text-white text-sm uppercase tracking-wider">Select Size</p>
                {sizeErr && <p className="text-xs text-red-400 font-bold">Please select a size</p>}
              </div>
              <div className="flex gap-2 flex-wrap">
                {product.sizes.map(({ size, stock }) => (
                  <button key={size} disabled={stock === 0}
                    onClick={() => { setSelSize(size as Size); setSizeErr(false) }}
                    className={`w-12 h-12 rounded-xl border-2 text-sm font-black transition-all ${
                      selSize === size ? 'border-[#FFD700] bg-[#FFD700]/10 text-[#FFD700] shadow-[0_0_16px_rgba(255,215,0,0.3)]'
                        : stock === 0 ? 'border-[#111] text-[#333] cursor-not-allowed line-through'
                        : 'border-[#222] text-[#888] hover:border-[#444] hover:text-white'
                    }`}>
                    {size}
                  </button>
                ))}
              </div>
              {selSize && <p className="text-xs text-[#555] mt-2">{product.sizes.find(s => s.size === selSize)?.stock} in stock</p>}
            </div>

            {/* Custom */}
            {product.allowCustomization && (
              <div className="bg-[#080808] border border-[#1a1a1a] rounded-2xl p-5 mb-6">
                <p className="font-black text-white text-sm mb-1">✏️ Custom Name & Number</p>
                <p className="text-xs text-[#555] mb-4">Optional — print your name or favourite player on the jersey</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-black text-[#444] uppercase tracking-[0.2em] mb-2">Name</label>
                    <input value={custName} onChange={e => setCustName(e.target.value.toUpperCase().slice(0, 12))}
                      placeholder="MESSI"
                      className="w-full bg-black border border-[#1f1f1f] rounded-xl px-3 py-2.5 text-sm font-black text-white placeholder-[#333] focus:outline-none focus:border-[#FFD700]/50 uppercase tracking-widest text-center" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-[#444] uppercase tracking-[0.2em] mb-2">Number</label>
                    <input value={custNum} onChange={e => setCustNum(e.target.value.replace(/\D/g, '').slice(0, 2))}
                      placeholder="10"
                      className="w-full bg-black border border-[#1f1f1f] rounded-xl px-3 py-2.5 text-2xl font-black text-white placeholder-[#333] focus:outline-none focus:border-[#FFD700]/50 text-center" />
                  </div>
                </div>
              </div>
            )}

            {/* Add to cart */}
            <button onClick={handleAdd}
              className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-base transition-all duration-300 mb-4 ${
                added ? 'bg-green-500 text-white shadow-[0_0_30px_rgba(34,197,94,0.4)]'
                  : 'btn-gold shadow-[0_0_30px_rgba(255,215,0,0.2)] hover:shadow-[0_0_50px_rgba(255,215,0,0.5)]'
              }`}>
              {added ? <><Check className="w-5 h-5" /> Added to Cart!</> : <><ShoppingCart className="w-5 h-5" /> Add to Cart</>}
            </button>

            {/* WhatsApp direct */}
            <a href={`https://wa.me/9779747235169?text=Hi, I want to order ${encodeURIComponent(product.name)}`}
              target="_blank" rel="noreferrer"
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-base bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] hover:bg-[#25D366]/20 transition-all mb-5">
              📱 Order via WhatsApp
            </a>

            {/* Trust row */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { e: '💵', t: 'Cash on Delivery' },
                { e: '🚚', t: 'Nepal-wide' },
                { e: '📱', t: 'WhatsApp confirm' },
              ].map(item => (
                <div key={item.t} className="flex flex-col items-center gap-1 p-3 bg-[#080808] border border-[#1a1a1a] rounded-xl text-center">
                  <span className="text-xl">{item.e}</span>
                  <p className="text-[10px] font-bold text-[#555] leading-tight">{item.t}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews */}
        {reviews.length > 0 && (
          <div className="mb-20">
            <h2 className="text-2xl font-black text-white mb-6">
              Reviews <span className="text-[#444] font-bold text-lg">({reviews.length})</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {reviews.map(r => (
                <div key={r._id} className="bg-[#080808] border border-[#1a1a1a] rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(s => <Star key={s} className={`w-3.5 h-3.5 ${s <= r.rating ? 'fill-[#FFD700] text-[#FFD700]' : 'fill-[#1a1a1a] text-[#1a1a1a]'}`} />)}
                    </div>
                    {r.isVerifiedPurchase && <span className="tag-gold text-[9px]">✓ Verified</span>}
                  </div>
                  <p className="text-sm text-[#777] leading-relaxed mb-3">"{r.comment}"</p>
                  <p className="text-xs text-[#444]">{new Date(r.createdAt).toLocaleDateString('en-NP', { month: 'short', year: 'numeric', day: 'numeric' })}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related */}
        {related.length > 0 && (
          <div>
            <h2 className="text-2xl font-black text-white mb-6">More from {product.team}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
