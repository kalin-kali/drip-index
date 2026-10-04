/* DRIP INDEX — checkout page.
   Delivery is priced live from the Econt tariff and the weight of what's in the bag; payment is
   online through PayPal (PayPal account or any debit/credit card as a guest). The server function
   at /api/pay rebuilds the total from shop.json, so a price edited in the browser is never charged.
   Once paid, the order is also emailed to the shop inbox through FormSubmit (first live submission
   sends an activation link to that inbox — click it once).
   Until the PayPal keys are set in Cloudflare, the page takes the order without payment and we send
   a payment link — so the shop keeps working while payments are being set up. */
(function () {
  const ORDER_ENDPOINT = 'https://formsubmit.co/ajax/' + (CONTACTS.email || '');
  /* keep in sync with functions/api/pay/[[path]].js — that copy is the one that charges */
  const ECONT = [[1, 3.44, 4.55], [2, 3.78, 5.62], [5, 4.13, 7.14], [10, 6.59, 10.61], [15, 7.41, 14.29],
    [20, 9.07, 16.66], [30, 12.67, 21.06], [40, 16.27, 25.46], [50, 19.87, 29.86]];
  const FREE_SHIPPING_OVER = null, PACKING_KG = 0.3;
  const CART = 'drip.cart.v1', BUYER = 'drip.buyer.v1', REF = 'drip.ref.v1', ORDERS = 'drip.orders.v1';
  const $ = s => document.querySelector(s);
  const get = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d } catch (e) { return d } };
  const put = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch (e) {} };
  const money = n => '€' + n.toFixed(2);
  const r2 = n => Math.round(n * 100) / 100;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  let cart = get(CART, []), SHOP = null, PAY = null; /* PAY: {clientId, env} once payments are live */
  const count = () => cart.reduce((n, i) => n + i.qty, 0);
  function ref() {
    let r = null; try { r = localStorage.getItem(REF) } catch (e) {}
    if (!r) { const d = new Date(), p = n => String(n).padStart(2, '0'); r = 'DI-' + p(d.getDate()) + p(d.getMonth() + 1) + '-' + Math.random().toString(36).slice(2, 6).toUpperCase(); try { localStorage.setItem(REF, r) } catch (e) {} }
    return r;
  }

  /* ---------- prices + delivery (same maths as the server) ---------- */
  const shipMethod = () => (document.querySelector('input[name=ship]:checked') || {}).value || 'office';
  function quote() {
    let sub = 0, kg = PACKING_KG;
    cart.forEach(i => {
      const p = SHOP && SHOP[i.spu];
      if (p) { const u = p[1] && i.size && p[1][i.size] != null ? p[1][i.size] : p[0]; i.price = u; kg += p[2] * i.qty }
      else kg += .8 * i.qty;
      sub += i.price * i.qty;
    });
    sub = r2(sub);
    const col = shipMethod() === 'address' ? 2 : 1, row = ECONT.find(r => kg <= r[0]);
    let ship = row ? row[col] : r2(ECONT[ECONT.length - 1][col] + Math.ceil((kg - 50) / 10) * (col === 2 ? 4.4 : 3.6));
    if (FREE_SHIPPING_OVER != null && sub >= FREE_SHIPPING_OVER) ship = 0;
    return { sub, ship, total: r2(sub + ship), kg: r2(kg) };
  }

  /* ---------- summary ---------- */
  function summary() {
    const s = $('#cosum');
    if (!cart.length) {
      $('#coform').hidden = true;
      s.innerHTML = '<div class="coempty"><b>Your bag is empty</b><span>Add a piece from the catalogue and come back here.</span><a class="cgo" href="index.html#catalogue">Browse the catalogue →</a></div>';
      s.classList.add('wide'); return;
    }
    const q = quote();
    /* price next to each delivery option */
    ['office', 'address'].forEach(m => { const el = document.getElementById('ot_' + m); if (!el) return; const r = document.querySelector('input[name=ship][value=' + m + ']'), was = shipMethod(); r.checked = true; el.textContent = money(quote().ship); document.querySelector('input[name=ship][value=' + was + ']').checked = true });
    s.innerHTML = `<div class="sumh"><b>Your order</b><span class="mono">${count()} ${count() === 1 ? 'item' : 'items'} · ${ref()}</span></div>
      <div class="sumlist">${cart.map((i, k) => `<div class="sumi"><a class="sim" href="product/${i.spu}.html"><img src="images/${i.spu}_0.webp" alt=""><span class="mono">${i.qty}</span></a>
        <div><a class="snm" href="product/${i.spu}.html">${esc(i.name)}</a><div class="ssz mono">${[i.color ? esc(i.color) : '', i.size ? 'Size ' + esc(i.size) : ''].filter(Boolean).join(' · ')}</div>
        <button type="button" class="srm mono" data-k="${k}">Remove</button></div><b class="spr">${money(i.price * i.qty)}</b></div>`).join('')}</div>
      <div class="sumrows"><div><span>Subtotal</span><b>${money(q.sub)}</b></div>
      <div><span>Delivery <i class="mono">Econt ${shipMethod() === 'address' ? 'to your address' : 'to an office'} · ~${q.kg} kg</i></span><b>${q.ship ? money(q.ship) : 'Free'}</b></div>
      <div class="sumtot"><span>Total</span><b>${money(q.total)}</b></div>
      <div class="sumpay mono"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18"/></svg>Card or PayPal · incl. VAT</div></div>`;
    s.querySelectorAll('.srm').forEach(b => b.onclick = () => { cart.splice(+b.dataset.k, 1); put(CART, cart); summary(); paintBtn() });
    $('#cobtn').textContent = '· ' + money(q.total);
    const pt = $('#paytotal'); if (pt) pt.textContent = money(q.total);
  }
  function paintBtn() { const c = document.querySelector('.cartbtn .cn'); if (c) { c.textContent = count(); c.parentNode.classList.toggle('has', count() > 0) } }

  /* ---------- form: saved buyer, delivery method, Econt offices ---------- */
  const f = id => document.getElementById('f_' + id);
  const form = document.getElementById('coform'), btn = document.getElementById('cosubmit'), err = document.getElementById('coerr');
  const b0 = get(BUYER, {});
  ['name', 'phone', 'email', 'city', 'addr', 'note'].forEach(k => { if (b0[k] && f(k)) f(k).value = b0[k] });
  if (b0.ship) { const r = document.querySelector(`input[name=ship][value=${b0.ship}]`); if (r) r.checked = true }
  function shipMode() {
    const o = shipMethod() === 'office';
    $('#w_office').hidden = !o; $('#w_addr').hidden = o;
    f('office').required = o; f('addr').required = !o;
  }
  document.querySelectorAll('input[name=ship]').forEach(r => r.onchange = () => { shipMode(); save(); summary() });
  shipMode();

  let ECONTOFF = [];
  fetch('econt.json').then(r => r.json()).then(d => {
    ECONTOFF = d;
    $('#cities').innerHTML = d.map(c => `<option value="${esc(c[0])}">${c[1].length} ${c[1].length === 1 ? 'office' : 'offices'}</option>`).join('');
    offices(b0.office);
  }).catch(() => { const s = f('office'); s.outerHTML = '<input id="f_office" name="office" required placeholder="Econt office name or address">' });
  function offices(keep) {
    const s = f('office'); if (!s || s.tagName !== 'SELECT') return;
    const city = f('city').value.trim().toLowerCase();
    const c = ECONTOFF.find(x => x[0].toLowerCase() === city);
    if (!c) { s.disabled = true; s.innerHTML = `<option value="">${city ? 'No Econt office in that town — check the spelling' : 'Pick your town first'}</option>`; return }
    s.disabled = false;
    const opt = o => `<option value="${esc(o[1] + ' — ' + o[2].trim())}">${esc(o[1])} · ${esc(o[2].replace(c[0], '').trim().slice(0, 60))}</option>`;
    const off = c[1].filter(o => !o[3]), aps = c[1].filter(o => o[3]);
    s.innerHTML = '<option value="">Choose an office…</option>' + (off.length ? `<optgroup label="Offices">${off.map(opt).join('')}</optgroup>` : '') + (aps.length ? `<optgroup label="Parcel lockers">${aps.map(opt).join('')}</optgroup>` : '');
    if (keep) s.value = keep;
    if (c[1].length === 1) s.selectedIndex = 1;
  }
  f('city').addEventListener('input', () => offices());
  form.addEventListener('input', save); form.addEventListener('change', save);
  /* an error disappears as soon as the field is touched again */
  const unmark = e => { const w = e.target.closest('.fld.bad'); if (w) { w.classList.remove('bad'); const m = w.querySelector('.fe'); if (m) m.remove() } };
  form.addEventListener('input', unmark); form.addEventListener('change', unmark);
  function read() {
    return { name: f('name').value.trim(), phone: f('phone').value.trim(), email: f('email').value.trim(), city: f('city').value.trim(),
      office: f('office').value, addr: f('addr').value.trim(), note: f('note').value.trim(), ship: shipMethod() };
  }
  function save() { put(BUYER, read()) }

  /* ---------- validation ---------- */
  const phoneOK = p => { let d = p.replace(/\D/g, ''); if (d.startsWith('00359')) d = d.slice(2); if (d.startsWith('359')) d = '0' + d.slice(3); return /^0\d{8,9}$/.test(d) ? d : null };
  function check(d, quiet) {
    const bad = [];
    const mark = (k, ok, msg) => { const el = f(k), w = el.closest('.fld'); if (quiet) { if (!ok) bad.push(el); return } w.classList.toggle('bad', !ok); let m = w.querySelector('.fe'); if (!ok) { if (!m) { m = document.createElement('em'); m.className = 'fe'; w.appendChild(m) } m.textContent = msg; bad.push(el) } else if (m) m.remove() };
    mark('name', d.name.split(/\s+/).length >= 2, 'Write your first and last name — Econt needs both');
    mark('phone', !!phoneOK(d.phone), 'A Bulgarian phone number, e.g. 0888 123 456');
    mark('email', !d.email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email), 'This email doesn’t look right');
    mark('city', !!d.city, 'Which town should we send it to?');
    if (d.ship === 'office') mark('office', !!d.office, 'Choose the Econt office you’ll collect from');
    else mark('addr', d.addr.length > 5, 'Street, number and flat, please');
    if (bad.length && !quiet) bad[0].focus();
    return !bad.length;
  }

  /* ---------- order text + email to the shop ---------- */
  const where = d => d.ship === 'office' ? 'Econt office — ' + d.city + ', ' + d.office : 'Econt to address — ' + d.city + ', ' + d.addr;
  function orderText(d, r, q, paid) {
    return `DRIP INDEX order ${r}\n` + cart.map(i => `• ${i.name}${i.color ? ' / ' + i.color : ''}${i.size ? ' / size ' + i.size : ''} x${i.qty} — ${money(i.price * i.qty)}  (${location.origin}/product/${i.spu})`).join('\n')
      + `\nSubtotal: ${money(q.sub)}\nDelivery: ${money(q.ship)}\nTotal: ${money(q.total)} — ${paid ? 'PAID (' + paid + ')' : 'NOT PAID YET — send a payment link'}\n\nName: ${d.name}\nPhone: ${d.phone}${d.email ? '\nEmail: ' + d.email : ''}\nDelivery: ${where(d)}${d.note ? '\nNote: ' + d.note : ''}`;
  }
  async function emailShop(d, r, q, paid) {
    const payload = {
      _subject: `${paid ? 'PAID' : 'New'} order ${r} — ${money(q.total)} — ${d.name}`, _template: 'table', _captcha: 'false',
      Order: r, Status: paid ? 'PAID — ' + paid : 'NOT PAID YET — send a card/PayPal payment link',
      Name: d.name, Phone: phoneOK(d.phone), email: d.email || '(none)', Delivery: where(d),
      Items: cart.map(i => `${i.qty} x ${i.name}${i.color ? ' / ' + i.color : ''}${i.size ? ' / size ' + i.size : ''} — ${money(i.price * i.qty)} — ${location.origin}/product/${i.spu}`).join('\n'),
      Subtotal: money(q.sub), 'Econt delivery': money(q.ship), Total: money(q.total), Note: d.note || '-'
    };
    if (d.email) payload._autoresponse = paid
      ? `Thanks, ${d.name.split(' ')[0]}! Your DRIP INDEX order ${r} is paid (${money(q.total)}). We'll send it with Econt to ${where(d)} and you'll get the tracking number.`
      : `Thanks, ${d.name.split(' ')[0]}! We received your DRIP INDEX order ${r} (${money(q.total)} incl. delivery). We'll send you a secure card / PayPal payment link shortly.`;
    try {
      const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), 15000);
      const res = await fetch(ORDER_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(payload), signal: ctl.signal });
      clearTimeout(t);
      const j = await res.json().catch(() => ({}));
      return res.ok && String(j.success) === 'true';
    } catch (x) { return false }
  }

  /* ---------- payment: PayPal / card buttons ---------- */
  const items = () => cart.map(i => ({ spu: i.spu, name: i.name, size: i.size, color: i.color, qty: i.qty }));
  const api = (path, body) => fetch('api/pay/' + path, body ? { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) } : {})
    .then(async r => { const j = await r.json().catch(() => ({})); if (!r.ok) throw Object.assign(new Error(j.error || 'HTTP ' + r.status), { status: r.status }); return j });
  function loadPayPal() {
    if (!cart.length) return;
    api('config').then(cfg => new Promise((ok, no) => {
      PAY = cfg;
      const s = document.createElement('script');
      s.src = 'https://www.paypal.com/sdk/js?client-id=' + encodeURIComponent(cfg.clientId) + '&currency=EUR&intent=capture&components=buttons&enable-funding=card&disable-funding=paylater,venmo';
      s.onload = ok; s.onerror = no; document.head.appendChild(s);
    })).then(renderButtons).catch(() => { PAY = null; payMode() });
  }
  function payMode() {
    /* PAY set -> PayPal/card buttons replace our button; otherwise our button sends the order for a payment link */
    $('#paybox').hidden = !PAY; btn.hidden = !!PAY;
    $('#paynote').innerHTML = PAY
      ? `Pay <b id="paytotal">${money(quote().total)}</b> securely with your card or PayPal. You don’t need a PayPal account — choose <b>Debit or Credit Card</b>.${PAY.env === 'sandbox' ? ' <em class="mono">TEST MODE — no real money</em>' : ''}`
      : `Online card / PayPal payment is being switched on. Place the order now — we’ll send you a secure payment link for <b id="paytotal">${money(quote().total)}</b> and ship as soon as it’s paid.`;
  }
  function renderButtons() {
    payMode();
    window.paypal.Buttons({
      style: { layout: 'vertical', color: 'black', shape: 'rect', label: 'pay', height: 48 },
      onClick: (data, actions) => { err.innerHTML = ''; const d = read(); if (!check(d)) return actions.reject(); save(); return actions.resolve() },
      createOrder: () => { const d = read(); return api('order', { items: items(), ship: d.ship, ref: ref(), buyer: { name: d.name, phone: d.phone } }).then(o => o.id) },
      onApprove: data => api('capture', { id: data.orderID }).then(async c => {
        if (c.status !== 'COMPLETED') throw new Error('Payment not completed (' + c.status + ')');
        const d = read(), q = quote(), r = ref(), paid = (c.amount ? c.amount.value + ' ' + c.amount.currency_code : money(q.total)) + ' via PayPal, capture ' + c.captureId;
        await emailShop(d, r, q, paid);
        done(d, r, q, true);
      }).catch(e => fail('Your payment didn’t go through: ' + e.message + '. Nothing was charged — try again or use another card.')),
      onCancel: () => fail('Payment cancelled — nothing was charged. Your bag is still here.', true),
      onError: e => fail('The payment window had a problem (' + (e && e.message || 'unknown') + '). Nothing was charged — try again in a moment.')
    }).render('#ppbuttons');
  }
  function fail(msg, soft) {
    err.innerHTML = `<b>${soft ? 'No problem.' : 'Payment failed.'}</b><span>${esc(msg)}</span>`;
    err.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }

  /* ---------- no online payment yet: send the order, we reply with a payment link ---------- */
  form.addEventListener('submit', async e => {
    e.preventDefault(); err.innerHTML = '';
    if (PAY) return;
    const d = read(); if (!check(d)) return; save();
    const r = ref(), q = quote();
    btn.disabled = true; btn.classList.add('busy'); btn.querySelector('span').textContent = 'Sending…';
    const ok = await emailShop(d, r, q, null);
    btn.disabled = false; btn.classList.remove('busy'); btn.querySelector('span').textContent = 'Place order';
    if (ok) done(d, r, q, false); else fallback(d, r, orderText(d, r, q, null));
  });

  function done(d, r, q, paid) {
    const o = get(ORDERS, []); o.unshift({ ref: r, at: Date.now(), total: q.total, n: count(), paid, items: cart.map(i => ({ spu: i.spu, name: i.name, size: i.size, qty: i.qty })) }); put(ORDERS, o.slice(0, 20));
    const n = count();
    cart = []; put(CART, []); try { localStorage.removeItem(REF) } catch (e) {} paintBtn();
    document.querySelector('.cogrid').hidden = true;
    document.querySelectorAll('.costeps li').forEach(li => li.classList.add('on'));
    const wa = ORDER_WHATSAPP ? `https://wa.me/${ORDER_WHATSAPP}?text=${encodeURIComponent('Hi! About my DRIP INDEX order ' + r)}` : '';
    const box = document.getElementById('codone'); box.hidden = false;
    const place = esc(d.ship === 'office' ? d.office.split(' — ')[0] : d.city + ', ' + d.addr);
    box.innerHTML = `<div class="dn"><svg class="tick" viewBox="0 0 52 52" aria-hidden="true"><circle cx="26" cy="26" r="24"/><path d="M15 27l7 7 15-16"/></svg>
      <span class="kick mono">${paid ? 'Paid · order confirmed' : 'Order received'}</span><h2>Thank you, ${esc(d.name.split(' ')[0])}.</h2>
      <div class="dref"><span class="mono">Your order number</span><b class="mono">${r}</b><small>${n} ${n === 1 ? 'item' : 'items'} · ${money(q.total)} incl. delivery${paid ? ' · paid' : ''}</small></div>
      <ol class="dsteps">${paid
        ? `<li class="on"><b>Paid</b><span>Just now — the receipt is in your PayPal / card email</span></li><li><b>Packed &amp; shipped with Econt</b><span>You get the tracking number by SMS${d.email ? ' and email' : ''}</span></li><li><b>Collect it</b><span>${place}</span></li>`
        : `<li class="on"><b>Received</b><span>Just now</span></li><li><b>Payment link</b><span>We send a secure card / PayPal link to ${esc(d.email || d.phone)}</span></li><li><b>Shipped with Econt</b><span>As soon as it’s paid — tracking number by SMS</span></li><li><b>Collect it</b><span>${place}</span></li>`}</ol>
      <div class="dbtns"><a class="cgo" href="index.html">Keep shopping →</a>${wa ? `<a class="dalt" href="${wa}" target="_blank" rel="noopener">Questions? WhatsApp us about ${r}</a>` : ''}</div></div>`;
    scrollTo({ top: 0, behavior: 'smooth' });
  }

  function fallback(d, r, text) {
    const wa = ORDER_WHATSAPP ? 'https://wa.me/' + ORDER_WHATSAPP + '?text=' + encodeURIComponent(text) : '';
    const ml = CONTACTS.email ? 'mailto:' + CONTACTS.email + '?subject=' + encodeURIComponent('DRIP INDEX order ' + r) + '&body=' + encodeURIComponent(text) : '';
    err.innerHTML = `<b>We couldn’t send it automatically.</b><span>Your bag is still here. Send the order in one tap — it’s already written for you:</span>
      <div class="fbb">${wa ? `<a class="cta wa" href="${wa}" target="_blank" rel="noopener">Send on WhatsApp</a>` : ''}${ml ? `<a class="cta" href="${ml}">Send by email</a>` : ''}<button type="button" class="cta copy" id="cocopy">Copy order</button></div>`;
    const cp = document.getElementById('cocopy');
    cp.onclick = () => navigator.clipboard.writeText(text).then(() => { cp.textContent = 'Copied ✓' });
    err.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }

  summary(); payMode();
  /* real prices + weights, then payment buttons */
  fetch('shop.json').then(r => r.json()).then(s => { SHOP = s; put(CART, cart); summary(); payMode() }).catch(() => {}).finally(loadPayPal);
})();
