import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Search, X } from 'lucide-react'
import { eur, FACETS, img, TAB_LABEL, type Catalogue, type Facet } from '../lib/data'
import { useScrollLock } from '../lib/cart'
import { T } from '../lib/motion'
import Img from './Img'

const SUGGEST = ['Jordan 4', 'Yeezy', 'Balenciaga', 'New Balance', 'Corteiz', 'Essentials', 'Trapstar', 'Goyard']

export default function SearchOverlay({
  open,
  data,
  onClose,
  onQuery,
  onFacet,
}: {
  open: boolean
  data: Catalogue | null
  onClose: () => void
  onQuery: (q: string) => void
  onFacet: (f: Facet) => void
}) {
  const [q, setQ] = useState('')
  const input = useRef<HTMLInputElement>(null)
  useScrollLock(open)

  useEffect(() => {
    if (open) {
      setQ('')
      // wait for the panel to mount before focusing so the caret lands correctly
      requestAnimationFrame(() => input.current?.focus())
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const on = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', on)
    return () => window.removeEventListener('keydown', on)
  }, [open, onClose])

  const { hits, facets } = useMemo(() => {
    const term = q.trim().toLowerCase()
    if (!data || term.length < 2) return { hits: [], facets: [] as Facet[] }
    const words = term.split(' ').filter(Boolean)
    const hits = data.items
      .filter((p) => {
        const n = p.name.toLowerCase()
        return words.every((w) => n.includes(w))
      })
      .slice(0, 8)
    const facets = FACETS.filter((f) => f.name.toLowerCase().includes(term)).slice(0, 4)
    return { hits, facets }
  }, [q, data])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!q.trim()) return
    onQuery(q.trim())
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={T.fast}
          className="fixed inset-0 z-[70] flex items-start justify-center bg-bg/80 p-4 pt-[12vh] backdrop-blur-md"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label="Search the catalogue"
        >
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={T.base}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl"
          >
            <form onSubmit={submit} className="flex items-center gap-3 border-b border-line px-4">
              <Search size={18} aria-hidden className="shrink-0 text-muted" />
              <input
                ref={input}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                type="search"
                placeholder="Jordan 4, Yeezy, Corteiz, Goyard…"
                aria-label="Search the catalogue"
                className="h-14 flex-1 bg-transparent text-base text-fg outline-none placeholder:text-dim"
              />
              <button type="button" onClick={onClose} aria-label="Close search" className="shrink-0 p-2 text-muted hover:text-fg">
                <X size={18} aria-hidden />
              </button>
            </form>

            <div className="max-h-[52vh] overflow-y-auto">
              {q.trim().length < 2 ? (
                <div className="p-4">
                  <span className="mono mb-3 block text-dim">Popular</span>
                  <div className="flex flex-wrap gap-2">
                    {SUGGEST.map((s) => {
                      const f = FACETS.find((x) => x.name.toLowerCase() === s.toLowerCase())
                      return (
                        <button
                          key={s}
                          onClick={() => {
                            if (f) onFacet(f)
                            else onQuery(s)
                            onClose()
                          }}
                          className="rounded-full border border-line px-3.5 py-2 text-[0.8125rem] text-muted transition-colors hover:border-accent hover:text-accent"
                        >
                          {s}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ) : hits.length || facets.length ? (
                <>
                  {facets.length > 0 && (
                    <div className="border-b border-line p-2">
                      {facets.map((f) => (
                        <button
                          key={f.name}
                          onClick={() => {
                            onFacet(f)
                            onClose()
                          }}
                          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-elevated"
                        >
                          <span className="mono rounded bg-elevated px-1.5 py-0.5 text-dim">Brand</span>
                          <span className="text-sm font-medium">{f.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="p-2">
                    {hits.map((p) => (
                      <a
                        key={p.id}
                        href={`#/product/${p.id}`}
                        onClick={onClose}
                        className="flex items-center gap-3 rounded-lg p-2 no-underline hover:bg-elevated"
                      >
                        <Img src={img(p.id)} alt="" className="size-12 shrink-0 rounded-md" />
                        <span className="min-w-0 flex-1">
                          <span className="mono block text-dim">
                            {TAB_LABEL[data!.tabs[p.tabs[0]]] ?? data!.tabs[p.tabs[0]]}
                          </span>
                          <span className="line-clamp-1 text-[0.8125rem] font-medium text-fg">{p.name}</span>
                        </span>
                        {p.price != null && (
                          <span className="shrink-0 font-display text-sm font-extrabold">{eur(p.price)}</span>
                        )}
                      </a>
                    ))}
                    <button
                      onClick={submit as unknown as () => void}
                      className="mono mt-1 w-full rounded-lg px-3 py-3 text-left text-accent hover:bg-elevated"
                    >
                      See all results for “{q.trim()}” →
                    </button>
                  </div>
                </>
              ) : (
                <p className="p-8 text-center text-sm text-muted">No pieces match “{q.trim()}”.</p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
