/* DRIP INDEX — payments (Cloudflare Pages Function, served at /api/pay/*).
   The browser never decides the price: totals are rebuilt here from /shop.json + the Econt tariff,
   then a PayPal order is created with the secret key that only this server knows.
   PayPal's checkout covers both PayPal accounts and plain debit/credit cards (guest checkout).

   Set in Cloudflare → Pages → drip-index → Settings → Variables and secrets:
     PAYPAL_CLIENT_ID   (plain text)   developer.paypal.com → Apps & Credentials
     PAYPAL_SECRET      (secret)
     PAYPAL_ENV         "live" or "sandbox" (default sandbox = test cards, no real money)

   Routes:
     GET  /api/pay/config                         -> { clientId, env }   (503 until the keys are set)
     POST /api/pay/quote   {items, ship}           -> { items, subtotal, shipping, total, kg }
     POST /api/pay/order   {items, ship, ref, buyer} -> { id, total }  PayPal order id
     POST /api/pay/capture {id}                    -> { status, captureId, amount, payer } */

/* Econt tariff, EUR, parcel paid by sender (Econt's own calculator, 2026-10-05). [max kg, office, address] */
const ECONT = [[1, 3.44, 4.55], [2, 3.78, 5.62], [5, 4.13, 7.14], [10, 6.59, 10.61], [15, 7.41, 14.29],
  [20, 9.07, 16.66], [30, 12.67, 21.06], [40, 16.27, 25.46], [50, 19.87, 29.86]];
const FREE_SHIPPING_OVER = null; // e.g. 150 -> free delivery for orders of €150+
const PACKING_KG = 0.3;

export function shippingFor(kg, method, subtotal) {
  if (FREE_SHIPPING_OVER != null && subtotal >= FREE_SHIPPING_OVER) return 0;
  const col = method === 'address' ? 2 : 1;
  const row = ECONT.find(r => kg <= r[0]);
  if (row) return row[col];
  const last = ECONT[ECONT.length - 1], extra = Math.ceil((kg - 50) / 10);
  return +(last[col] + extra * (col === 2 ? 4.4 : 3.6)).toFixed(2);
}

const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
const r2 = n => Math.round(n * 100) / 100;

async function priceList(ctx) {
  const res = await ctx.env.ASSETS.fetch(new URL('/shop.json', ctx.request.url));
  if (!res.ok) throw new Error('price list missing');
  return res.json();
}

/* rebuild the bag from our own prices; unknown pieces are rejected, prices sent by the browser are ignored */
export function quote(list, items, method) {
  if (!Array.isArray(items) || !items.length || items.length > 30) throw new Error('empty bag');
  let subtotal = 0, kg = PACKING_KG;
  const lines = items.map(i => {
    const p = list[String(i.spu)];
    if (!p) throw new Error('This piece is no longer available: ' + String(i.name || i.spu).slice(0, 60));
    const qty = Math.max(1, Math.min(9, parseInt(i.qty, 10) || 1));
    const size = String(i.size || '');
    const unit = p[1] && size && p[1][size] != null ? p[1][size] : p[0];
    subtotal += unit * qty; kg += p[2] * qty;
    return { spu: String(i.spu), name: String(i.name || '').slice(0, 120), size: size.slice(0, 20), color: String(i.color || '').slice(0, 40), qty, unit };
  });
  subtotal = r2(subtotal);
  const shipping = shippingFor(kg, method, subtotal);
  return { items: lines, subtotal, shipping, total: r2(subtotal + shipping), kg: r2(kg), free: FREE_SHIPPING_OVER };
}

async function paypal(env, path, body) {
  const base = env.PAYPAL_ENV === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';
  const tok = await fetch(base + '/v1/oauth2/token', {
    method: 'POST', body: 'grant_type=client_credentials',
    headers: { authorization: 'Basic ' + btoa(env.PAYPAL_CLIENT_ID + ':' + env.PAYPAL_SECRET), 'content-type': 'application/x-www-form-urlencoded' }
  }).then(r => r.json());
  if (!tok.access_token) throw new Error('PayPal auth failed — check PAYPAL_CLIENT_ID / PAYPAL_SECRET / PAYPAL_ENV');
  const res = await fetch(base + path, {
    method: 'POST', body: body ? JSON.stringify(body) : undefined,
    headers: { authorization: 'Bearer ' + tok.access_token, 'content-type': 'application/json', prefer: 'return=representation' }
  });
  const out = await res.json();
  if (!res.ok) throw new Error((out.details && out.details[0] && out.details[0].description) || out.message || 'PayPal error');
  return out;
}

export async function onRequest(ctx) {
  const { request, env, params } = ctx;
  const route = [].concat(params.path || []).join('/');
  const ready = !!(env.PAYPAL_CLIENT_ID && env.PAYPAL_SECRET);
  try {
    if (route === 'config') return ready ? json({ clientId: env.PAYPAL_CLIENT_ID, env: env.PAYPAL_ENV === 'live' ? 'live' : 'sandbox' }) : json({ error: 'payments not configured' }, 503);
    if (request.method !== 'POST') return json({ error: 'method not allowed' }, 405);
    const body = await request.json().catch(() => ({}));
    if (route === 'quote') return json(quote(await priceList(ctx), body.items, body.ship));
    if (!ready) return json({ error: 'payments not configured' }, 503);
    if (route === 'order') {
      const q = quote(await priceList(ctx), body.items, body.ship);
      const ref = String(body.ref || '').replace(/[^A-Z0-9-]/gi, '').slice(0, 30) || 'DRIP';
      const b = body.buyer || {};
      const order = await paypal(env, '/v2/checkout/orders', {
        intent: 'CAPTURE',
        purchase_units: [{
          reference_id: ref, invoice_id: ref + '-' + Date.now().toString(36).toUpperCase(),
          custom_id: [b.name, b.phone].filter(Boolean).join(' / ').slice(0, 127) || undefined,
          description: ('DRIP INDEX order ' + ref).slice(0, 127),
          amount: { currency_code: 'EUR', value: q.total.toFixed(2), breakdown: {
            item_total: { currency_code: 'EUR', value: q.subtotal.toFixed(2) }, shipping: { currency_code: 'EUR', value: q.shipping.toFixed(2) } } },
          items: q.items.map(i => ({
            name: (i.name || i.spu).slice(0, 127), sku: (i.spu + (i.size ? '-' + i.size : '')).slice(0, 127),
            description: [i.color && 'Colour ' + i.color, i.size && 'Size ' + i.size].filter(Boolean).join(' · ').slice(0, 127) || undefined,
            quantity: String(i.qty), unit_amount: { currency_code: 'EUR', value: i.unit.toFixed(2) }, category: 'PHYSICAL_GOODS'
          }))
        }],
        /* the Econt office/address is collected on our page, so PayPal doesn't ask for a shipping address */
        /* application_context (not payment_source) so the same order works for the PayPal and the card button */
        application_context: { shipping_preference: 'NO_SHIPPING', brand_name: 'DRIP INDEX', user_action: 'PAY_NOW' }
      });
      return json({ id: order.id, total: q.total });
    }
    if (route === 'capture') {
      const id = String(body.id || '').replace(/[^A-Z0-9]/gi, '');
      const c = await paypal(env, '/v2/checkout/orders/' + id + '/capture');
      const pu = c.purchase_units && c.purchase_units[0], cap = pu && pu.payments && pu.payments.captures && pu.payments.captures[0];
      return json({ status: c.status, captureId: cap && cap.id, amount: cap && cap.amount, payer: c.payer && c.payer.email_address });
    }
    return json({ error: 'not found' }, 404);
  } catch (e) {
    return json({ error: String(e.message || e) }, 400);
  }
}
