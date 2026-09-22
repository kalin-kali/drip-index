import { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { loadCatalogue, TAB_LABEL, type Catalogue as Cat, type Facet } from './lib/data'
import { go, useRoute } from './lib/cart'
import { T } from './lib/motion'
import Header from './components/Header'
import Hero from './components/Hero'
import Marquee from './components/Marquee'
import Lookbook from './components/Lookbook'
import { BrandMarquee, ModelBento } from './components/Brands'
import Catalogue, { emptyFilter, Row, type Filter } from './components/Catalogue'
import ProductPage from './components/ProductPage'
import SearchOverlay from './components/SearchOverlay'
import CartDrawer from './components/CartDrawer'
import Footer from './components/Footer'

const TICKER = ['3,550 pieces indexed', 'Top batches only', 'EU 36–47 · XS–3XL', 'Prices incl. VAT', 'Real supplier photos']
const ROWS: [number, string, string][] = [
  [1, 'Trending now', 'Moving fastest'],
  [2, 'Latest finds', 'Just indexed'],
  [3, 'Sneakers', 'The main event'],
  [10, '2026 World Cup kits', 'Seasonal'],
]

export default function App() {
  const [data, setData] = useState<Cat | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<Filter>(emptyFilter)
  const [search, setSearch] = useState(false)
  const [cart, setCart] = useState(false)
  const route = useRoute()

  useEffect(() => {
    loadCatalogue().then(setData).catch((e: Error) => setError(e.message))
  }, [])

  /* "/" focuses search the way the v1 site did, and ⌘K matches what people
     expect from a command palette. Neither fires while typing in a field. */
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      const el = document.activeElement
      const typing = el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement
      if ((e.key === '/' && !typing) || (e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey))) {
        e.preventDefault()
        setSearch(true)
      }
    }
    window.addEventListener('keydown', on)
    return () => window.removeEventListener('keydown', on)
  }, [])

  const scrollToCatalogue = useCallback(() => {
    requestAnimationFrame(() => {
      document.getElementById('catalogue')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }, [])

  const applyAndScroll = useCallback(
    (f: Filter) => {
      setFilter(f)
      if (route.name !== 'home') go('#/')
      scrollToCatalogue()
    },
    [route.name, scrollToCatalogue],
  )

  const onTab = useCallback((tab: number) => applyAndScroll({ ...emptyFilter, tab }), [applyAndScroll])
  const onFacet = useCallback((facet: Facet) => applyAndScroll({ ...emptyFilter, facet }), [applyAndScroll])
  const onQuery = useCallback((query: string) => applyAndScroll({ ...emptyFilter, query }), [applyAndScroll])

  const label = useCallback(
    (tabIndex: number) => (data ? TAB_LABEL[data.tabs[tabIndex]] ?? data.tabs[tabIndex] : ''),
    [data],
  )

  const rows = useMemo(() => {
    if (!data) return []
    const used = new Set<string>()
    return ROWS.map(([tab, title, kicker]) => {
      const items = data.items.filter((p) => p.tabs[0] === tab && p.price != null && !used.has(p.id)).slice(0, 14)
      items.forEach((p) => used.add(p.id))
      return { tab, title, kicker, items }
    }).filter((r) => r.items.length > 0)
  }, [data])

  return (
    <>
      <a
        href="#catalogue"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[90] focus:rounded-lg focus:bg-accent focus:px-4 focus:py-3 focus:font-medium focus:text-on-accent"
      >
        Skip to the catalogue
      </a>

      <Header onSearch={() => setSearch(true)} onCart={() => setCart(true)} onTab={onTab} />

      <AnimatePresence mode="wait">
        <motion.main
          key={route.name === 'product' ? route.id : 'home'}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={T.base}
        >
          {error ? (
            <div className="gut flex min-h-[80svh] flex-col items-center justify-center gap-4 text-center">
              <h1 className="font-display text-3xl font-900 tracking-tight">The index didn’t load</h1>
              <p className="text-muted">{error}</p>
              <button onClick={() => location.reload()} className="mono rounded-full bg-accent px-5 py-3 text-on-accent">
                Try again
              </button>
            </div>
          ) : route.name === 'product' ? (
            data ? (
              <ProductPage data={data} id={route.id} onFacet={onFacet} />
            ) : (
              <Loading />
            )
          ) : (
            <>
              <Hero data={data} onFacet={onFacet} />

              <div className="border-y border-line bg-surface/40 py-3">
                <Marquee duration={34}>
                  {TICKER.map((t, i) => (
                    <span key={i} className="mono flex items-center gap-6 px-6 text-muted">
                      {t}
                      <span aria-hidden className="size-1 rounded-full bg-accent" />
                    </span>
                  ))}
                </Marquee>
              </div>

              {data ? (
                <>
                  {rows.slice(0, 2).map((r) => (
                    <Row
                      key={r.tab}
                      title={r.title}
                      kicker={r.kicker}
                      items={r.items}
                      tabLabels={(p) => label(p.tabs[0])}
                      onAll={() => onTab(r.tab)}
                    />
                  ))}
                  <Lookbook data={data} onFacet={onFacet} />
                  <ModelBento data={data} onFacet={onFacet} />
                  <BrandMarquee data={data} onFacet={onFacet} />
                  {rows.slice(2).map((r) => (
                    <Row
                      key={r.tab}
                      title={r.title}
                      kicker={r.kicker}
                      items={r.items}
                      tabLabels={(p) => label(p.tabs[0])}
                      onAll={() => onTab(r.tab)}
                    />
                  ))}
                  <Catalogue data={data} filter={filter} onFilter={setFilter} />
                </>
              ) : (
                <Loading />
              )}
            </>
          )}
        </motion.main>
      </AnimatePresence>

      <Footer data={data} onTab={onTab} onFacet={onFacet} />

      <SearchOverlay open={search} data={data} onClose={() => setSearch(false)} onQuery={onQuery} onFacet={onFacet} />
      <CartDrawer open={cart} onClose={() => setCart(false)} />
    </>
  )
}

function Loading() {
  return (
    <div className="gut grid grid-cols-2 gap-3 py-16 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6" aria-busy="true" aria-label="Loading the catalogue">
      {Array.from({ length: 12 }, (_, i) => (
        <div key={i} className="overflow-hidden rounded-xl border border-line bg-surface">
          <div className="aspect-square animate-pulse bg-elevated" />
          <div className="space-y-2 p-3.5">
            <div className="h-2 w-1/3 animate-pulse rounded bg-elevated" />
            <div className="h-3 w-full animate-pulse rounded bg-elevated" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-elevated" />
          </div>
        </div>
      ))}
    </div>
  )
}
