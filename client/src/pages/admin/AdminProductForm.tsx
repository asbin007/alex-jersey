import { useRef, useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ImagePlus, X, Loader2, Plus } from 'lucide-react'
import { createAdminProduct, uploadProductImages, fetchAdminProducts, updateAdminProduct } from '@/services/adminService'
import { Button } from '@/components/ui/button'
import type { ProductCategory, JerseyType, Size, SizeStock } from '@/types'
import type { CreateProductDTO } from '@/types/dto'

const CATEGORIES: ProductCategory[] = ['worldcup', 'retro', 'club', 'streetwear']
const JERSEY_TYPES: JerseyType[] = ['home', 'away', 'third', 'retro', 'custom']
const SIZES: Size[] = ['S', 'M', 'L', 'XL', 'XXL']

type Mode = 'create' | 'edit'

function InputField({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      {children}
    </div>
  )
}

const inputClass =
  'w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary'

export default function AdminProductForm() {
  const navigate = useNavigate()
  const { id } = useParams<{ id?: string }>()
  const mode: Mode = id ? 'edit' : 'create'

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Form fields
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
  const [grade, setGrade] = useState<'A' | 'B' | null>(null)
  const [gradeDescription, setGradeDescription] = useState('')
  const [sizes, setSizes] = useState<SizeStock[]>(
    SIZES.map((size) => ({ size, stock: 0 }))
  )

  // Image state: new files to upload + existing URLs (edit mode)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([])

  // UI state
  const [loadingProduct, setLoadingProduct] = useState(mode === 'edit')
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // In edit mode — load existing product data
  useEffect(() => {
    if (mode !== 'edit' || !id) return
    setLoadingProduct(true)
    fetchAdminProducts()
      .then((products) => {
        const p = products.find((p) => p._id === id)
        if (!p) {
          setError('Product not found')
          return
        }
        setName(p.name)
        setDescription(p.description)
        setPrice(String(p.price))
        setCompareAtPrice(p.compareAtPrice ? String(p.compareAtPrice) : '')
        setCategory(p.category)
        setTeam(p.team)
        setPlayer(p.player ?? '')
        setJerseyType(p.jerseyType)
        setTags(p.tags.join(', '))
        setIsFeatured(p.isFeatured)
        setIsLimitedDrop(p.isLimitedDrop)
        setAllowCustomization(p.allowCustomization)
        setGrade(p.grade ?? null)
        setGradeDescription(p.gradeDescription ?? '')
        setExistingImageUrls(p.images)
        // Merge existing sizes with defaults
        const merged = SIZES.map((s) => {
          const found = p.sizes.find((ps) => ps.size === s)
          return { size: s, stock: found ? found.stock : 0 }
        })
        setSizes(merged)
      })
      .catch(() => setError('Failed to load product'))
      .finally(() => setLoadingProduct(false))
  }, [mode, id])

  // ── Image helpers ──────────────────────────────────────────────────────────

  const totalImages = existingImageUrls.length + imageFiles.length

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return
    const remaining = 5 - totalImages
    if (remaining <= 0) {
      alert('Maximum 5 images allowed')
      return
    }
    const toAdd = files.slice(0, remaining)
    setImageFiles((prev) => [...prev, ...toAdd])
    toAdd.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (ev) =>
        setImagePreviews((prev) => [...prev, ev.target?.result as string])
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  const removeExistingImage = (index: number) => {
    setExistingImageUrls((prev) => prev.filter((_, i) => i !== index))
  }

  const removeNewImage = (index: number) => {
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
    setError(null)

    const totalImageCount = existingImageUrls.length + imageFiles.length
    if (totalImageCount === 0) {
      setError('Please add at least one product image')
      return
    }
    const activeSizes = sizes.filter((s) => s.stock > 0)
    if (activeSizes.length === 0) {
      setError('At least one size must have stock greater than 0')
      return
    }

    try {
      let newImageUrls: string[] = []

      // Upload new files if any
      if (imageFiles.length > 0) {
        setUploading(true)
        const results = await uploadProductImages(imageFiles)
        newImageUrls = results.map((r) => r.url)
        setUploading(false)
      }

      const allImageUrls = [...existingImageUrls, ...newImageUrls]

      const payload: CreateProductDTO = {
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price),
        compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : undefined,
        images: allImageUrls,
        category,
        team: team.trim(),
        player: player.trim() || undefined,
        jerseyType,
        grade,
        gradeDescription: gradeDescription.trim() || null,
        sizes: sizes.filter((s) => s.stock > 0),
        tags: tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        isFeatured,
        isLimitedDrop,
        allowCustomization,
      }

      setSubmitting(true)
      if (mode === 'edit' && id) {
        await updateAdminProduct(id, payload)
      } else {
        await createAdminProduct(payload)
      }
      navigate('/admin/products')
    } catch (err: any) {
      setUploading(false)
      setSubmitting(false)
      const message =
        err?.response?.data?.errors?.[0]?.msg ||
        err?.response?.data?.error ||
        `Failed to ${mode === 'edit' ? 'update' : 'create'} product`
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  const isLoading = uploading || submitting

  if (loadingProduct) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Page header */}
      <div className="mb-8 flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/products')}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Products
        </button>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-black text-foreground">
          {mode === 'edit' ? 'Edit Product' : 'Add Product'}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {mode === 'edit'
            ? 'Update product details below'
            : 'Fill in the details to add a new jersey to the catalog'}
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ── Images ── */}
        <div className="rounded-xl border border-border/50 bg-card p-5">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Images ({totalImages}/5)
          </h2>
          <div className="flex flex-wrap gap-3">
            {/* Existing images */}
            {existingImageUrls.map((url, i) => (
              <div
                key={`existing-${i}`}
                className="relative h-24 w-24 overflow-hidden rounded-lg border border-border bg-muted"
              >
                <img src={url} alt={`product-${i}`} className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeExistingImage(i)}
                  className="absolute right-0.5 top-0.5 rounded bg-black/60 p-0.5 text-white hover:bg-black/80"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}

            {/* New image previews */}
            {imagePreviews.map((src, i) => (
              <div
                key={`new-${i}`}
                className="relative h-24 w-24 overflow-hidden rounded-lg border border-primary/40 bg-muted"
              >
                <img src={src} alt={`new-${i}`} className="h-full w-full object-cover" />
                <div className="absolute left-0.5 top-0.5 rounded bg-primary/80 px-1 py-0.5 text-[9px] font-bold text-white">
                  NEW
                </div>
                <button
                  type="button"
                  onClick={() => removeNewImage(i)}
                  className="absolute right-0.5 top-0.5 rounded bg-black/60 p-0.5 text-white hover:bg-black/80"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}

            {/* Add button */}
            {totalImages < 5 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-24 w-24 flex-col items-center justify-center rounded-lg border-2 border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors"
              >
                <ImagePlus className="h-6 w-6" />
                <span className="mt-1 text-xs">Add Photo</span>
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
          <p className="mt-2 text-xs text-muted-foreground">
            JPEG, PNG, WebP, AVIF · Max 5MB per image · Up to 5 images
          </p>
        </div>

        {/* ── Basic Info ── */}
        <div className="rounded-xl border border-border/50 bg-card p-5 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Basic Information
          </h2>

          <InputField label="Product Name" required>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Nepal National Jersey 2024"
              className={inputClass}
            />
          </InputField>

          <InputField label="Description" required>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the product, material, fit, etc."
              className={`${inputClass} resize-none`}
            />
          </InputField>

          <div className="grid grid-cols-2 gap-4">
            <InputField label="Price (Rs.)" required>
              <input
                required
                type="number"
                min="1"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 2500"
                className={inputClass}
              />
            </InputField>
            <InputField label="Compare At Price (Rs.)">
              <input
                type="number"
                min="1"
                step="0.01"
                value={compareAtPrice}
                onChange={(e) => setCompareAtPrice(e.target.value)}
                placeholder="Original / strikethrough"
                className={inputClass}
              />
            </InputField>
          </div>
        </div>

        {/* ── Classification ── */}
        <div className="rounded-xl border border-border/50 bg-card p-5 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Classification
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <InputField label="Team" required>
              <input
                required
                value={team}
                onChange={(e) => setTeam(e.target.value)}
                placeholder="e.g. Nepal"
                className={inputClass}
              />
            </InputField>
            <InputField label="Player">
              <input
                value={player}
                onChange={(e) => setPlayer(e.target.value)}
                placeholder="e.g. Bimal Magar"
                className={inputClass}
              />
            </InputField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InputField label="Category" required>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductCategory)}
                className={inputClass}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </option>
                ))}
              </select>
            </InputField>
            <InputField label="Jersey Type" required>
              <select
                value={jerseyType}
                onChange={(e) => setJerseyType(e.target.value as JerseyType)}
                className={inputClass}
              >
                {JERSEY_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </option>
                ))}
              </select>
            </InputField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InputField label="Grade">
              <select
                value={grade ?? ''}
                onChange={(e) => setGrade(e.target.value === '' ? null : e.target.value as 'A' | 'B')}
                className={inputClass}
              >
                <option value="">No Grade</option>
                <option value="A">A Grade</option>
                <option value="B">B Grade</option>
              </select>
            </InputField>
            {grade && (
              <InputField label="Grade Description">
                <textarea
                  value={gradeDescription}
                  onChange={(e) => setGradeDescription(e.target.value)}
                  placeholder="Describe the grade characteristics..."
                  className={`${inputClass} resize-none h-[42px]`}
                />
              </InputField>
            )}
          </div>

          <InputField label="Tags">
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="football, nepal, home — comma separated"
              className={inputClass}
            />
          </InputField>
        </div>

        {/* ── Sizes & Stock ── */}
        <div className="rounded-xl border border-border/50 bg-card p-5">
          <h2 className="mb-1 text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Sizes & Stock <span className="text-destructive">*</span>
          </h2>
          <p className="mb-4 text-xs text-muted-foreground">Set stock to 0 to mark a size as unavailable</p>
          <div className="grid grid-cols-5 gap-3">
            {sizes.map(({ size, stock }) => (
              <div key={size} className="flex flex-col items-center gap-1.5">
                <span className="text-xs font-bold text-muted-foreground">{size}</span>
                <input
                  type="number"
                  min="0"
                  value={stock}
                  onChange={(e) => updateStock(size as Size, e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-2 py-2 text-center text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            ))}
          </div>
        </div>

        {/* ── Flags ── */}
        <div className="rounded-xl border border-border/50 bg-card p-5">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Options
          </h2>
          <div className="space-y-3">
            {[
              {
                id: 'featured',
                label: 'Featured Product',
                desc: 'Show this product in the featured section on the homepage',
                value: isFeatured,
                set: setIsFeatured,
              },
              {
                id: 'limitedDrop',
                label: 'Limited Drop',
                desc: 'Mark as a limited edition or limited stock release',
                value: isLimitedDrop,
                set: setIsLimitedDrop,
              },
              {
                id: 'customization',
                label: 'Allow Customization',
                desc: 'Customers can add custom name & number to this jersey',
                value: allowCustomization,
                set: setAllowCustomization,
              },
            ].map(({ id, label, desc, value, set }) => (
              <label
                key={id}
                className="flex cursor-pointer items-start gap-3 rounded-lg border border-border/50 p-3 hover:bg-white/3 transition-colors select-none"
              >
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => set(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-border accent-primary"
                />
                <div>
                  <p className="text-sm font-medium text-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="flex items-center justify-end gap-3 pb-8">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/admin/products')}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} className="min-w-[160px]">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {uploading ? 'Uploading images...' : 'Saving...'}
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                {mode === 'edit' ? 'Save Changes' : 'Add Product'}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
