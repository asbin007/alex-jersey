'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { cn } from '@/lib/utils'

const delayMap: Record<number, number> = {
  0: 0,
  1: 0.1,
  2: 0.2,
  3: 0.3,
  4: 0.4,
  5: 0.5,
}

interface Props {
  children: React.ReactNode
  className?: string
  delay?: 0 | 1 | 2 | 3 | 4 | 5
  /** Direction the element slides in from */
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
}

export default function Reveal({
  children,
  className,
  delay = 0,
  direction = 'up',
}: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -60px 0px' })

  const dirOffset = {
    up: { y: 28, x: 0 },
    down: { y: -28, x: 0 },
    left: { x: 28, y: 0 },
    right: { x: -28, y: 0 },
    none: { x: 0, y: 0 },
  }[direction]

  return (
    <motion.div
      ref={ref}
      className={cn(className)}
      initial={{ opacity: 0, ...dirOffset }}
      animate={inView ? { opacity: 1, x: 0, y: 0 } : {}}
      transition={{
        duration: 0.55,
        delay: delayMap[delay],
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  )
}
