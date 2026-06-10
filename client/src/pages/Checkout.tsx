import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, MessageCircle, Loader2 } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { allCities, getDeliveryCharge } from '@/lib/delivery'
import { createOrder } from '@/services/orderService'

const WA = '9779747235169'


function waMsg(on: string, name: string, phone: string, addr: string, city: string, note: string,
  items: {n: string, s: string, q: number, p: number, cn?: string, cno?: string}[],
  sub: number, del: number, tot: number) {
  return [
    `👑 NEW ORDER — Alex Jersey Shop`,
    `📋 Order: ${on}`,
    '',
    `👤 ${name}`,
    `📱 ${phone}`,
    `📍 ${addr}, ${city}`,
    '',
    `🛒 Items:`,
    ...items.map(i => `  • ${i.n} (${i.s}) ×${i.q} — Rs.${i.p}${i.cn || i.cno ? ` [${i.cn||''} ${i.cno||''}]` : ''}`),
    '',
    `💰 Subtotal: Rs.${sub}`,
    `🚚 Delivery: Rs.${del}`,
    `💵 TOTAL: Rs.${tot}`,
    `💳 Cash on Delivery`,
    note ? `📝 ${note}` : '',
  ].filter(Boolean).join('\n')
}

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart()
  const navigate = useNavigate()

  const [form, setForm] = useState({ name: '', phone: '', address: '', city: 'Kathmandu', note: '' })
  const [errs, setErrs] = useState<Record<string, string>>({})
  const [placed, setPlaced] = useState(false)
  const [on, setOn] = useState('')
  const [whatsappUrl, setWhatsappUrl] = useState('')
  const [loading, setLoading] = useState(false)

  const del = getDeliveryCharge(form.city)
  const total = subtotal + del

  const validate = () => {
    const e: Record<string, string> = {}
    if (form.name.trim().length < 2) e.name = 'Enter your full name'
    if (!/^9[78]\d{8}$/.test(form.phone)) e.phone = 'Enter valid Nepal phone (97/98XXXXXXXX)'
    if (!form.address.trim()) e.address = 'Enter delivery address'
    return e
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const v = validate()
    if (Object.keys(v).length) { setErrs(v); return }

    setLoading(true)
    try {
      const payload = {
        items: items.map(item => ({
          productId: item.product._id,
          size: item.size,
          quantity: item.quantity,
          customName: item.customName || undefined,
          customNumber: item.customNumber || undefined,
        })),
        customerName: form.name,
        phone: form.phone,
        deliveryAddress: form.address,
        city: form.city,
        note: form.note || undefined,
      }
      const res = await createOrder(payload)
      setOn(res.order.orderNumber)
      setWhatsappUrl(res.whatsappUrl)
      setPlaced(true)
    } catch (err: any) {
      console.error(err)
      const errMsg = err.response?.data?.error || 'Failed to place order. Please try again.'
      setErrs({ submit: errMsg })
    } finally {
      setLoading(false)
    }
  }

  const confirmWA = () => {
    clearCart()
    if (whatsappUrl) {
      window.open(whatsappUrl, '_blank')
    } else {
      const msg = waMsg(on, form.name, form.phone, form.address, form.city, form.note,
        items.map(i => ({ n: i.product.name, s: i.size, q: i.quantity, p: i.product.price * i.quantity, cn: i.customName, cno: i.customNumber })),
        subtotal, del, total)
      window.open(`https://wa.me/${WA}?text=${encodeURIComponent(msg)}`, '_blank')
    }
    navigate('/orders')
  }

  if (items.length === 0 && !placed) { navigate('/cart'); return null }

  if (placed) return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-[#080808] border border-[#1a1a1a] rounded-3xl p-8 text-center">
        <div className="w-16 h-16 bg-green-500/15 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="w-8 h-8 text-green-400" />
        </div>
        <h2 className="text-2xl font-black text-white mb-1">Order Created!</h2>
        <p className="text-[#555] text-sm mb-1">Order number</p>
        <p className="font-black text-xl gold-text mb-6">{on}</p>

        <div className="bg-black rounded-2xl p-4 mb-6 text-left space-y-2 border border-[#111]">
          {items.map(item => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-[#555] truncate mr-2">{item.product.name.split(' ').slice(0,3).join(' ')} ({item.size}) ×{item.quantity}</span>
              <span className="text-white flex-shrink-0">Rs. {(item.product.price * item.quantity).toLocaleString()}</span>
            </div>
          ))}
          <div className="border-t border-[#111] pt-2 flex justify-between text-sm">
            <span className="text-[#555]">Delivery ({form.city})</span>
            <span className="text-white">Rs. {del}</span>
          </div>
          <div className="flex justify-between font-black">
            <span className="text-white">Total</span>
            <span className="gold-text">Rs. {total.toLocaleString()}</span>
          </div>
        </div>

        <p className="text-sm text-[#555] mb-5">Tap below to confirm your order on WhatsApp. We'll respond within minutes!</p>

        <button onClick={confirmWA}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-base bg-[#25D366] text-white hover:bg-[#1da851] transition-colors shadow-[0_0_24px_rgba(37,211,102,0.3)]">
          <MessageCircle className="w-5 h-5" /> Confirm on WhatsApp
        </button>
        <p className="text-xs text-[#444] mt-3">📞 9747235169 · 9864227012</p>
      </div>
    </div>
  )

  const field = (key: keyof typeof form, label: string, placeholder: string, type = 'text') => (
    <div>
      <label className="block text-[10px] font-black text-[#444] uppercase tracking-[0.2em] mb-2">{label}</label>
      <input type={type} value={form[key]} placeholder={placeholder}
        onChange={e => setForm(f => ({ ...f, [key]: key === 'phone' ? e.target.value.replace(/\D/g, '').slice(0, 10) : e.target.value }))}
        className={`w-full bg-black border rounded-xl px-4 py-3 text-sm text-white placeholder-[#333] focus:outline-none transition-colors ${errs[key] ? 'border-red-500/50 focus:border-red-400' : 'border-[#1a1a1a] focus:border-[#FFD700]/50'}`} />
      {errs[key] && <p className="text-xs text-red-400 mt-1 font-semibold">{errs[key]}</p>}
    </div>
  )

  return (
    <div className="min-h-screen bg-black text-white pt-16">
      <div className="border-b border-[#0f0f0f] bg-[#050505] py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h1 className="text-3xl sm:text-4xl font-black text-white">Checkout</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid lg:grid-cols-5 gap-8">
          <form onSubmit={submit} className="lg:col-span-3 space-y-5">

            <div className="bg-[#080808] border border-[#1a1a1a] rounded-2xl p-5 space-y-4">
              <p className="font-black text-white text-sm uppercase tracking-wider">📍 Delivery Details</p>
              {field('name', 'Full Name', 'Aarav Sharma')}
              {field('phone', 'Phone Number (Nepal)', '9841234567', 'tel')}
              <div>
                <label className="block text-[10px] font-black text-[#444] uppercase tracking-[0.2em] mb-2">City / District</label>
                <select value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                  className="w-full bg-black border border-[#1a1a1a] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FFD700]/50 cursor-pointer">
                  {allCities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              {field('address', 'Delivery Address', 'Thamel, Ward 26, Near...')}
              <div>
                <label className="block text-[10px] font-black text-[#444] uppercase tracking-[0.2em] mb-2">Note (Optional)</label>
                <textarea value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                  placeholder="Any special instructions..." rows={2}
                  className="w-full bg-black border border-[#1a1a1a] rounded-xl px-4 py-3 text-sm text-white placeholder-[#333] focus:outline-none focus:border-[#FFD700]/50 resize-none" />
              </div>
            </div>

            <div className="bg-[#080808] border border-[#1a1a1a] rounded-2xl p-5">
              <p className="font-black text-white text-sm uppercase tracking-wider mb-3">💳 Payment</p>
              <div className="flex items-center gap-3 p-4 bg-[#FFD700]/5 border border-[#FFD700]/20 rounded-xl">
                <div className="w-4 h-4 rounded-full border-2 border-[#FFD700] flex items-center justify-center">
                  <div className="w-2 h-2 bg-[#FFD700] rounded-full" />
                </div>
                <div>
                  <p className="font-black text-white text-sm">Cash on Delivery</p>
                  <p className="text-xs text-[#555]">Pay when your jersey arrives</p>
                </div>
                <span className="ml-auto text-2xl">💵</span>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full btn-gold py-4 rounded-2xl font-black text-base flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Place Order → Confirm on WhatsApp'}
            </button>
            {errs.submit && <p className="text-xs text-red-400 font-bold text-center mt-2">{errs.submit}</p>}
          </form>

          {/* Summary */}
          <div className="lg:col-span-2">
            <div className="bg-[#080808] border border-[#1a1a1a] rounded-2xl p-5 sticky top-24">
              <p className="font-black text-white text-lg mb-5">Order Summary</p>
              <div className="space-y-3 mb-5">
                {items.map(item => (
                  <div key={item.id} className="flex gap-3">
                    <img src={item.product.images[0]} alt="" className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                      onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=100&q=80' }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white line-clamp-1">{item.product.name}</p>
                      <p className="text-[10px] text-[#555]">{item.size} · ×{item.quantity}</p>
                      {(item.customName || item.customNumber) && <p className="text-[10px] text-[#FFD700]">{item.customName} {item.customNumber}</p>}
                    </div>
                    <p className="text-sm font-bold text-white flex-shrink-0">Rs. {(item.product.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-[#111] pt-3 space-y-2">
                <div className="flex justify-between text-sm"><span className="text-[#555]">Subtotal</span><span className="text-white">Rs. {subtotal.toLocaleString()}</span></div>
                <div className="flex justify-between text-sm"><span className="text-[#555]">Delivery ({form.city})</span><span className="text-white">Rs. {del}</span></div>
                <div className="flex justify-between font-black text-lg border-t border-[#111] pt-2">
                  <span className="text-white">Total</span>
                  <span className="gold-text">Rs. {total.toLocaleString()}</span>
                </div>
              </div>
              <div className="mt-5 p-3 bg-[#25D366]/5 border border-[#25D366]/20 rounded-xl">
                <p className="text-xs font-bold text-[#25D366] mb-1">📱 WhatsApp Confirmation</p>
                <p className="text-[10px] text-[#555]">After placing, you'll be redirected to WhatsApp to confirm with our team instantly.</p>
              </div>
              <p className="text-xs text-[#333] mt-3 text-center">📞 9747235169 · 9864227012</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
