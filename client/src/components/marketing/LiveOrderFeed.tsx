import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag } from 'lucide-react'

const ORDERS = [
  { name: 'Suman K.', city: 'Kathmandu', product: 'Argentina Home Kit', flag: '🇦🇷', ago: '2 min ago' },
  { name: 'Rajan T.', city: 'Pokhara', product: 'Brazil Away Jersey', flag: '🇧🇷', ago: '5 min ago' },
  { name: 'Anisha M.', city: 'Biratnagar', product: 'France 2026 Kit', flag: '🇫🇷', ago: '8 min ago' },
  { name: 'Dipesh R.', city: 'Lalitpur', product: 'Portugal Home Jersey', flag: '🇵🇹', ago: '11 min ago' },
  { name: 'Priya S.', city: 'Butwal', product: 'Spain Away Kit', flag: '🇪🇸', ago: '14 min ago' },
  { name: 'Bikash L.', city: 'Dharan', product: 'England Third Kit', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', ago: '17 min ago' },
  { name: 'Sabina G.', city: 'Hetauda', product: 'Germany Home Jersey', flag: '🇩🇪', ago: '20 min ago' },
  { name: 'Nabin P.', city: 'Chitwan', product: 'Netherlands Away Kit', flag: '🇳🇱', ago: '23 min ago' },
]

export default function LiveOrderFeed() {
  const [visible, setVisible] = useState(false)
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    // Show first toast after 6s, then every 10s
    const first = setTimeout(() => {
      setVisible(true)
      setIdx(0)
    }, 6000)

    return () => clearTimeout(first)
  }, [])

  useEffect(() => {
    if (!visible) return
    // Hide after 4s, then show next after 10s
    const hide = setTimeout(() => setVisible(false), 4000)
    const next = setTimeout(() => {
      setIdx(i => (i + 1) % ORDERS.length)
      setVisible(true)
    }, 10000)

    return () => { clearTimeout(hide); clearTimeout(next) }
  }, [visible, idx])

  const order = ORDERS[idx]

  return (
    <div className="pointer-events-none fixed bottom-20 left-4 z-50 sm:bottom-6">
      <AnimatePresence>
        {visible && (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -60, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -60, scale: 0.95 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-3 rounded-2xl border border-[#1f1f1f] bg-[#0a0a0a]/95 px-4 py-3 shadow-2xl backdrop-blur-md"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FFD700]/10 text-lg">
              {order.flag}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black text-white leading-snug">
                <span className="text-[#FFD700]">{order.name}</span> from {order.city}
              </p>
              <p className="truncate text-[10px] text-[#666]">
                <ShoppingBag className="mr-1 inline h-2.5 w-2.5" />
                {order.product}
              </p>
            </div>
            <span className="shrink-0 text-[9px] font-black uppercase tracking-wider text-[#444]">
              {order.ago}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
