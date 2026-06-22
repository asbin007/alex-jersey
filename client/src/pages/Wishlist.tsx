import { Heart, ShoppingBag } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useWishlist } from '@/context/WishlistContext'
import ProductCard from '@/components/products/ProductCard'
import SEO from '@/components/SEO'

export default function Wishlist() {
  const { items, loading } = useWishlist()

  return (
    <>
      <SEO title="Wishlist" description="Your saved jerseys" url="/wishlist" />
      <div className="min-h-screen bg-black text-white pt-16">
        <div className="border-b border-[#111] bg-[#050505] py-8 sm:py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-[11px] font-black text-[#FFD700] uppercase tracking-[0.25em] mb-2">
              Your Collection
            </p>
            <h1 className="font-display text-3xl font-black text-white sm:text-4xl">
              Wishlist
            </h1>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-80 rounded-2xl bg-[#0a0a0a] animate-pulse" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-20 sm:py-28">
              <Heart className="w-12 h-12 text-[#222] mx-auto mb-4" />
              <p className="text-xl font-black text-white mb-2">Your wishlist is empty</p>
              <p className="text-[#444] mb-6 text-sm">
                Save jerseys you love by tapping the heart icon
              </p>
              <Link
                to="/products"
                className="btn-gold px-6 py-3 rounded-xl font-bold text-sm inline-flex items-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" /> Browse Jerseys
              </Link>
            </div>
          ) : (
            <>
              <p className="text-sm text-[#555] mb-5 font-semibold">
                {items.length} {items.length === 1 ? 'jersey' : 'jerseys'} saved
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {items.map(p => <ProductCard key={p._id} product={p} />)}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
