import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { useAuth } from './AuthContext'
import * as wishlistService from '@/services/wishlistService'
import type { Product } from '@/types'

interface WishlistContextType {
  items: Product[]
  loading: boolean
  toggle: (productId: string) => Promise<void>
  isInWishlist: (productId: string) => boolean
  refresh: () => Promise<void>
}

const WishlistContext = createContext<WishlistContextType | null>(null)

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth()
  const [items, setItems] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    if (!token) { setItems([]); return }
    setLoading(true)
    try {
      const data = await wishlistService.fetchWishlist()
      setItems(data)
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { refresh() }, [refresh])

  const toggle = useCallback(async (productId: string) => {
    if (!token) return
    const exists = items.some(p => p._id === productId)
    if (exists) {
      setItems(prev => prev.filter(p => p._id !== productId))
      await wishlistService.removeFromWishlist(productId).catch(refresh)
    } else {
      await wishlistService.addToWishlist(productId).catch(refresh)
      await refresh()
    }
  }, [token, items, refresh])

  const isInWishlist = useCallback((productId: string) => {
    return items.some(p => p._id === productId)
  }, [items])

  return (
    <WishlistContext.Provider value={{ items, loading, toggle, isInWishlist, refresh }}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const ctx = useContext(WishlistContext)
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider')
  return ctx
}
