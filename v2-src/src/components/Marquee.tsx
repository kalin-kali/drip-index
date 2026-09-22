import type { ReactNode } from 'react'
import { cn } from '../lib/utils'

/* Duplicated-track marquee: the content is rendered twice and the track is
   translated -50%, so the loop is seamless at any content width. The copy is
   aria-hidden so screen readers read the strip once. Pauses on hover and is
   disabled entirely under prefers-reduced-motion (see index.css). */
export default function Marquee({
  children,
  duration = 40,
  className,
  reverse = false,
}: {
  children: ReactNode
  duration?: number
  className?: string
  reverse?: boolean
}) {
  return (
    <div className={cn('marquee-wrap relative overflow-hidden', className)}>
      <div
        className="marquee-track flex w-max"
        style={{ '--mq-dur': `${duration}s`, animationDirection: reverse ? 'reverse' : 'normal' } as React.CSSProperties}
      >
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  )
}
