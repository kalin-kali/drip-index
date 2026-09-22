/* DRIP INDEX — cart + product-page interactions.
   Works on both the homepage and the static product pages; no build step, no dependencies.
   Contact channels for orders: fill these in and the buttons appear. */
const CONTACTS = {
  instagram: '',      // e.g. 'dripindex.bg'      -> instagram.com/<handle>
  telegram : '',      // e.g. 'dripindex'         -> t.me/<handle>
  whatsapp : '',      // e.g. '359888123456'      -> wa.me/<number>
  email    : '',      // e.g. 'orders@dripindex.eu'
  hours    : 'Mon–Sat · 10:00–19:00 EET'
};
const ORDER_WHATSAPP = CONTACTS.whatsapp;
const ORDER_EMAIL    = CONTACTS.email;
(function(){
const KEY = 'drip.cart.v1';
const RM_ = matchMedia('(prefers-reduced-motion: reduce)').matches;
const ROOT = document.querySelector('.brand') && document.querySelector('.brand').getAttribute('href') === 'index.html' ? '' : '../';

const money = n => '€' + n.toFixed(2);
const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || [] } catch (e) { return [] } };
const save = c => { try { localStorage.setItem(KEY, JSON.stringify(c)) } catch (e) {} paint() };
const count = c => c.reduce((n, i) => n + i.qty, 0);
const total = c => c.reduce((n, i) => n + i.qty * i.price, 0);

/* ---------- header button + drawer ---------- */
const bar = document.querySelector('header .bar');
let btn, drawer, backdrop;
if (bar) {
  btn = document.createElement('button');
  btn.className = 'cartbtn'; btn.type = 'button'; btn.setAttribute('aria-label', 'Open cart');
  btn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 7h12l-1.2 11.2a2 2 0 0 1-2 1.8H9.2a2 2 0 0 1-2-1.8Z"/><path d="M9 7a3 3 0 0 1 6 0"/></svg><span class="cn mono">0</span>';
  bar.appendChild(btn);
  backdrop = document.createElement('div'); backdrop.className = 'cbackdrop'; document.body.appendChild(backdrop);
  drawer = document.createElement('aside'); drawer.className = 'cdrawer'; drawer.setAttribute('aria-label', 'Cart'); drawer.hidden = true;
  drawer.innerHTML = '<div class="ch"><b>Your bag</b><button class="cx" type="button" aria-label="Close cart">✕</button></div><div class="cbody" id="cbody"></div><div class="cfoot" id="cfoot"></div>';
  document.body.appendChild(drawer);
  btn.onclick = () => openCart(true);
  drawer.querySelector('.cx').onclick = () => openCart(false);
  backdrop.onclick = () => openCart(false);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') openCart(false) });
}
function openCart(on) {
  if (!drawer) return;
  if (on) { drawer.hidden = false; requestAnimationFrame(() => { drawer.classList.add('on'); backdrop.classList.add('on') }); drawer.querySelector('.cx').focus() }
  else { drawer.classList.remove('on'); backdrop.classList.remove('on'); setTimeout(() => { drawer.hidden = true }, RM_ ? 0 : 260) }
}
function paint() {
  const c = load();
  if (btn) { const n = count(c); btn.querySelector('.cn').textContent = n; btn.classList.toggle('has', n > 0) }
  const body = document.getElementById('cbody'), foot = document.getElementById('cfoot');
  if (!body) return;
  if (!c.length) { body.innerHTML = '<div class="cempty mono">Your bag is empty</div>'; foot.innerHTML = ''; return }
  body.innerHTML = c.map((i, k) => `<div class="ci"><a class="cim" href="${ROOT}product/${i.spu}.html"><img src="${ROOT}images/${i.spu}_0.webp" alt=""></a>
    <div class="cinf"><a class="cnm" href="${ROOT}product/${i.spu}.html">${i.name}</a>
    ${(i.size || i.color) ? `<div class="csz mono">${[i.color ? 'Colour ' + i.color : '', i.size ? 'Size ' + i.size : ''].filter(Boolean).join(' · ')}</div>` : ''}<div class="cpr">${money(i.price)}</div></div>
    <div class="cqty"><button type="button" data-a="-" data-k="${k}" aria-label="Decrease quantity">−</button><span>${i.qty}</span><button type="button" data-a="+" data-k="${k}" aria-label="Increase quantity">+</button><button class="crm" type="button" data-a="x" data-k="${k}" aria-label="Remove">✕</button></div></div>`).join('');
  const t = total(c);
  foot.innerHTML = `<div class="crow"><span class="mono">Subtotal</span><b>${money(t)}</b></div>
    <div class="cnote mono">Incl. VAT · shipping calculated at checkout</div>
    <div class="cbtns"><button class="cta copy" type="button">Copy order</button>${ORDER_WHATSAPP ? '<a class="cta wa" target="_blank" rel="noopener">WhatsApp</a>' : ''}${ORDER_EMAIL ? '<a class="cta mail">Email</a>' : ''}</div>`;
  const txt = 'DRIP INDEX order:\n' + c.map(i => `• ${i.name}${i.color ? ' / colour ' + i.color : ''}${i.size ? ' / size ' + i.size : ''} x${i.qty} — ${money(i.price * i.qty)}  (${location.origin}/product/${i.spu})`).join('\n') + `\nTotal: ${money(t)}`;
  const cp = foot.querySelector('.copy');
  cp.onclick = () => { navigator.clipboard.writeText(txt).then(() => { cp.textContent = 'Copied ✓'; setTimeout(() => cp.textContent = 'Copy order', 1600) }) };
  const wa = foot.querySelector('.wa'); if (wa) wa.href = 'https://wa.me/' + ORDER_WHATSAPP + '?text=' + encodeURIComponent(txt);
  const ml = foot.querySelector('.mail'); if (ml) ml.href = 'mailto:' + ORDER_EMAIL + '?subject=' + encodeURIComponent('DRIP INDEX order') + '&body=' + encodeURIComponent(txt);
}
document.addEventListener('click', e => {
  const b = e.target.closest('.cqty button'); if (!b) return;
  const c = load(), k = +b.dataset.k;
  if (b.dataset.a === '+') c[k].qty++;
  else if (b.dataset.a === '-') { c[k].qty--; if (c[k].qty < 1) c.splice(k, 1) }
  else c.splice(k, 1);
  save(c);
});
function addToCart(item) {
  const c = load();
  const hit = c.find(i => i.spu === item.spu && i.size === item.size && (i.color || '') === (item.color || ''));
  if (hit) hit.qty += item.qty; else c.push(item);
  save(c); openCart(true);
}

/* ---------- support widget (floating) + footer contacts ---------- */
const CH = [
  { k: 'instagram', label: 'Instagram', href: v => 'https://instagram.com/' + v.replace(/^@/, ''), icon: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>' },
  { k: 'telegram', label: 'Telegram', href: v => 'https://t.me/' + v.replace(/^@/, ''), icon: '<path d="M21 4 3 11l5 2 2 6 3-4 5 4Z"/>' },
  { k: 'whatsapp', label: 'WhatsApp', href: v => 'https://wa.me/' + v.replace(/\D/g, ''), icon: '<path d="M4 20l1.3-4A8 8 0 1 1 8 18.7Z"/>' },
  { k: 'email', label: 'Email', href: v => 'mailto:' + v, icon: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>' }
];
const channels = () => CH.filter(c => CONTACTS[c.k]).map(c => ({ ...c, url: c.href(CONTACTS[c.k]), value: CONTACTS[c.k] }));
function supportMarkup() {
  const list = channels();
  if (!list.length) return '<div class="nolink mono">Contact channels coming soon</div>';
  return list.map(c => `<a class="sup" href="${c.url}" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" aria-hidden="true">${c.icon}</svg><span><b>${c.label}</b><i>${c.value}</i></span></a>`).join('');
}
(function support() {
  const fg = document.querySelector('footer .fgrid');
  if (fg) {
    const col = document.createElement('div');
    col.innerHTML = '<h4 class="mono">SUPPORT</h4>' + supportMarkup() + `<div class="shours mono">${CONTACTS.hours}</div>`;
    col.className = 'fsupport'; fg.appendChild(col);
  }
  const fab = document.createElement('div'); fab.className = 'supwrap';
  fab.innerHTML = `<div class="suppanel" hidden><div class="sph"><b>Need help?</b><button class="spx" type="button" aria-label="Close">✕</button></div>
    <p class="mono">Questions about sizing, batches or an order — write to us, we answer in Bulgarian or English.</p>${supportMarkup()}<div class="shours mono">${CONTACTS.hours}</div></div>
    <button class="supbtn" type="button" aria-label="Support"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12a8 8 0 1 1-3.1-6.3"/><path d="M12 17v-1a3 3 0 0 1 1.6-2.6A2.6 2.6 0 1 0 9.6 10"/><circle cx="12" cy="20" r=".6" fill="currentColor" stroke="none"/></svg><span>Support</span></button>`;
  document.body.appendChild(fab);
  const panel = fab.querySelector('.suppanel');
  fab.querySelector('.supbtn').onclick = () => { panel.hidden = !panel.hidden; if (!panel.hidden) panel.classList.add('on') };
  fab.querySelector('.spx').onclick = () => { panel.hidden = true };
})();

/* ---------- product page: brand wordmark, selectable sizes, colours, add to cart ---------- */
const ld = document.querySelector('script[type="application/ld+json"]');
const pinfo = document.querySelector('.pinfo');
if (ld && pinfo) {
  let P = {}; try { P = JSON.parse(ld.textContent) } catch (e) {}
  if (P['@type'] === 'Product') {
    const spu = (P.url || '').split('/').pop().replace('.html', '');
    const base = P.offers ? (P.offers.price != null ? +P.offers.price : +P.offers.lowPrice) : null;
    /* big brand wordmark behind the gallery, like an editorial product page */
    const brand = (P.name || '').split(/[—\-–(]/)[0].trim().split(/\s+/).slice(0, 2).join(' ');
    const gal = document.querySelector('.gal .main');
    if (gal && brand) { const w = document.createElement('div'); w.className = 'wm'; w.setAttribute('aria-hidden', 'true'); w.textContent = brand; gal.appendChild(w); gal.classList.add('anim') }
    /* colours (from the variants blob injected per page) become required options */
    let colSel = null, colChips = [];
    const vnode = document.getElementById('vars');
    let VARS = {}; try { VARS = vnode ? JSON.parse(vnode.textContent) : {} } catch (e) {}
    if (VARS.colors && VARS.colors.length > 1) {
      const box = document.createElement('div');
      box.innerHTML = '<div class="szh">Colour <span class="req">· required</span> <span class="cpick mono"></span></div><div class="cols" role="radiogroup" aria-label="Colour"></div>';
      const row = box.querySelector('.cols'), pickLabel = box.querySelector('.cpick');
      VARS.colors.forEach((c, i) => {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'cw'; b.dataset.color = c.n;
        b.setAttribute('role', 'radio'); b.setAttribute('aria-checked', 'false'); b.title = c.n;
        b.innerHTML = c.i ? `<img src="${c.i}?w=120" loading="lazy" referrerpolicy="no-referrer" alt="${c.n}">` : `<span class="cwt">${c.n}</span>`;
        b.onclick = () => { colChips.forEach(x => { x.classList.remove('on'); x.setAttribute('aria-checked', 'false') }); b.classList.add('on'); b.setAttribute('aria-checked', 'true'); colSel = c.n; pickLabel.textContent = c.n; if (err) err.textContent = '' };
        row.appendChild(b); colChips.push(b);
      });
      (document.querySelector('.szh') || pinfo).before(box);
    }
    /* sizes become real options */
    const chips = [...document.querySelectorAll('.sizes .sz')];
    let sel = null;
    chips.forEach(ch => {
      const em = ch.querySelector('em');
      ch.dataset.size = (ch.childNodes[0].textContent || '').trim();
      ch.dataset.price = em ? em.textContent.replace(/[^\d.]/g, '') : (base != null ? base : '');
      ch.setAttribute('role', 'radio'); ch.setAttribute('aria-checked', 'false'); ch.tabIndex = 0;
      const pick = () => { chips.forEach(x => { x.classList.remove('on'); x.setAttribute('aria-checked', 'false') }); ch.classList.add('on'); ch.setAttribute('aria-checked', 'true'); sel = ch; if (priceEl && ch.dataset.price) priceEl.textContent = money(+ch.dataset.price); if (err) err.textContent = '' };
      ch.onclick = pick; ch.onkeydown = e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); pick() } };
    });
    const box = document.querySelector('.sizes') ? document.querySelector('.sizes').parentNode : pinfo;
    const wrap = document.createElement('div'); wrap.className = 'buybox';
    wrap.innerHTML = `<div class="qty"><button type="button" data-q="-" aria-label="Decrease quantity">−</button><span id="qn">1</span><button type="button" data-q="+" aria-label="Increase quantity">+</button></div>
      <button class="addbtn" type="button">Add to bag${base != null ? ' · <b id="bprice">' + money(base) + '</b>' : ''}</button><div class="err mono" id="err"></div>`;
    (document.querySelector('.sizes') || pinfo).after(wrap);
    const priceEl = wrap.querySelector('#bprice'), err = wrap.querySelector('#err');
    let qty = 1; const qn = wrap.querySelector('#qn');
    wrap.querySelectorAll('.qty button').forEach(b => b.onclick = () => { qty = Math.max(1, Math.min(9, qty + (b.dataset.q === '+' ? 1 : -1))); qn.textContent = qty });
    wrap.querySelector('.addbtn').onclick = e => {
      if (colChips.length && !colSel) { err.textContent = 'Pick a colour first'; const cr = document.querySelector('.cols'); cr.classList.add('shake'); setTimeout(() => cr.classList.remove('shake'), 500); cr.scrollIntoView({ block: 'nearest', behavior: RM_ ? 'auto' : 'smooth' }); return }
      if (chips.length && !sel) { err.textContent = 'Pick a size first'; document.querySelector('.sizes').classList.add('shake'); setTimeout(() => document.querySelector('.sizes').classList.remove('shake'), 500); return }
      const price = sel && sel.dataset.price ? +sel.dataset.price : base;
      if (price == null) { err.textContent = 'This item has no price yet'; return }
      addToCart({ spu, name: P.name, size: sel ? sel.dataset.size : '', color: colSel || '', price, qty });
      const b = e.currentTarget; b.classList.add('done'); setTimeout(() => b.classList.remove('done'), 900);
    };
  }
}
paint();

/* ---------- Motion (framer-motion's vanilla build) — progressive enhancement ----------
   Only effects that cannot hide content if the library fails to load: the brand marquee,
   a spring on the cart drawer and a little scroll drift on the product photo.
   Element reveal stays on CSS (app.js / the inline script on product pages), so a failed
   import or a stalled animation can never leave the page blank. */
if (!RM_) import('https://cdn.jsdelivr.net/npm/motion@12/+esm').then(M => {
  const { animate, scroll } = M;
  document.documentElement.classList.add('has-motion');

  /* brand strip: continuous marquee */
  const track = document.querySelector('.marquee .mtrack');
  if (track && track.children.length) {
    track.innerHTML += track.innerHTML;
    animate(track, { transform: ['translateX(0)', 'translateX(-50%)'] }, { duration: 45, ease: 'linear', repeat: Infinity });
  }

  /* product photo drifts slightly as you scroll past it */
  const gal = document.querySelector('.pp .gal'), pic = gal && gal.querySelector('.main img');
  if (pic && scroll) {
    try { scroll(animate(pic, { transform: ['translateY(-10px)', 'translateY(10px)'] }, { ease: 'linear' }), { target: gal, offset: ['start end', 'end start'] }) } catch (e) {}
  }

  /* cart drawer: spring instead of a CSS ease */
  const dr = document.querySelector('.cdrawer');
  if (dr) new MutationObserver(() => {
    if (dr.classList.contains('on')) animate(dr, { transform: ['translateX(100%)', 'translateX(0)'] }, { type: 'spring', stiffness: 260, damping: 30 });
  }).observe(dr, { attributes: true, attributeFilter: ['class'] });
}).catch(() => {});

})();
