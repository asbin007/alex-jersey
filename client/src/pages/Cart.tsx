import { Link } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react'
import { useCart } from '@/context/CartContext'

export default function Cart() {
  const { items, removeFromCart, updateQuantity, subtotal } = useCart()

  if (items.length === 0) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center px-4">
        <ShoppingBag className="w-16 h-16 text-[#222] mx-auto mb-5" />
        <h2 className="text-3xl font-black text-white mb-3">Cart is Empty</h2>
        <p className="text-[#555] mb-8">Add some jerseys to your cart first.</p>
        <Link to="/products" className="btn-gold inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-black">
          Shop Jerseys <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-black text-white pt-16">
      <div className="border-b border-[#0f0f0f] bg-[#050505] py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h1 className="text-3xl sm:text-4xl font-black text-white">
            Your Cart <span className="text-[#333] font-bold text-xl">({items.length})</span>
          </h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">

          {/* Items */}
          <div className="lg:col-span-2 space-y-3">
            {items.map(item => (
              <div key={item.id} className="bg-[#080808] border border-[#1a1a1a] rounded-2xl p-4 flex gap-4 hover:border-[#FFD700]/15 transition-colors">
                <Link to={`/products/${item.product.slug}`} className="flex-shrink-0">
                  <img src={item.product.images[0]} alt={item.product.name}
                    className="w-20 h-20 object-cover rounded-xl"
                    onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=200&q=80' }} />
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[10px] font-black text-[#FFD700] uppercase tracking-widest">{item.product.team}</p>
                      <Link to={`/products/${item.product.slug}`}>
                        <p className="font-bold text-white text-sm leading-tight hover:text-[#FFD700] transition-colors line-clamp-2">{item.product.name}</p>
                      </Link>
                      <p className="text-xs text-[#555] mt-0.5">Size: <span className="text-[#888]">{item.size}</span></p>
                      {(item.customName || item.customNumber) && (
                        <p className="text-xs text-[#FFD700] mt-0.5">Custom: {item.customName} {item.customNumber}</p>
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
                        className="w-9 h-9 flex items-center justify-center text-[#555] hover:text-white hover:bg-[#111] transition-colors">
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm font-black text-white">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-9 h-9 flex items-center justify-center text-[#555] hover:text-white hover:bg-[#111] transition-colors">
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="font-black text-white">Rs. {(item.product.price * item.quantity).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div>
            <div className="bg-[#080808] border border-[#1a1a1a] rounded-2xl p-5 sticky top-24">
              <h2 className="font-black text-white text-lg mb-5">Summary</h2>
              <div className="space-y-2 mb-4">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-[#555] truncate mr-2">{item.product.name.split(' ').slice(0, 3).join(' ')} ×{item.quantity}</span>
                    <span className="text-white flex-shrink-0">Rs. {(item.product.price * item.quantity).toLocaleString()}</span>
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
                  <span className="text-[#555]">Calculated at checkout</span>
                </div>
              </div>
              <div className="border-t border-[#111] pt-3 mb-5">
                <div className="flex justify-between font-black text-xl">
                  <span className="text-white">Subtotal</span>
                  <span className="gold-text">Rs. {subtotal.toLocaleString()}</span>
                </div>
              </div>
              <Link to="/checkout"
                className="btn-gold w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-base">
                Checkout <ArrowRight className="w-5 h-5" />
              </Link>
              <p className="text-center text-xs text-[#444] mt-3">💵 Cash on Delivery · 📱 WhatsApp Confirm</p>
              <Link to="/products" className="block text-center mt-3 text-sm text-[#FFD700] hover:underline font-semibold">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
