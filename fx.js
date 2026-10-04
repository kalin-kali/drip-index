/* DRIP INDEX — GSAP motion layer, same language as the promo video (snap-in shoes, ghost words,
   slam-in type, count-ups, orange progress bar).
   Rule from the Motion bug (2026-09-22): nothing here may leave content hidden. Every "from" state
   is applied only at the moment its trigger fires, the static layout is complete without this file,
   and with reduced motion or a failed CDN load we simply do nothing. */
(function () {
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* promo video: plays only while on screen (works without GSAP) */
  const v = document.getElementById('promo');
  if (v) {
    if (RM) { v.controls = true }
    else new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { v.preload = 'auto'; v.play().catch(() => { v.controls = true }) } else v.pause()
    }), { threshold: .35 }).observe(v);
  }

  if (RM || !window.gsap || !window.ScrollTrigger) return;
  const g = window.gsap, ST = window.ScrollTrigger;
  g.registerPlugin(ST);
  const SNAP = 'power4.out';
  document.documentElement.classList.add('has-gsap');

  /* fire a from-animation once, when the element first comes into view */
  const onView = (el, fn, start) => ST.create({ trigger: el, start: start || 'top 88%', once: true, onEnter: () => fn(el) });

  /* ---- headings: words rise out of a mask ---- */
  function splitWords(h) {
    if (h.dataset.split) return h.querySelectorAll('.w > i');
    h.dataset.split = 1; h.setAttribute('aria-label', h.textContent.trim());
    const walk = node => [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const f = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(t => {
          if (!t) return;
          if (/^\s+$/.test(t)) { f.appendChild(document.createTextNode(' ')); return }
          const w = document.createElement('span'); w.className = 'w'; w.setAttribute('aria-hidden', 'true');
          const i = document.createElement('i'); i.textContent = t; w.appendChild(i); f.appendChild(w);
        });
        n.replaceWith(f);
      } else if (n.nodeType === 1) walk(n);
    });
    walk(h);
    return h.querySelectorAll('.w > i');
  }
  function heads(root) {
    (root || document).querySelectorAll('.sh h2, .how h2.kin').forEach(h => {
      if (h.dataset.fx) return; h.dataset.fx = 1;
      onView(h, () => g.from(splitWords(h), { yPercent: 110, rotate: 4, duration: .7, ease: SNAP, stagger: .06 }));
    });
  }

  /* ---- numbers count up ---- */
  function counts() {
    document.querySelectorAll('[data-count]').forEach(el => onView(el, () => {
      const end = parseFloat(el.dataset.count), dec = el.dataset.dec ? 1 : 0, o = { v: 0 };
      g.to(o, { v: end, duration: 1.4, ease: 'power3.out', onUpdate: () => { el.textContent = dec ? o.v.toFixed(1) : Math.round(o.v).toLocaleString('en') } });
    }));
    const st = document.getElementById('stats');
    if (st) onView(st, () => g.from(st.children, { y: 26, opacity: 0, duration: .6, ease: SNAP, stagger: .07 }));
  }

  /* ---- kinetic band: loops, speeds up and leans with scroll velocity ---- */
  function band() {
    const t = document.querySelector('.kband .kbt'); if (!t) return;
    const loop = g.to(t, { xPercent: -50, duration: 26, ease: 'none', repeat: -1 });
    const skew = g.quickTo(t, 'skewX', { duration: .4, ease: 'power3' });
    let back;
    ST.create({ trigger: '.kband', start: 'top bottom', end: 'bottom top', onUpdate: s => {
      const vel = s.getVelocity();
      loop.timeScale(1 + Math.min(4, Math.abs(vel) / 400) * (vel < 0 ? -1 : 1));
      skew(g.utils.clamp(-12, 12, -vel / 120));
      clearTimeout(back); back = setTimeout(() => { g.to(loop, { timeScale: 1, duration: .8 }); skew(0) }, 140);
    } });
  }

  /* ---- most wanted: pinned scroll scene, one sneaker snaps in after another ---- */
  function wanted() {
    const sec = document.getElementById('wanted'), shoes = sec ? [...sec.querySelectorAll('.wshoe')] : [];
    if (shoes.length < 2) return;
    sec.classList.add('pinned');
    const idx = document.getElementById('widx'), bar = document.getElementById('wbar'), n = shoes.length;
    g.set(shoes.slice(1), { autoAlpha: 0 });  /* the first one is already there when the section arrives */
    const tl = g.timeline({ defaults: { ease: SNAP }, scrollTrigger: {
      trigger: sec, start: 'top top', end: '+=' + n * 75 + '%', pin: sec.querySelector('.wpin'), scrub: .6,
      onUpdate: s => { const i = Math.min(n - 1, Math.floor(s.progress * n)); idx.textContent = '0' + (i + 1); shoes.forEach((x, j) => x.tabIndex = j === i ? 0 : -1) }
    } });
    shoes.forEach((s, i) => {
      const t = i;
      if (!i) { tl.to(s.querySelector('img'), { rotate: -3, duration: .8, ease: 'none' }, 0).to(s, { xPercent: -110, autoAlpha: 0, duration: .25, ease: 'power3.in' }, .8); return }
      tl.set(s, { autoAlpha: 1 }, t)
        .fromTo(s.querySelector('img'), { xPercent: 120, rotate: -22, scale: .75 }, { xPercent: 0, rotate: -8, scale: 1, duration: .45 }, t)
        .fromTo(s.querySelector('.ghost'), { autoAlpha: 0, scale: 1.3 }, { autoAlpha: 1, scale: 1, duration: .5 }, t)
        .fromTo(s.querySelectorAll('.wname,.wmeta,.wgo'), { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: .35, stagger: .06 }, t + .1)
        .to(s.querySelector('img'), { rotate: -3, duration: .45, ease: 'none' }, t + .45);
      if (i < n - 1) tl.to(s, { xPercent: -110, autoAlpha: 0, duration: .25, ease: 'power3.in' }, t + .8);
    });
    tl.fromTo(bar, { scaleX: 0 }, { scaleX: 1, ease: 'none', duration: n }, 0);
  }

  /* ---- hero: the product follows the cursor a little ---- */
  function heroTilt() {
    const h = document.getElementById('hero'); if (!h || matchMedia('(hover: none)').matches) return;
    h.addEventListener('pointermove', e => {
      const r = h.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      const img = h.querySelector('.slide.on .pic img'); if (!img) return;
      g.to(img, { x: x * 30, y: y * 18, rotate: x * 4, duration: .6, ease: 'power3.out', overwrite: 'auto' });
    });
    h.addEventListener('pointerleave', () => g.to(h.querySelectorAll('.slide .pic img'), { x: 0, y: 0, rotate: 0, duration: .8, ease: 'power3.out' }));
  }

  /* ---- how-to-order: phone drifts and leans as you scroll past ---- */
  function how() {
    const ph = document.querySelector('.how .phone'); if (!ph) return;
    g.fromTo(ph, { rotate: -7, y: 60 }, { rotate: 3, y: -40, ease: 'none', scrollTrigger: { trigger: '.how', start: 'top bottom', end: 'bottom top', scrub: .5 } });
    const steps = document.querySelectorAll('.how .steps li');
    if (steps.length) onView(steps[0].parentNode, () => g.from(steps, { x: -40, opacity: 0, duration: .55, ease: SNAP, stagger: .1 }));
  }

  /* ---- size picker: headline slams in from both sides, sizes cascade ---- */
  window.fxModal = m => {
    const sp = m.querySelectorAll('h2 span');
    g.fromTo(sp[0], { x: -260, opacity: 0 }, { x: 0, opacity: 1, duration: .45, ease: SNAP, delay: .05 });
    g.fromTo(sp[1], { x: 260, opacity: 0 }, { x: 0, opacity: 1, duration: .45, ease: SNAP, delay: .15 });
    g.fromTo(sp[2], { scale: 1.6, opacity: 0 }, { scale: 1, opacity: 1, duration: .5, ease: 'back.out(2)', delay: .3 });
    g.fromTo(m.querySelectorAll('.szpg:not([hidden]) .szp'), { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: .35, ease: SNAP, stagger: .012, delay: .35 });
  };

  /* ---- catalogue: result count rolls to the new number, first cards snap in ---- */
  let last = null;
  window.fxGrid = grid => {
    const b = document.querySelector('#srow b'); if (!b) return;
    const to = parseInt(b.textContent.replace(/\D/g, ''), 10) || 0;
    if (last != null && last !== to) { const o = { v: last }; g.to(o, { v: to, duration: .5, ease: 'power2.out', onUpdate: () => { b.textContent = Math.round(o.v).toLocaleString('en') } }) }
    if (last != null) g.from([...grid.children].slice(0, 12), { y: 22, opacity: 0, duration: .4, ease: SNAP, stagger: .025, clearProps: 'transform,opacity' });
    last = to;
  };

  /* app.js builds sections after data.json arrives — wait for it */
  const ready = () => document.querySelector('#wstage .wshoe');
  const start = () => { heads(); counts(); band(); wanted(); heroTilt(); how(); ST.refresh() };
  if (ready()) start();
  else { let n = 0; const t = setInterval(() => { if (ready() || ++n > 50) { clearInterval(t); start() } }, 100) }
})();
