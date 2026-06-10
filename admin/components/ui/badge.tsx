import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary/15 text-primary',
        success: 'border-transparent bg-green-500/15 text-green-400',
        warning: 'border-transparent bg-yellow-500/15 text-yellow-400',
        destructive: 'border-transparent bg-destructive/15 text-destructive',
        outline: 'text-muted-foreground',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

export function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}
