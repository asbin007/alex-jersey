import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, ShoppingCart, Check, Star, Zap, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { useCart } from '@/context/CartContext'
import ProductCard from '@/components/products/ProductCard'
import ProductReviews from '@/components/products/ProductReviews'
import { ProductDetailSkeleton } from '@/components/ui/skeleton'
import SEO from '@/components/SEO'
import StockUrgency from '@/components/marketing/StockUrgency'
import WishlistButton from '@/components/products/WishlistButton'
import WhatsAppShare from '@/components/marketing/WhatsAppShare'
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed'
import type { Size, Product } from '@/types'
import { fetchProduct, fetchRelatedProducts } from '@/services/productService'

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>()
  const { addToCart } = useCart()
  const { add: addRecent, items: recentItems } = useRecentlyViewed()

  const [product, setProduct] = useState<Product | undefined>(undefined)
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
    setProduct(undefined)
    setRelated([])
    setSelSize('')
    setCustName('')
    setCustNum('')
    setImgIdx(0)
    setSizeErr(false)
    setAdded(false)
    setLoading(true)

    fetchProduct(slug)
      .then(prod => {
        setProduct(prod)
        addRecent(prod)
        setLoading(false)
        fetchRelatedProducts(prod._id)
          .then(setRelated)
          .catch(console.error)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [slug])

  if (!product) {
    return (
      <div className="min-h-screen bg-black text-white pt-16">
        <div className="border-b border-[#0f0f0f] bg-[#050505] px-4 py-3">
          <div className="max-w-7xl mx-auto">
            <Link
              to="/products"
              className="inline-flex items-center gap-1.5 text-sm text-[#555] hover:text-[#FFD700] transition-colors font-semibold"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> All Jerseys
            </Link>
          </div>
        </div>
        {loading ? (
          <ProductDetailSkeleton />
        ) : (
          <div className="flex items-center justify-center py-32 px-4">
            <div className="text-center">
              <div className="text-6xl mb-4">😞</div>
              <p className="text-xl font-black text-white mb-3">Jersey not found</p>
              <Link to="/products" className="text-[#FFD700] hover:underline font-semibold">
                ← Back to Shop
              </Link>
            </div>
          </div>
        )}
      </div>
    )
  }

  const disc = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : null

  const handleAdd = () => {
    if (!selSize) { setSizeErr(true); return }
    setSizeErr(false)
    addToCart(product, selSize as Size, 1, custName || undefined, custNum || undefined)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const capType = product.jerseyType.charAt(0).toUpperCase() + product.jerseyType.slice(1)

  return (
    <div className="min-h-screen bg-black text-white pt-16">
      <SEO
        title={`${product.name} — ${product.team} ${capType} Kit`}
        description={`${product.description} Buy ${product.team} ${product.jerseyType} kit online in Nepal. Cash on Delivery available.`}
        keywords={`${product.name}, ${product.team} jersey, FIFA World Cup 2026, ${product.jerseyType} kit, football jersey Nepal, Cash on Delivery`}
        image={product.images[0]}
        url={`/products/${product.slug ?? ''}`}
        type="product"
        product={{
          name: product.name,
          description: product.description,
          price: product.price,
          currency: 'NPR',
          availability: product.sizes.some(s => s.stock > 0) ? 'in_stock' : 'out_of_stock',
          image: product.images[0],
          brand: product.team,
          rating: product.rating,
          reviewCount: product.reviewCount,
        }}
      />

      {/* Breadcrumb */}
      <div className="border-b border-[#0f0f0f] bg-[#050505] px-4 py-3">
        <div className="max-w-7xl mx-auto">
          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 text-sm text-[#555] hover:text-[#FFD700] transition-colors font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> All Jerseys
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-10 lg:gap-12 mb-14 sm:mb-20">

          {/* ── IMAGE PANEL ── */}
          <motion.div
            className="lg:sticky lg:top-24 lg:self-start"
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <div
              className="relative rounded-xl sm:rounded-2xl overflow-hidden bg-[#080808] border border-[#1a1a1a] group cursor-zoom-in"
              style={{ aspectRatio: '1' }}
            >
              <motion.img
                key={imgIdx}
                src={product.images[imgIdx]}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                onError={e => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=700&q=80'
                }}
              />

              {product.images.length > 1 && (
                <>
                  <button
                    onClick={() => setImgIdx(i => Math.max(0, i - 1))}
                    className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 bg-black/70 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-black transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setImgIdx(i => Math.min(product.images.length - 1, i + 1))}
                    className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 bg-black/70 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-black transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}

              <div className="absolute top-3 left-3 flex flex-col gap-2">
                {product.isLimitedDrop && (
                  <span className="tag-gold">
                    <Zap className="w-2.5 h-2.5 inline mr-1" />Limited
                  </span>
                )}
                {disc && <span className="tag-red">-{disc}%</span>}
              </div>
              <div className="absolute top-3 right-3">
                <WishlistButton productId={product._id} />
              </div>
            </div>

            {product.images.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIdx(i)}
                    className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                      imgIdx === i
                        ? 'border-[#FFD700]'
                        : 'border-[#1a1a1a] opacity-50 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* ── INFO PANEL ── */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
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
              {product.grade && (
                <span 
                  title={product.gradeDescription || (product.grade === 'A' ? 'Premium Quality - Perfect condition' : 'Slight Defects - Minor cosmetic imperfections')}
                  className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider cursor-help ${
                    product.grade === 'A'
                      ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                      : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                  }`}
                >
                  {product.grade} Grade
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight mb-4">
              {product.name}
            </h1>

            <div className="flex items-center gap-2 sm:gap-3 mb-5">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star
                    key={s}
                    className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                      s <= Math.round(product.rating)
                        ? 'fill-[#FFD700] text-[#FFD700]'
                        : 'fill-[#222] text-[#222]'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-bold text-white">{product.rating}</span>
              <span className="text-sm text-[#555]">({product.reviewCount} reviews)</span>
            </div>

            {/* Stock urgency */}
            <div className="mb-5">
              <StockUrgency
                stock={product.sizes.reduce((a, s) => a + s.stock, 0)}
                productId={product._id}
              />
            </div>

            <div className="flex flex-wrap items-baseline gap-2 sm:gap-3 pb-5 mb-5 border-b border-[#111]">
              <span className="text-3xl sm:text-4xl font-black gold-text">
                Rs. {product.price.toLocaleString()}
              </span>
              {product.compareAtPrice && (
                <>
                  <span className="text-lg sm:text-xl text-[#444] line-through">
                    Rs. {product.compareAtPrice.toLocaleString()}
                  </span>
                  <span className="tag-red">
                    Save Rs. {(product.compareAtPrice - product.price).toLocaleString()}
                  </span>
                </>
              )}
            </div>

            <p className="text-[#666] text-sm leading-relaxed mb-6 sm:mb-7 whitespace-pre-line">
              {product.description}
            </p>

            {product.grade && (
              <div className={`mb-6 p-4 rounded-xl border ${
                product.grade === 'A' ? 'bg-green-500/5 border-green-500/20' : 'bg-orange-500/5 border-orange-500/20'
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-black uppercase tracking-wider ${
                    product.grade === 'A' ? 'text-green-400' : 'text-orange-400'
                  }`}>
                    {product.grade} Grade Quality
                  </span>
                </div>
                <p className="text-xs text-[#888] leading-relaxed">
                  {product.gradeDescription || (product.grade === 'A' 
                    ? 'This is a premium quality jersey with no manufacturing defects. It features perfect stitching, material quality, and authentic design.' 
                    : 'This jersey has minor cosmetic defects or irregularities (like small stains or scuffs). It has no functional issues and is offered at a discounted price.')}
                </p>
              </div>
            )}

            {/* Size selector */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <p className="font-black text-white text-sm uppercase tracking-wider">Select Size</p>
                {sizeErr && (
                  <p className="text-xs text-red-400 font-bold animate-pulse">Please select a size</p>
                )}
              </div>
              <div className="flex gap-2 flex-wrap">
                {product.sizes.map(({ size, stock }) => (
                  <motion.button
                    key={size}
                    disabled={stock === 0}
                    onClick={() => { setSelSize(size as Size); setSizeErr(false) }}
                    whileTap={{ scale: stock > 0 ? 0.9 : 1 }}
                    className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl border-2 text-sm font-black transition-all ${
                      selSize === size
                        ? 'border-[#FFD700] bg-[#FFD700]/10 text-[#FFD700] shadow-[0_0_16px_rgba(255,215,0,0.3)]'
                        : stock === 0
                        ? 'border-[#111] text-[#333] cursor-not-allowed line-through'
                        : 'border-[#222] text-[#888] hover:border-[#444] hover:text-white'
                    }`}
                  >
                    {size}
                  </motion.button>
                ))}
              </div>
              {selSize && (
                <p className="text-xs text-[#555] mt-2">
                  {product.sizes.find(s => s.size === selSize)?.stock} in stock
                </p>
              )}
            </div>

            {/* Customisation */}
            {product.allowCustomization && (
              <div className="bg-[#080808] border border-[#1a1a1a] rounded-xl sm:rounded-2xl p-4 sm:p-5 mb-6">
                <p className="font-black text-white text-sm mb-1">✏️ Custom Name &amp; Number</p>
                <p className="text-xs text-[#555] mb-4">
                  Optional — print your name or favourite player on the jersey
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-black text-[#444] uppercase tracking-[0.2em] mb-2">
                      Name
                    </label>
                    <input
                      value={custName}
                      onChange={e => setCustName(e.target.value.toUpperCase().slice(0, 12))}
                      placeholder="MESSI"
                      className="w-full bg-black border border-[#1f1f1f] rounded-xl px-3 py-2.5 text-sm font-black text-white placeholder-[#333] focus:outline-none focus:border-[#FFD700]/50 uppercase tracking-widest text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-[#444] uppercase tracking-[0.2em] mb-2">
                      Number
                    </label>
                    <input
                      value={custNum}
                      onChange={e => setCustNum(e.target.value.replace(/\D/g, '').slice(0, 2))}
                      placeholder="10"
                      className="w-full bg-black border border-[#1f1f1f] rounded-xl px-3 py-2.5 text-2xl font-black text-white placeholder-[#333] focus:outline-none focus:border-[#FFD700]/50 text-center"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Add to cart */}
            <motion.button
              onClick={handleAdd}
              whileTap={{ scale: 0.97 }}
              className={`w-full flex items-center justify-center gap-3 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-black text-base transition-all duration-300 mb-3 sm:mb-4 ${
                added
                  ? 'bg-green-500 text-white shadow-[0_0_30px_rgba(34,197,94,0.4)]'
                  : 'btn-gold shadow-[0_0_30px_rgba(255,215,0,0.2)] hover:shadow-[0_0_50px_rgba(255,215,0,0.5)]'
              }`}
            >
              {added ? (
                <><Check className="w-5 h-5" /> Added to Cart!</>
              ) : (
                <><ShoppingCart className="w-5 h-5" /> Add to Cart</>
              )}
            </motion.button>

            {/* WhatsApp CTA */}
            <a
              href={`https://wa.me/9779747235169?text=Hi, I want to order ${encodeURIComponent(product.name)}`}
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-black text-base bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] hover:bg-[#25D366]/20 transition-all mb-5"
            >
              📱 Order via WhatsApp
            </a>

            {/* Trust pills */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { e: '💵', t: 'Cash on Delivery' },
                { e: '🚚', t: 'Nepal-wide' },
                { e: '📱', t: 'WhatsApp confirm' },
              ].map(item => (
                <div
                  key={item.t}
                  className="flex flex-col items-center gap-1 p-2.5 sm:p-3 bg-[#080808] border border-[#1a1a1a] rounded-xl text-center"
                >
                  <span className="text-lg sm:text-xl">{item.e}</span>
                  <p className="text-[9px] sm:text-[10px] font-bold text-[#555] leading-tight">{item.t}</p>
                </div>
              ))}
            </div>

            {/* WhatsApp Share */}
            <div className="mt-4">
              <WhatsAppShare
                productName={product.name}
                productUrl={`https://alexjersey.com.np/products/${product.slug}`}
                price={product.price}
              />
            </div>
          </motion.div>
        </div>

        {/* Reviews */}
        <ProductReviews
          productId={product._id}
          productRating={product.rating}
          reviewCount={product.reviewCount}
        />

        {/* Related products */}
        {related.length > 0 && (
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white mb-5 sm:mb-6">
              More from {product.team}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {related.map(p => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </div>
        )}

        {/* Recently viewed */}
        {recentItems.filter(p => p._id !== product._id).length > 0 && (
          <div className="mt-14 sm:mt-20">
            <h2 className="text-xl sm:text-2xl font-black text-white mb-5 sm:mb-6">
              Recently Viewed
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {recentItems.filter(p => p._id !== product._id).slice(0, 4).map(p => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
