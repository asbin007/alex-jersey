import { Link } from 'react-router-dom'
import { ShoppingCart, Star, Check } from 'lucide-react'
import { useState } from 'react'
import { motion } from 'framer-motion'
import type { Product } from '@/types'
import { useCart } from '@/context/CartContext'

interface Props { product: Product }

const kitLabels: Record<string, string> = {
  home: 'Home',
  away: 'Away',
  third: 'Third',
  retro: 'Retro',
  custom: 'Custom',
}

export default function ProductCard({ product }: Props) {
  const { addToCart } = useCart()
  const [added, setAdded] = useState(false)

  const avail = product.sizes.filter(s => s.stock > 0)
  const stock = product.sizes.reduce((a, s) => a + s.stock, 0)
  const disc = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : null

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (added || !avail[0]) return
    addToCart(product, avail[0].size)
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      <Link to={`/products/${product.slug}`} className="group block">
        <div className="card-dark overflow-hidden rounded-xl sm:rounded-2xl">

          <div className="product-shine relative overflow-hidden bg-[#0d0d0d]" style={{ aspectRatio: '3/4' }}>
            <motion.img
              src={product.images[0]}
              alt={product.name}
              className="h-full w-full object-cover"
              loading="lazy"
              onError={e => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=500&q=80'
              }}
              whileHover={{ scale: 1.06 }}
              transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            />

            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black via-black/50 to-transparent" />
            <div className="absolute inset-0 ring-0 ring-[#FFD700]/0 transition-all duration-300 group-hover:ring-1 group-hover:ring-inset group-hover:ring-[#FFD700]/25" />

            <div className="absolute left-2 top-2 flex flex-col gap-1 sm:left-2.5 sm:top-2.5">
              {product.isLimitedDrop && <span className="tag-gold text-[9px]">⚡ Limited</span>}
              {disc && <span className="tag-red text-[9px]">-{disc}%</span>}
              {stock > 0 && stock <= 5 && !product.isLimitedDrop && (
                <span className="tag-red text-[9px]">Only {stock} left</span>
              )}
              {product.grade && (
                <span 
                  title={product.gradeDescription || (product.grade === 'A' ? 'Premium Quality - Perfect condition' : 'Slight Defects - Minor cosmetic imperfections')}
                  className={`text-[9px] font-black uppercase tracking-wider ${
                  product.grade === 'A'
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                } rounded px-1.5 py-0.5 backdrop-blur-sm cursor-help`}>
                  {product.grade} Grade
                </span>
              )}
            </div>

            <span className="absolute right-2 top-2 rounded-md border border-white/10 bg-black/60 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider text-[#aaa] backdrop-blur-sm sm:right-2.5 sm:top-2.5 sm:text-[9px]">
              {kitLabels[product.jerseyType] ?? product.jerseyType}
            </span>

            <div className="absolute inset-x-0 bottom-0 p-2.5 sm:p-3">
              <p className="mb-0.5 truncate text-[9px] font-black uppercase tracking-widest text-[#FFD700] sm:text-[10px]">
                {product.team}
              </p>
              <h3 className="line-clamp-1 text-xs font-black leading-snug text-white sm:text-sm">
                {product.name}
              </h3>
              <div className="mt-1.5 flex items-center justify-between">
                <div className="flex items-center gap-0.5 sm:gap-1">
                  <Star className="h-2.5 w-2.5 fill-[#FFD700] text-[#FFD700] sm:h-3 sm:w-3" />
                  <span className="text-[10px] text-[#aaa] sm:text-[11px]">
                    {product.rating}
                    <span className="hidden sm:inline"> ({product.reviewCount})</span>
                  </span>
                </div>
                <span className="text-xs font-black text-white sm:text-sm">
                  Rs.{product.price.toLocaleString()}
                </span>
              </div>
            </div>

            {avail.length > 0 ? (
              <motion.button
                onClick={handleAdd}
                aria-label="Add to cart"
                whileTap={{ scale: 0.9 }}
                className={`absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-lg transition-colors duration-200 sm:bottom-3 sm:right-3 sm:h-9 sm:w-9 sm:rounded-xl sm:translate-y-2 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100 ${
                  added
                    ? 'bg-green-500 shadow-[0_0_16px_rgba(34,197,94,0.5)]'
                    : 'btn-gold'
                }`}
              >
                {added
                  ? <Check className="h-3.5 w-3.5 text-white sm:h-4 sm:w-4" />
                  : <ShoppingCart className="h-3.5 w-3.5 text-black sm:h-4 sm:w-4" />
                }
              </motion.button>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-black/65 backdrop-blur-[2px]">
                <span className="rounded-full border border-[#333] px-3 py-1 text-xs font-black tracking-wider text-[#666]">
                  SOLD OUT
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-2 px-2.5 py-2 sm:px-3">
            <div className="flex min-w-0 flex-wrap gap-1">
              {product.sizes.slice(0, 4).map(s => (
                <span
                  key={s.size}
                  className={`rounded border px-1 py-0.5 text-[9px] font-bold sm:px-1.5 ${
                    s.stock > 0
                      ? 'border-[#2a2a2a] text-[#666]'
                      : 'border-[#1a1a1a] text-[#333] line-through'
                  }`}
                >
                  {s.size}
                </span>
              ))}
            </div>
            {product.compareAtPrice && (
              <span className="shrink-0 text-[10px] text-[#555] line-through sm:text-xs">
                Rs.{product.compareAtPrice.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
