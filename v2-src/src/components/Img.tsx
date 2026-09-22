import { useState } from 'react'
import { cn } from '../lib/utils'

/* Every image reserves its box before it loads and fades in over a tonal
   placeholder, so the grid never shifts (CLS) and never flashes white. */
export default function Img({
  src,
  alt,
  className,
  ratio = '1 / 1',
  eager = false,
  fit = 'cover',
}: {
  src: string
  alt: string
  className?: string
  ratio?: string
  eager?: boolean
  fit?: 'cover' | 'contain'
}) {
  const [state, setState] = useState<'load' | 'done' | 'fail'>('load')

  return (
    <div className={cn('relative overflow-hidden bg-elevated', className)} style={{ aspectRatio: ratio }}>
      {state !== 'done' && (
        <div
          aria-hidden
          className={cn(
            'absolute inset-0 bg-[linear-gradient(110deg,var(--color-elevated)_30%,var(--color-line-2)_50%,var(--color-elevated)_70%)] bg-[length:220%_100%]',
            state === 'load' && 'animate-[shimmer_1.4s_infinite]',
          )}
        />
      )}
      {state !== 'fail' && (
        <img
          src={src}
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={eager ? 'high' : 'auto'}
          onLoad={() => setState('done')}
          onError={() => setState('fail')}
          className={cn(
            'absolute inset-0 h-full w-full transition-opacity duration-500',
            fit === 'cover' ? 'object-cover' : 'object-contain',
            state === 'done' ? 'opacity-100' : 'opacity-0',
          )}
        />
      )}
    </div>
  )
}
