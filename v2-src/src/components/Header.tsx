import { useEffect, useState } from 'react'
import { motion, useScroll, useSpring } from 'framer-motion'
import { Search, ShoppingBag, Menu, X } from 'lucide-react'
import { cartCount, useCart } from '../lib/cart'
import { cn } from '../lib/utils'

const NAV: { label: string; tab: number }[] = [
  { label: 'Sneakers', tab: 3 },
  { label: 'Tees & Shorts', tab: 4 },
  { label: 'Hoodies & Pants', tab: 5 },
  { label: 'Jackets', tab: 6 },
  { label: 'Accessories', tab: 7 },
  { label: 'Kits', tab: 10 },
]

export default function Header({
  onSearch,
  onCart,
  onTab,
}: {
  onSearch: () => void
  onCart: () => void
  onTab: (tab: number) => void
}) {
  const [solid, setSolid] = useState(false)
  const [open, setOpen] = useState(false)
  const lines = useCart()
  const count = cartCount(lines)

  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 })

  useEffect(() => {
    const on = () => setSolid(window.scrollY > 24)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div
        className={cn(
          'gut flex h-16 items-center gap-3 transition-colors duration-300',
          solid ? 'border-b border-line bg-bg/80 backdrop-blur-xl' : 'border-b border-transparent',
        )}
      >
        <a href="#/" className="flex shrink-0 items-center gap-2 font-display text-lg font-900 tracking-[-0.03em] no-underline">
          <span aria-hidden className="size-3 rounded-[3px] bg-accent" />
          <span className="text-fg">
            DRIP<span className="text-accent">.</span>INDEX
          </span>
        </a>

        <nav aria-label="Categories" className="ml-4 hidden items-center gap-1 lg:flex">
          {NAV.map((n) => (
            <button
              key={n.tab}
              onClick={() => onTab(n.tab)}
              className="relative rounded-md px-2.5 py-2 text-[0.8125rem] font-medium text-muted transition-colors duration-200 hover:bg-elevated hover:text-fg"
            >
              {n.label}
            </button>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={onSearch}
            aria-label="Search the catalogue"
            className="flex h-10 items-center gap-2 rounded-lg border border-line bg-surface px-3 text-muted transition-colors duration-200 hover:border-line-2 hover:text-fg sm:w-64 md:w-72"
          >
            <Search size={16} aria-hidden />
            <span className="mono hidden truncate sm:inline">Search 3,550 pieces</span>
            <kbd className="mono ml-auto hidden rounded border border-line-2 px-1.5 py-0.5 text-dim sm:inline">/</kbd>
          </button>

          <button
            onClick={onCart}
            aria-label={count ? `Bag, ${count} items` : 'Bag, empty'}
            className="relative flex size-11 items-center justify-center rounded-lg border border-line bg-surface text-fg transition-colors duration-200 hover:border-line-2"
          >
            <ShoppingBag size={18} aria-hidden />
            {count > 0 && (
              <motion.span
                key={count}
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                className="mono absolute -right-1.5 -top-1.5 flex min-w-5 items-center justify-center rounded-full bg-accent px-1 py-0.5 font-semibold text-on-accent"
              >
                {count}
              </motion.span>
            )}
          </button>

          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            className="flex size-11 items-center justify-center rounded-lg border border-line bg-surface text-fg lg:hidden"
          >
            {open ? <Menu size={18} aria-hidden className="rotate-90" /> : <Menu size={18} aria-hidden />}
          </button>
        </div>
      </div>

      {/* reading progress — the page is a long scroll narrative */}
      <motion.div
        aria-hidden
        style={{ scaleX: progress }}
        className="h-px origin-left bg-gradient-to-r from-accent to-accent-2"
      />

      {open && (
        <motion.nav
          aria-label="Categories"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="gut grid gap-1 border-b border-line bg-bg/95 py-3 backdrop-blur-xl lg:hidden"
        >
          {NAV.map((n) => (
            <button
              key={n.tab}
              onClick={() => {
                onTab(n.tab)
                setOpen(false)
              }}
              className="flex items-center justify-between rounded-lg px-3 py-3 text-left text-sm font-medium text-fg hover:bg-elevated"
            >
              {n.label}
              <X size={14} aria-hidden className="-rotate-45 text-dim" />
            </button>
          ))}
        </motion.nav>
      )}
    </header>
  )
}
