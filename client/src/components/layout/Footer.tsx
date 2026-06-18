import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t border-[#0f0f0f] bg-[#030303]">
      <div className="gold-line" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">

          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-lg overflow-hidden shadow-[0_0_16px_rgba(255,215,0,0.4)]">
                <img
                  src="/high-level-description-a-premium-luxury-_ATSl7QwTUJuEiAlkhMqLOw_OUDEm_mAT4WjgotO4XZ0TA.jpg"
                  alt="Alex Jersey Shop logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="font-black text-white text-lg leading-none">ALEX <span className="gold-text">JERSEY</span></p>
                <p className="text-[9px] text-[#444] uppercase tracking-[0.15em] mt-0.5">World Cup 2026</p>
              </div>
            </Link>
            <p className="text-sm text-[#555] leading-relaxed mb-4">
              Delivering Pride to Every Corner of Nepal. Official World Cup 2026 jerseys for every nation.
            </p>
            <div className="space-y-1.5">
              <p className="text-xs font-black text-white">📞 9747235169 / 9864227012</p>
              <p className="text-xs text-[#555]">📱 WhatsApp same numbers</p>
              <p className="text-xs text-[#555]">📘 Facebook: Alex Jersey Shop</p>
            </div>
          </div>

          {/* Shop */}
          <div>
            <p className="text-[10px] font-black text-[#333] uppercase tracking-[0.25em] mb-4">Shop</p>
            <ul className="space-y-2.5">
              {[
                ['All Jerseys', '/products'],
                ['New Arrivals', '/products?sortBy=newest'],
                ['Limited Drops', '/products?limited=true'],
              ].map(([l, h]) => (
                <li key={h}>
                  <Link to={h} className="text-sm text-[#555] hover:text-[#FFD700] transition-colors font-medium">
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Nations */}
          <div>
            <p className="text-[10px] font-black text-[#333] uppercase tracking-[0.25em] mb-4">Nations</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {['Argentina', 'Brazil', 'France', 'Portugal', 'Spain', 'England', 'Germany', 'Netherlands'].map(n => (
                <Link key={n} to={`/products?team=${n}`}
                  className="text-sm text-[#555] hover:text-[#FFD700] transition-colors font-medium">
                  {n}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <p className="text-[10px] font-black text-[#333] uppercase tracking-[0.25em] mb-4">Order Info</p>
            <div className="space-y-2 mb-5">
              {[
                ['💵', 'Cash on Delivery'],
                ['🚚', 'All Nepal Delivery'],
                ['📱', 'WhatsApp Orders'],
                ['🏆', 'Premium Quality'],
              ].map(([e, t]) => (
                <div key={t} className="flex items-center gap-2 text-xs text-[#555]">
                  <span>{e}</span>{t}
                </div>
              ))}
            </div>
            <a href="https://wa.me/9779747235169" target="_blank" rel="noreferrer"
              className="flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm bg-[#25D366]/10 border border-[#25D366]/25 text-[#25D366] hover:bg-[#25D366]/20 transition-all">
              📱 WhatsApp Order
            </a>
          </div>
        </div>

        <div className="border-t border-[#0f0f0f] mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[#333]">© 2026 Alex Jersey Shop · Nepal</p>
          <p className="text-xs text-[#333]">Delivering Pride to Every Corner of Nepal 🇳🇵</p>
        </div>
      </div>
    </footer>
  )
}
