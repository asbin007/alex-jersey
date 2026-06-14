'use client'

import { useRef, useState, useEffect } from 'react'
import { X, Plus, Loader2, ImagePlus, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createProduct, updateProduct, uploadImages } from '@/lib/services'
import { toast } from 'sonner'
import type { CreateProductDTO, Product, ProductCategory, JerseyType, Size } from '@/types'

const CATEGORIES: ProductCategory[] = ['worldcup', 'retro', 'club', 'streetwear']
const JERSEY_TYPES: JerseyType[] = ['home', 'away', 'third', 'retro', 'custom']
const SIZES: Size[] = ['S', 'M', 'L', 'XL', 'XXL']

interface SizeRow { size: Size; stock: number }
const defaultSizes: SizeRow[] = SIZES.map((size) => ({ size, stock: 0 }))

interface Props {
  onClose: () => void
  onSuccess: () => void
  product?: Product // if provided → edit mode
}

export default function AddProductModal({ onClose, onSuccess, product }: Props) {
  const isEdit = !!product
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  // Images: existing URLs (from edit) + new file previews
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])

  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Pre-fill form when editing
  useEffect(() => {
    if (!product) return
    setName(product.name)
    setDescription(product.description)
    setPrice(String(product.price))
    setCompareAtPrice(product.compareAtPrice ? String(product.compareAtPrice) : '')
    setCategory(product.category)
    setTeam(product.team)
    setPlayer(product.player ?? '')
    setJerseyType(product.jerseyType)
    setTags(product.tags.join(', '))
    setIsFeatured(product.isFeatured)
    setIsLimitedDrop(product.isLimitedDrop)
    setAllowCustomization(product.allowCustomization)
    setExistingImages(product.images)
    // Merge existing sizes with default, filling in stock values
    setSizes(SIZES.map((s) => {
      const found = product.sizes.find((ps) => ps.size === s)
      return { size: s, stock: found ? found.stock : 0 }
    }))
  }, [product])

  const totalImages = existingImages.length + imageFiles.length

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    const remaining = 5 - totalImages
    if (remaining <= 0) { toast.error('Maximum 5 images'); return }
    const toAdd = files.slice(0, remaining)
    setImageFiles((prev) => [...prev, ...toAdd])
    toAdd.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (ev) => setImagePreviews((prev) => [...prev, ev.target?.result as string])
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  const removeExisting = (i: number) => setExistingImages((prev) => prev.filter((_, idx) => idx !== i))
  const removeNew = (i: number) => {
    setImageFiles((prev) => prev.filter((_, idx) => idx !== i))
    setImagePreviews((prev) => prev.filter((_, idx) => idx !== i))
  }

  const updateStock = (size: Size, value: string) => {
    const stock = Math.max(0, parseInt(value, 10) || 0)
    setSizes((prev) => prev.map((s) => (s.size === size ? { ...s, stock } : s)))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (totalImages === 0) { toast.error('Add at least one image'); return }
    if (!sizes.some((s) => s.stock > 0)) { toast.error('At least one size must have stock > 0'); return }

    try {
      let uploadedUrls: string[] = []
      if (imageFiles.length > 0) {
        setUploading(true)
        const results = await uploadImages(imageFiles)
        uploadedUrls = results.map((r) => r.url)
        setUploading(false)
      }

      const allImages = [...existingImages, ...uploadedUrls]

      const payload: CreateProductDTO = {
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price),
        compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : undefined,
        images: allImages,
        category,
        team: team.trim(),
        player: player.trim() || undefined,
        jerseyType,
        sizes: sizes.filter((s) => s.stock > 0),
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        isFeatured,
        isLimitedDrop,
        allowCustomization,
      }

      setSubmitting(true)
      if (isEdit && product) {
        await updateProduct(product._id, payload)
        toast.success('Product updated')
      } else {
        await createProduct(payload)
        toast.success('Product created')
      }
      onSuccess()
      onClose()
    } catch (err: any) {
      setUploading(false)
      const message =
        err?.response?.data?.errors?.[0]?.msg ||
        err?.response?.data?.error ||
        `Failed to ${isEdit ? 'update' : 'create'} product`
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  const isLoading = uploading || submitting

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/50">
      <div className="flex h-full w-full max-w-xl flex-col bg-background shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="text-lg font-black flex items-center gap-2">
              {isEdit ? <Pencil className="h-5 w-5 text-primary" /> : <Plus className="h-5 w-5 text-primary" />}
              {isEdit ? 'Edit Product' : 'Add Product'}
            </h2>
            <p className="text-xs text-muted-foreground">
              {isEdit ? `Editing: ${product?.name}` : 'Fill in the details to list a new jersey'}
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-y-auto">
          <div className="flex-1 space-y-5 px-6 py-5">

            {/* Images */}
            <section>
              <label className="mb-2 block text-sm font-semibold">
                Images <span className="text-destructive">*</span>
                <span className="ml-1 font-normal text-muted-foreground">({totalImages}/5)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {/* Existing images */}
                {existingImages.map((src, i) => (
                  <div key={`ex-${i}`} className="relative h-20 w-20 overflow-hidden rounded-lg border border-border bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="h-full w-full object-cover" />
                    <button type="button" onClick={() => removeExisting(i)}
                      className="absolute right-0.5 top-0.5 rounded bg-black/60 p-0.5 text-white hover:bg-black/80">
                      <X className="h-3 w-3" />
                    </button>
                    <span className="absolute bottom-0.5 left-0.5 rounded bg-black/50 px-1 text-[9px] text-white">saved</span>
                  </div>
                ))}
                {/* New image previews */}
                {imagePreviews.map((src, i) => (
                  <div key={`new-${i}`} className="relative h-20 w-20 overflow-hidden rounded-lg border border-primary/40 bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="h-full w-full object-cover" />
                    <button type="button" onClick={() => removeNew(i)}
                      className="absolute right-0.5 top-0.5 rounded bg-black/60 p-0.5 text-white hover:bg-black/80">
                      <X className="h-3 w-3" />
                    </button>
                    <span className="absolute bottom-0.5 left-0.5 rounded bg-primary/70 px-1 text-[9px] text-white">new</span>
                  </div>
                ))}
                {totalImages < 5 && (
                  <button type="button" onClick={() => fileInputRef.current?.click()}
                    className="flex h-20 w-20 flex-col items-center justify-center rounded-lg border-2 border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                    <ImagePlus className="h-5 w-5" />
                    <span className="mt-1 text-[10px]">Add</span>
                  </button>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
            </section>

            {/* Name */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold">Name <span className="text-destructive">*</span></label>
              <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Nepal National Jersey 2024" />
            </div>

            {/* Description */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold">Description <span className="text-destructive">*</span></label>
              <textarea required rows={3} value={description} onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the product..."
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none" />
            </div>

            {/* Price */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-sm font-semibold">Price (Rs.) <span className="text-destructive">*</span></label>
                <Input required type="number" min="1" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g. 2500" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold">Compare At (Rs.)</label>
                <Input type="number" min="1" step="0.01" value={compareAtPrice} onChange={(e) => setCompareAtPrice(e.target.value)} placeholder="Original price" />
              </div>
            </div>

            {/* Team + Player */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-sm font-semibold">Team <span className="text-destructive">*</span></label>
                <Input required value={team} onChange={(e) => setTeam(e.target.value)} placeholder="e.g. Nepal" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold">Player</label>
                <Input value={player} onChange={(e) => setPlayer(e.target.value)} placeholder="e.g. Bimal Magar" />
              </div>
            </div>

            {/* Category + Jersey Type */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-sm font-semibold">Category <span className="text-destructive">*</span></label>
                <select value={category} onChange={(e) => setCategory(e.target.value as ProductCategory)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold">Jersey Type <span className="text-destructive">*</span></label>
                <select value={jerseyType} onChange={(e) => setJerseyType(e.target.value as JerseyType)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                  {JERSEY_TYPES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
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
                    <Input type="number" min="0" value={stock} onChange={(e) => updateStock(size, e.target.value)} className="text-center px-1" />
                  </div>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold">Tags</label>
              <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="football, nepal, home — comma separated" />
            </div>

            {/* Flags */}
            <div className="flex flex-wrap gap-4">
              {[
                { label: 'Featured', value: isFeatured, set: setIsFeatured },
                { label: 'Limited Drop', value: isLimitedDrop, set: setIsLimitedDrop },
                { label: 'Allow Customization', value: allowCustomization, set: setAllowCustomization },
              ].map(({ label, value, set }) => (
                <label key={label} className="flex cursor-pointer items-center gap-2 text-sm select-none">
                  <input type="checkbox" checked={value} onChange={(e) => set(e.target.checked)}
                    className="h-4 w-4 rounded border-border accent-primary" />
                  {label}
                </label>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
            <Button type="submit" disabled={isLoading} className="min-w-[130px]">
              {isLoading ? (
                <><Loader2 className="h-4 w-4 animate-spin" />{uploading ? 'Uploading...' : 'Saving...'}</>
              ) : isEdit ? (
                <><Pencil className="h-4 w-4" /> Save Changes</>
              ) : (
                <><Plus className="h-4 w-4" /> Add Product</>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
