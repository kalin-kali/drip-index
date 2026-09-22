import { useMemo, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react'
import { asset, eur, img, LOOKS, type Catalogue, type Facet } from '../lib/data'
import { EASE, inView, reveal, revealUp, T } from '../lib/motion'
import Img from './Img'

/* Editorial lookbook: one full-bleed street shot paired with the matching
   piece from the index. Each look is picked once so the strip never repeats
   the same product twice. */
export default function Lookbook({ data, onFacet }: { data: Catalogue; onFacet: (f: Facet) => void }) {
  const reduce = useReducedMotion()
  const [i, setI] = useState(0)
  const [dir, setDir] = useState(1)

  const looks = useMemo(() => {
    const used = new Set<string>()
    return LOOKS.map((L) => {
      const all = data.items.filter((p) => L.rx.test(p.name))
      const fresh = (f: (p: typeof all[0]) => boolean) => all.find((p) => f(p) && !used.has(p.id))
      const pick =
        fresh((p) => L.pick.test(p.name) && p.price != null) ??
        fresh((p) => p.price != null) ??
        all.find((p) => p.price != null) ??
        all[0]
      if (!pick) return null
      used.add(pick.id)
      return { look: L, product: pick, count: all.length }
    }).filter(Boolean) as { look: (typeof LOOKS)[0]; product: Catalogue['items'][0]; count: number }[]
  }, [data])

  if (!looks.length) return null
  const cur = looks[i % looks.length]

  const step = (d: number) => {
    setDir(d)
    setI((v) => (v + d + looks.length) % looks.length)
  }

  const slide = {
    enter: (d: number) => ({ opacity: 0, x: reduce ? 0 : d * 48 }),
    center: { opacity: 1, x: 0 },
    exit: (d: number) => ({ opacity: 0, x: reduce ? 0 : d * -48 }),
  }

  return (
    <motion.section variants={reveal} initial="hidden" whileInView="show" viewport={inView} className="gut py-12 md:py-16">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="mono mb-1.5 block text-accent">Worn by</span>
          <h2 className="font-display text-[clamp(1.75rem,4.5vw,3rem)] font-900 leading-none tracking-[-0.04em]">Lookbook</h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => step(-1)}
            aria-label="Previous look"
            className="flex size-11 items-center justify-center rounded-full border border-line text-muted transition-colors hover:border-accent hover:text-accent"
          >
            <ArrowLeft size={16} aria-hidden />
          </button>
          <button
            onClick={() => step(1)}
            aria-label="Next look"
            className="flex size-11 items-center justify-center rounded-full border border-line text-muted transition-colors hover:border-accent hover:text-accent"
          >
            <ArrowRight size={16} aria-hidden />
          </button>
        </div>
      </div>

      <motion.div variants={revealUp} className="grid gap-3 lg:grid-cols-[1.45fr_1fr]">
        {/* street shot */}
        <div className="relative overflow-hidden rounded-2xl border border-line bg-surface">
          <AnimatePresence custom={dir} mode="wait">
            <motion.div
              key={cur.look.image}
              custom={dir}
              variants={slide}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.5, ease: EASE }}
              className="relative"
            >
              <img
                src={asset(cur.look.image)}
                alt={`${cur.look.brand} — ${cur.look.caption}`}
                loading="lazy"
                decoding="async"
                className="aspect-[4/5] w-full object-cover sm:aspect-[16/10] lg:aspect-[4/3]"
              />
              <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-bg via-bg/10 to-transparent" />
              <div className="absolute inset-x-4 bottom-4 sm:inset-x-6 sm:bottom-6">
                <span className="mono mb-2 inline-block rounded-full bg-accent px-2.5 py-1 font-semibold text-on-accent">
                  {cur.look.brand}
                </span>
                <p className="font-display text-[clamp(1.25rem,3vw,2rem)] font-extrabold leading-tight tracking-[-0.03em]">
                  {cur.look.caption}
                </p>
                <span className="mono mt-1 block text-muted">{cur.count} listings in the index</span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* the matching piece */}
        <AnimatePresence custom={dir} mode="wait">
          <motion.div
            key={cur.product.id}
            custom={dir}
            variants={slide}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.5, ease: EASE, delay: 0.06 }}
            className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-4 sm:p-5"
          >
            <Img src={img(cur.product.id)} alt={cur.product.name} className="rounded-xl" ratio="4 / 3" />
            <div className="flex-1">
              <span className="mono text-dim">Shop the look</span>
              <p className="mt-1.5 line-clamp-2 text-sm font-medium leading-snug">{cur.product.name}</p>
              {cur.product.price != null && (
                <p className="mt-3 font-display text-2xl font-900 tracking-[-0.03em]">
                  {cur.product.priceHigh != null && <span className="mono mr-1.5 font-normal text-dim">from</span>}
                  {eur(cur.product.price)}
                  <span className="mono ml-2 font-normal text-dim">incl. VAT</span>
                </p>
              )}
              {cur.product.sizeRange && <p className="mono mt-1.5 text-muted">Sizes {cur.product.sizeRange}</p>}
            </div>
            <div className="flex flex-wrap gap-2">
              <motion.a
                whileTap={{ scale: 0.98 }}
                transition={T.fast}
                href={`#/product/${cur.product.id}`}
                className="inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-full bg-accent px-5 text-[0.8125rem] font-bold text-on-accent no-underline"
              >
                View item <ArrowUpRight size={15} strokeWidth={2.5} aria-hidden />
              </motion.a>
              <button
                onClick={() => onFacet({ name: cur.look.brand, rx: cur.look.rx })}
                className="inline-flex h-11 items-center justify-center rounded-full border border-line-2 px-5 text-[0.8125rem] font-medium transition-colors hover:border-accent hover:text-accent"
              >
                All {cur.look.brand}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      <div className="mt-4 flex flex-wrap justify-center gap-1.5">
        {looks.map((l, n) => (
          <button
            key={l.look.image}
            onClick={() => {
              setDir(n > i ? 1 : -1)
              setI(n)
            }}
            aria-label={`Show ${l.look.brand} look`}
            aria-current={n === i}
            className="group flex h-9 w-6 items-center justify-center"
          >
            <span className={`block h-0.5 rounded-full transition-all duration-500 ${n === i ? 'w-5 bg-accent' : 'w-2.5 bg-line-2 group-hover:bg-dim'}`} />
          </button>
        ))}
      </div>
    </motion.section>
  )
}
