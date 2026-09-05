// Full smoke: DOM stubs + in-memory IndexedDB -> boot app, seed, render all screens.
function makeEl(tag = 'div') {
  const el = {
    tagName: String(tag).toUpperCase(),
    children: [],
    dataset: {},
    style: { setProperty() {}, removeProperty() {} },
    classList: { add() {}, remove() {}, toggle() {}, contains: () => false },
    hidden: false, disabled: false, checked: false, value: '', textContent: '',
    innerHTML: '', outerHTML: '', text: '', title: '', width: 0, height: 0,
    append(...a) { el.children.push(...a); },
    appendChild(c) { el.children.push(c); return c; },
    remove() {}, click() {}, focus() {},
    replaceChildren(...a) { el.children = a; },
    replaceWith() {}, after() {}, before() {},
    setAttribute() {}, getAttribute: () => null, removeAttribute() {},
    toggleAttribute() {}, hasAttribute: () => false,
    addEventListener() {}, removeEventListener() {},
    dispatchEvent() { return true; },
    querySelector: () => makeEl(), querySelectorAll: () => [],
    closest: () => makeEl(), matches: () => false,
    insertAdjacentHTML() {}, getBoundingClientRect: () => ({ top: 0, left: 0, width: 0, height: 0 }),
    scrollIntoView() {}, showModal() {}, close() {},
    getContext: () => new Proxy({}, { get: (t, k) => (k === 'canvas' ? el : k === 'measureText' ? (() => ({ width: 0 })) : (() => {})) }),
    options: [], selectedIndex: 0,
    parentNode: { insertBefore() {}, appendChild() {}, removeChild() {} },
    parentElement: null,
  };
  el.parentElement = el;
  return el;
}

const listeners = {};
globalThis.document = {
  querySelector: () => makeEl(),
  querySelectorAll: () => [],
  getElementById: () => makeEl(),
  createElement: (t) => makeEl(t),
  createElementNS: (ns, t) => makeEl(t),
  addEventListener: (t, fn) => { (listeners[t] ||= []).push(fn); },
  removeEventListener: () => {},
  body: makeEl('body'), head: makeEl('head'), documentElement: makeEl('html'),
  activeElement: null, hidden: false, title: '',
  createTreeWalker: () => ({ nextNode: () => null, currentNode: null }),
  createDocumentFragment: () => makeEl('fragment'),
  createComment: (t) => makeEl('comment'),
  createTextNode: (t) => makeEl('text'),
};
globalThis.window = globalThis;
globalThis.addEventListener = (t, fn) => { (listeners[t] ||= []).push(fn); };
globalThis.removeEventListener = () => {};
globalThis.localStorage = { _s: {}, getItem(k) { return this._s[k] ?? null; }, setItem(k, v) { this._s[k] = String(v); }, removeItem(k) { delete this._s[k]; } };
Object.defineProperty(globalThis, 'navigator', { value: { clipboard: { writeText: async () => {} }, share: undefined, language: 'ru-RU' }, configurable: true });
globalThis.location = { href: 'http://localhost/', hash: '' };
globalThis.requestAnimationFrame = (fn) => setTimeout(fn, 0);
globalThis.matchMedia = () => ({ matches: false, addEventListener: () => {} });
globalThis.CSS = { escape: (s) => String(s).replace(/["\\]/g, '\\$&') };
globalThis.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
globalThis.IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} };
globalThis.getComputedStyle = () => ({ getPropertyValue: () => '' });
globalThis.NodeFilter = { SHOW_TEXT: 4, FILTER_ACCEPT: 1, FILTER_REJECT: 2, FILTER_SKIP: 3 };
globalThis.innerWidth = 1280; globalThis.innerHeight = 800; globalThis.devicePixelRatio = 1;
globalThis.history = { replaceState() {}, pushState() {}, back() {} };
globalThis.HTMLElement = class {};
globalThis.URL = URL;

// ---- in-memory IndexedDB ----
const _stores = {};
const _schema = {};
function doneReq(tx, req, result) {
  tx._pend++;
  queueMicrotask(() => {
    req.result = result;
    try { req.onsuccess?.({ target: req }); }
    finally { if (--tx._pend === 0) queueMicrotask(() => tx.oncomplete?.()); }
  });
}
function fieldOf(keyPath) { return (rec) => String(keyPath).split('.').reduce((o, p) => o?.[p], rec); }
function applyQuery(rows, val, q) {
  if (q === undefined) return rows;
  if (q && q.__range) return rows.filter((r) => { const v = val(r); return (q.lo === undefined || v >= q.lo) && (q.hi === undefined || v <= q.hi); });
  return rows.filter((r) => val(r) === q);
}
function makeStore(name, tx) {
  const data = (_stores[name] ||= new Map());
  const schema = (_schema[name] ||= { keyPath: 'id', indexes: {} });
  const all = () => [...data.values()];
  const api = {
    getAll: (q) => { const req = {}; doneReq(tx, req, applyQuery(all(), fieldOf(schema.keyPath), q)); return req; },
    get: (k) => { const req = {}; doneReq(tx, req, data.get(k)); return req; },
    put: (rec) => { const req = {}; const k = rec[schema.keyPath] ?? rec.id ?? rec.key ?? `k${data.size}`; data.set(k, { ...rec }); doneReq(tx, req, k); return req; },
    delete: (k) => { const req = {}; data.delete(k); doneReq(tx, req, undefined); return req; },
    index: (iname) => {
      const val = fieldOf(schema.indexes[iname] || 'id');
      return { getAll: (q) => { const req = {}; doneReq(tx, req, applyQuery(all(), val, q)); return req; } };
    },
  };
  return api;
}
const fakeDB = {
  objectStoreNames: { contains: (n) => Boolean(_schema[n]) },
  close() {},
  createObjectStore(name, { keyPath }) {
    _schema[name] = { keyPath, indexes: {} };
    _stores[name] ||= new Map();
    const store = {
      indexNames: { contains: (n) => Boolean(_schema[name].indexes[n]) },
      createIndex: (iname, ikp) => { _schema[name].indexes[iname] = ikp; },
    };
    return store;
  },
  transaction(names, mode) {
    const tx = { _pend: 0, oncomplete: null, onabort: null, onerror: null, objectStore: (n) => makeStore(n, tx) };
    return tx;
  },
};
globalThis.indexedDB = {
  open() {
    const req = {};
    queueMicrotask(() => {
      req.result = fakeDB;
      req.transaction = fakeDB.transaction([], 'versionchange');
      try { req.onupgradeneeded?.({ target: req, oldVersion: 0, newVersion: 3 }); } catch (e) { req.onerror?.(); return; }
      req.onsuccess?.({ target: req });
    });
    return req;
  },
};
globalThis.IDBKeyRange = {
  bound: (lo, hi) => ({ __range: true, lo, hi }),
  lowerBound: (lo) => ({ __range: true, lo }),
  upperBound: (hi) => ({ __range: true, hi }),
};

const errors = [];
process.on('unhandledRejection', (e) => errors.push('UNHANDLED: ' + (e?.stack || e)));
process.on('uncaughtException', (e) => { console.error('UNCAUGHT:', e?.stack || e); process.exit(2); });

await import(new URL('../app.js', import.meta.url));
await new Promise((r) => setTimeout(r, 1500));
console.log('stores:', Object.fromEntries(Object.entries(_stores).map(([k, v]) => [k, v.size])));

function makeControl(action, extra = {}) {
  const control = makeEl('button');
  control.dataset.action = action;
  Object.assign(control.dataset, extra);
  return control;
}
function clickEvent(control, host = null) {
  return {
    target: { closest: (sel) => {
      if (sel === '[data-action]') return control;
      if (host && (sel === '.finance-card, .goal-card' || sel === '.finance-card, .goal-card, .category-card')) return host;
      return null;
    } },
    preventDefault() {},
  };
}
const driverErrors = [];
async function fire(label, action, extra = {}, hostDataset = null) {
  const control = makeControl(action, extra);
  let host = null;
  if (hostDataset) { host = makeEl('article'); Object.assign(host.dataset, hostDataset); host.querySelector = () => makeEl(); }
  const ev = clickEvent(control, host);
  try {
    for (const fn of (listeners.click || [])) await fn(ev);
    await new Promise((r) => setTimeout(r, 30));
  } catch (e) { driverErrors.push(`${label}: ${e?.message}\n  ${e?.stack?.split('\n')[1]}`); }
}

for (const s of ['dashboard', 'incomes', 'expenses', 'categories', 'credits', 'recurring', 'calendar', 'goals', 'analytics', 'archive', 'reminders', 'settings', 'more']) {
  await fire(`show-screen:${s}`, 'show-screen', { screen: s });
}
await fire('stats:insights', 'stats-tab', { tab: 'insights' });
await fire('stats:operations', 'stats-tab', { tab: 'operations' });
await fire('dash-owner', 'dash-owner', { owner: 'user-danil' });
await fire('show-insights', 'show-insights');
await fire('cycle-theme', 'cycle-theme');
await fire('open-bank-picker', 'open-bank-picker');
await fire('close-bank-picker', 'close-bank-picker');
await fire('open-filter', 'open-filter');
await fire('filter-type', 'filter-type', { value: 'expense' });
await fire('filter-apply', 'filter-apply');
await fire('filter-reset', 'filter-reset');
await fire('close-filter', 'close-filter');
await fire('open-kebab', 'open-kebab', {}, { removable: '', goalId: 'goal-vacation' });
await fire('kebab-edit', 'kebab-edit', {}, { removable: '', goalId: 'goal-vacation' });
await fire('open-history:goal', 'open-history', {}, { removable: '', goalId: 'goal-vacation' });
const rpId = [...(_stores.recurringPayments || new Map()).keys()][0];
await fire('open-history:recurring', 'open-history', {}, { removable: '', recurringId: rpId });
await fire('mark-recurring-paid', 'mark-recurring-paid', {}, { removable: '', recurringId: rpId });
const cardId = [...(_stores.creditCards || new Map()).keys()][0];
await fire('open-history:card', 'open-history', {}, { removable: '', creditCardId: cardId });
const remId = [...(_stores.reminders || new Map()).keys()][0];
await fire('toggle-reminder', 'toggle-reminder-complete', {}, { removable: '', reminderId: remId });
for (const t of ['recurringEditor', 'creditsEditor', 'reminderEditor', 'categoryEditor', 'goalsEditor']) {
  await fire(`toggle-editor:${t}`, 'toggle-editor', { target: t });
}
await fire('add-planned-income', 'add-planned-income');
await fire('op-type', 'op-type', { type: 'income' });
await fire('pill-select', 'pill-select', { select: 'recurringPeriodicitySelect', value: 'еженедельно' });
await fire('export-data', 'export-data');
await fire('export-csv', 'export-csv');
for (const a of ['ob-next', 'ob-register', 'ob-mode', 'ob-mode-next', 'ob-copy', 'ob-share', 'ob-join-open', 'ob-join-show', 'ob-finish']) {
  await fire(a, a);
}
await fire('bank-add-hint', 'bank-add-hint');
await fire('select-period', 'select-period', { period: '7d' });
await fire('cycle-owner-filter:income', 'cycle-owner-filter', { scope: 'income' });
await fire('cycle-archive-sort', 'cycle-archive-sort');
await fire('add-planned-expense', 'add-planned-expense');
await fire('credit-kind', 'credit-kind', { kind: 'loan' });
await fire('recurring-flow', 'recurring-flow', { flow: 'income' });
await fire('category-type', 'category-type', { type: 'income' });
await fire('category-tab', 'category-tab', { tab: 'income' });
await fire('open-sheet', 'open-sheet');
await fire('keypad-key', 'keypad-key', { key: '5' });
await fire('start-add', 'start-add', { type: 'expense' });
await fire('close-sheet', 'close-sheet');
await fire('calendar-prev', 'planner-prev');
await fire('calendar-next', 'planner-next');
await fire('select-period:today', 'select-period', { period: 'today' });
await fire('select-period:thisMonth', 'select-period', { period: 'thisMonth' });
await fire('insight-next', 'insight-next');
await fire('insight-prev', 'insight-prev');
await fire('toggle-range-calendar', 'toggle-range-calendar');
await fire('close-info-modal', 'close-info-modal');
await fire('save-finance-draft', 'save-finance-draft');
if (driverErrors.length) { console.log('DRIVER ERRORS:\n' + driverErrors.join('\n---\n')); process.exit(1); }
console.log('DRIVER-OK');
if (errors.length) { console.log('ASYNC ERRORS:\n' + errors.slice(0, 8).join('\n---\n')); process.exit(1); }
console.log('FULL-SMOKE-OK');
