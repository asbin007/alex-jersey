'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Search, Eye, EyeOff, Trash2, Loader2, Plus, Pencil } from 'lucide-react'
import AdminLayout from '../adminLayout/adminLayout'
import AddProductModal from '@/components/AddProductModal'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { deleteProduct, fetchProducts, toggleProductActive } from '@/lib/services'
import { formatCurrency } from '@/lib/utils'
import type { Product } from '@/types'
import { toast } from 'sonner'

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)

  const load = () => {
    setLoading(true)
    fetchProducts()
      .then(setProducts)
      .catch(() => toast.error('Failed to load products'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.team.toLowerCase().includes(search.toLowerCase())
  )

  const totalStock = (p: Product) => p.sizes.reduce((sum, s) => sum + s.stock, 0)

  const handleToggle = async (p: Product) => {
    try {
      await toggleProductActive(p._id, !p.isActive)
      toast.success(p.isActive ? 'Product hidden' : 'Product activated')
      load()
    } catch {
      toast.error('Update failed')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return
    try {
      await deleteProduct(id)
      toast.success('Product deleted')
      load()
    } catch {
      toast.error('Delete failed')
    }
  }

  return (
    <AdminLayout>
      {/* Add modal */}
      {showAddModal && (
        <AddProductModal onClose={() => setShowAddModal(false)} onSuccess={load} />
      )}
      {/* Edit modal */}
      {editProduct && (
        <AddProductModal
          product={editProduct}
          onClose={() => setEditProduct(null)}
          onSuccess={() => { load(); setEditProduct(null) }}
        />
      )}

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">Products</h1>
          <p className="text-sm text-muted-foreground">{products.length} jerseys in catalog</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4" /> Add Product
        </Button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : (
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3 hidden md:table-cell">Team</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3 hidden sm:table-cell">Stock</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product) => (
                  <tr key={product._id} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                          {product.images[0] && (
                            <Image src={product.images[0]} alt={product.name} fill className="object-cover" unoptimized />
                          )}
                        </div>
                        <div>
                          <p className="font-medium line-clamp-1">{product.name}</p>
                          <p className="text-xs text-muted-foreground capitalize">{product.jerseyType} kit</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">{product.team}</td>
                    <td className="px-4 py-3 font-semibold">{formatCurrency(product.price)}</td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className={totalStock(product) <= 5 ? 'text-red-400 font-semibold' : ''}>
                        {totalStock(product)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={product.isActive ? 'success' : 'outline'}>
                        {product.isActive ? 'Active' : 'Hidden'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" title="Edit product" onClick={() => setEditProduct(product)}>
                          <Pencil className="h-4 w-4 text-primary" />
                        </Button>
                        <Button variant="ghost" size="icon" title={product.isActive ? 'Hide' : 'Show'} onClick={() => handleToggle(product)}>
                          {product.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" title="Delete" onClick={() => handleDelete(product._id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <p className="py-12 text-center text-muted-foreground">No products found</p>
            )}
          </CardContent>
        </Card>
      )}
    </AdminLayout>
  )
}
