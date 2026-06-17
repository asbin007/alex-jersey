import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Edit, Trash2, Search, Eye, EyeOff } from 'lucide-react'
import { fetchAdminProducts, updateAdminProduct, deleteAdminProduct } from '@/services/adminService'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AdminProductRowSkeleton } from '@/components/ui/skeleton'
import type { Product } from '@/types'

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const loadProducts = () => {
    setLoading(true)
    fetchAdminProducts()
      .then(setProducts)
      .catch((err) => console.error("Failed to load products", err))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.team.toLowerCase().includes(search.toLowerCase())
  )

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await updateAdminProduct(id, { isActive: !currentStatus })
      setProducts(prev => prev.map(p => p._id === id ? { ...p, isActive: !currentStatus } : p))
    } catch (err) {
      console.error("Failed to toggle product status", err)
    }
  }

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteAdminProduct(id)
        setProducts(prev => prev.filter(p => p._id !== id))
      } catch (err) {
        console.error("Failed to delete product", err)
      }
    }
  }

  const totalStock = (p: Product) => p.sizes.reduce((sum, s) => sum + s.stock, 0)

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-foreground">Products</h1>
          <p className="text-sm text-muted-foreground mt-1">{products.length} total products</p>
        </div>
        <Link to="/admin/products/new">
          <Button className="bg-primary hover:bg-primary/90 text-black font-bold text-sm">
            <Plus className="w-4 h-4 mr-1" /> Add Product
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search products..."
          className="w-full pl-9 pr-4 py-2.5 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Table */}
      <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Product</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Category</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Price</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Stock</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 8 }).map((_, i) => <AdminProductRowSkeleton key={i} />)
                : filtered.map(product => (
                <tr key={product._id} className="border-b border-border/30 last:border-0 hover:bg-white/[0.03] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                        onError={e => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=60&q=50'
                        }}
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground line-clamp-1">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.team}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <Badge variant="outline" className="text-xs capitalize">{product.category}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-semibold text-foreground">Rs.&nbsp;{product.price.toLocaleString()}</p>
                    {product.compareAtPrice && (
                      <p className="text-xs text-muted-foreground line-through">
                        Rs.&nbsp;{product.compareAtPrice.toLocaleString()}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className={`text-sm font-medium ${
                      totalStock(product) === 0
                        ? 'text-destructive'
                        : totalStock(product) < 5
                        ? 'text-yellow-400'
                        : 'text-green-400'
                    }`}>
                      {totalStock(product)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={product.isActive ? 'success' : 'outline'}>
                      {product.isActive ? 'Active' : 'Hidden'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => toggleActive(product._id, product.isActive)}
                        className="p-1.5 rounded hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors"
                        title={product.isActive ? 'Hide product' : 'Show product'}
                      >
                        {product.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <Link
                        to={`/admin/products/${product._id}/edit`}
                        className="p-1.5 rounded hover:bg-white/5 text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDeleteProduct(product._id)}
                        className="p-1.5 rounded hover:bg-white/5 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && filtered.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-12">No products found</p>
        )}
      </div>
    </div>
  )
}
