'use client'

import { useEffect, useState } from 'react'
import { Search, ChevronDown, Loader2 } from 'lucide-react'
import AdminLayout from '../adminLayout/adminLayout'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { fetchOrders, updateOrderStatus } from '@/lib/services'
import { formatCurrency } from '@/lib/utils'
import type { Order, OrderStatus } from '@/types'
import { toast } from 'sonner'

const ALL_STATUSES: OrderStatus[] = ['pending', 'confirmed', 'processing', 'ontheway', 'delivered', 'cancelled']

const statusVariant: Record<OrderStatus, 'default' | 'success' | 'warning' | 'destructive' | 'outline'> = {
  pending:    'warning' as const,
  confirmed:  'default',
  processing: 'default',
  ontheway:   'outline',
  delivered:  'success',
  cancelled:  'destructive',
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  const load = () => {
    setLoading(true)
    fetchOrders()
      .then(setOrders)
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false))
  }

  const silentRefresh = () => {
    fetchOrders()
      .then((data) => { setOrders(data); setLastRefresh(new Date()) })
      .catch(() => {}) // silent background refresh
  }

  useEffect(() => {
    load()
    const interval = setInterval(silentRefresh, 30000)
    return () => clearInterval(interval)
  }, [])

  const filtered = orders.filter((o) => {
    const matchSearch =
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.name.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.phone.includes(search)
    const matchStatus = statusFilter ? o.status === statusFilter : true
    return matchSearch && matchStatus
  })

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, status)
      toast.success('Status updated')
      load()
    } catch {
      toast.error('Update failed')
    }
  }

  return (
    <AdminLayout>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black">Orders</h1>
          <p className="text-xs text-muted-foreground">
            Auto-refreshes every 30s · Last: {lastRefresh.toLocaleTimeString('en-NP', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <p className="text-sm text-muted-foreground">{orders.length} total orders</p>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search orders..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as OrderStatus | '')}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => (
            <Card key={order._id} className="overflow-hidden">
              <div
                className="flex cursor-pointer items-center justify-between p-4 hover:bg-muted/30"
                onClick={() => setExpanded(expanded === order._id ? null : order._id)}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold">{order.orderNumber}</p>
                    <Badge variant={statusVariant[order.status]}>{order.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {order.customer.name} · {order.customer.phone} · {new Date(order.createdAt).toLocaleDateString('en-NP')}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-black">{formatCurrency(order.total)}</p>
                  <ChevronDown className={`h-4 w-4 transition-transform ${expanded === order._id ? 'rotate-180' : ''}`} />
                </div>
              </div>

              {expanded === order._id && (
                <div className="border-t border-border px-4 pb-4 pt-3">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span>{item.productName} ({item.size}) ×{item.quantity}</span>
                          <span>{formatCurrency(item.price)}</span>
                        </div>
                      ))}
                    </div>
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Update status</p>
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order._id, e.target.value as OrderStatus)}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                      >
                        {ALL_STATUSES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ))}
          {filtered.length === 0 && (
            <p className="py-12 text-center text-muted-foreground">No orders found</p>
          )}
        </div>
      )}
    </AdminLayout>
  )
}
