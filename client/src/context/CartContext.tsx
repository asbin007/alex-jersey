import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { Product, Size } from '@/types'

export interface CartItem {
  id: string // productId + size + customName + customNumber
  product: Product
  size: Size
  quantity: number
  customName?: string
  customNumber?: string
}

interface CartContextType {
  items: CartItem[]
  addToCart: (product: Product, size: Size, quantity?: number, customName?: string, customNumber?: string) => void
  removeFromCart: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  itemCount: number
  subtotal: number
}

const CartContext = createContext<CartContextType | null>(null)

function makeCartId(productId: string, size: string, customName?: string, customNumber?: string) {
  return `${productId}-${size}-${customName ?? ''}-${customNumber ?? ''}`
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('cart')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items))
  }, [items])

  const MAX_QTY = 99

  const addToCart = (
    product: Product,
    size: Size,
    quantity = 1,
    customName?: string,
    customNumber?: string
  ) => {
    const id = makeCartId(product._id, size, customName, customNumber)
    setItems(prev => {
      const existing = prev.find(i => i.id === id)
      if (existing) {
        const next = Math.min(existing.quantity + quantity, MAX_QTY)
        return prev.map(i => i.id === id ? { ...i, quantity: next } : i)
      }
      return [...prev, { id, product, size, quantity: Math.min(quantity, MAX_QTY), customName, customNumber }]
    })
  }

  const removeFromCart = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id))
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id)
      return
    }
    setItems(prev => prev.map(i => i.id === id ? { ...i, quantity: Math.min(quantity, MAX_QTY) } : i))
  }

  const clearCart = () => setItems([])

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)
  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0)

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      itemCount,
      subtotal,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
