import { Heart } from 'lucide-react'
import { motion } from 'framer-motion'
import { useWishlist } from '@/context/WishlistContext'
import { useAuth } from '@/context/AuthContext'
import { useNavigate } from 'react-router-dom'

interface Props {
  productId: string
  className?: string
  size?: 'sm' | 'md'
}

export default function WishlistButton({ productId, className = '', size = 'md' }: Props) {
  const { isInWishlist, toggle } = useWishlist()
  const { token } = useAuth()
  const navigate = useNavigate()
  const active = isInWishlist(productId)

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!token) { navigate('/login'); return }
    await toggle(productId)
  }

  const s = size === 'sm' ? 'h-7 w-7' : 'h-9 w-9'
  const icon = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'

  return (
    <motion.button
      onClick={handleClick}
      whileTap={{ scale: 0.85 }}
      className={`${s} flex items-center justify-center rounded-lg border transition-colors ${
        active
          ? 'border-red-500/40 bg-red-500/10 text-red-400'
          : 'border-[#222] bg-black/60 text-[#666] hover:text-red-400 hover:border-red-500/30'
      } backdrop-blur-sm ${className}`}
      aria-label={active ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <Heart className={`${icon} ${active ? 'fill-red-400' : ''}`} />
    </motion.button>
  )
}
