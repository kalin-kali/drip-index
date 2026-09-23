/* DRIP INDEX — cart + product-page interactions.
   Works on both the homepage and the static product pages; no build step, no dependencies.
   Contact channels for orders: fill these in and the buttons appear. */
const CONTACTS = {
  phone    : '0884 708 691',          // tel: link, dialled as +359 884 708 691
  phone2   : '0887 081 684',
  whatsapp : '0898 481 925',          // wa.me/359898481925
  email    : 'dripindex2@gmail.com',
  instagram: '',                      // 'handle' -> instagram.com/<handle>
  telegram : '',                      // 'handle' -> t.me/<handle>
  hours    : 'Mon–Sat · 10:00–19:00 EET'
};
/* Bulgarian mobile numbers are written 08xx… locally but must dial as +3598xx… */
const intl = v => '+359' + v.replace(/\D/g, '').replace(/^0/, '');
const ORDER_WHATSAPP = CONTACTS.whatsapp ? intl(CONTACTS.whatsapp).replace('+', '') : '';
const ORDER_EMAIL    = CONTACTS.email;
(function(){
const KEY = 'drip.cart.v1';
const RM_ = matchMedia('(prefers-reduced-motion: reduce)').matches;
const ROOT = document.querySelector('.brand') && document.querySelector('.brand').getAttribute('href') === 'index.html' ? '' : '../';

const money = n => '€' + n.toFixed(2);
const BKEY = 'drip.buyer.v1', RKEY = 'drip.ref.v1';
const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || [] } catch (e) { return [] } };
const loadBuyer = () => { try { return JSON.parse(localStorage.getItem(BKEY)) || {} } catch (e) { return {} } };
const saveBuyer = b => { try { localStorage.setItem(BKEY, JSON.stringify(b)) } catch (e) {} };
/* one reference per bag, so a customer and we can refer to the same order later */
function orderRef() {
  let r = null; try { r = localStorage.getItem(RKEY) } catch (e) {}
  if (!r) {
    const d = new Date(), p = n => String(n).padStart(2, '0');
    r = 'DI-' + p(d.getDate()) + p(d.getMonth() + 1) + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
    try { localStorage.setItem(RKEY, r) } catch (e) {}
  }
  return r;
}
const clearRef = () => { try { localStorage.removeItem(RKEY) } catch (e) {} };
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
  const t = total(c), b = loadBuyer(), ref = orderRef();
  foot.innerHTML = `<div class="crow"><span class="mono">Subtotal</span><b>${money(t)}</b></div>
    <div class="cnote mono">Incl. VAT · shipping quoted per order · Ref ${ref}</div>
    <div class="cform">
      <label><span class="mono">Name *</span><input id="bname" value="${(b.name || '').replace(/"/g, '&quot;')}" autocomplete="name" placeholder="Име и фамилия"></label>
      <label><span class="mono">Phone *</span><input id="bphone" value="${(b.phone || '').replace(/"/g, '&quot;')}" autocomplete="tel" inputmode="tel" placeholder="08xx xxx xxx"></label>
      <label class="wide"><span class="mono">Delivery — town &amp; Econt office</span><input id="baddr" value="${(b.addr || '').replace(/"/g, '&quot;')}" autocomplete="street-address" placeholder="гр. София, Еконт офис …"></label>
      <label class="wide"><span class="mono">Note</span><input id="bnote" value="${(b.note || '').replace(/"/g, '&quot;')}" placeholder="Друг размер, цвят, въпрос…"></label>
    </div>
    <div class="cbtns"><button class="cta copy" type="button">Copy order</button>${ORDER_WHATSAPP ? '<a class="cta wa" target="_blank" rel="noopener">WhatsApp</a>' : ''}${ORDER_EMAIL ? '<a class="cta mail">Email</a>' : ''}</div>
    <div class="cerr mono" id="cerr"></div>`;
  const fields = ['name', 'phone', 'addr', 'note'].map(k => [k, foot.querySelector('#b' + k)]);
  const read = () => { const o = {}; fields.forEach(([k, el]) => o[k] = el.value.trim()); return o };
  fields.forEach(([, el]) => el.addEventListener('input', () => saveBuyer(read())));
  const err = foot.querySelector('#cerr');
  const orderText = () => {
    const d = read();
    return `DRIP INDEX order ${ref}\n`
      + c.map(i => `• ${i.name}${i.color ? ' / colour ' + i.color : ''}${i.size ? ' / size ' + i.size : ''} x${i.qty} — ${money(i.price * i.qty)}  (${location.origin}/product/${i.spu})`).join('\n')
      + `\nTotal: ${money(t)}\n\nName: ${d.name}\nPhone: ${d.phone}`
      + (d.addr ? `\nDelivery: ${d.addr}` : '') + (d.note ? `\nNote: ${d.note}` : '');
  };
  /* name and phone are what makes an order answerable — ask for them before sending */
  const ready = () => {
    const d = read();
    if (!d.name || !d.phone) {
      err.textContent = 'Add your name and phone so we can confirm the order';
      (!d.name ? fields[0][1] : fields[1][1]).focus();
      return false;
    }
    err.textContent = ''; saveBuyer(d); return true;
  };
  const cp = foot.querySelector('.copy');
  cp.onclick = () => { if (!ready()) return; navigator.clipboard.writeText(orderText()).then(() => { cp.textContent = 'Copied ✓'; setTimeout(() => cp.textContent = 'Copy order', 1600) }) };
  const wa = foot.querySelector('.wa');
  if (wa) wa.onclick = e => { if (!ready()) { e.preventDefault(); return } wa.href = 'https://wa.me/' + ORDER_WHATSAPP + '?text=' + encodeURIComponent(orderText()) };
  const ml = foot.querySelector('.mail');
  if (ml) ml.onclick = e => { if (!ready()) { e.preventDefault(); return } ml.href = 'mailto:' + ORDER_EMAIL + '?subject=' + encodeURIComponent('DRIP INDEX order ' + ref) + '&body=' + encodeURIComponent(orderText()) };
}
document.addEventListener('click', e => {
  const b = e.target.closest('.cqty button'); if (!b) return;
  const c = load(), k = +b.dataset.k;
  if (b.dataset.a === '+') c[k].qty++;
  else if (b.dataset.a === '-') { c[k].qty--; if (c[k].qty < 1) c.splice(k, 1) }
  else c.splice(k, 1);
  if (!c.length) clearRef();
  save(c);
});
function addToCart(item) {
  const c = load();
  const hit = c.find(i => i.spu === item.spu && i.size === item.size && (i.color || '') === (item.color || ''));
  if (hit) hit.qty += item.qty; else c.push(item);
  save(c); openCart(true);
}

/* ---------- header: solid on scroll, progress line, mobile menu (product pages have no app.js) ---------- */
(function hdr(){
  const h = document.getElementById('hdr'), pr = document.getElementById('hprog'),
        mn = document.getElementById('menu'), mv = document.getElementById('mobnav');
  if (!h || h.dataset.wired) return; h.dataset.wired = '1';
  const on = () => { h.classList.toggle('solid', scrollY > 24);
    if (pr) { const max = document.body.scrollHeight - innerHeight; pr.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, scrollY / max) : 0) + ')' } };
  addEventListener('scroll', on, { passive: true }); on();
  if (mn && mv) mn.onclick = () => { const o = mv.hidden; mv.hidden = !o; mn.setAttribute('aria-expanded', String(o)) };
  const q = document.getElementById('q');
  addEventListener('keydown', e => { if (e.key === '/' && q && document.activeElement !== q) { e.preventDefault(); q.focus() } });
})();

/* ---------- support widget (floating) + footer contacts ---------- */
const PHONE_ICON = '<path d="M4.5 4h3.2l1.6 4-2 1.4a12 12 0 0 0 5.3 5.3l1.4-2 4 1.6v3.2a1.5 1.5 0 0 1-1.7 1.5C9.6 18.6 5.4 14.4 3 6.2A1.5 1.5 0 0 1 4.5 4Z"/>';
const CH = [
  { k: 'phone', label: 'Call us', href: v => 'tel:' + intl(v), icon: PHONE_ICON },
  { k: 'phone2', label: 'Call us', href: v => 'tel:' + intl(v), icon: PHONE_ICON },
  { k: 'instagram', label: 'Instagram', href: v => 'https://instagram.com/' + v.replace(/^@/, ''), icon: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>' },
  { k: 'telegram', label: 'Telegram', href: v => 'https://t.me/' + v.replace(/^@/, ''), icon: '<path d="M21 4 3 11l5 2 2 6 3-4 5 4Z"/>' },
  { k: 'whatsapp', label: 'WhatsApp', href: v => 'https://wa.me/' + intl(v).replace('+', ''), icon: '<path d="M4 20l1.3-4A8 8 0 1 1 8 18.7Z"/>' },
  { k: 'email', label: 'Email', href: v => 'mailto:' + v, icon: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>' }
];
const channels = () => CH.filter(c => CONTACTS[c.k]).map(c => ({ ...c, url: c.href(CONTACTS[c.k]), value: CONTACTS[c.k] }));
function supportMarkup() {
  const list = channels();
  if (!list.length) return '<div class="nolink mono">Contact channels coming soon</div>';
  /* two numbers, one label — only the first says "Call us" */
  let calls = 0;
  list.forEach(c => { if (c.k.startsWith('phone') && calls++) c.label = 'Or call' });
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
        if (!c.i) b.classList.add('txt');
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
      ${base != null ? `<button class="addbtn" type="button">Add to bag · <b id="bprice">${money(base)}</b></button>`
        : `<button class="addbtn off" type="button" disabled>Currently unavailable</button>`}<div class="err mono" id="err">${base == null ? 'This piece is not listed by the supplier right now — ask us for an alternative.' : ''}</div>`;
    (document.querySelector('.sizes') || pinfo).after(wrap);
    const priceEl = wrap.querySelector('#bprice'), err = wrap.querySelector('#err');
    let qty = 1; const qn = wrap.querySelector('#qn');
    wrap.querySelectorAll('.qty button').forEach(b => b.onclick = () => { qty = Math.max(1, Math.min(9, qty + (b.dataset.q === '+' ? 1 : -1))); qn.textContent = qty });
    /* what a buyer asks before paying, answered next to the button */
    const facts = document.createElement('div'); facts.className = 'facts';
    facts.innerHTML = [
      ['<path d="M12 3l8 4v5c0 4.4-3.2 8-8 9-4.8-1-8-4.6-8-9V7Z"/><path d="m8.6 12 2.4 2.4 4.4-4.8"/>', 'Top batches only', 'Every listing is a vetted batch, photographed by the supplier.'],
      ['<rect x="2" y="7" width="12" height="9" rx="1.5"/><path d="M14 10h4l3 3v3h-7z"/><circle cx="7" cy="18" r="1.6"/><circle cx="17" cy="18" r="1.6"/>', 'Shipping quoted per order', 'Combined shipping across the whole bag.'],
      ['<path d="M3 9.5 9.5 3 21 14.5 14.5 21Z"/><path d="M7 9l1.6 1.6M10 12l1.6 1.6M13 15l1.6 1.6"/>', 'Sizes as listed', P.size && P.size.length ? 'This piece runs ' + P.size[0] + '–' + P.size[P.size.length - 1] + '.' : 'Sizes shown are the ones the supplier stocks.']
    ].map(([ic, t, d]) => `<div class="fact"><svg viewBox="0 0 24 24" aria-hidden="true">${ic}</svg><div><b>${t}</b><span>${d}</span></div></div>`).join('');
    wrap.after(facts);
    if (base != null) wrap.querySelector('.addbtn').onclick = e => {
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
  document.querySelectorAll('.marquee .mtrack').forEach((track, i) => {
    if (!track.children.length) return;
    [...track.children].forEach(n => { const c = n.cloneNode(true); c.setAttribute('aria-hidden', 'true'); c.tabIndex = -1; track.appendChild(c) });
    const from = i ? 'translateX(-50%)' : 'translateX(0)', to = i ? 'translateX(0)' : 'translateX(-50%)';
    animate(track, { transform: [from, to] }, { duration: 55 + i * 10, ease: 'linear', repeat: Infinity });
  });

  /* product photo drifts slightly as you scroll past it */
  const gal = document.querySelector('.pp .gal'), pic = gal && gal.querySelector('.main img');
  if (pic && scroll) {
    try { scroll(animate(pic, { transform: ['translateY(-10px)', 'translateY(10px)'] }, { ease: 'linear' }), { target: gal, offset: ['start end', 'end start'] }) } catch (e) {}
  }

}).catch(() => {});

})();
