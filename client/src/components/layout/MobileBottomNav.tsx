import { Link, useLocation } from 'react-router-dom'
import { Home, Search, ShoppingCart, Heart, User } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'

const tabs = [
  { icon: Home, label: 'Home', href: '/' },
  { icon: Search, label: 'Shop', href: '/products' },
  { icon: ShoppingCart, label: 'Cart', href: '/cart' },
  { icon: Heart, label: 'Wishlist', href: '/wishlist', auth: true },
  { icon: User, label: 'Profile', href: '/profile', auth: true },
]

export default function MobileBottomNav() {
  const { pathname } = useLocation()
  const { itemCount } = useCart()
  const { isAuthenticated } = useAuth()

  const visible = !pathname.startsWith('/admin') && !pathname.startsWith('/delivery')

  if (!visible) return null

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 lg:hidden bg-black/95 backdrop-blur-xl border-t border-[#1a1a1a]">
      <div className="flex items-center justify-around h-14">
        {tabs
          .filter(t => !t.auth || isAuthenticated)
          .map(t => {
            const active = pathname === t.href || (t.href !== '/' && pathname.startsWith(t.href))
            return (
              <Link
                key={t.href}
                to={t.href}
                className={cn(
                  'relative flex flex-col items-center gap-0.5 px-3 py-1 transition-colors',
                  active ? 'text-[#FFD700]' : 'text-[#555]'
                )}
              >
                <div className="relative">
                  <t.icon className="w-5 h-5" />
                  {t.href === '/cart' && itemCount > 0 && (
                    <span className="absolute -top-1 -right-2 w-4 h-4 bg-[#FFD700] text-black text-[9px] font-black rounded-full flex items-center justify-center">
                      {itemCount > 9 ? '9+' : itemCount}
                    </span>
                  )}
                </div>
                <span className="text-[9px] font-bold">{t.label}</span>
                {active && (
                  <span className="absolute -top-px inset-x-2 h-0.5 bg-[#FFD700] rounded-full" />
                )}
              </Link>
            )
          })}
      </div>
    </nav>
  )
}
