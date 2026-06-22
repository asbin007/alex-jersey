import { useState, useEffect } from 'react'
import type { Product } from '@/types'

const STORAGE_KEY = 'recently_viewed'
const MAX_ITEMS = 10

export function useRecentlyViewed() {
  const [items, setItems] = useState<Product[]>([])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setItems(JSON.parse(stored))
    } catch {}
  }, [])

  const add = (product: Product) => {
    setItems(prev => {
      const filtered = prev.filter(p => p._id !== product._id)
      const next = [product, ...filtered].slice(0, MAX_ITEMS)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }

  return { items, add }
}
