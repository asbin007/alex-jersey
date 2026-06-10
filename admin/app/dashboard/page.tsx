'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Package, ShoppingBag, Users, TrendingUp, Clock, ArrowRight, Loader2 } from 'lucide-react'
import AdminLayout from '../adminLayout/adminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { fetchDashboardStats } from '@/lib/services'
import { formatCurrency } from '@/lib/utils'
import type { DashboardStats, OrderStatus } from '@/types'

const statusVariant: Record<OrderStatus, 'default' | 'success' | 'warning' | 'destructive' | 'outline'> = {
  pending: 'warning',
  confirmed: 'default',
  processing: 'default',
  ontheway: 'outline',
  delivered: 'success',
  cancelled: 'destructive',
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoading(false))
  }, [])

  const cards = stats
    ? [
        { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag },
        { label: 'Revenue', value: formatCurrency(stats.totalRevenue), icon: TrendingUp },
        { label: 'Products', value: stats.totalProducts, icon: Package },
        { label: 'Customers', value: stats.totalUsers, icon: Users },
      ]
    : []

  return (
    <AdminLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Alex Jersey Shop overview</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : !stats ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Could not load dashboard. Is the API server running?
          </CardContent>
        </Card>
      ) : (
        <>
          {stats.pendingOrders > 0 && (
            <Card className="mb-6 border-yellow-500/30 bg-yellow-500/5">
              <CardContent className="flex items-center justify-between py-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-yellow-400" />
                  <div>
                    <p className="font-semibold">{stats.pendingOrders} orders pending</p>
                    <p className="text-xs text-muted-foreground">Need confirmation</p>
                  </div>
                </div>
                <Link href="/orders" className="flex items-center gap-1 text-sm text-primary hover:underline">
                  View <ArrowRight className="h-3 w-3" />
                </Link>
              </CardContent>
            </Card>
          )}

          <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {cards.map((card) => (
              <Card key={card.label}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{card.label}</CardTitle>
                    <card.icon className="h-4 w-4 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-black">{card.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Orders</CardTitle>
              <Link href="/orders" className="text-xs text-primary hover:underline">View all</Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {stats.recentOrders.length === 0 ? (
                <p className="text-sm text-muted-foreground">No orders yet</p>
              ) : (
                stats.recentOrders.map((order) => (
                  <div key={order._id} className="flex items-center justify-between border-b border-border/50 py-2 last:border-0">
                    <div>
                      <p className="text-sm font-semibold">{order.orderNumber}</p>
                      <p className="text-xs text-muted-foreground">
                        {order.customer.name} · {order.customer.city}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{formatCurrency(order.total)}</p>
                      <Badge variant={statusVariant[order.status]}>{order.status}</Badge>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </>
      )}
    </AdminLayout>
  )
}
