import { MessageCircle } from 'lucide-react'

const WHATSAPP = 'https://wa.me/9779747235169'

export default function FloatingWhatsApp() {
  return (
    <a
      href={WHATSAPP}
      target="_blank"
      rel="noreferrer"
      aria-label="Order on WhatsApp"
      className="whatsapp-float group fixed bottom-5 right-4 z-50 flex items-center gap-2 sm:bottom-6 sm:right-6"
    >
      <span className="hidden rounded-full border border-[#25D366]/25 bg-black/90 px-3 py-1.5 text-xs font-black text-[#25D366] shadow-lg backdrop-blur-md transition-all group-hover:border-[#25D366]/50 sm:block">
        Order on WhatsApp
      </span>
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_8px_32px_rgba(37,211,102,0.45)] transition-transform group-hover:scale-105 group-active:scale-95">
        <MessageCircle className="h-7 w-7" strokeWidth={2.25} />
      </span>
    </a>
  )
}
