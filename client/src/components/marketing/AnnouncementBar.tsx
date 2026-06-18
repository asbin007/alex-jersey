import { useState } from 'react'
import { X, Tag } from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

const messages = [
  { text: '🎉 FREE delivery on orders above Rs. 3,000', link: '/products', linkText: 'Shop now' },
  { text: '⚡ Limited drops going fast — grab yours before they\'re gone', link: '/products?limited=true', linkText: 'See drops' },
  { text: '📱 Order on WhatsApp & get instant confirmation', link: null, linkText: null },
]

export default function AnnouncementBar() {
  const [dismissed, setDismissed] = useState(false)
  const [idx, setIdx] = useState(0)

  // Cycle through messages every 4 s
  useState(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % messages.length), 4000)
    return () => clearInterval(t)
  })

  if (dismissed) return null

  const msg = messages[idx]

  return (
    <AnimatePresence>
      <motion.div
        key="announcement-bar"
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -40, opacity: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-[60] flex items-center justify-center gap-3 bg-[#FFD700] px-10 py-2 text-black"
      >
        <Tag className="h-3.5 w-3.5 shrink-0" />
        <AnimatePresence mode="wait">
          <motion.p
            key={idx}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
            className="text-[11px] font-black uppercase tracking-wide"
          >
            {msg.text}
            {msg.link && (
              <Link to={msg.link} className="ml-2 underline underline-offset-2 hover:no-underline">
                {msg.linkText} →
              </Link>
            )}
          </motion.p>
        </AnimatePresence>
        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 opacity-60 hover:opacity-100 transition-opacity"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </motion.div>
    </AnimatePresence>
  )
}
