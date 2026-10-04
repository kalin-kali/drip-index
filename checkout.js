/* DRIP INDEX — checkout page.
   The order is sent as an email to the shop inbox through FormSubmit (free, no backend needed on
   a static site). The very first submission makes FormSubmit email an activation link to that inbox;
   until someone clicks it, orders can't be delivered — then the buyer automatically gets the
   WhatsApp / email / copy fallback instead, so no order is ever lost. */
(function () {
  const ORDER_ENDPOINT = 'https://formsubmit.co/ajax/' + (CONTACTS.email || '');
  const CART = 'drip.cart.v1', BUYER = 'drip.buyer.v1', REF = 'drip.ref.v1', ORDERS = 'drip.orders.v1';
  const $ = s => document.querySelector(s);
  const get = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d } catch (e) { return d } };
  const put = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch (e) {} };
  const money = n => '€' + n.toFixed(2);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  let cart = get(CART, []), form0;
  const total = () => cart.reduce((n, i) => n + i.qty * i.price, 0);
  const count = () => cart.reduce((n, i) => n + i.qty, 0);
  function ref() {
    let r = null; try { r = localStorage.getItem(REF) } catch (e) {}
    if (!r) { const d = new Date(), p = n => String(n).padStart(2, '0'); r = 'DI-' + p(d.getDate()) + p(d.getMonth() + 1) + '-' + Math.random().toString(36).slice(2, 6).toUpperCase(); try { localStorage.setItem(REF, r) } catch (e) {} }
    return r;
  }

  /* ---------- summary ---------- */
  function summary() {
    const s = $('#cosum');
    if (!cart.length) {
      $('#coform').hidden = true;
      s.innerHTML = '<div class="coempty"><b>Your bag is empty</b><span>Add a piece from the catalogue and come back here.</span><a class="cgo" href="index.html#catalogue">Browse the catalogue →</a></div>';
      s.classList.add('wide'); return;
    }
    s.innerHTML = `<div class="sumh"><b>Your order</b><span class="mono">${count()} ${count() === 1 ? 'item' : 'items'} · ${ref()}</span></div>
      <div class="sumlist">${cart.map((i, k) => `<div class="sumi"><a class="sim" href="product/${i.spu}.html"><img src="images/${i.spu}_0.webp" alt=""><span class="mono">${i.qty}</span></a>
        <div><a class="snm" href="product/${i.spu}.html">${esc(i.name)}</a><div class="ssz mono">${[i.color ? esc(i.color) : '', i.size ? 'Size ' + esc(i.size) : ''].filter(Boolean).join(' · ')}</div>
        <button type="button" class="srm mono" data-k="${k}">Remove</button></div><b class="spr">${money(i.price * i.qty)}</b></div>`).join('')}</div>
      <div class="sumrows"><div><span>Subtotal</span><b>${money(total())}</b></div><div><span>Delivery</span><b class="mono">Econt tariff, paid on delivery</b></div>
      <div class="sumtot"><span>Total now</span><b>€0.00</b></div><div class="sumcod"><span>Pay on delivery</span><b>${money(total())} <small>+ delivery</small></b></div></div>`;
    s.querySelectorAll('.srm').forEach(b => b.onclick = () => { cart.splice(+b.dataset.k, 1); put(CART, cart); summary(); paintBtn() });
    $('#cobtn').textContent = '· ' + money(total());
  }
  function paintBtn() { const c = document.querySelector('.cartbtn .cn'); if (c) { c.textContent = count(); c.parentNode.classList.toggle('has', count() > 0) } }

  /* ---------- form: saved buyer, delivery method, Econt offices ---------- */
  const f = id => document.getElementById('f_' + id);
  const b = get(BUYER, {});
  ['name', 'phone', 'email', 'city', 'addr', 'note'].forEach(k => { if (b[k] && f(k)) f(k).value = b[k] });
  if (b.ship) { const r = document.querySelector(`input[name=ship][value=${b.ship}]`); if (r) r.checked = true }
  const ship = () => document.querySelector('input[name=ship]:checked').value;
  function shipMode() {
    const o = ship() === 'office';
    $('#w_office').hidden = !o; $('#w_addr').hidden = o;
    f('office').required = o; f('addr').required = !o;
  }
  document.querySelectorAll('input[name=ship]').forEach(r => r.onchange = () => { shipMode(); save() });
  shipMode();

  let ECONT = [];
  fetch('econt.json').then(r => r.json()).then(d => {
    ECONT = d;
    $('#cities').innerHTML = d.map(c => `<option value="${esc(c[0])}">${c[1].length} ${c[1].length === 1 ? 'office' : 'offices'}</option>`).join('');
    offices(b.office);
  }).catch(() => { const s = f('office'); s.outerHTML = '<input id="f_office" name="office" required placeholder="Econt office name or address">' });
  function offices(keep) {
    const s = f('office'); if (!s || s.tagName !== 'SELECT') return;
    const city = f('city').value.trim().toLowerCase();
    const c = ECONT.find(x => x[0].toLowerCase() === city);
    if (!c) { s.disabled = true; s.innerHTML = `<option value="">${city ? 'No Econt office in that town — check the spelling' : 'Pick your town first'}</option>`; return }
    s.disabled = false;
    const opt = o => `<option value="${esc(o[1] + ' — ' + o[2].trim())}">${esc(o[1])} · ${esc(o[2].replace(c[0], '').trim().slice(0, 60))}</option>`;
    const off = c[1].filter(o => !o[3]), aps = c[1].filter(o => o[3]);
    s.innerHTML = '<option value="">Choose an office…</option>' + (off.length ? `<optgroup label="Offices">${off.map(opt).join('')}</optgroup>` : '') + (aps.length ? `<optgroup label="Parcel lockers">${aps.map(opt).join('')}</optgroup>` : '');
    if (keep) s.value = keep;
    if (c[1].length === 1) s.selectedIndex = 1;
  }
  f('city').addEventListener('input', () => { offices(); save() });
  document.getElementById('coform').addEventListener('input', save);
  document.getElementById('coform').addEventListener('change', save);
  function read() {
    return { name: f('name').value.trim(), phone: f('phone').value.trim(), email: f('email').value.trim(), city: f('city').value.trim(),
      office: f('office').value, addr: f('addr').value.trim(), note: f('note').value.trim(), ship: ship() };
  }
  function save() { put(BUYER, read()) }
  /* an error disappears as soon as the field is touched again */
  form0 = document.getElementById('coform');
  form0.addEventListener('input', e => { const w = e.target.closest('.fld.bad'); if (w) { w.classList.remove('bad'); const m = w.querySelector('.fe'); if (m) m.remove() } });
  form0.addEventListener('change', e => { const w = e.target.closest('.fld.bad'); if (w) { w.classList.remove('bad'); const m = w.querySelector('.fe'); if (m) m.remove() } });

  /* ---------- validation ---------- */
  const phoneOK = p => { let d = p.replace(/\D/g, ''); if (d.startsWith('00359')) d = d.slice(2); if (d.startsWith('359')) d = '0' + d.slice(3); return /^0\d{8,9}$/.test(d) ? d : null };
  function check(d) {
    const bad = [];
    const mark = (k, ok, msg) => { const el = f(k), w = el.closest('.fld'); w.classList.toggle('bad', !ok); let m = w.querySelector('.fe'); if (!ok) { if (!m) { m = document.createElement('em'); m.className = 'fe'; w.appendChild(m) } m.textContent = msg; bad.push(el) } else if (m) m.remove() };
    mark('name', d.name.split(/\s+/).length >= 2, 'Write your first and last name — Econt needs both');
    mark('phone', !!phoneOK(d.phone), 'A Bulgarian phone number, e.g. 0888 123 456');
    mark('email', !d.email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email), 'This email doesn’t look right');
    mark('city', !!d.city, 'Which town should we send it to?');
    if (d.ship === 'office') mark('office', !!d.office, 'Choose the Econt office you’ll collect from');
    else mark('addr', d.addr.length > 5, 'Street, number and flat, please');
    if (bad.length) bad[0].focus();
    return !bad.length;
  }

  /* ---------- order text (also used by the fallback) ---------- */
  function orderText(d, r) {
    return `DRIP INDEX order ${r}\n` + cart.map(i => `• ${i.name}${i.color ? ' / ' + i.color : ''}${i.size ? ' / size ' + i.size : ''} x${i.qty} — ${money(i.price * i.qty)}  (${location.origin}/product/${i.spu})`).join('\n')
      + `\nTotal: ${money(total())} + Econt delivery (pay on delivery)\n\nName: ${d.name}\nPhone: ${d.phone}${d.email ? '\nEmail: ' + d.email : ''}\nDelivery: ${d.ship === 'office' ? 'Econt office — ' + d.city + ', ' + d.office : 'Econt to address — ' + d.city + ', ' + d.addr}${d.note ? '\nNote: ' + d.note : ''}`;
  }

  /* ---------- submit ---------- */
  const form = document.getElementById('coform'), btn = document.getElementById('cosubmit'), err = document.getElementById('coerr');
  form.addEventListener('submit', async e => {
    e.preventDefault(); err.innerHTML = '';
    const d = read(); if (!check(d)) return; save();
    const r = ref(), text = orderText(d, r);
    btn.disabled = true; btn.classList.add('busy'); btn.querySelector('span').textContent = 'Sending…';
    const payload = {
      _subject: `New order ${r} — ${money(total())} — ${d.name}`, _template: 'table', _captcha: 'false',
      Order: r, Name: d.name, Phone: phoneOK(d.phone), email: d.email || '(none)',
      Delivery: d.ship === 'office' ? 'Econt office' : 'Econt to address', Town: d.city,
      [d.ship === 'office' ? 'Office' : 'Address']: d.ship === 'office' ? d.office : d.addr,
      Items: cart.map(i => `${i.qty} x ${i.name}${i.color ? ' / ' + i.color : ''}${i.size ? ' / size ' + i.size : ''} — ${money(i.price * i.qty)} — ${location.origin}/product/${i.spu}`).join('\n'),
      Total: money(total()) + ' + Econt delivery, pay on delivery', Note: d.note || '-'
    };
    if (d.email) payload._autoresponse = `Thanks, ${d.name.split(' ')[0]}! We received your DRIP INDEX order ${r} (${money(total())}). We'll call you on ${d.phone} to confirm it, then send it with Econt — you pay on delivery.`;
    let ok = false;
    try {
      const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), 15000);
      const res = await fetch(ORDER_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(payload), signal: ctl.signal });
      clearTimeout(t);
      const j = await res.json().catch(() => ({}));
      ok = res.ok && String(j.success) === 'true';
    } catch (x) { ok = false }
    btn.disabled = false; btn.classList.remove('busy'); btn.querySelector('span').textContent = 'Place order';
    if (ok) done(d, r); else fallback(d, r, text);
  });

  function done(d, r) {
    const o = get(ORDERS, []); o.unshift({ ref: r, at: Date.now(), total: total(), n: count(), items: cart.map(i => ({ spu: i.spu, name: i.name, size: i.size, qty: i.qty })) }); put(ORDERS, o.slice(0, 20));
    const sum = total(), n = count();
    cart = []; put(CART, []); try { localStorage.removeItem(REF) } catch (e) {} paintBtn();
    document.querySelector('.cogrid').hidden = true;
    document.querySelectorAll('.costeps li').forEach(li => li.classList.add('on'));
    const wa = ORDER_WHATSAPP ? `https://wa.me/${ORDER_WHATSAPP}?text=${encodeURIComponent('Hi! About my DRIP INDEX order ' + r)}` : '';
    const box = document.getElementById('codone'); box.hidden = false;
    box.innerHTML = `<div class="dn"><svg class="tick" viewBox="0 0 52 52" aria-hidden="true"><circle cx="26" cy="26" r="24"/><path d="M15 27l7 7 15-16"/></svg>
      <span class="kick mono">Order received</span><h2>Thank you, ${esc(d.name.split(' ')[0])}.</h2>
      <div class="dref"><span class="mono">Your order number</span><b class="mono">${r}</b><small>${n} ${n === 1 ? 'item' : 'items'} · ${money(sum)} + delivery</small></div>
      <ol class="dsteps"><li class="on"><b>Received</b><span>Just now</span></li><li><b>We call you</b><span>On ${esc(d.phone)} to confirm sizes &amp; details</span></li><li><b>Shipped with Econt</b><span>You get the tracking number by SMS</span></li><li><b>You pay on delivery</b><span>${esc(d.ship === 'office' ? d.office.split(' — ')[0] : d.city)}</span></li></ol>
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

  summary();
})();
