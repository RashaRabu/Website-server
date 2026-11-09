/* MawiSMP store: products, cart, username sheet, WhatsApp checkout */

/* ========== EDIT ME ========== */
const WA_NUMBER = '628892910155';   // admin WhatsApp: country code, no "+" and no leading 0
const KEY_TYPES = ['Primus', 'Nemesis'];
const SHARD_COLOR = '#A303F9';
const KEY_COLOR = '#FF3B3B';

// n name, i symbol, c color, p price (IDR), d discount % (0 = none), f benefits
const RANKS = [
  { n: 'Crocs', i: '🐊', c: '#B8FF00', p: 10000,  d: 0,  f: [['Auction limit', 6], ['Home limit', 4], ['Order limit', 6], ['Kit', 'Crocs']] },
  { n: 'Nike',  i: '⚡', c: '#FFE600', p: 40000,  d: 10, f: [['Auction limit', 12], ['Home limit', 6], ['Order limit', 12], ['Access to', '/ec'], ['Kit', 'Nike']] },
  { n: 'Dior',  i: '💎', c: '#FF5EAA', p: 70000,  d: 0,  f: [['Auction limit', 18], ['Home limit', 8], ['Order limit', 18], ['Kit', 'Dior']] },
  { n: 'Rolex', i: '⚜', c: '#00FF95', p: 100000,  d: 0,  f: [['Auction limit', 24], ['Home limit', 14], ['Order limit', 24], ['Auction', 'FastBuy'], ['Receive', 'Shards while playing'], ['Kit', 'Rolex']] },
  { n: 'Gucci', i: '✨', c: '#FF6B00', p: 150000, d: 0,  f: [['Auction limit', 30], ['Home limit', 20], ['Order limit', 30], ['Auction', 'FastSell'], ['RTP', 'bypass'], ['Kit', 'Gucci']] },
  { n: 'Mawi',  i: '🔱', c: '#00D9FF', p: 200000, d: 0,  f: [['Auction limit', 40], ['Home limit', 25], ['Order limit', 40], ['Access to', 'all kits']] },
];
// n shards, from = amount before bonus, b = bonus %
const SHARDS = [
  { n: 400,   p: 15000 },
  { n: 2500,  p: 75000 },
  { n: 5500,  from: 5000,  b: 10, p: 150000 },
  { n: 12000, from: 10000, b: 20, p: 300000 },
];
// q = keys in the pack (same price for Primus and Nemesis)
const KEYS = [{ q: 2, p: 10000 }, { q: 4, p: 15000 }, { q: 10, p: 30000 }, { q: 30, p: 80000 }];
/* ============================== */

const $ = s => document.querySelector(s);
const rp = n => 'Rp' + n.toLocaleString('id-ID');
const num = n => n.toLocaleString('en-US');
const esc = s => String(s).replace(/[&<>"']/g, c => '&#' + c.charCodeAt(0) + ';');
const final = (p, d) => Math.round(p * (100 - (d || 0)) / 100);
const db = {
  get: (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

let cart = db.get('mawi_cart', []);
let user = db.get('mawi_user', null);   // { name, edition }
let pack = null;                        // key pack waiting for a key type
const total = () => cart.reduce((s, c) => s + c.price, 0);

const ov = Object.assign(document.createElement('div'), { className: 'ov', hidden: true });
const fab = Object.assign(document.createElement('button'), { className: 'cart', hidden: true });
document.body.append(ov, fab);
const vv = window.visualViewport;   // keep the sheet above the on-screen keyboard
if (vv) {
  const fit = () => { const kb = Math.max(0, innerHeight - vv.height - vv.offsetTop); ov.style.paddingBottom = kb ? kb + 12 + 'px' : ''; };
  vv.addEventListener('resize', fit);
  vv.addEventListener('scroll', fit);
}

/* ---------- listing ---------- */
const buy = (id, label) => `<button class="buy" data-buy="${id}">${label}</button>`;
const tint = c => `--c:${c};--t:${c}1a;--b:${c}59`;
const fill = (id, html) => { const el = $(`#${id} .grid`); if (el) el.innerHTML = html; };
const pic = src => `<span class="pic sk"><img src="${src}" alt="" onload="this.parentNode.classList.remove('sk')" onerror="this.parentNode.remove()"></span>`;
const SK_RANK = `<article class="card"><span class="sk l1"></span>${'<span class="sk l"></span>'.repeat(3)}<span class="sk b"></span></article>`;
const SK_ITEM = `<article class="card item"><span class="pic sk"></span><span class="sk l1"></span><span class="sk b"></span></article>`;

function render() {
  fill('ranks', RANKS.map((r, i) => {
    const prev = RANKS[i - 1];
    const label = r.d ? `<s>${rp(r.p)}</s>${rp(final(r.p, r.d))}` : rp(r.p);
    return `<article class="card" style="${tint(r.c)}">
      ${r.d ? `<span class="bonus">-${r.d}%</span>` : ''}
      <h4><i>[</i><span>${r.i}</span> <b>${r.n}</b><i>]</i></h4>
      <ul class="rows">${prev ? `<li>All benefits of<b style="color:${prev.c}">${prev.n}</b></li>` : ''}${r.f.map(([k, v]) => `<li>${k}<b>${v}</b></li>`).join('')}</ul>
      ${buy('rank-' + r.n.toLowerCase(), label)}
    </article>`;
  }).join(''));
  fill('shard', SHARDS.map(s => `<article class="card item" style="${tint(SHARD_COLOR)}">
    ${s.b ? `<span class="bonus">+${s.b}%</span>` : ''}${pic(`../Galery/shard${s.n}.png`)}
    <h5>${s.from ? `<s>${num(s.from)}</s>` : ''}${num(s.n)} Shards</h5>${buy('shard-' + s.n, rp(s.p))}</article>`).join(''));
  fill('keys', KEYS.map(k => `<article class="card item" style="${tint(KEY_COLOR)}">
    ${pic(`../Galery/key${k.q}.png`)}<h5>${k.q} Keys</h5>${buy('key-' + k.q, rp(k.p))}</article>`).join(''));
}

// skeleton first, real cards once the page has loaded (min 450 ms so it never flashes)
fill('ranks', SK_RANK.repeat(3));
fill('shard', SK_ITEM.repeat(2));
fill('keys', SK_ITEM.repeat(2));
const wait = ms => new Promise(r => setTimeout(r, ms));
const loaded = new Promise(r => (document.readyState === 'complete' ? r() : addEventListener('load', r)));
Promise.all([Promise.race([loaded, wait(1500)]), wait(450)]).then(render);

/* ---------- sheets ---------- */
const show = html => {
  ov.innerHTML = `<div class="sheet" role="dialog" aria-modal="true">${html}</div>`;
  ov.hidden = false;
  document.body.style.overflow = 'hidden';
};
const hide = () => { ov.hidden = true; ov.innerHTML = ''; document.body.style.overflow = ''; };

function sync() {
  db.set('mawi_cart', cart);
  fab.hidden = !cart.length;
  document.body.classList.toggle('has-cart', !fab.hidden);
  fab.textContent = `Cart (${cart.length}) ${rp(total())}`;
}

function add(it) {
  if (!cart.some(c => c.id === it.id)) cart.push(it);
  sync();
  user ? checkout() : askUser();
}

function keyPopup() {
  show(`<h2>Choose key type</h2>
    <p class="sub">${pack.q} keys, ${rp(pack.p)}</p>
    <div class="kt">${KEY_TYPES.map(t => `<button class="buy" style="${tint(KEY_COLOR)}" data-kt="${t}">${t} Key</button>`).join('')}</div>`);
}

function askUser() {
  let ed = user?.edition || 'java';
  show(`<h2>Enter your Minecraft Username</h2>
    <div class="tabs">${['java', 'bedrock'].map(e => `<button type="button" class="tog${e === ed ? ' on' : ''}" data-ed="${e}">${e.toUpperCase()}</button>`).join('')}</div>
    <form class="fld"><input name="n" placeholder="Enter your username" autocomplete="off" maxlength="16" value="${esc(user?.name || '')}"><button class="btn">Continue ›</button></form>
    <p class="err" role="alert"></p>`);
  const f = ov.querySelector('form');
  ov.querySelectorAll('[data-ed]').forEach(b => b.onclick = () => {
    ed = b.dataset.ed;
    ov.querySelectorAll('[data-ed]').forEach(x => x.classList.toggle('on', x === b));
  });
  f.onsubmit = e => {
    e.preventDefault();
    const name = f.n.value.trim();
    const ok = ed === 'java' ? /^\w{3,16}$/.test(name) : /^[\w ]{3,16}$/.test(name);
    if (!ok) { ov.querySelector('.err').textContent = ed === 'java' ? 'Use 3-16 letters, numbers or _ only.' : 'Use 3-16 letters, numbers, spaces or _ only.'; return; }
    user = { name, edition: ed };
    db.set('mawi_user', user);
    checkout();
  };
  f.n.focus();
}

function checkout() {
  if (!cart.length) return show(`<h2>Your cart is empty</h2><button class="btn full" data-close>Back to store</button>`);
  show(`<div class="co-h"><img src="../Galery/logo.png" alt=""><div><h2>Checkout</h2><p>Total: <b>${rp(total())}</b></p></div></div>
    <div class="me">
      <span class="av sk"><img src="https://mc-heads.net/avatar/${encodeURIComponent(user.name)}/96" alt="" onload="this.parentNode.classList.remove('sk')" onerror="this.parentNode.remove()"></span>
      <div><small>You are currently signed in as</small><strong>${esc(user.name)}</strong></div>
      <button class="lnk" data-switch>Wrong account?<b>Switch account</b></button>
    </div>
    <ul class="cl">
      <li class="th"><span>Name</span><span>Price</span><span></span></li>
      ${cart.map((c, i) => `<li><b>${esc(c.name)}</b><span>${rp(c.price)}</span><button class="x" data-rm="${i}" aria-label="Remove ${esc(c.name)}">×</button></li>`).join('')}
    </ul>
    <button class="btn full" data-go>Proceed to checkout »</button>`);
}

function whatsapp() {
  const nick = user.name + (user.edition === 'bedrock' ? ' (Bedrock)' : '');
  const msg = `Halo bang admin aku mau beli product di server MawiSMP\n\nNickku= ${nick}\nApa yg mau aku beli= ${cart.map(c => c.name).join(', ')}\nTotal = ${rp(total())}\n\nDi tunggu Qris nya ya bang`;
  cart = [];
  sync();
  location.href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
}

/* ---------- events ---------- */
document.addEventListener('click', e => {
  const b = e.target.closest('[data-buy]');
  if (!b) return;
  const [t, v] = b.dataset.buy.split('-');
  if (t === 'key') { pack = KEYS.find(k => k.q === +v); return keyPopup(); }
  if (t === 'rank') { const r = RANKS.find(r => r.n.toLowerCase() === v); return add({ id: b.dataset.buy, name: `${r.n} rank`, price: final(r.p, r.d) }); }
  const s = SHARDS.find(s => s.n === +v);
  add({ id: b.dataset.buy, name: `${num(s.n)} Shards`, price: s.p });
});

ov.addEventListener('click', e => {
  const t = e.target;
  if (t === ov || t.closest('[data-close]')) return hide();
  const kt = t.closest('[data-kt]');
  if (kt) return add({ id: `key-${pack.q}-${kt.dataset.kt}`, name: `${pack.q} ${kt.dataset.kt} Keys`, price: pack.p });
  const rm = t.closest('[data-rm]');
  if (rm) { cart.splice(+rm.dataset.rm, 1); sync(); return checkout(); }
  if (t.closest('[data-switch]')) return askUser();
  if (t.closest('[data-go]')) return whatsapp();
});

// highlight the clicked card's border (stays until another card or empty space is clicked)
document.addEventListener('click', e => {
  const card = e.target.closest('.card');
  document.querySelectorAll('.card.active').forEach(c => c !== card && c.classList.remove('active'));
  if (card && !card.querySelector('.sk')) card.classList.add('active');
});

fab.onclick = () => (user ? checkout() : askUser());
document.addEventListener('keydown', e => { if (e.key === 'Escape') hide(); });
sync();
