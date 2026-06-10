'use client'

import { useRef, useState } from 'react'
import { X, Plus, Trash2, Upload, Loader2, ImagePlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createProduct, uploadImages } from '@/lib/services'
import { toast } from 'sonner'
import type { CreateProductDTO, ProductCategory, JerseyType, Size } from '@/types'

const CATEGORIES: ProductCategory[] = ['worldcup', 'retro', 'club', 'streetwear']
const JERSEY_TYPES: JerseyType[] = ['home', 'away', 'third', 'retro', 'custom']
const SIZES: Size[] = ['S', 'M', 'L', 'XL', 'XXL']

interface SizeRow {
  size: Size
  stock: number
}

const defaultSizes: SizeRow[] = SIZES.map((size) => ({ size, stock: 0 }))

interface Props {
  onClose: () => void
  onSuccess: () => void
}

export default function AddProductModal({ onClose, onSuccess }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [compareAtPrice, setCompareAtPrice] = useState('')
  const [category, setCategory] = useState<ProductCategory>('club')
  const [team, setTeam] = useState('')
  const [player, setPlayer] = useState('')
  const [jerseyType, setJerseyType] = useState<JerseyType>('home')
  const [tags, setTags] = useState('')
  const [isFeatured, setIsFeatured] = useState(false)
  const [isLimitedDrop, setIsLimitedDrop] = useState(false)
  const [allowCustomization, setAllowCustomization] = useState(false)
  const [sizes, setSizes] = useState<SizeRow[]>(defaultSizes)

  // Image state
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])

  // Loading
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // ── Image helpers ─────────────────────────────────────────────────────────

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return

    const remaining = 5 - imageFiles.length
    if (remaining <= 0) {
      toast.error('Maximum 5 images allowed')
      return
    }
    const toAdd = files.slice(0, remaining)
    setImageFiles((prev) => [...prev, ...toAdd])
    toAdd.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (ev) => {
        setImagePreviews((prev) => [...prev, ev.target?.result as string])
      }
      reader.readAsDataURL(file)
    })
    // reset input so same file can be re-selected if removed
    e.target.value = ''
  }

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index))
    setImagePreviews((prev) => prev.filter((_, i) => i !== index))
  }

  // ── Size helpers ──────────────────────────────────────────────────────────

  const updateStock = (size: Size, value: string) => {
    const stock = Math.max(0, parseInt(value, 10) || 0)
    setSizes((prev) => prev.map((s) => (s.size === size ? { ...s, stock } : s)))
  }

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (imageFiles.length === 0) {
      toast.error('Please add at least one product image')
      return
    }
    const activeSizes = sizes.filter((s) => s.stock > 0)
    if (activeSizes.length === 0) {
      toast.error('At least one size must have stock greater than 0')
      return
    }

    try {
      // Step 1: upload images to Cloudinary
      setUploading(true)
      const uploadResults = await uploadImages(imageFiles)
      setUploading(false)

      const imageUrls = uploadResults.map((r) => r.url)

      // Step 2: create product with uploaded image URLs
      setSubmitting(true)
      const payload: CreateProductDTO = {
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price),
        compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : undefined,
        images: imageUrls,
        category,
        team: team.trim(),
        player: player.trim() || undefined,
        jerseyType,
        sizes: sizes.filter((s) => s.stock > 0),
        tags: tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        isFeatured,
        isLimitedDrop,
        allowCustomization,
      }

      await createProduct(payload)
      toast.success('Product created successfully')
      onSuccess()
      onClose()
    } catch (err: any) {
      setUploading(false)
      setSubmitting(false)
      const message =
        err?.response?.data?.errors?.[0]?.msg ||
        err?.response?.data?.error ||
        'Failed to create product'
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  const isLoading = uploading || submitting

  return (
    // Backdrop
    <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/50">
      {/* Slide-over panel */}
      <div className="flex h-full w-full max-w-xl flex-col bg-background shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="text-lg font-black">Add Product</h2>
            <p className="text-xs text-muted-foreground">Fill in the details to list a new jersey</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-y-auto">
          <div className="flex-1 space-y-5 px-6 py-5">

            {/* Images */}
            <section>
              <label className="mb-2 block text-sm font-semibold">
                Images <span className="text-destructive">*</span>
                <span className="ml-1 font-normal text-muted-foreground">({imageFiles.length}/5)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {imagePreviews.map((src, i) => (
                  <div key={i} className="relative h-20 w-20 overflow-hidden rounded-lg border border-border bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt={`preview-${i}`} className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute right-0.5 top-0.5 rounded bg-black/60 p-0.5 text-white hover:bg-black/80"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {imageFiles.length < 5 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex h-20 w-20 flex-col items-center justify-center rounded-lg border-2 border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                  >
                    <ImagePlus className="h-5 w-5" />
                    <span className="mt-1 text-[10px]">Add</span>
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
            </section>

            {/* Name */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold">
                Name <span className="text-destructive">*</span>
              </label>
              <Input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Nepal National Jersey 2024"
              />
            </div>

            {/* Description */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold">
                Description <span className="text-destructive">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the product..."
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              />
            </div>

            {/* Price + Compare */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-sm font-semibold">
                  Price (Rs.) <span className="text-destructive">*</span>
                </label>
                <Input
                  required
                  type="number"
                  min="1"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g. 2500"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold">
                  Compare At (Rs.)
                </label>
                <Input
                  type="number"
                  min="1"
                  step="0.01"
                  value={compareAtPrice}
                  onChange={(e) => setCompareAtPrice(e.target.value)}
                  placeholder="Original price"
                />
              </div>
            </div>

            {/* Team + Player */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-sm font-semibold">
                  Team <span className="text-destructive">*</span>
                </label>
                <Input
                  required
                  value={team}
                  onChange={(e) => setTeam(e.target.value)}
                  placeholder="e.g. Nepal"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold">Player</label>
                <Input
                  value={player}
                  onChange={(e) => setPlayer(e.target.value)}
                  placeholder="e.g. Bimal Magar"
                />
              </div>
            </div>

            {/* Category + Jersey Type */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-sm font-semibold">
                  Category <span className="text-destructive">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ProductCategory)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c} className="capitalize">
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold">
                  Jersey Type <span className="text-destructive">*</span>
                </label>
                <select
                  value={jerseyType}
                  onChange={(e) => setJerseyType(e.target.value as JerseyType)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {JERSEY_TYPES.map((t) => (
                    <option key={t} value={t} className="capitalize">
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sizes & Stock */}
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Sizes & Stock <span className="text-destructive">*</span>
                <span className="ml-1 font-normal text-muted-foreground">(at least one &gt; 0)</span>
              </label>
              <div className="grid grid-cols-5 gap-2">
                {sizes.map(({ size, stock }) => (
                  <div key={size} className="flex flex-col items-center gap-1">
                    <span className="text-xs font-semibold text-muted-foreground">{size}</span>
                    <Input
                      type="number"
                      min="0"
                      value={stock}
                      onChange={(e) => updateStock(size, e.target.value)}
                      className="text-center px-1"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold">Tags</label>
              <Input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="football, nepal, home — comma separated"
              />
            </div>

            {/* Flags */}
            <div className="flex flex-wrap gap-4">
              {[
                { label: 'Featured', value: isFeatured, set: setIsFeatured },
                { label: 'Limited Drop', value: isLimitedDrop, set: setIsLimitedDrop },
                { label: 'Allow Customization', value: allowCustomization, set: setAllowCustomization },
              ].map(({ label, value, set }) => (
                <label key={label} className="flex cursor-pointer items-center gap-2 text-sm select-none">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => set(e.target.checked)}
                    className="h-4 w-4 rounded border-border accent-primary"
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="min-w-[130px]">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {uploading ? 'Uploading...' : 'Saving...'}
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Add Product
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
