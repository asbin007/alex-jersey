import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, ChevronLeft, ChevronRight } from 'lucide-react'

const testimonials = [
  {
    name: 'Suman K.',
    city: 'Kathmandu',
    team: '🇦🇷 Argentina',
    rating: 5,
    text: 'Argentina home kit quality is top notch. Delivered in 2 days, paid on delivery. Perfect for World Cup season.',
  },
  {
    name: 'Rajan T.',
    city: 'Pokhara',
    team: '🇧🇷 Brazil',
    rating: 5,
    text: 'Ordered Brazil away jersey on WhatsApp — super fast reply and exact sizing. Will order again for friends.',
  },
  {
    name: 'Anisha M.',
    city: 'Biratnagar',
    team: '🇫🇷 France',
    rating: 5,
    text: 'Premium feel and sharp prints. Alex Jersey is my go-to for every tournament. Highly recommend!',
  },
  {
    name: 'Dipesh R.',
    city: 'Lalitpur',
    team: '🇵🇹 Portugal',
    rating: 5,
    text: 'Got the Portugal kit with custom name and number. Looks exactly like the real thing. Quality exceeded expectations.',
  },
  {
    name: 'Priya S.',
    city: 'Butwal',
    team: '🇪🇸 Spain',
    rating: 5,
    text: 'Cash on delivery made it so easy. No risk, just pure quality. Spain away jersey fits perfectly.',
  },
  {
    name: 'Bikash L.',
    city: 'Dharan',
    team: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 England',
    rating: 5,
    text: 'Placed the order in the morning and it arrived by evening the next day. Fastest delivery I\'ve experienced in Nepal.',
  },
]

function StarRow({ n }: { n: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star
          key={s}
          className={`h-3.5 w-3.5 ${s <= n ? 'fill-[#FFD700] text-[#FFD700]' : 'fill-[#222] text-[#222]'}`}
        />
      ))}
    </div>
  )
}

export default function TestimonialsSection() {
  const [active, setActive] = useState(0)
  const [dir, setDir] = useState(1)
  const len = testimonials.length

  useEffect(() => {
    const t = setInterval(() => { setDir(1); setActive(i => (i + 1) % len) }, 5000)
    return () => clearInterval(t)
  }, [len])

  const go = (next: number, d: number) => { setDir(d); setActive(next) }

  return (
    <section className="border-b border-[#111] py-12 sm:py-16">
      <div className="mb-8 text-center">
        <p className="mb-1 text-[10px] font-black uppercase tracking-[0.28em] text-[#FFD700]">What Customers Say</p>
        <h2 className="font-display text-2xl font-black text-white sm:text-3xl">Real Reviews from Nepal</h2>
        <div className="mt-2 flex items-center justify-center gap-1">
          {[1, 2, 3, 4, 5].map(s => (
            <Star key={s} className="h-4 w-4 fill-[#FFD700] text-[#FFD700]" />
          ))}
          <span className="ml-2 text-sm font-black text-white">5.0</span>
          <span className="text-sm text-[#555]">· {len} reviews</span>
        </div>
      </div>

      <div className="relative overflow-hidden">
        {/* Cards — show 1 on mobile, 3 on desktop */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-2xl border border-[#1a1a1a] bg-[#050505] p-5"
            >
              <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FFD700] text-sm font-black text-black">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-black text-white">{t.name}</p>
                    <p className="text-[10px] text-[#555]">{t.city}</p>
                  </div>
                </div>
                <span className="text-base">{t.team.split(' ')[0]}</span>
              </div>
              <StarRow n={t.rating} />
              <p className="mt-3 text-sm leading-relaxed text-[#777]">&ldquo;{t.text}&rdquo;</p>
              <p className="mt-3 text-[10px] font-black uppercase tracking-wider text-[#444]">{t.team.slice(3)}</p>
            </motion.div>
          ))}
        </div>

        {/* Mobile carousel */}
        <div className="relative sm:hidden overflow-hidden">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={active}
              custom={dir}
              variants={{
                enter: (d: number) => ({ x: d > 0 ? 60 : -60, opacity: 0 }),
                center: { x: 0, opacity: 1 },
                exit: (d: number) => ({ x: d > 0 ? -60 : 60, opacity: 0 }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-2xl border border-[#1a1a1a] bg-[#050505] p-5"
            >
              {(() => {
                const t = testimonials[active]
                return (
                  <>
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FFD700] text-sm font-black text-black">
                          {t.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-black text-white">{t.name}</p>
                          <p className="text-[10px] text-[#555]">{t.city}</p>
                        </div>
                      </div>
                      <span className="text-xl">{t.team.split(' ')[0]}</span>
                    </div>
                    <StarRow n={t.rating} />
                    <p className="mt-3 text-sm leading-relaxed text-[#777]">&ldquo;{t.text}&rdquo;</p>
                    <p className="mt-3 text-[10px] font-black uppercase tracking-wider text-[#444]">{t.team.slice(3)}</p>
                  </>
                )
              })()}
            </motion.div>
          </AnimatePresence>

          {/* Controls */}
          <div className="mt-4 flex items-center justify-between">
            <button
              onClick={() => go((active - 1 + len) % len, -1)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#222] text-[#555] transition-colors hover:border-[#FFD700]/50 hover:text-[#FFD700]"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex gap-1.5">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => go(i, i > active ? 1 : -1)}
                  className={`h-1.5 rounded-full transition-all ${i === active ? 'w-6 bg-[#FFD700]' : 'w-1.5 bg-[#333]'}`}
                />
              ))}
            </div>
            <button
              onClick={() => go((active + 1) % len, 1)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#222] text-[#555] transition-colors hover:border-[#FFD700]/50 hover:text-[#FFD700]"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
