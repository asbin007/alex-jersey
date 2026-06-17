import { cn } from '@/lib/utils'

/** Base shimmer block */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg bg-[#111] before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.4s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/5 before:to-transparent',
        className,
      )}
    />
  )
}

/** 3:4 product card skeleton */
export function ProductCardSkeleton() {
  return (
    <div className="rounded-xl sm:rounded-2xl overflow-hidden bg-[#0a0a0a] border border-[#1f1f1f]">
      <Skeleton className="aspect-[3/4] w-full rounded-none" />
      <div className="px-3 py-2.5 space-y-2">
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  )
}

/** Full-page product grid skeleton (n columns) */
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}

/** Product detail page skeleton */
export function ProductDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <div className="grid lg:grid-cols-2 gap-6 sm:gap-10 lg:gap-12">
        {/* Image */}
        <Skeleton className="aspect-square w-full rounded-xl sm:rounded-2xl" />

        {/* Info */}
        <div className="space-y-4">
          {/* Badges */}
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          {/* Title */}
          <Skeleton className="h-8 w-4/5" />
          <Skeleton className="h-6 w-1/2" />
          {/* Stars */}
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="w-4 h-4 rounded" />
            ))}
            <Skeleton className="h-4 w-16 ml-2" />
          </div>
          {/* Price */}
          <Skeleton className="h-10 w-40" />
          {/* Description */}
          <div className="space-y-2 pt-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
            <Skeleton className="h-3 w-4/6" />
          </div>
          {/* Size buttons */}
          <div className="flex gap-2 pt-2">
            {['S', 'M', 'L', 'XL', 'XXL'].map(s => (
              <Skeleton key={s} className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl" />
            ))}
          </div>
          {/* CTA buttons */}
          <Skeleton className="h-14 w-full rounded-2xl" />
          <Skeleton className="h-14 w-full rounded-2xl" />
          {/* Trust row */}
          <div className="grid grid-cols-3 gap-2">
            {[0, 1, 2].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}
          </div>
        </div>
      </div>
    </div>
  )
}

/** Order row skeleton */
export function OrderRowSkeleton() {
  return (
    <div className="bg-[#080808] border border-[#1a1a1a] rounded-2xl p-4 flex items-center gap-3">
      <Skeleton className="w-10 h-10 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-48" />
      </div>
      <div className="space-y-2 text-right">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-5 w-16 rounded-full ml-auto" />
      </div>
    </div>
  )
}

/** Admin orders row skeleton */
export function AdminOrderRowSkeleton() {
  return (
    <div className="bg-card border border-border/50 rounded-xl p-4 flex items-start gap-3">
      <div className="flex-1 space-y-2">
        <div className="flex gap-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-16 rounded-full" />
          <Skeleton className="h-4 w-12 rounded-full" />
        </div>
        <Skeleton className="h-3 w-56" />
        <Skeleton className="h-3 w-40" />
      </div>
      <Skeleton className="h-8 w-28 rounded-lg flex-shrink-0" />
    </div>
  )
}

/** Admin product table row skeleton */
export function AdminProductRowSkeleton() {
  return (
    <tr className="border-b border-border/30">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-lg flex-shrink-0" />
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      </td>
      <td className="px-4 py-3 hidden md:table-cell"><Skeleton className="h-5 w-16 rounded-full" /></td>
      <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
      <td className="px-4 py-3 hidden sm:table-cell"><Skeleton className="h-4 w-8" /></td>
      <td className="px-4 py-3"><Skeleton className="h-5 w-14 rounded-full" /></td>
      <td className="px-4 py-3">
        <div className="flex justify-end gap-1">
          <Skeleton className="w-7 h-7 rounded" />
          <Skeleton className="w-7 h-7 rounded" />
          <Skeleton className="w-7 h-7 rounded" />
        </div>
      </td>
    </tr>
  )
}
