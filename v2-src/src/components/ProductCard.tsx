import { useRef, useState } from 'react'
import { motion, useMotionValue, useMotionTemplate, useReducedMotion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { batchBadge, eur, img, type Product } from '../lib/data'
import { revealItem, T } from '../lib/motion'
import { cn } from '../lib/utils'
import Img from './Img'

/* Spotlight card: a radial highlight follows the pointer across the border and
   surface. Purely decorative — the whole card is a link, so touch devices get
   the same destination without needing hover. */
export default function ProductCard({
  product,
  index,
  tabLabel,
  eager = false,
  compact = false,
}: {
  product: Product
  index: number
  tabLabel?: string
  eager?: boolean
  compact?: boolean
}) {
  const ref = useRef<HTMLAnchorElement>(null)
  const mx = useMotionValue(-400)
  const my = useMotionValue(-400)
  const [hot, setHot] = useState(false)
  const reduce = useReducedMotion()

  const spotlight = useMotionTemplate`radial-gradient(240px circle at ${mx}px ${my}px, rgba(255,77,28,0.16), transparent 72%)`
  const edge = useMotionTemplate`radial-gradient(300px circle at ${mx}px ${my}px, rgba(255,77,28,0.55), transparent 70%)`

  const track = (e: React.PointerEvent) => {
    if (reduce) return
    const r = ref.current?.getBoundingClientRect()
    if (!r) return
    mx.set(e.clientX - r.left)
    my.set(e.clientY - r.top)
  }

  const badge = batchBadge(product.name)

  return (
    <motion.a
      ref={ref}
      variants={revealItem}
      href={`#/product/${product.id}`}
      onPointerMove={track}
      onPointerEnter={() => setHot(true)}
      onPointerLeave={() => setHot(false)}
      whileHover={reduce ? undefined : { y: -4 }}
      transition={T.spring}
      className="group relative isolate block overflow-hidden rounded-xl border border-line bg-surface no-underline"
    >
      {/* pointer-follow glow on the border and the surface */}
      <motion.span
        aria-hidden
        style={{ background: edge, opacity: hot ? 1 : 0 }}
        className="pointer-events-none absolute -inset-px z-0 rounded-xl transition-opacity duration-300"
      />
      <span aria-hidden className="absolute inset-px z-0 rounded-[11px] bg-surface" />
      <motion.span
        aria-hidden
        style={{ background: spotlight, opacity: hot ? 1 : 0 }}
        className="pointer-events-none absolute inset-0 z-20 rounded-xl transition-opacity duration-300"
      />

      <div className="relative z-10">
        <div className="relative overflow-hidden">
          <Img
            src={img(product.id)}
            alt={product.name}
            eager={eager}
            className="transition-transform duration-[900ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.06]"
          />
          <span className="mono pointer-events-none absolute left-2.5 top-2.5 rounded bg-bg/70 px-1.5 py-0.5 text-dim backdrop-blur-sm">
            {String(index + 1).padStart(4, '0')}
          </span>
          {badge && (
            <span className="mono pointer-events-none absolute right-2.5 top-2.5 rounded bg-accent px-1.5 py-0.5 font-semibold text-on-accent">
              {badge}
            </span>
          )}
          <span className="pointer-events-none absolute bottom-2.5 right-2.5 flex size-8 translate-y-3 items-center justify-center rounded-full bg-accent text-on-accent opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <ArrowUpRight size={16} strokeWidth={2.5} aria-hidden />
          </span>
        </div>

        <div className={cn('flex flex-col gap-1.5', compact ? 'p-3' : 'p-3.5')}>
          {tabLabel && <span className="mono text-dim">{tabLabel}</span>}
          <span className="line-clamp-2 text-[0.8125rem] font-medium leading-snug text-fg">{product.name}</span>
          <div className="mt-0.5 flex items-end justify-between gap-2">
            {product.price != null ? (
              <span className="font-display text-base font-extrabold tracking-tight">
                {product.priceHigh != null && <span className="mono mr-1 font-normal text-dim">from</span>}
                {eur(product.price)}
              </span>
            ) : (
              <span className="mono text-dim">Ask for price</span>
            )}
            {product.sizeRange && <span className="mono shrink-0 text-dim">{product.sizeRange}</span>}
          </div>
        </div>
      </div>
    </motion.a>
  )
}
