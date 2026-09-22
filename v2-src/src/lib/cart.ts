import { useEffect, useState, useSyncExternalStore } from 'react'

export interface CartLine {
  id: string
  name: string
  size: string
  price: number | null
  qty: number
}

const KEY = 'drip.cart.v2'

/* A tiny external store rather than context: the cart is read by the header
   badge, the drawer and every product page, and none of them need re-render
   coupling beyond the line list. */
let lines: CartLine[] = load()
const listeners = new Set<() => void>()

function load(): CartLine[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as CartLine[]) : []
  } catch {
    return []
  }
}

function commit(next: CartLine[]) {
  lines = next
  try {
    localStorage.setItem(KEY, JSON.stringify(lines))
  } catch {
    /* private mode or blocked storage — the cart still works for this session */
  }
  listeners.forEach((l) => l())
}

const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => listeners.delete(l)
}

export const useCart = () => useSyncExternalStore(subscribe, () => lines, () => lines)

export const cartCount = (l: CartLine[]) => l.reduce((n, x) => n + x.qty, 0)
export const cartTotal = (l: CartLine[]) => l.reduce((n, x) => n + (x.price ?? 0) * x.qty, 0)

const keyOf = (id: string, size: string) => `${id}::${size}`

export function addToCart(line: Omit<CartLine, 'qty'>, qty = 1) {
  const k = keyOf(line.id, line.size)
  const existing = lines.find((l) => keyOf(l.id, l.size) === k)
  commit(
    existing
      ? lines.map((l) => (keyOf(l.id, l.size) === k ? { ...l, qty: l.qty + qty } : l))
      : [...lines, { ...line, qty }],
  )
}

export function setQty(id: string, size: string, qty: number) {
  const k = keyOf(id, size)
  commit(qty <= 0 ? lines.filter((l) => keyOf(l.id, l.size) !== k) : lines.map((l) => (keyOf(l.id, l.size) === k ? { ...l, qty } : l)))
}

export const clearCart = () => commit([])

/* Locks background scroll while a drawer or overlay owns the screen, and
   compensates for the scrollbar so the page doesn't shift. */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return
    const { overflow, paddingRight } = document.body.style
    const gap = window.innerWidth - document.documentElement.clientWidth
    document.body.style.overflow = 'hidden'
    if (gap > 0) document.body.style.paddingRight = `${gap}px`
    return () => {
      document.body.style.overflow = overflow
      document.body.style.paddingRight = paddingRight
    }
  }, [active])
}

/* Hash routing: the site is served as static files from two different roots
   with no rewrite rules available, so the hash keeps deep links working
   everywhere without server config. */
export type Route = { name: 'home' } | { name: 'product'; id: string }

const parse = (): Route => {
  const m = /^#\/product\/([\w-]+)/.exec(window.location.hash)
  return m ? { name: 'product', id: m[1] } : { name: 'home' }
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(parse)
  useEffect(() => {
    const on = () => setRoute(parse())
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return route
}

export const go = (hash: string) => {
  window.location.hash = hash
}
