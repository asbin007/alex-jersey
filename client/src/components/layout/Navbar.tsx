import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ShoppingCart, Menu, X, ChevronDown } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'All Jerseys', href: '/products' },
  { label: '🇦🇷 Argentina', href: '/products?team=Argentina' },
  { label: '🇧🇷 Brazil', href: '/products?team=Brazil' },
  { label: '🇫🇷 France', href: '/products?team=France' },
  { label: '🇵🇹 Portugal', href: '/products?team=Portugal' },
  { label: '🇪🇸 Spain', href: '/products?team=Spain' },
  { label: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 England', href: '/products?team=England' },
]

export default function Navbar() {
  const { itemCount } = useCart()
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const [userMenu, setUserMenu] = useState(false)
  const [solid, setSolid] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fn = () => setSolid(window.scrollY > 10)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => { setOpen(false); setUserMenu(false) }, [pathname])

  // Close user menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <nav className={cn(
      'fixed top-0 inset-x-0 z-50 transition-all duration-300',
      solid ? 'bg-black/98 backdrop-blur-xl border-b border-[#1f1f1f]' : 'bg-transparent'
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
          <div className="w-9 h-9 rounded-lg overflow-hidden shadow-[0_0_16px_rgba(255,215,0,0.5)] group-hover:shadow-[0_0_28px_rgba(255,215,0,0.8)] transition-all">
            <img
              src="/high-level-description-a-premium-luxury-_ATSl7QwTUJuEiAlkhMqLOw_OUDEm_mAT4WjgotO4XZ0TA.jpg"
              alt="Alex Jersey Shop logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="font-black text-white text-lg leading-none tracking-tight">
              ALEX <span className="gold-text">JERSEY</span>
            </p>
            <p className="text-[9px] text-[#555] uppercase tracking-[0.2em] leading-none mt-0.5">World Cup 2026</p>
          </div>
        </Link>

        {/* Center links — desktop only */}
        <div className="hidden lg:flex items-center gap-1">
          {navLinks.slice(0, 6).map(l => (
            <Link key={l.href} to={l.href}
              className={cn(
                'px-3 py-1.5 text-sm font-semibold rounded-lg transition-all whitespace-nowrap',
                pathname === l.href
                  ? 'text-[#FFD700]'
                  : 'text-[#888] hover:text-white hover:bg-white/5'
              )}>
              {l.label}
            </Link>
          ))}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1.5">
          {/* Cart */}
          <Link to="/cart" className="relative p-2 rounded-lg hover:bg-white/5 transition-colors group">
            <ShoppingCart className="w-5 h-5 text-[#888] group-hover:text-white transition-colors" />
            {itemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#FFD700] text-black text-[10px] font-black rounded-full flex items-center justify-center glow-pulse">
                {itemCount > 9 ? '9+' : itemCount}
              </span>
            )}
          </Link>

          {/* Auth */}
          {isAuthenticated ? (
            <div className="relative" ref={userMenuRef}>
              <button onClick={() => setUserMenu(!userMenu)}
                className="flex items-center gap-2 px-2.5 py-1.5 bg-[#111] border border-[#1f1f1f] rounded-xl hover:border-[#FFD700]/30 transition-all">
                <div className="w-6 h-6 bg-[#FFD700] rounded-full flex items-center justify-center text-black text-xs font-black flex-shrink-0">
                  {user?.name?.charAt(0)}
                </div>
                <span className="text-sm font-semibold text-white hidden sm:block max-w-[72px] truncate">
                  {user?.name?.split(' ')[0]}
                </span>
                <ChevronDown className={cn('w-3.5 h-3.5 text-[#555] transition-transform flex-shrink-0', userMenu && 'rotate-180')} />
              </button>
              {userMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-[#0f0f0f] border border-[#1f1f1f] rounded-xl overflow-hidden shadow-2xl z-50">
                  <Link to="/profile" className="flex items-center gap-2 px-4 py-3 text-sm text-[#aaa] hover:text-white hover:bg-white/5 transition-colors">
                    👤 My Profile
                  </Link>
                  <Link to="/wishlist" className="flex items-center gap-2 px-4 py-3 text-sm text-[#aaa] hover:text-white hover:bg-white/5 transition-colors">
                    ❤️ Wishlist
                  </Link>
                  <Link to="/orders" className="flex items-center gap-2 px-4 py-3 text-sm text-[#aaa] hover:text-white hover:bg-white/5 transition-colors">
                    📦 My Orders
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" className="flex items-center gap-2 px-4 py-3 text-sm text-[#FFD700] hover:bg-[#FFD700]/10 transition-colors">
                      ⚙️ Admin Panel
                    </Link>
                  )}
                  <hr className="border-[#1f1f1f]" />
                  <button onClick={() => { logout(); navigate('/') }}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                    🚪 Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login"
              className="btn-gold px-4 py-2 rounded-xl text-sm font-black">
              Login
            </Link>
          )}

          {/* Mobile/tablet menu toggle */}
          <button onClick={() => setOpen(!open)}
            className="lg:hidden p-2 rounded-lg hover:bg-white/5 transition-colors text-[#888] hover:text-white"
            aria-label="Toggle menu">
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile / tablet menu */}
      {open && (
        <div className="lg:hidden bg-[#030303]/98 backdrop-blur-xl border-t border-[#1f1f1f]">
          <div className="max-w-7xl mx-auto px-4 py-3 grid grid-cols-2 sm:grid-cols-3 gap-1">
            {navLinks.map(l => (
              <Link key={l.href} to={l.href}
                className={cn(
                  'flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-xl transition-colors',
                  pathname === l.href
                    ? 'text-[#FFD700] bg-[#FFD700]/5'
                    : 'text-[#aaa] hover:text-white hover:bg-white/5'
                )}>
                {l.label}
              </Link>
            ))}
          </div>
          {isAuthenticated && (
            <div className="border-t border-[#111] px-4 py-3 flex items-center justify-between">
              <Link to="/profile" className="text-sm text-[#aaa] hover:text-white transition-colors font-semibold">
                👤 Profile
              </Link>
              <Link to="/wishlist" className="text-sm text-[#aaa] hover:text-white transition-colors font-semibold">
                ❤️ Wishlist
              </Link>
              <Link to="/orders" className="text-sm text-[#aaa] hover:text-white transition-colors font-semibold">
                📦 Orders
              </Link>
              {isAdmin && (
                <Link to="/admin" className="text-sm text-[#FFD700] font-semibold">
                  ⚙️ Admin
                </Link>
              )}
              <button onClick={() => { logout(); navigate('/') }}
                className="text-sm text-red-400 font-semibold hover:text-red-300 transition-colors">
                🚪 Sign Out
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}
