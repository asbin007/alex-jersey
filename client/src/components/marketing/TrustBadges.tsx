import { motion } from 'framer-motion'
import { Truck, ShieldCheck, MessageCircle, RefreshCw, Award, Zap } from 'lucide-react'

const badges = [
  { icon: Truck, title: 'All Nepal Delivery', desc: 'Reach anywhere in Nepal in 2–4 days' },
  { icon: ShieldCheck, title: 'Cash on Delivery', desc: 'Pay only when you receive your jersey' },
  { icon: MessageCircle, title: 'WhatsApp Support', desc: 'Instant replies 9AM–9PM daily' },
  { icon: Award, title: '100% Premium Quality', desc: 'Official-grade fabric and printing' },
  { icon: RefreshCw, title: 'Easy Exchange', desc: 'Wrong size? We\'ll swap it for you' },
  { icon: Zap, title: 'Fast Confirmation', desc: 'Order confirmed within minutes' },
]

export default function TrustBadges() {
  return (
    <section className="border-b border-[#111] py-10 sm:py-12">
      <p className="mb-6 text-center text-[10px] font-black uppercase tracking-[0.3em] text-[#444]">
        Why 1,000+ customers choose Alex Jersey Shop
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
        {badges.map((b, i) => (
          <motion.div
            key={b.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center gap-2 rounded-2xl border border-[#1a1a1a] bg-[#050505] p-4 text-center"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFD700]/10">
              <b.icon className="h-5 w-5 text-[#FFD700]" />
            </div>
            <p className="text-xs font-black text-white leading-tight">{b.title}</p>
            <p className="text-[10px] leading-snug text-[#555]">{b.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
