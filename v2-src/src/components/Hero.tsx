import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { ArrowDown, ArrowUpRight } from 'lucide-react'
import { asset, eur, minPrice, SHOE_RX, type Catalogue, type Facet } from '../lib/data'
import { EASE, T, wordRise, wordStagger } from '../lib/motion'

const DROPS: (Facet & { kicker: string; shot: string })[] = [
  { name: 'Balenciaga', rx: /balenciaga/i, kicker: 'Track 3.0', shot: 'hero/balenciaga.webp' },
  { name: 'Jordan 4', rx: /jordan 4|aj4|\bj4\b/i, kicker: 'Retro', shot: 'hero/jordan4.webp' },
  { name: 'Yeezy', rx: /yeezy/i, kicker: 'Boost 350', shot: 'hero/yeezy.webp' },
  { name: 'New Balance', rx: /new balance|\bnb ?\d/i, kicker: '9060 · 550', shot: 'hero/nb.webp' },
  { name: 'Nike Dunk', rx: /dunk/i, kicker: 'Low SB', shot: 'hero/dunk.webp' },
  { name: 'Jordan 1', rx: /jordan 1|aj1/i, kicker: 'High OG', shot: 'hero/jordan1.webp' },
]

const HEADLINE = ['THE', 'WHOLE', 'INDEX.']

export default function Hero({ data, onFacet }: { data: Catalogue | null; onFacet: (f: Facet) => void }) {
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()
  const [i, setI] = useState(0)

  /* Scroll-morph: the hero recedes as the catalogue rises over it. */
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '22%'])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.12])
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '-40%'])

  useEffect(() => {
    if (reduce) return
    const t = setInterval(() => setI((v) => (v + 1) % DROPS.length), 5200)
    return () => clearInterval(t)
  }, [reduce])

  const drop = DROPS[i]

  const stat = useMemo(() => {
    if (!data) return null
    const list = data.items.filter((p) => drop.rx.test(p.name))
    const from = minPrice(list.filter((p) => p.tabs.includes(3) || SHOE_RX.test(p.name)))
    return { count: list.length, from }
  }, [data, drop])

  return (
    <section ref={ref} className="relative isolate overflow-hidden pt-16 lg:min-h-[92svh]">
      {/* ambient field: two slow colour washes + a grid, all decorative */}
      <motion.div aria-hidden style={{ opacity }} className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-22%] size-[70vw] max-w-[900px] -translate-x-1/2 rounded-full bg-accent/16 blur-[140px]" />
        <div className="absolute bottom-[-18%] right-[-8%] size-[46vw] max-w-[640px] rounded-full bg-accent-2/10 blur-[130px]" />
        <div
          className="absolute inset-0 opacity-[0.18] [mask-image:radial-gradient(ellipse_at_center,black,transparent_78%)]"
          style={{
            backgroundImage:
              'linear-gradient(to right, var(--color-line) 1px, transparent 1px), linear-gradient(to bottom, var(--color-line) 1px, transparent 1px)',
            backgroundSize: '72px 72px',
          }}
        />
      </motion.div>

      <div className="gut relative grid items-center gap-10 pb-14 pt-10 lg:min-h-[calc(92svh-4rem)] lg:gap-12 lg:pb-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        {/* ── editorial column ── */}
        <motion.div style={{ y: reduce ? 0 : textY }} className="relative z-10 max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...T.base, delay: 0.1 }}
            className="mono mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-surface/70 px-3 py-1.5 text-muted backdrop-blur-sm"
          >
            <span aria-hidden className="size-1.5 animate-pulse rounded-full bg-accent" />
            {data ? `${data.items.length.toLocaleString()} pieces indexed` : 'Loading the index'}
          </motion.div>

          <motion.h1
            variants={wordStagger}
            initial="hidden"
            animate="show"
            className="font-display text-[clamp(3rem,11vw,7.5rem)] font-900 leading-[0.86] tracking-[-0.045em]"
          >
            {HEADLINE.map((w, n) => (
              <span key={w} className="block overflow-hidden pb-[0.06em]">
                <motion.span
                  variants={wordRise}
                  className={n === 2 ? 'block bg-gradient-to-r from-accent to-accent-2 bg-clip-text text-transparent' : 'block'}
                >
                  {w}
                </motion.span>
              </span>
            ))}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...T.base, delay: 0.45 }}
            className="mt-6 max-w-md text-[0.9375rem] leading-relaxed text-muted"
          >
            Sneakers, streetwear and designer pieces — top batches only. Real supplier photos,
            every size listed, prices in EUR including VAT.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...T.base, delay: 0.55 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <a
              href="#catalogue"
              className="group inline-flex h-12 items-center gap-2 rounded-full bg-accent px-6 font-display text-sm font-bold tracking-tight text-on-accent no-underline transition-transform duration-200 hover:scale-[1.02] active:scale-[0.99]"
            >
              Browse the index
              <ArrowUpRight size={17} strokeWidth={2.5} aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
            <button
              onClick={() => onFacet(drop)}
              className="inline-flex h-12 items-center gap-2 rounded-full border border-line-2 px-6 text-sm font-medium text-fg transition-colors duration-200 hover:border-accent hover:text-accent"
            >
              Shop {drop.name}
            </button>
          </motion.div>

          <motion.dl
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ ...T.base, delay: 0.7 }}
            className="mt-10 grid max-w-md grid-cols-3 gap-4 border-t border-line pt-6"
          >
            {[
              ['3,550', 'Pieces'],
              ['EU 36–47', 'Sizes'],
              ['Incl. VAT', 'Pricing'],
            ].map(([big, small]) => (
              <div key={small}>
                <dd className="font-display text-lg font-extrabold tracking-tight">{big}</dd>
                <dt className="mono mt-0.5 text-dim">{small}</dt>
              </div>
            ))}
          </motion.dl>
        </motion.div>

        {/* ── rotating drop ── */}
        <motion.div style={{ y: reduce ? 0 : y, scale: reduce ? 1 : scale }} className="relative">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-[560px]">
            <AnimatePresence mode="popLayout">
              <motion.div
                key={drop.name}
                initial={{ opacity: 0, scale: 0.92, rotate: -3 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 1.04, rotate: 2 }}
                transition={{ duration: 0.9, ease: EASE }}
                className="absolute inset-0"
              >
                <img
                  src={asset(drop.shot)}
                  alt={`${drop.name} — ${drop.kicker}`}
                  fetchPriority="high"
                  className="size-full rounded-2xl object-cover"
                />
                <span aria-hidden className="absolute inset-0 rounded-2xl bg-gradient-to-t from-bg via-bg/10 to-transparent" />
              </motion.div>
            </AnimatePresence>

            {/* oversized wordmark bleeding behind the shot */}
            <AnimatePresence mode="popLayout">
              <motion.span
                key={drop.name + '-type'}
                aria-hidden
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 0.07, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.9, ease: EASE }}
                className="pointer-events-none absolute -bottom-6 left-1/2 w-max -translate-x-1/2 font-display text-[clamp(3rem,9vw,7rem)] font-900 uppercase leading-none tracking-[-0.05em]"
              >
                {drop.name}
              </motion.span>
            </AnimatePresence>

            {/* live stat card */}
            <motion.button
              onClick={() => onFacet(drop)}
              whileHover={reduce ? undefined : { y: -3 }}
              transition={T.spring}
              className="absolute bottom-4 left-4 right-4 flex items-center gap-3 rounded-xl border border-line bg-bg/70 p-3 text-left backdrop-blur-xl sm:left-6 sm:right-auto sm:min-w-[19rem]"
            >
              <div className="min-w-0 flex-1">
                <span className="mono block text-dim">{drop.kicker}</span>
                <span className="block truncate font-display text-base font-extrabold tracking-tight">{drop.name}</span>
              </div>
              <div className="shrink-0 text-right">
                <span className="mono block text-dim">{stat ? `${stat.count} listings` : '—'}</span>
                {stat?.from != null && (
                  <span className="block font-display text-base font-extrabold tracking-tight text-accent">
                    {eur(stat.from)}
                  </span>
                )}
              </div>
              <ArrowUpRight size={16} aria-hidden className="shrink-0 text-muted" />
            </motion.button>
          </div>

          {/* drop selector */}
          <div className="mt-5 flex items-center justify-center gap-1.5">
            {DROPS.map((d, n) => (
              <button
                key={d.name}
                onClick={() => setI(n)}
                aria-label={`Show ${d.name}`}
                aria-current={n === i}
                className="group flex h-11 w-7 items-center justify-center"
              >
                <span
                  className={`block h-0.5 rounded-full transition-all duration-500 ${
                    n === i ? 'w-6 bg-accent' : 'w-3 bg-line-2 group-hover:bg-dim'
                  }`}
                />
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.a
        href="#catalogue"
        aria-label="Skip to the catalogue"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1 }}
        style={{ opacity }}
        className="mono absolute bottom-4 left-1/2 hidden -translate-x-1/2 items-center gap-2 text-dim no-underline hover:text-fg md:flex"
      >
        <ArrowDown size={13} aria-hidden className="animate-bounce" />
        Scroll
      </motion.a>
    </section>
  )
}
