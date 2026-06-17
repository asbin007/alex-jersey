import { cn } from '@/lib/utils'
import { useScrollReveal } from '@/hooks/useScrollReveal'

interface Props {
  children: React.ReactNode
  className?: string
  delay?: 0 | 1 | 2 | 3 | 4 | 5
}

export default function Reveal({ children, className, delay = 0 }: Props) {
  const { ref, visible } = useScrollReveal<HTMLDivElement>()

  return (
    <div
      ref={ref}
      className={cn(
        'scroll-reveal',
        visible && 'scroll-reveal-visible',
        delay > 0 && `scroll-reveal-delay-${delay}`,
        className,
      )}
    >
      {children}
    </div>
  )
}
