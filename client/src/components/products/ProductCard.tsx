import { Link } from 'react-router-dom'
import { ShoppingCart, Star, Check } from 'lucide-react'
import { useState } from 'react'
import type { Product } from '@/types'
import { useCart } from '@/context/CartContext'

interface Props { product: Product }

export default function ProductCard({ product }: Props) {
  const { addToCart } = useCart()
  const [added, setAdded] = useState(false)

  const avail = product.sizes.filter(s => s.stock > 0)
  const stock = product.sizes.reduce((a, s) => a + s.stock, 0)
  const disc = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : null

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation()
    if (!avail[0]) return
    addToCart(product, avail[0].size)
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
  }

  return (
    <Link to={`/products/${product.slug}`} className="group block">
      <div className="card-dark rounded-2xl overflow-hidden">

        {/* Image */}
        <div className="relative overflow-hidden bg-[#0d0d0d]" style={{ aspectRatio: '3/4' }}>
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
            onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=500&q=80' }}
          />

          {/* Dark gradient bottom */}
          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

          {/* Top badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.isLimitedDrop && (
              <span className="tag-gold">⚡ Limited</span>
            )}
            {disc && (
              <span className="tag-red">-{disc}%</span>
            )}
            {stock > 0 && stock <= 5 && !product.isLimitedDrop && (
              <span className="tag-red">Only {stock} left</span>
            )}
          </div>

          {/* Team + rating overlay */}
          <div className="absolute bottom-0 inset-x-0 p-3">
            <p className="text-[10px] font-black text-[#FFD700] uppercase tracking-widest mb-0.5">
              {product.team}
            </p>
            <h3 className="text-sm font-black text-white leading-snug line-clamp-1">
              {product.name}
            </h3>
            <div className="flex items-center justify-between mt-1.5">
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-[#FFD700] text-[#FFD700]" />
                <span className="text-[11px] text-[#aaa]">{product.rating} ({product.reviewCount})</span>
              </div>
              <span className="text-sm font-black text-white">Rs. {product.price.toLocaleString()}</span>
            </div>
          </div>

          {/* Quick Add — hover */}
          {avail.length > 0 ? (
            <button onClick={handleAdd}
              className={`absolute right-3 bottom-3 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 ${
                added ? 'bg-green-500 shadow-[0_0_16px_rgba(34,197,94,0.5)]' : 'btn-gold'
              }`}>
              {added ? <Check className="w-4 h-4 text-white" /> : <ShoppingCart className="w-4 h-4 text-black" />}
            </button>
          ) : (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-sm font-black text-[#555] tracking-wider">SOLD OUT</span>
            </div>
          )}
        </div>

        {/* Bottom info */}
        <div className="px-3 py-2.5 flex items-center justify-between">
          <div className="flex gap-1 flex-wrap">
            {product.sizes.slice(0, 4).map(s => (
              <span key={s.size}
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                  s.stock > 0 ? 'border-[#2a2a2a] text-[#666]' : 'border-[#1a1a1a] text-[#333] line-through'
                }`}>
                {s.size}
              </span>
            ))}
          </div>
          {product.compareAtPrice && (
            <span className="text-xs text-[#555] line-through">
              Rs. {product.compareAtPrice.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
