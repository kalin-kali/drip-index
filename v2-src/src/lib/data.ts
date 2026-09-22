/* Raw catalogue row as stored in data.json (kept as a tuple to stay small on the wire):
   [id, name, tabIndices, sizeRange, sizes, price, priceHigh] */
export type Row = [string, string, number[], string, string[], number | null, number | null]

export interface Product {
  id: string
  name: string
  tabs: number[]
  sizeRange: string
  sizes: string[]
  price: number | null
  priceHigh: number | null
}

export interface Catalogue {
  tabs: string[]
  items: Product[]
}

/* The v2 bundle is deployed into a subfolder of the existing site, which is served
   from two different roots (a bare domain and a /drip-index/ project path). Resolve
   the site root from the document URL so image and data paths work on both. */
export const SITE = (() => {
  const p = window.location.pathname
  const dir = p.endsWith('/') ? p : p.replace(/[^/]*$/, '')
  return dir.replace(/v2\/$/, '')
})()

export const img = (id: string, n = 0) => `${SITE}images/${id}_${n}.webp`
export const asset = (p: string) => `${SITE}images/${p}`
export const legacyProduct = (id: string) => `${SITE}product/${id}.html`

export const eur = (n: number) =>
  '€' + n.toFixed(2)

let cache: Promise<Catalogue> | null = null

export function loadCatalogue(): Promise<Catalogue> {
  if (!cache) {
    cache = fetch(`${SITE}data.json`)
      .then((r) => {
        if (!r.ok) throw new Error(`catalogue ${r.status}`)
        return r.json()
      })
      .then((d: { tabs: string[]; items: Row[] }) => ({
        tabs: d.tabs,
        items: d.items.map(
          ([id, name, tabs, sizeRange, sizes, price, priceHigh]): Product => ({
            id, name, tabs, sizeRange, sizes: sizes || [], price, priceHigh,
          }),
        ),
      }))
      .catch((e) => {
        cache = null
        throw e
      })
  }
  return cache
}

/* ── Taxonomy ─────────────────────────────────────────────────────────────
   Supplier names are free text, so brands and silhouettes are matched by
   regex rather than a field. Carried over from the v1 catalogue. */

export interface Facet {
  name: string
  rx: RegExp
  image?: string
}

export const SHOE_RX =
  /track|runner|triple|3xl|shoe|sneaker|trainer|jordan \d|dunk|yeezy \d|350|700|500|foam|balance|\bnb ?\d|\d{3,4}r?\b/i

export const MODELS: Facet[] = [
  { name: 'Jordan 4', rx: /jordan 4|aj4|\bj4\b/i, image: 'models/jordan4.webp' },
  { name: 'Jordan 1', rx: /jordan 1|aj1/i, image: 'models/jordan1.webp' },
  { name: 'Nike Dunk', rx: /dunk/i, image: 'models/dunk.webp' },
  { name: 'Yeezy 350', rx: /yeezy/i, image: 'models/yeezy.webp' },
  { name: 'Balenciaga Track', rx: /balenciaga/i, image: 'models/balenciaga.webp' },
  { name: 'New Balance', rx: /new balance|\bnb ?\d/i, image: 'models/nb.webp' },
  { name: 'Air Max / TN', rx: /air max|\btn\b|vapormax/i, image: 'models/airmax.webp' },
  { name: 'Air Force 1', rx: /air force|af1/i, image: 'models/af1.webp' },
  { name: 'Adidas Samba', rx: /samba|gazelle|spezial|campus/i, image: 'models/samba.webp' },
  { name: 'Dior B22 / B30', rx: /dior.*(b22|b30)/i, image: 'models/dior.webp' },
  { name: 'LV Trainer', rx: /(\blv\b|louis vuitton).*(trainer|skate|shoe|sneaker)/i, image: 'models/lv.webp' },
  { name: 'Louboutin', rx: /louboutin/i, image: 'models/louboutin.webp' },
  { name: 'Golden Goose', rx: /golden goose/i, image: 'models/goldengoose.webp' },
  { name: 'Yeezy Slides', rx: /yeezy.*(slide|foam)|foam runner/i, image: 'models/yeezy-slide.webp' },
  { name: 'Triple S', rx: /triple s/i, image: 'models/balenciaga-triples.webp' },
]

export const BRANDS: Facet[] = [
  { name: 'Essentials', rx: /essentials|fear of god|\bfog\b/i, image: 'brands/essentials.webp' },
  { name: 'Corteiz', rx: /corteiz|crtz/i, image: 'brands/corteiz.webp' },
  { name: 'Trapstar', rx: /trapstar/i, image: 'brands/trapstar.webp' },
  { name: 'Amiri', rx: /amiri/i, image: 'brands/amiri.webp' },
  { name: 'Chrome Hearts', rx: /chrome ?hearts/i, image: 'brands/chromehearts.webp' },
  { name: 'Stussy', rx: /stussy|stüssy/i, image: 'brands/stussy.webp' },
  { name: 'Hellstar', rx: /hellstar/i, image: 'brands/hellstar.webp' },
  { name: 'Gallery Dept', rx: /gallery ?dept/i, image: 'brands/gallerydept.webp' },
  { name: 'Denim Tears', rx: /denim tears/i, image: 'brands/denimtears.webp' },
  { name: 'Sp5der', rx: /sp5der/i, image: 'brands/sp5der.webp' },
  { name: 'Bape', rx: /\bbape\b/i, image: 'brands/bape.webp' },
  { name: 'Supreme', rx: /supreme/i, image: 'brands/supreme.webp' },
  { name: 'Moncler', rx: /moncler/i, image: 'brands/moncler.webp' },
  { name: 'Stone Island', rx: /stone island/i, image: 'brands/stoneisland.webp' },
  { name: 'The North Face', rx: /north ?face|\btnf\b/i, image: 'brands/northface.webp' },
  { name: 'Ralph Lauren', rx: /ralph lauren|\bpolo\b/i, image: 'brands/ralphlauren.webp' },
  { name: 'Carhartt', rx: /carhartt/i, image: 'brands/carhartt.webp' },
  { name: 'Nike', rx: /\bnike\b/i, image: 'brands/nike.webp' },
  { name: 'Goyard', rx: /goyard/i, image: 'brands/goyard.webp' },
  { name: 'Louis Vuitton', rx: /\blv\b|louis vuitton/i, image: 'brands/lv.webp' },
  { name: 'Gucci', rx: /gucci/i, image: 'brands/gucci.webp' },
  { name: 'Prada', rx: /prada/i, image: 'brands/prada.webp' },
  { name: 'Dior', rx: /dior/i, image: 'brands/dior.webp' },
  { name: 'Football kits', rx: /jersey|\bkit\b|world cup/i, image: 'brands/fifa.webp' },
]

export const FACETS = [...BRANDS, ...MODELS]

/* Editorial lookbook: [brand, shot, caption, brand regex, preferred-product regex] */
export interface Look {
  brand: string
  image: string
  caption: string
  rx: RegExp
  pick: RegExp
}

export const LOOKS: Look[] = [
  { brand: 'Corteiz', image: 'look/corteiz-2.webp', caption: 'Pista velour tracksuit', rx: /corteiz|crtz/i, pick: /corteiz.*(track|jacket|set|suit)/i },
  { brand: 'Sp5der', image: 'look/sp5der-purple.webp', caption: 'Web tracksuit', rx: /sp5der/i, pick: /sp5der.*(track|hoodie|sweat|set|pant)/i },
  { brand: 'Louis Vuitton', image: 'look/lv-naomi.webp', caption: 'Monogram look', rx: /\blv\b|louis vuitton/i, pick: /(\blv\b|louis vuitton).*(jacket|shirt|hoodie|tee|set)/i },
  { brand: 'Moncler', image: 'look/moncler-puffer.webp', caption: 'Down jacket', rx: /moncler/i, pick: /moncler.*(down|puffer|jacket)/i },
  { brand: 'Trapstar', image: 'look/trapstar-duo.webp', caption: 'Irongate tracksuits', rx: /trapstar/i, pick: /trapstar.*(hoodie|sweat|track|set|suit)/i },
  { brand: 'Stone Island', image: 'look/stoneisland-orange.webp', caption: 'Shell jacket', rx: /stone island/i, pick: /stone island.*(jacket|coat|wind|shell|overshirt)/i },
  { brand: 'Balenciaga', image: 'look/balenciaga-track.webp', caption: 'Track 3.0', rx: /balenciaga/i, pick: /balenciaga.*track/i },
  { brand: 'Essentials', image: 'look/essentials.webp', caption: 'Fear of God hoodie', rx: /essentials|fear of god|\bfog\b/i, pick: /essentials.*hoodie|fog.*hoodie/i },
  { brand: 'Hellstar', image: 'look/hellstar.webp', caption: 'Hoodie & sweatpants', rx: /hellstar/i, pick: /hellstar.*(hoodie|sweat|set|pant)/i },
  { brand: 'Gallery Dept', image: 'look/gallerydept.webp', caption: 'Paint logo hoodie', rx: /gallery ?dept/i, pick: /gallery.*(hoodie|sweat)/i },
  { brand: 'Amiri', image: 'look/amiri.webp', caption: 'Oversized tee', rx: /amiri/i, pick: /amiri.*(tee|t-?shirt)/i },
  { brand: 'Stussy', image: 'look/stussy.webp', caption: 'Hooded puffer', rx: /stussy|stüssy/i, pick: /stussy.*(puffer|jacket|down)/i },
]

export const TAB_LABEL: Record<string, string> = {
  Selected: 'Selected',
  'Trending Now': 'Trending',
  'Latest Finds': 'New in',
  Shoes: 'Sneakers',
  'T-Shirt And Shorts': 'Tees & Shorts',
  'Hoodies And Pants': 'Hoodies & Pants',
  'Coats And Jackets': 'Jackets',
  Accessories: 'Accessories',
  'Electronic Products': 'Tech',
  'Trendy Brands': 'Trendy brands',
  '2026 Fifa World Cup': 'World Cup kits',
}

/* Cover shot per tab — a few are pinned to curated crops, the rest fall back
   to the first product in that tab. */
export const TAB_COVER: Record<number, string> = {
  [-1]: 'models/jordan4.webp',
  0: 'models/dior.webp',
  3: 'models/balenciaga.webp',
}

export const minPrice = (list: Product[]) => {
  let m = Infinity
  for (const p of list) if (p.price != null && p.price < m) m = p.price
  return m === Infinity ? null : m
}

export const batchBadge = (name: string) => {
  const m = /og batch|top batch|best batch|pk batch|top quality|1:1/i.exec(name)
  if (!m) return null
  return m[0].toUpperCase().replace('BEST BATCH', 'TOP BATCH').replace('TOP QUALITY', 'TOP BATCH').replace('1:1', '1:1 BATCH')
}
