import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { TAB_LABEL, type Catalogue as Cat, type Facet, type Product } from '../lib/data'
import { inView, reveal, T } from '../lib/motion'
import ProductCard from './ProductCard'

const PAGE = 60

export interface Filter {
  tab: number
  facet: Facet | null
  query: string
}

export const emptyFilter: Filter = { tab: -1, facet: null, query: '' }

export function applyFilter(items: Product[], f: Filter) {
  const words = f.query.toLowerCase().split(' ').filter(Boolean)
  return items.filter((p) => {
    if (f.tab >= 0 && !p.tabs.includes(f.tab)) return false
    if (f.facet && !f.facet.rx.test(p.name)) return false
    if (words.length) {
      const name = p.name.toLowerCase()
      const sizes = p.sizes.map((s) => s.toLowerCase())
      for (const w of words) if (!name.includes(w) && !sizes.includes(w)) return false
    }
    return true
  })
}

export default function Catalogue({
  data,
  filter,
  onFilter,
}: {
  data: Cat
  filter: Filter
  onFilter: (f: Filter) => void
}) {
  const [shown, setShown] = useState(PAGE)
  const sentinel = useRef<HTMLDivElement>(null)

  const list = useMemo(() => applyFilter(data.items, filter), [data, filter])

  useEffect(() => setShown(PAGE), [filter])

  /* Infinite scroll — the sentinel sits a screen below the fold so the next
     batch is already mounted by the time it scrolls into view. */
  useEffect(() => {
    const el = sentinel.current
    if (!el) return
    const io = new IntersectionObserver(
      (e) => e[0].isIntersecting && setShown((s) => (s < list.length ? s + PAGE : s)),
      { rootMargin: '900px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [list.length])

  const tabs = useMemo(
    () =>
      [{ i: -1, label: 'All', n: data.items.length }].concat(
        data.tabs
          .map((t, i) => ({ i, label: TAB_LABEL[t] ?? t, n: data.items.filter((p) => p.tabs.includes(i)).length }))
          .filter((t) => t.n > 0),
      ),
    [data],
  )

  const dirty = filter.tab >= 0 || !!filter.facet || !!filter.query

  return (
    <section id="catalogue" className="gut scroll-mt-20 py-16 md:py-24">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <h2 className="font-display text-[clamp(1.75rem,4.5vw,3rem)] font-900 leading-none tracking-[-0.04em]">
          Full catalogue
        </h2>
        <span className="mono text-dim">Press / to search</span>
      </div>

      {/* Category rail — the active pill is a single shared element that slides
          between tabs (layoutId) instead of two elements cross-fading. */}
      <div className="no-bar bleed mb-5 flex gap-2 overflow-x-auto pb-1">
        {tabs.map((t) => {
          const on = filter.tab === t.i && !filter.facet
          return (
            <button
              key={t.i}
              onClick={() => onFilter({ ...emptyFilter, tab: t.i })}
              aria-pressed={on}
              className={`relative shrink-0 rounded-full px-4 py-2.5 text-[0.8125rem] font-medium transition-colors duration-200 ${
                on ? 'text-on-accent' : 'text-muted hover:text-fg'
              }`}
            >
              {on && (
                <motion.span
                  layoutId="tab-pill"
                  transition={T.spring}
                  className="absolute inset-0 -z-10 rounded-full bg-accent"
                />
              )}
              {!on && <span aria-hidden className="absolute inset-0 -z-10 rounded-full border border-line bg-surface" />}
              {t.label}
              <span className={`mono ml-2 ${on ? 'text-on-accent/70' : 'text-dim'}`}>{t.n.toLocaleString()}</span>
            </button>
          )
        })}
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-3 border-y border-line py-3">
        <span className="mono text-muted" role="status">
          {list.length.toLocaleString()} items
          {filter.tab >= 0 && ` · ${TAB_LABEL[data.tabs[filter.tab]] ?? data.tabs[filter.tab]}`}
          {filter.facet && ` · ${filter.facet.name}`}
          {filter.query && ` · “${filter.query}”`}
        </span>
        <AnimatePresence>
          {dirty && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={() => onFilter(emptyFilter)}
              className="mono ml-auto inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-muted transition-colors hover:border-accent hover:text-accent"
            >
              <X size={12} aria-hidden /> Clear filter
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {list.length === 0 ? (
        <p className="py-20 text-center text-muted">
          Nothing matches that. <button onClick={() => onFilter(emptyFilter)} className="text-accent underline">Clear the filter</button>.
        </p>
      ) : (
        <>
          <motion.div
            variants={reveal}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
          >
            {list.slice(0, shown).map((p, i) => (
              <ProductCard
                key={p.id}
                product={p}
                index={i}
                eager={i < 6}
                tabLabel={TAB_LABEL[data.tabs[p.tabs[0]]] ?? data.tabs[p.tabs[0]]}
              />
            ))}
          </motion.div>
          <div ref={sentinel} className="h-px" />
          {shown < list.length && (
            <div className="flex justify-center pt-10">
              <button
                onClick={() => setShown((s) => s + PAGE)}
                className="mono rounded-full border border-line-2 px-6 py-3 text-muted transition-colors hover:border-accent hover:text-accent"
              >
                Load more ({(list.length - shown).toLocaleString()})
              </button>
            </div>
          )}
        </>
      )}
    </section>
  )
}

/* A horizontal editorial row used for the curated sections above the catalogue. */
export function Row({
  title, kicker, items, tabLabels, onAll,
}: {
  title: string
  kicker: string
  items: Product[]
  tabLabels: (p: Product) => string
  onAll: () => void
}) {
  if (!items.length) return null
  return (
    <motion.section
      variants={reveal}
      initial="hidden"
      whileInView="show"
      viewport={inView}
      className="gut py-8 md:py-10"
    >
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="mono mb-1.5 block text-accent">{kicker}</span>
          <h2 className="font-display text-[clamp(1.5rem,3.5vw,2.25rem)] font-900 leading-none tracking-[-0.04em]">{title}</h2>
        </div>
        <button onClick={onAll} className="mono text-muted transition-colors hover:text-accent">
          See all →
        </button>
      </div>
      <div className="no-bar bleed flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2">
        {items.map((p, i) => (
          <div key={p.id} className="w-[46vw] shrink-0 snap-start sm:w-56 lg:w-60">
            <ProductCard product={p} index={i} tabLabel={tabLabels(p)} compact />
          </div>
        ))}
      </div>
    </motion.section>
  )
}
