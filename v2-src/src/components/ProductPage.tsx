import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowLeft, Check, Ruler, ShieldCheck, ShoppingBag, Truck } from 'lucide-react'
import { addToCart } from '../lib/cart'
import { batchBadge, eur, FACETS, img, legacyProduct, TAB_LABEL, type Catalogue } from '../lib/data'
import { EASE, inView, reveal, revealItem, T } from '../lib/motion'
import Img from './Img'
import ProductCard from './ProductCard'

const MAX_SHOTS = 5

/* The catalogue data doesn't record how many shots a product has (it ranges
   from 1 to 5), so probe the numbered files and keep the ones that decode. */
function useGallery(id: string) {
  const [shots, setShots] = useState<string[]>([img(id, 0)])

  useEffect(() => {
    let alive = true
    const found: string[] = []
    Promise.all(
      Array.from({ length: MAX_SHOTS }, (_, n) =>
        new Promise<void>((done) => {
          const im = new Image()
          im.onload = () => {
            found[n] = img(id, n)
            done()
          }
          im.onerror = () => done()
          im.src = img(id, n)
        }),
      ),
    ).then(() => {
      if (!alive) return
      const list = found.filter(Boolean)
      setShots(list.length ? list : [img(id, 0)])
    })
    return () => {
      alive = false
    }
  }, [id])

  return shots
}

export default function ProductPage({ data, id, onFacet }: { data: Catalogue; id: string; onFacet: (f: (typeof FACETS)[0]) => void }) {
  const reduce = useReducedMotion()
  const product = useMemo(() => data.items.find((p) => p.id === id), [data, id])
  const shots = useGallery(id)
  const [shot, setShot] = useState(0)
  const [size, setSize] = useState<string | null>(null)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
    setShot(0)
    setSize(null)
    setAdded(false)
  }, [id])

  useEffect(() => {
    if (!added) return
    const t = setTimeout(() => setAdded(false), 2000)
    return () => clearTimeout(t)
  }, [added])

  const related = useMemo(() => {
    if (!product) return []
    const facet = FACETS.find((f) => f.rx.test(product.name))
    const pool = facet
      ? data.items.filter((p) => facet.rx.test(p.name) && p.id !== product.id)
      : data.items.filter((p) => p.tabs[0] === product.tabs[0] && p.id !== product.id)
    return pool.slice(0, 12)
  }, [data, product])

  if (!product) {
    return (
      <div className="gut flex min-h-[70svh] flex-col items-center justify-center gap-4 pt-24 text-center">
        <h1 className="font-display text-3xl font-900 tracking-tight">Piece not found</h1>
        <p className="text-muted">That id isn’t in the index.</p>
        <a href="#/" className="mono rounded-full bg-accent px-5 py-3 text-on-accent no-underline">
          Back to the index
        </a>
      </div>
    )
  }

  const badge = batchBadge(product.name)
  const tab = TAB_LABEL[data.tabs[product.tabs[0]]] ?? data.tabs[product.tabs[0]]
  const needsSize = product.sizes.length > 0
  const brand = FACETS.find((f) => f.rx.test(product.name))

  const add = () => {
    if (needsSize && !size) return
    addToCart({ id: product.id, name: product.name, size: size ?? 'One size', price: product.price })
    setAdded(true)
  }

  return (
    <div className="pt-16">
      <div className="gut flex items-center gap-2 py-5">
        <a href="#/" className="mono inline-flex items-center gap-1.5 text-muted no-underline transition-colors hover:text-accent">
          <ArrowLeft size={13} aria-hidden /> Index
        </a>
        <span className="mono text-line-2">/</span>
        <span className="mono text-dim">{tab}</span>
      </div>

      <div className="gut grid gap-8 pb-16 lg:grid-cols-[1.15fr_1fr] lg:gap-12">
        {/* ── gallery ── */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row">
          {shots.length > 1 && (
            <div className="no-bar flex gap-2 overflow-x-auto sm:w-20 sm:shrink-0 sm:flex-col sm:overflow-y-auto">
              {shots.map((s, n) => (
                <button
                  key={s}
                  onClick={() => setShot(n)}
                  aria-label={`Show photo ${n + 1} of ${shots.length}`}
                  aria-current={n === shot}
                  className={`shrink-0 overflow-hidden rounded-lg border transition-colors ${
                    n === shot ? 'border-accent' : 'border-line hover:border-line-2'
                  }`}
                >
                  <Img src={s} alt="" className="w-16 sm:w-full" />
                </button>
              ))}
            </div>
          )}

          <div className="relative flex-1 self-start overflow-hidden rounded-2xl border border-line bg-surface">
            <AnimatePresence mode="wait">
              <motion.div
                key={shots[shot]}
                initial={{ opacity: 0, scale: reduce ? 1 : 1.03 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: EASE }}
              >
                <Img src={shots[shot]} alt={product.name} eager ratio="1 / 1" />
              </motion.div>
            </AnimatePresence>
            {badge && (
              <span className="mono absolute left-3 top-3 rounded bg-accent px-2 py-1 font-semibold text-on-accent">{badge}</span>
            )}
          </div>
        </div>

        {/* ── detail ── */}
        <motion.div variants={reveal} initial="hidden" animate="show" className="lg:sticky lg:top-24 lg:self-start">
          <motion.div variants={revealItem} className="flex flex-wrap items-center gap-2">
            <span className="mono rounded-full border border-line px-2.5 py-1 text-dim">{tab}</span>
            {brand && (
              <button
                onClick={() => onFacet(brand)}
                className="mono rounded-full border border-line px-2.5 py-1 text-muted transition-colors hover:border-accent hover:text-accent"
              >
                All {brand.name} →
              </button>
            )}
          </motion.div>

          <motion.h1
            variants={revealItem}
            className="mt-4 font-display text-[clamp(1.5rem,4vw,2.5rem)] font-900 leading-[1.05] tracking-[-0.035em]"
          >
            {product.name}
          </motion.h1>

          {product.price != null ? (
            <motion.div variants={revealItem} className="mt-5 flex items-baseline gap-2.5">
              {product.priceHigh != null && <span className="mono text-dim">from</span>}
              <span className="font-display text-[clamp(2rem,6vw,3rem)] font-900 leading-none tracking-[-0.04em] text-accent">
                {eur(product.price)}
              </span>
              {product.priceHigh != null && product.priceHigh !== product.price && (
                <span className="mono text-dim">to {eur(product.priceHigh)}</span>
              )}
              <span className="mono text-dim">incl. VAT</span>
            </motion.div>
          ) : (
            <motion.p variants={revealItem} className="mono mt-5 text-muted">
              Price on request
            </motion.p>
          )}

          {needsSize && (
            <motion.div variants={revealItem} className="mt-7">
              <div className="mb-2.5 flex items-center justify-between">
                <span className="mono text-muted">
                  <Ruler size={12} aria-hidden className="mr-1.5 inline" />
                  Size {product.sizeRange && `· ${product.sizeRange}`}
                </span>
                {!size && <span className="mono text-dim">Pick one to add</span>}
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    aria-pressed={size === s}
                    className={`relative min-h-11 min-w-11 rounded-lg px-3 text-[0.8125rem] font-medium transition-colors duration-200 ${
                      size === s ? 'text-on-accent' : 'border border-line bg-surface text-muted hover:border-line-2 hover:text-fg'
                    }`}
                  >
                    {size === s && (
                      <motion.span layoutId="size-pill" transition={T.spring} className="absolute inset-0 -z-10 rounded-lg bg-accent" />
                    )}
                    {s}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          <motion.div variants={revealItem} className="mt-7 flex flex-wrap gap-2.5">
            <motion.button
              onClick={add}
              disabled={needsSize && !size}
              whileTap={{ scale: 0.985 }}
              transition={T.fast}
              className={`relative flex h-13 min-h-13 flex-1 items-center justify-center gap-2 overflow-hidden rounded-full px-6 font-display text-sm font-bold transition-colors duration-200 ${
                needsSize && !size
                  ? 'cursor-not-allowed border border-line-2 bg-surface text-dim'
                  : 'bg-accent text-on-accent'
              }`}
            >
              <AnimatePresence mode="wait" initial={false}>
                {added ? (
                  <motion.span
                    key="added"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={T.fast}
                    className="flex items-center gap-2"
                  >
                    <Check size={17} strokeWidth={3} aria-hidden /> Added to bag
                  </motion.span>
                ) : (
                  <motion.span
                    key="add"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={T.fast}
                    className="flex items-center gap-2"
                  >
                    <ShoppingBag size={17} aria-hidden />
                    {needsSize && !size ? 'Select a size' : 'Add to bag'}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
            <a
              href={legacyProduct(product.id)}
              className="flex h-13 min-h-13 items-center justify-center rounded-full border border-line-2 px-5 text-[0.8125rem] font-medium text-muted no-underline transition-colors hover:border-accent hover:text-accent"
            >
              Classic page
            </a>
          </motion.div>
          <p role="status" aria-live="polite" className="sr-only">
            {added ? `${product.name} added to your bag` : ''}
          </p>

          <motion.dl variants={revealItem} className="mt-8 grid gap-px overflow-hidden rounded-xl border border-line bg-line">
            {[
              [ShieldCheck, 'Top batches only', 'Every listing is a vetted batch, photographed by the supplier.'],
              [Truck, 'Shipping quoted per order', 'Combined shipping across the whole bag.'],
              [Ruler, 'Sizes as listed', product.sizeRange ? `This piece runs ${product.sizeRange}.` : 'Single size.'],
            ].map(([Icon, title, body]) => {
              const I = Icon as typeof ShieldCheck
              return (
                <div key={title as string} className="flex gap-3 bg-surface p-4">
                  <I size={16} aria-hidden className="mt-0.5 shrink-0 text-accent" />
                  <div>
                    <dt className="text-[0.8125rem] font-semibold">{title as string}</dt>
                    <dd className="mt-0.5 text-[0.8125rem] leading-relaxed text-muted">{body as string}</dd>
                  </div>
                </div>
              )
            })}
          </motion.dl>
        </motion.div>
      </div>

      {related.length > 0 && (
        <motion.section
          variants={reveal}
          initial="hidden"
          whileInView="show"
          viewport={inView}
          className="gut border-t border-line py-12"
        >
          <h2 className="mb-6 font-display text-[clamp(1.5rem,3.5vw,2.25rem)] font-900 leading-none tracking-[-0.04em]">
            {brand ? `More ${brand.name}` : 'More like this'}
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {related.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} compact />
            ))}
          </div>
        </motion.section>
      )}
    </div>
  )
}
