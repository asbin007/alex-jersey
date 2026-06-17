'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Star,
  Users,
  LogOut,
  Menu,
  Crown,
  ExternalLink,
  Truck,
  MessageCircle,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { cn, formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { getStoredUser, clearAuth, isAdminUser } from '@/store/auth'
import WhatsAppSidebarDot from '@/components/WhatsAppSidebarDot'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Products', href: '/products', icon: Package },
  { label: 'Orders', href: '/orders', icon: ShoppingBag },
  { label: 'Reviews', href: '/reviews', icon: Star },
  { label: 'Users', href: '/userTable', icon: Users },
  { label: 'Delivery Team', href: '/delivery', icon: Truck },
  { label: 'WhatsApp', href: '/whatsapp', icon: MessageCircle },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const user = getStoredUser()
    if (!isAdminUser(user)) {
      router.replace('/user/login')
      return
    }
    setReady(true)
  }, [router])

  const logout = () => {
    clearAuth()
    router.replace('/user/login')
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  const NavLinks = () => (
    <>
      {navItems.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              active
                ? 'bg-primary/10 text-primary'
                : 'text-sidebar-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        )
      })}
    </>
  )

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden w-60 flex-shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex">
        <div className="border-b border-sidebar-border p-5">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15">
              <Crown className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-black text-foreground">Alex Jersey</p>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Admin Panel
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          <NavLinks />
        </nav>

        <div className="space-y-2 border-t border-sidebar-border p-3">
          <a
            href="http://localhost:5173"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <ExternalLink className="h-4 w-4" />
            View Store
          </a>
          <WhatsAppSidebarDot />
          <button
            onClick={logout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border bg-card px-4 py-3 md:hidden">
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            <span className="font-bold">Alex Jersey Admin</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(!mobileOpen)}>
            <Menu className="h-5 w-5" />
          </Button>
        </header>

        {mobileOpen && (
          <div className="border-b border-border bg-sidebar p-3 md:hidden">
            <nav className="space-y-1">
              <NavLinks />
            </nav>
          </div>
        )}

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
