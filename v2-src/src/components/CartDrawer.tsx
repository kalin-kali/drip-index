import { AnimatePresence, motion } from 'framer-motion'
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react'
import { cartTotal, clearCart, setQty, useCart, useScrollLock } from '../lib/cart'
import { eur, img } from '../lib/data'
import { EASE, T } from '../lib/motion'
import Img from './Img'

export default function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const lines = useCart()
  const total = cartTotal(lines)
  useScrollLock(open)

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={T.fast}
            onClick={onClose}
            className="fixed inset-0 z-[70] bg-bg/70 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.38, ease: EASE }}
            role="dialog"
            aria-modal="true"
            aria-label="Your bag"
            className="fixed inset-y-0 right-0 z-[71] flex w-full max-w-md flex-col border-l border-line bg-surface"
          >
            <header className="flex items-center gap-3 border-b border-line px-5 py-4">
              <ShoppingBag size={18} aria-hidden className="text-accent" />
              <h2 className="font-display text-base font-extrabold tracking-tight">Your bag</h2>
              <span className="mono text-dim">{lines.length} lines</span>
              <button onClick={onClose} aria-label="Close bag" className="ml-auto p-2 text-muted hover:text-fg">
                <X size={18} aria-hidden />
              </button>
            </header>

            {lines.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
                <ShoppingBag size={32} aria-hidden className="text-line-2" />
                <p className="text-sm text-muted">Your bag is empty.</p>
                <button onClick={onClose} className="mono text-accent hover:underline">
                  Back to the index →
                </button>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-3">
                  <AnimatePresence initial={false}>
                    {lines.map((l) => (
                      <motion.div
                        key={`${l.id}::${l.size}`}
                        layout
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                        transition={T.base}
                        className="mb-2 overflow-hidden"
                      >
                        <div className="flex gap-3 rounded-xl border border-line bg-elevated/50 p-2.5">
                          <a href={`#/product/${l.id}`} onClick={onClose} className="shrink-0">
                            <Img src={img(l.id)} alt="" className="size-20 rounded-lg" />
                          </a>
                          <div className="flex min-w-0 flex-1 flex-col">
                            <p className="line-clamp-2 text-[0.8125rem] font-medium leading-snug">{l.name}</p>
                            <span className="mono mt-1 text-dim">Size {l.size}</span>
                            <div className="mt-auto flex items-center gap-2 pt-2">
                              <div className="flex items-center rounded-lg border border-line">
                                <button
                                  onClick={() => setQty(l.id, l.size, l.qty - 1)}
                                  aria-label={`Decrease quantity of ${l.name}`}
                                  className="flex size-9 items-center justify-center text-muted hover:text-fg"
                                >
                                  <Minus size={13} aria-hidden />
                                </button>
                                <span className="mono w-6 text-center text-fg">{l.qty}</span>
                                <button
                                  onClick={() => setQty(l.id, l.size, l.qty + 1)}
                                  aria-label={`Increase quantity of ${l.name}`}
                                  className="flex size-9 items-center justify-center text-muted hover:text-fg"
                                >
                                  <Plus size={13} aria-hidden />
                                </button>
                              </div>
                              <span className="ml-auto font-display text-sm font-extrabold">
                                {l.price != null ? eur(l.price * l.qty) : '—'}
                              </span>
                              <button
                                onClick={() => setQty(l.id, l.size, 0)}
                                aria-label={`Remove ${l.name}`}
                                className="flex size-9 items-center justify-center text-dim hover:text-accent"
                              >
                                <Trash2 size={14} aria-hidden />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                <footer className="border-t border-line p-4">
                  <div className="mb-3 flex items-end justify-between">
                    <span className="mono text-muted">Subtotal · incl. VAT</span>
                    <motion.span key={total} initial={{ opacity: 0.4 }} animate={{ opacity: 1 }} className="font-display text-2xl font-900 tracking-[-0.03em]">
                      {eur(total)}
                    </motion.span>
                  </div>
                  <a
                    href="#catalogue"
                    onClick={onClose}
                    className="flex h-12 items-center justify-center rounded-full bg-accent font-display text-sm font-bold text-on-accent no-underline transition-transform duration-200 hover:scale-[1.01] active:scale-[0.99]"
                  >
                    Request this order
                  </a>
                  <div className="mt-2 flex items-center justify-between">
                    <p className="mono text-dim">Shipping quoted per order</p>
                    <button onClick={clearCart} className="mono text-dim hover:text-accent">
                      Empty bag
                    </button>
                  </div>
                </footer>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
