import { useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { asset, BRANDS, MODELS, img, type Catalogue, type Facet } from '../lib/data'
import { inView, reveal, revealItem, T } from '../lib/motion'
import Img from './Img'
import Marquee from './Marquee'

/* Bento grid — the first two cells are double-width so the eye lands on the
   headline silhouettes before scanning the rest. */
const SPAN = ['col-span-2 row-span-2', 'col-span-2', '', '', '', '', 'col-span-2', '', '', '', '', '']

export function ModelBento({ data, onFacet }: { data: Catalogue; onFacet: (f: Facet) => void }) {
  const reduce = useReducedMotion()
  const cells = useMemo(
    () =>
      MODELS.map((m) => ({ facet: m, count: data.items.filter((p) => m.rx.test(p.name)).length }))
        .filter((c) => c.count > 0)
        .slice(0, 12),
    [data],
  )

  return (
    <motion.section variants={reveal} initial="hidden" whileInView="show" viewport={inView} className="gut py-12 md:py-16">
      <div className="mb-6">
        <span className="mono mb-1.5 block text-accent">Silhouettes</span>
        <h2 className="font-display text-[clamp(1.75rem,4.5vw,3rem)] font-900 leading-none tracking-[-0.04em]">
          Shop by model
        </h2>
      </div>

      <div className="grid auto-rows-[10rem] grid-cols-2 gap-3 md:grid-cols-4 md:auto-rows-[11rem] lg:grid-cols-6">
        {cells.map((c, i) => (
          <motion.button
            key={c.facet.name}
            variants={revealItem}
            onClick={() => onFacet(c.facet)}
            whileHover={reduce ? undefined : { y: -4 }}
            transition={T.spring}
            className={`group relative overflow-hidden rounded-xl border border-line bg-surface text-left ${SPAN[i] ?? ''}`}
          >
            <img
              src={c.facet.image ? asset(c.facet.image) : img(data.items.find((p) => c.facet.rx.test(p.name))!.id)}
              alt=""
              aria-hidden
              loading="lazy"
              decoding="async"
              className="absolute inset-0 size-full object-cover opacity-70 transition-all duration-[900ms] ease-[var(--ease-out-expo)] group-hover:scale-110 group-hover:opacity-90"
            />
            <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-bg via-bg/35 to-transparent" />
            <span
              aria-hidden
              className="absolute inset-0 bg-accent/0 transition-colors duration-500 group-hover:bg-accent/10"
            />
            <span className="absolute inset-x-3 bottom-3">
              <span className="block font-display text-sm font-extrabold leading-tight tracking-tight text-fg">
                {c.facet.name}
              </span>
              <span className="mono mt-0.5 block text-dim group-hover:text-accent">{c.count} listings</span>
            </span>
          </motion.button>
        ))}
      </div>
    </motion.section>
  )
}

/* Brand strip — a marquee of every brand chip, doubling as a "we stock these"
   trust signal. Each chip is a real filter, not decoration. */
export function BrandMarquee({ data, onFacet }: { data: Catalogue; onFacet: (f: Facet) => void }) {
  const chips = useMemo(
    () => BRANDS.map((b) => ({ facet: b, count: data.items.filter((p) => b.rx.test(p.name)).length })).filter((c) => c.count > 0),
    [data],
  )

  const row = (list: typeof chips) =>
    list.map((c) => (
      <button
        key={c.facet.name}
        onClick={() => onFacet(c.facet)}
        className="group mx-1.5 flex shrink-0 items-center gap-2.5 rounded-full border border-line bg-surface py-1.5 pl-1.5 pr-4 transition-colors duration-200 hover:border-accent"
      >
        <Img
          src={c.facet.image ? asset(c.facet.image) : img(data.items.find((p) => c.facet.rx.test(p.name))!.id)}
          alt=""
          className="size-9 shrink-0 rounded-full"
        />
        <span className="whitespace-nowrap text-[0.8125rem] font-medium text-fg">{c.facet.name}</span>
        <span className="mono text-dim group-hover:text-accent">{c.count}</span>
      </button>
    ))

  const half = Math.ceil(chips.length / 2)

  return (
    <section className="border-y border-line bg-surface/40 py-8">
      <h2 className="mono gut mb-4 text-dim">Brands in the index</h2>
      <Marquee duration={62} className="[mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
        {row(chips.slice(0, half))}
      </Marquee>
      <div className="h-3" />
      <Marquee duration={68} reverse className="[mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
        {row(chips.slice(half))}
      </Marquee>
    </section>
  )
}
