import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

const WA_NUMBER = '9779747235169'
const WA_MSG = encodeURIComponent("Hi! I was just browsing jerseys at Alex Jersey Shop. Can you help me find the right one?")

export default function ExitIntentPopup() {
  const [show, setShow] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (dismissed) return

    // Only show once per session
    if (sessionStorage.getItem('exit-popup-shown')) return

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 5) {
        setShow(true)
        sessionStorage.setItem('exit-popup-shown', '1')
      }
    }

    // Mobile: show after 45s of browsing
    const timer = setTimeout(() => {
      if (!sessionStorage.getItem('exit-popup-shown')) {
        setShow(true)
        sessionStorage.setItem('exit-popup-shown', '1')
      }
    }, 45000)

    document.addEventListener('mouseleave', handleMouseLeave)
    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave)
      clearTimeout(timer)
    }
  }, [dismissed])

  const dismiss = () => { setShow(false); setDismissed(true) }

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm"
            onClick={dismiss}
          />
          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-4 top-1/2 z-[71] mx-auto max-w-sm -translate-y-1/2 overflow-hidden rounded-3xl border border-[#1f1f1f] bg-[#080808] p-6 shadow-[0_40px_120px_rgba(0,0,0,0.8)] sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full"
          >
            <button
              onClick={dismiss}
              aria-label="Close"
              className="absolute right-4 top-4 rounded-full p-1 text-[#555] hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Glow */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#FFD700]/8 via-transparent to-transparent" />

            <div className="relative text-center">
              <div className="mb-4 text-4xl">⚽</div>
              <p className="mb-1 text-[10px] font-black uppercase tracking-[0.3em] text-[#FFD700]">
                Wait — before you go!
              </p>
              <h2 className="mb-3 text-xl font-black text-white leading-tight">
                Get Exclusive Deals on<br />World Cup Jerseys
              </h2>
              <p className="mb-6 text-sm text-[#666] leading-relaxed">
                Chat with us on WhatsApp and get a <span className="font-black text-[#FFD700]">special discount</span> on your first order. Cash on Delivery available across Nepal.
              </p>

              <a
                href={`https://wa.me/${WA_NUMBER}?text=${WA_MSG}`}
                target="_blank"
                rel="noreferrer"
                onClick={dismiss}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#25D366] py-3.5 text-sm font-black text-white transition-transform active:scale-95 hover:bg-[#20ba5a]"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.555 4.116 1.528 5.845L.057 23.093a.75.75 0 0 0 .925.919l5.179-1.469A11.946 11.946 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.694-.5-5.24-1.374l-.375-.215-3.873 1.098 1.114-3.785-.232-.384A9.955 9.955 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                </svg>
                Chat on WhatsApp for Deals
              </a>

              <button
                onClick={dismiss}
                className="mt-3 w-full py-2.5 text-xs text-[#555] hover:text-[#888] transition-colors"
              >
                No thanks, I'll pay full price
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
