/* app.js – UI logic. All user text is inserted with textContent (via h()), never innerHTML. */
const CATS = ['Electronics', 'Books and Study Materials', 'Furniture', 'Clothing and Accessories', 'Home Essentials', 'Sports Equipment', 'Other'];
const RCATS = ['Electronics', 'Mobile Phones', 'Computers and Laptops', 'Furniture', 'Clothing and Bags', 'Bicycles', 'Home Appliances', 'Other'];
const CONDS = ['New', 'Like New', 'Good', 'Fair', 'Needs Repair'];
const $ = s => document.querySelector(s);
let db = Store.load();

function h(tag, attrs, ...kids) {
  const e = document.createElement(tag);
  for (const [n, v] of Object.entries(attrs || {})) {
    if (n === 'class') e.className = v; else if (n === 'text') e.textContent = v;
    else if (n.startsWith('on')) e.addEventListener(n.slice(2), v);
    else if (v !== false && v != null) e.setAttribute(n, v === true ? '' : v);
  }
  kids.flat().forEach(c => { if (c != null && c !== false) e.append(c); });
  return e;
}
const commit = () => { if (!Store.save(db)) toast('Could not save – browser storage is blocked or full.', 'err'); };
function toast(msg, kind) {
  const t = h('div', { class: 'toast ' + (kind || ''), text: msg }); $('#toasts').append(t);
  setTimeout(() => t.remove(), 3500);
}
const EMO = { sell: '🛍️', free: '🎁', exchange: '🔄', service: '🔧', repairreq: '🧰' };
function ph(it) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="#e3efe5"/><text x="200" y="175" font-size="90" text-anchor="middle">${EMO[it.type] || '♻️'}</text></svg>`;
  return 'data:image/svg+xml,' + encodeURIComponent(svg);
}
function img(it) {
  return h('img', { src: it.image || ph(it), alt: it.title, loading: 'lazy', onerror: e => { if (e.target.dataset.f) return; e.target.dataset.f = 1; e.target.src = ph(it); } });
}
const priceOf = it => it.type === 'free' ? 'Free' : it.type === 'exchange' ? 'Wants: ' + it.want : it.type === 'repairreq' ? 'Repair needed' : typeof it.price === 'number' ? '₹' + it.price : it.price;
const find = id => db.items.find(i => i.id === id);

function badges(it) {
  return h('div', { class: 'badges' }, it.demo && h('span', { class: 'b demo' }, 'DEMO DATA'), it.type === 'free' && h('span', { class: 'b free' }, 'FREE'),
    it.type === 'exchange' && h('span', { class: 'b ex' }, 'EXCHANGE'), it.status && !['available', 'open'].includes(it.status) && h('span', { class: 'b st' }, it.status.toUpperCase()));
}
function card(it) {
  return h('article', { class: 'card' }, h('div', { class: 'imgw' }, img(it), badges(it)),
    h('div', { class: 'cb' }, h('h3', { text: it.title }), h('p', { class: 'meta', text: [it.category, it.condition].filter(Boolean).join(' · ') }),
      h('p', { class: 'price', text: priceOf(it) }), h('p', { class: 'meta', text: '📍 ' + it.location }),
      h('button', { class: 'btn sm', onclick: () => detail(it.id) }, 'View details')));
}

/* ---------- dialog ---------- */
const dlg = $('#dlg');
dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
function openDlg(...nodes) {
  $('#dbody').replaceChildren(h('button', { class: 'x', 'aria-label': 'Close', onclick: () => dlg.close() }, '✕'), ...nodes);
  if (!dlg.open) dlg.showModal();
}

/* ---------- item details ---------- */
function detail(id) {
  const it = find(id); if (!it) return;
  const own = !it.demo, acts = h('div', { class: 'row' });
  const set = (st, msg) => () => { it.status = st; commit(); dlg.close(); toast(msg); render(); };
  if (it.type === 'sell' && own) acts.append(it.status === 'sold' ? h('button', { class: 'btn', onclick: set('available', 'Marked available again.') }, 'Mark available') : h('button', { class: 'btn', onclick: set('sold', 'Marked as sold.') }, 'Mark as sold'));
  if (it.type === 'free') {
    if (it.status === 'available') acts.append(h('button', { class: 'btn', onclick: set('reserved', 'Item reserved for you.') }, 'Request / Reserve'));
    if (it.status === 'reserved') acts.append(h('button', { class: 'btn', onclick: set('collected', 'Marked as collected.') }, 'Mark collected'), h('button', { class: 'btn ghost', onclick: set('available', 'Reservation cancelled.') }, 'Cancel reservation'));
  }
  if (it.type === 'exchange' && it.status === 'available') acts.append(h('button', { class: 'btn', onclick: () => exchangeForm(it) }, 'Propose an exchange'));
  if (it.type === 'repairreq' && own) acts.append(it.status === 'open' ? h('button', { class: 'btn', onclick: set('repaired', 'Marked as repaired.') }, 'Mark repaired') : h('button', { class: 'btn ghost', onclick: set('open', 'Reopened.') }, 'Reopen'));
  if (own) acts.append(h('button', { class: 'btn ghost', onclick: () => openForm(it.type, it) }, 'Edit'), h('button', { class: 'btn danger', onclick: () => del(it) }, 'Delete'));
  const contact = h('p', { class: 'meta', text: 'Contact is hidden until you choose to show it.' });
  const show = h('button', { class: 'btn sm ghost', onclick: e => { contact.textContent = 'Contact: ' + it.contact; e.target.remove(); } }, 'Show contact');
  openDlg(h('div', { class: 'imgw big' }, img(it), badges(it)), h('h2', { text: it.title }), h('p', { class: 'price', text: priceOf(it) }),
    h('p', { class: 'meta', text: [it.category, it.condition && 'Condition: ' + it.condition, '📍 ' + it.location].filter(Boolean).join(' · ') }),
    h('p', { text: it.description }), it.type === 'exchange' && h('p', { class: 'note', text: 'Offering: ' + it.title + '  ⇄  Wants: ' + it.want }),
    contact, show, it.demo && h('p', { class: 'note', text: 'Demo listing – sample data only, not a real person or business.' }), acts);
}
function del(it) {
  if (!confirm('Delete "' + it.title + '"? This cannot be undone.')) return;
  db.items = db.items.filter(i => i.id !== it.id); db.requests = db.requests.filter(r => r.targetId !== it.id);
  commit(); dlg.close(); toast('Listing deleted.'); render();
}

/* ---------- forms ---------- */
const TITLES = { sell: 'List an item for sale', free: 'Give an item for free', exchange: 'Post an item to exchange', repairreq: 'Request repair assistance' };
function fld(label, input) { return h('div', { class: 'f' }, h('label', { for: input.id }, label), input); }
const inp = (id, v, a) => h('input', { id, value: v == null ? '' : v, ...a });
const sel = (id, opts, v) => h('select', { id }, opts.map(o => h('option', { value: o, selected: o === v }, o)));
function openForm(type, it) {
  const isR = type === 'repairreq', e = it || {};
  const err = h('div', { class: 'err', role: 'alert' });
  const f = h('form', { novalidate: true },
    h('h2', { text: it ? 'Edit listing' : TITLES[type] }), err,
    fld(isR ? 'What needs repair? *' : 'Item title *', inp('f-title', e.title, { maxlength: 80 })),
    fld(isR ? 'Preferred repair category *' : 'Category *', sel('f-cat', isR ? RCATS : CATS, e.category)),
    fld(isR ? 'Describe the issue *' : 'Description *', h('textarea', { id: 'f-desc', rows: 3, maxlength: 600 }, e.description || '')),
    type === 'sell' && fld('Price (₹) *', inp('f-price', e.price, { type: 'number', min: 0, step: 1 })),
    type === 'exchange' && fld('What would you like in return? *', inp('f-want', e.want, { maxlength: 80 })),
    !isR && fld('Condition *', sel('f-cond', CONDS, e.condition || 'Good')),
    fld('Location *', inp('f-loc', e.location, { maxlength: 60 })),
    fld('Contact (email or phone) *', inp('f-contact', e.contact, { maxlength: 80 })),
    fld('Image URL (optional)', inp('f-url', e.image && e.image.startsWith('http') ? e.image : '', { type: 'url', placeholder: 'https://…' })),
    fld('…or upload an image (JPG/PNG/WebP/GIF, max 500 KB)', inp('f-file', '', { type: 'file', accept: 'image/jpeg,image/png,image/webp,image/gif' })),
    h('p', { class: 'note', text: 'Local demo: this is saved only in this browser. Your contact is hidden until someone clicks "Show contact".' }),
    h('button', { class: 'btn', type: 'submit' }, it ? 'Save changes' : 'Submit'));
  f.addEventListener('submit', async ev => {
    ev.preventDefault();
    const v = id => (f.querySelector('#' + id) || {}).value, errs = [];
    const title = (v('f-title') || '').trim(), desc = (v('f-desc') || '').trim(), loc = (v('f-loc') || '').trim(), contact = (v('f-contact') || '').trim();
    if (title.length < 3) errs.push('Title needs at least 3 characters.');
    if (desc.length < 10) errs.push('Description needs at least 10 characters.');
    if (!loc) errs.push('Location is required.');
    if (!contact) errs.push('Contact information is required.');
    if (type === 'sell' && (v('f-price') === '' || Number(v('f-price')) < 0)) errs.push('Enter a valid price (0 or more).');
    if (type === 'exchange' && !(v('f-want') || '').trim()) errs.push('Say what you would like in return.');
    const url = (v('f-url') || '').trim(); if (url && !/^https?:\/\//i.test(url)) errs.push('Image URL must start with http:// or https://.');
    const file = f.querySelector('#f-file').files[0]; let data = '';
    if (file) {
      if (!/^image\/(jpeg|png|webp|gif)$/.test(file.type)) errs.push('Image must be JPG, PNG, WebP or GIF.');
      else if (file.size > 500 * 1024) errs.push('Image is larger than 500 KB.');
      else data = await new Promise(r => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.onerror = () => r(''); fr.readAsDataURL(file); });
    }
    if (errs.length) { err.replaceChildren(...errs.map(m => h('div', { text: '• ' + m }))); err.scrollIntoView({ block: 'nearest' }); return; }
    const rec = it || { id: 'u' + Date.now().toString(36), type, demo: false, created: Date.now(), status: isR ? 'open' : 'available', price: 0 };
    Object.assign(rec, { title, category: v('f-cat'), description: desc, location: loc, contact, condition: isR ? '' : v('f-cond') });
    if (type === 'sell') rec.price = Number(v('f-price'));
    if (type === 'exchange') rec.want = v('f-want').trim();
    if (data || url) rec.image = data || url;
    if (!it) db.items.unshift(rec);
    commit(); dlg.close(); toast(it ? 'Listing updated.' : 'Posted successfully!'); render();
  });
  openDlg(f);
}
function exchangeForm(target) {
  const own = db.items.filter(i => !i.demo && i.type === 'exchange' && i.status === 'available');
  const err = h('div', { class: 'err', role: 'alert' });
  const f = h('form', { novalidate: true }, h('h2', { text: 'Propose an exchange' }), h('p', { class: 'note', text: 'You want: ' + target.title + ' (they want: ' + target.want + ')' }), err,
    fld('Your offer *', inp('x-offer', own[0] ? own[0].title : '', { maxlength: 80, list: 'x-list' })),
    h('datalist', { id: 'x-list' }, own.map(o => h('option', { value: o.title }))),
    fld('Message', h('textarea', { id: 'x-msg', rows: 2, maxlength: 300 })),
    h('p', { class: 'note', text: 'Demo only: requests are stored in this browser. Cross-device requests need a shared backend.' }),
    h('button', { class: 'btn', type: 'submit' }, 'Send request'));
  f.addEventListener('submit', ev => {
    ev.preventDefault(); const offer = f.querySelector('#x-offer').value.trim();
    if (!offer) { err.textContent = 'Please say what you are offering.'; return; }
    db.requests.push({ id: 'r' + Date.now().toString(36), targetId: target.id, targetTitle: target.title, offer, message: f.querySelector('#x-msg').value.trim(), status: 'Pending', incoming: false, created: Date.now() });
    commit(); dlg.close(); toast('Exchange request sent (local demo).'); render();
  });
  openDlg(f);
}

/* ---------- listing pages ---------- */
function listing(title, sub, groups, o) {
  const st = { q: '', cat: '', cond: '', price: '', sort: 'new' }, host = h('div');
  const bar = h('div', { class: 'filters' },
    h('input', { type: 'search', 'aria-label': 'Search', placeholder: o.ph || 'Search…', oninput: e => { st.q = e.target.value.toLowerCase(); draw(); } }),
    h('select', { 'aria-label': 'Category', onchange: e => { st.cat = e.target.value; draw(); } }, h('option', { value: '' }, 'All categories'), o.cats.map(c => h('option', { value: c }, c))),
    o.cond && h('select', { 'aria-label': 'Condition', onchange: e => { st.cond = e.target.value; draw(); } }, h('option', { value: '' }, 'Any condition'), CONDS.map(c => h('option', { value: c }, c))),
    o.price && h('select', { 'aria-label': 'Price range', onchange: e => { st.price = e.target.value; draw(); } }, h('option', { value: '' }, 'Any price'), h('option', { value: '0-500' }, 'Under ₹500'), h('option', { value: '500-2000' }, '₹500 – ₹2000'), h('option', { value: '2000-1e9' }, 'Over ₹2000')),
    o.price && h('select', { 'aria-label': 'Sort', onchange: e => { st.sort = e.target.value; draw(); } }, h('option', { value: 'new' }, 'Newest first'), h('option', { value: 'lo' }, 'Price: low to high'), h('option', { value: 'hi' }, 'Price: high to low')));
  function draw() {
    host.replaceChildren();
    groups.forEach(g => {
      let list = db.items.filter(i => i.type === g.type && (!st.cat || i.category === st.cat) && (!st.cond || i.condition === st.cond) &&
        (!st.q || [i.title, i.description, i.location, i.want].join(' ').toLowerCase().includes(st.q)));
      if (st.price) { const [a, b] = st.price.split('-').map(Number); list = list.filter(i => i.price >= a && i.price < b); }
      list.sort((x, y) => st.sort === 'lo' ? x.price - y.price : st.sort === 'hi' ? y.price - x.price : y.created - x.created);
      if (g.heading) host.append(h('h2', { class: 'sh', text: g.heading }));
      host.append(list.length ? h('div', { class: 'grid' }, list.map(card)) : h('div', { class: 'empty' }, h('p', { text: g.empty || 'No items match your search or filters.' })));
    });
  }
  draw();
  return h('section', {}, h('div', { class: 'ph' }, h('div', {}, h('h1', { text: title }), h('p', { text: sub })), h('div', { class: 'row' }, o.btns)), bar, host);
}
const postBtn = (t, label) => h('button', { class: 'btn', onclick: () => openForm(t) }, label);

/* ---------- pages ---------- */
function home() {
  const mine = db.items.filter(i => !i.demo && ['sell', 'free', 'exchange'].includes(i.type));
  const stat = (n, l) => h('div', { class: 'stat' }, h('strong', { text: String(n) }), h('span', { text: l }));
  const feat = (e, t, d, href) => h('a', { class: 'fc', href }, h('span', { class: 'ico', 'aria-hidden': 'true' }, e), h('h3', { text: t }), h('p', { text: d }));
  return h('div', {},
    h('section', { class: 'hero' }, h('div', {}, h('h1', { text: 'Give Old Items a Second Life' }), h('p', { text: 'Buy, sell, exchange, repair, or give away useful items. Save money while helping the planet.' }),
      h('div', { class: 'row' }, h('a', { class: 'btn', href: '#explore' }, 'Explore Items'), h('button', { class: 'btn ghost', onclick: () => openForm('sell') }, 'List an Item'))), h('div', { class: 'hbig', 'aria-hidden': 'true' }, '♻️')),
    h('p', { class: 'note c', text: 'Sample listings are marked "DEMO DATA". This is a local demo: data stays in your browser.' }),
    h('div', { class: 'fgrid4' }, feat('🛍️', 'Buy & Sell', 'Find affordable used items or list your own.', '#explore'), feat('🎁', 'Give for Free', 'Pass on things you no longer need.', '#free'),
      feat('🔄', 'Exchange Items', 'Swap what you have for what you need.', '#exchange'), feat('🔧', 'Repair Assistance', 'Repair instead of replacing.', '#repair')),
    h('h2', { class: 'sh', text: 'Featured items' }), h('div', { class: 'grid' }, db.items.filter(i => i.type === 'sell' && i.status === 'available').slice(0, 4).map(card)),
    h('section', { class: 'impact' }, h('h2', { text: 'Small Actions. Big Impact.' }),
      h('p', { text: 'Every item that is reused, exchanged or repaired is one less item thrown away. ReUse Hub encourages waste reduction, product reuse, repair instead of replacement, responsible consumption and resource conservation.' }),
      h('div', { class: 'stats' }, stat(mine.length, 'items you listed'), stat(mine.filter(i => ['sold', 'collected'].includes(i.status)).length, 'items you reused (sold / collected)'),
        stat(db.requests.filter(r => r.status === 'Completed').length, 'exchanges completed'), stat(db.items.filter(i => !i.demo && i.status === 'repaired').length, 'items repaired')),
      h('p', { class: 'note', text: 'These counts come only from activity recorded in this browser (demo data excluded). We do not claim carbon or waste savings.' })),
    h('h2', { class: 'sh', text: 'How it works' }),
    h('ol', { class: 'steps' }, h('li', {}, h('strong', { text: 'Post or browse. ' }), 'List an item to sell, give or exchange – or search what others offer.'), h('li', {}, h('strong', { text: 'Connect. ' }), 'Request an item, reserve it, or propose an exchange.'), h('li', {}, h('strong', { text: 'Reuse or repair. ' }), 'Mark items as sold, collected, exchanged or repaired.')));
}
function repair() {
  return listing('Repair Assistance', 'Fix it instead of throwing it away. Sample services below are demo data, not verified businesses, and no live booking is offered.',
    [{ type: 'service', heading: 'Repair services (sample listings)' }, { type: 'repairreq', heading: 'Repair requests (posted in this browser)', empty: 'No repair requests yet. Post one with the button above.' }],
    { cats: RCATS, ph: 'Search service, issue or location…', btns: [postBtn('repairreq', 'Request Repair Help')] });
}
function activity() {
  const mine = db.items.filter(i => !i.demo), sec = (t, c) => h('section', {}, h('h2', { class: 'sh', text: t }), c);
  const empty = m => h('div', { class: 'empty' }, h('p', { text: m }));
  const L = mine.filter(i => i.type !== 'repairreq'), R = mine.filter(i => i.type === 'repairreq');
  const setReq = (r, s) => () => { r.status = s; if (s === 'Completed') { const t = find(r.targetId); if (t) t.status = 'exchanged'; } commit(); toast('Request ' + s.toLowerCase() + '.'); render(); };
  const reqRow = r => h('div', { class: 'req' }, h('div', {}, h('strong', { text: r.incoming ? 'Incoming: ' + r.offer : r.offer + ' → ' + r.targetTitle }), h('p', { class: 'meta', text: (r.incoming ? 'For your listing "' + r.targetTitle + '"' : 'Outgoing request') + (r.message ? ' · ' + r.message : '') }),
    h('span', { class: 'b st', text: r.status })),
    h('div', { class: 'row' },
      r.status === 'Pending' && r.incoming && [h('button', { class: 'btn sm', onclick: setReq(r, 'Accepted') }, 'Accept'), h('button', { class: 'btn sm ghost', onclick: setReq(r, 'Rejected') }, 'Reject')],
      r.status === 'Pending' && !r.incoming && [h('button', { class: 'btn sm danger', onclick: () => { db.requests = db.requests.filter(x => x !== r); commit(); toast('Request cancelled.'); render(); } }, 'Cancel request'),
        h('button', { class: 'btn sm ghost', title: 'Demo only', onclick: setReq(r, 'Accepted') }, 'Simulate: accepted'), h('button', { class: 'btn sm ghost', title: 'Demo only', onclick: setReq(r, 'Rejected') }, 'Simulate: rejected')],
      r.status === 'Accepted' && h('button', { class: 'btn sm', onclick: setReq(r, 'Completed') }, 'Mark completed')));
  const sim = h('div', { class: 'row' }, mine.filter(i => i.type === 'exchange' && i.status === 'available').map(i => h('button', { class: 'btn sm ghost', onclick: () => { db.requests.push({ id: 'r' + Date.now().toString(36), targetId: i.id, targetTitle: i.title, offer: 'Sample offer from a demo user', message: 'Simulated request', status: 'Pending', incoming: true, created: Date.now() }); commit(); toast('Simulated incoming request added.'); render(); } }, 'Simulate incoming request for "' + i.title + '"')));
  return h('div', {}, h('div', { class: 'ph' }, h('div', {}, h('h1', { text: 'My Activity' }), h('p', { text: 'Local demo: there is no login. Everything here lives only in this browser and is not a secure multi-user system.' }))),
    sec('My listings', L.length ? h('div', { class: 'grid' }, L.map(card)) : empty('You have not posted any listings yet. Use "Sell an Item", "Give for Free" or "Exchange".')),
    sec('My repair requests', R.length ? h('div', { class: 'grid' }, R.map(card)) : empty('No repair requests yet.')),
    sec('Exchange requests', db.requests.length ? h('div', {}, db.requests.map(reqRow), sim) : h('div', {}, empty('No exchange requests yet. Open an exchange listing and click "Propose an exchange".'), sim)),
    sec('Data', h('div', { class: 'row' }, h('button', { class: 'btn ghost', onclick: () => { if (confirm('Reset demo listings to their original state? Your own listings are kept.')) { db = Store.resetDemo(db); commit(); toast('Demo data reset.'); render(); } } }, 'Reset demo data'),
      h('button', { class: 'btn danger', onclick: () => { if (confirm('Delete ALL your data and restore the demo? This cannot be undone.')) { db = Store.clearAll(); commit(); toast('All data cleared.'); render(); } } }, 'Clear all my data'))));
}
const PAGES = {
  home, repair, activity,
  explore: () => listing('Explore Items', 'Browse used items from your community.', [{ type: 'sell' }], { cats: CATS, cond: 1, price: 1, ph: 'Search by name or description…', btns: [postBtn('sell', 'List an Item')] }),
  free: () => listing('Give for Free', 'Giving away is optional – list free items you no longer need.', [{ type: 'free' }], { cats: CATS, cond: 1, ph: 'Search free items…', btns: [postBtn('free', 'Post a Free Item')] }),
  exchange: () => listing('Exchange', 'Swap items. Demo note: requests are stored locally; cross-device requests need a shared backend.', [{ type: 'exchange' }], { cats: CATS, cond: 1, ph: 'Search exchange offers…', btns: [postBtn('exchange', 'Post an Exchange'), h('a', { class: 'btn ghost', href: '#activity' }, 'View my requests')] })
};
function render() {
  let r = location.hash.slice(1) || 'home';
  if (r === 'sell') { history.replaceState(null, '', '#explore'); r = 'explore'; setTimeout(() => openForm('sell'), 0); }
  if (!PAGES[r]) r = 'home';
  $('#main').replaceChildren(PAGES[r]());
  document.querySelectorAll('#nav a').forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + r));
  $('#nav').classList.remove('open'); $('#burger').setAttribute('aria-expanded', 'false');
}
window.addEventListener('hashchange', () => { render(); window.scrollTo(0, 0); });
$('#burger').addEventListener('click', e => { const o = $('#nav').classList.toggle('open'); e.currentTarget.setAttribute('aria-expanded', String(o)); });
render();
