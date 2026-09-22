import type { Variants, Transition } from 'framer-motion'

/* One easing curve and three durations for the whole site, so every transition
   reads as the same system. Exits are faster than entrances. */
export const EASE = [0.16, 1, 0.3, 1] as const

export const T = {
  fast: { duration: 0.22, ease: EASE } as Transition,
  base: { duration: 0.45, ease: EASE } as Transition,
  slow: { duration: 0.75, ease: EASE } as Transition,
  spring: { type: 'spring', stiffness: 380, damping: 32, mass: 0.7 } as Transition,
  softSpring: { type: 'spring', stiffness: 200, damping: 28 } as Transition,
}

/* Scroll reveal for a section. Children stagger at 30ms — small enough that a
   long grid never feels sluggish. */
export const reveal: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.03, delayChildren: 0.02 } },
}

export const revealItem: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: T.base },
}

export const revealUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: T.slow },
}

/* Headline entrance: words rise and un-blur, clipped by an overflow-hidden mask. */
export const wordStagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.055 } },
}

export const wordRise: Variants = {
  hidden: { y: '110%', opacity: 0 },
  show: { y: '0%', opacity: 1, transition: { duration: 0.85, ease: EASE } },
}

export const fade: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: T.base },
  exit: { opacity: 0, transition: T.fast },
}

/* Shared viewport config — reveal once, slightly before the element is centred. */
export const inView = { once: true, margin: '0px 0px -12% 0px' } as const
