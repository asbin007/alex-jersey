import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Eye, Flame } from 'lucide-react'

interface Props {
  stock: number
  productId: string
}

/** Deterministic but product-specific "viewers" count — stable across renders */
function viewersFor(id: string) {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return 7 + (h % 19) // 7–25
}

export default function StockUrgency({ stock, productId }: Props) {
  const [viewers] = useState(() => viewersFor(productId))
  const [pulse, setPulse] = useState(false)

  useEffect(() => {
    const t = setInterval(() => setPulse(p => !p), 3000)
    return () => clearInterval(t)
  }, [])

  if (stock === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Viewers */}
      <motion.div
        animate={{ opacity: pulse ? 0.75 : 1 }}
        transition={{ duration: 1.5 }}
        className="flex items-center gap-1.5 rounded-full border border-[#1a1a1a] bg-[#0a0a0a] px-3 py-1.5"
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
        </span>
        <Eye className="h-3 w-3 text-[#666]" />
        <span className="text-[11px] font-black text-[#888]">
          <span className="text-white">{viewers}</span> people viewing
        </span>
      </motion.div>

      {/* Stock warning */}
      {stock <= 10 && (
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 ${
            stock <= 3
              ? 'border border-red-500/30 bg-red-500/8 text-red-400'
              : 'border border-[#FFD700]/25 bg-[#FFD700]/6 text-[#FFD700]'
          }`}
        >
          <Flame className="h-3 w-3" />
          <span className="text-[11px] font-black">
            {stock <= 3 ? `Only ${stock} left!` : `${stock} in stock — selling fast`}
          </span>
        </motion.div>
      )}
    </div>
  )
}
