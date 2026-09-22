import { FACETS, TAB_LABEL, type Catalogue, type Facet } from '../lib/data'

const INFO = ['How it works', 'Sizes & fit', 'Shipping & delivery', 'Contact']
const POPULAR = ['Jordan 4', 'Yeezy 350', 'Balenciaga Track', 'New Balance', 'Corteiz', 'Essentials', 'Goyard']

export default function Footer({
  data,
  onTab,
  onFacet,
}: {
  data: Catalogue | null
  onTab: (tab: number) => void
  onFacet: (f: Facet) => void
}) {
  const cats = data ? data.tabs.map((t, i) => ({ i, label: TAB_LABEL[t] ?? t })).filter((c) => c.i >= 3) : []

  return (
    <footer className="relative overflow-hidden border-t border-line bg-surface/50">
      <div className="gut grid gap-10 py-14 md:grid-cols-[1.6fr_1fr_1fr_1fr]">
        <div>
          <p className="font-display text-2xl font-900 tracking-[-0.04em]">
            DRIP<span className="text-accent">.</span>INDEX
          </p>
          <p className="mt-3 max-w-sm text-[0.8125rem] leading-relaxed text-muted">
            A curated index of 3,550 sneakers, streetwear and designer pieces — top batches only,
            real supplier photos, every size listed, prices in EUR incl. VAT.
          </p>
        </div>

        <nav aria-labelledby="f-cat">
          <h2 id="f-cat" className="mono mb-3 text-dim">Catalogue</h2>
          <ul className="space-y-1.5">
            {cats.map((c) => (
              <li key={c.i}>
                <button onClick={() => onTab(c.i)} className="text-[0.8125rem] text-muted transition-colors hover:text-accent">
                  {c.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-labelledby="f-pop">
          <h2 id="f-pop" className="mono mb-3 text-dim">Popular</h2>
          <ul className="space-y-1.5">
            {POPULAR.map((p) => {
              const f = FACETS.find((x) => x.name === p)
              return (
                <li key={p}>
                  <button
                    onClick={() => f && onFacet(f)}
                    className="text-[0.8125rem] text-muted transition-colors hover:text-accent"
                  >
                    {p}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        <nav aria-labelledby="f-info">
          <h2 id="f-info" className="mono mb-3 text-dim">Info</h2>
          <ul className="space-y-1.5">
            {INFO.map((t) => (
              <li key={t}>
                <a href="#catalogue" className="text-[0.8125rem] text-muted no-underline transition-colors hover:text-accent">
                  {t}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="gut flex flex-wrap items-center justify-between gap-2 border-t border-line py-5">
        <span className="mono text-dim">© 2026 DRIP INDEX</span>
        <span className="mono text-dim">Images via supplier listings · Prices in EUR incl. VAT</span>
      </div>

      {/* oversized wordmark bleeding off the bottom edge */}
      <p
        aria-hidden
        className="pointer-events-none select-none whitespace-nowrap px-2 text-center font-display text-[18vw] font-900 leading-[0.72] tracking-[-0.05em] text-fg/[0.035]"
      >
        DRIP INDEX
      </p>
    </footer>
  )
}
