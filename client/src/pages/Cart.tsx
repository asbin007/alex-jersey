import { Link } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react'
import { useCart } from '@/context/CartContext'

export default function Cart() {
  const { items, removeFromCart, updateQuantity, subtotal } = useCart()

  if (items.length === 0) return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="text-center">
        <ShoppingBag className="w-14 h-14 sm:w-16 sm:h-16 text-[#222] mx-auto mb-5" />
        <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">Cart is Empty</h2>
        <p className="text-[#555] mb-8 text-sm">Add some jerseys to get started.</p>
        <Link to="/products" className="btn-gold inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl font-black text-sm">
          Shop Jerseys <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-black text-white pt-16">
      <div className="border-b border-[#0f0f0f] bg-[#050505] py-7 sm:py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white">
            Your Cart{' '}
            <span className="text-[#333] font-bold text-base sm:text-xl">({items.length})</span>
          </h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">

          {/* Items */}
          <div className="lg:col-span-2 space-y-3">
            {items.map(item => (
              <div key={item.id}
                className="bg-[#080808] border border-[#1a1a1a] rounded-2xl p-3 sm:p-4 flex gap-3 sm:gap-4 hover:border-[#FFD700]/15 transition-colors">
                <Link to={`/products/${item.product.slug}`} className="flex-shrink-0">
                  <img src={item.product.images[0]} alt={item.product.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl"
                    onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=200&q=80' }} />
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[10px] font-black text-[#FFD700] uppercase tracking-widest">{item.product.team}</p>
                      <Link to={`/products/${item.product.slug}`}>
                        <p className="font-bold text-white text-sm leading-tight hover:text-[#FFD700] transition-colors line-clamp-2">{item.product.name}</p>
                      </Link>
                      <p className="text-xs text-[#555] mt-0.5">
                        Size: <span className="text-[#888]">{item.size}</span>
                      </p>
                      {(item.customName || item.customNumber) && (
                        <p className="text-xs text-[#FFD700] mt-0.5">
                          {item.customName} {item.customNumber}
                        </p>
                      )}
                    </div>
                    <button onClick={() => removeFromCart(item.id)}
                      className="text-[#333] hover:text-red-400 transition-colors p-1 flex-shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-0 bg-black border border-[#1a1a1a] rounded-xl overflow-hidden">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-[#555] hover:text-white hover:bg-[#111] transition-colors">
                        <Minus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      </button>
                      <span className="w-7 sm:w-8 text-center text-sm font-black text-white">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-[#555] hover:text-white hover:bg-[#111] transition-colors">
                        <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      </button>
                    </div>
                    <p className="font-black text-white text-sm sm:text-base">
                      Rs. {(item.product.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-[#080808] border border-[#1a1a1a] rounded-2xl p-4 sm:p-5 lg:sticky lg:top-24">
              <h2 className="font-black text-white text-base sm:text-lg mb-4 sm:mb-5">Order Summary</h2>
              <div className="space-y-2 mb-4">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between text-sm gap-2">
                    <span className="text-[#555] truncate">
                      {item.product.name.split(' ').slice(0, 3).join(' ')} ×{item.quantity}
                    </span>
                    <span className="text-white flex-shrink-0">
                      Rs. {(item.product.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-[#111] pt-3 space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-[#555]">Subtotal</span>
                  <span className="text-white">Rs. {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#555]">Delivery</span>
                  <span className="text-[#555]">At checkout</span>
                </div>
              </div>
              <div className="border-t border-[#111] pt-3 mb-5">
                <div className="flex justify-between font-black text-lg sm:text-xl">
                  <span className="text-white">Subtotal</span>
                  <span className="gold-text">Rs. {subtotal.toLocaleString()}</span>
                </div>
              </div>
              <Link to="/checkout"
                className="btn-gold w-full flex items-center justify-center gap-2 py-3.5 sm:py-4 rounded-2xl font-black text-sm sm:text-base">
                Checkout <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
              <p className="text-center text-xs text-[#444] mt-3">💵 Cash on Delivery · 📱 WhatsApp Confirm</p>
              <Link to="/products"
                className="block text-center mt-3 text-sm text-[#FFD700] hover:underline font-semibold">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
