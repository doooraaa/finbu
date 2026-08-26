// ============================================================================
// FamBu data layer вЂ” IndexedDB
// ----------------------------------------------------------------------------
// Р•РґРёРЅСЃС‚РІРµРЅРЅС‹Р№ РёСЃС‚РѕС‡РЅРёРє РїСЂР°РІРґС‹ РґР»СЏ РІСЃРµРіРѕ РїСЂРёР»РѕР¶РµРЅРёСЏ. РќРё РѕРґРЅР° СЃС‚СЂР°РЅРёС†Р° РЅРµ РґРѕР»Р¶РЅР°
// С…СЂР°РЅРёС‚СЊ РґР°РЅРЅС‹Рµ РІ DOM/РїРµСЂРµРјРµРЅРЅС‹С… вЂ” С‚РѕР»СЊРєРѕ С‡РёС‚Р°С‚СЊ/РїРёСЃР°С‚СЊ С‡РµСЂРµР· С„СѓРЅРєС†РёРё РЅРёР¶Рµ.
//
// РҐСЂР°РЅРёР»РёС‰Рµ: IndexedDB (РЅРµ localStorage вЂ” РЅСѓР¶РЅР° СЃС‚СЂСѓРєС‚СѓСЂР°, РёРЅРґРµРєСЃС‹ Рё РѕР±СЉС‘Рј
// РґР°РЅРЅС‹С… РЅР° РіРѕРґС‹ С‚СЂР°РЅР·Р°РєС†РёР№ Р±РµР· РґРµРіСЂР°РґР°С†РёРё РїСЂРѕРёР·РІРѕРґРёС‚РµР»СЊРЅРѕСЃС‚Рё).
// ============================================================================

const DB_NAME = 'fambu';
const DB_VERSION = 2;

/** @typedef {'income'|'expense'} OperationType */
/** @typedef {'violet'|'teal'|'green'|'rose'|'amber'} Tone */

// ----------------------------------------------------------------------------
// РЎС…РµРјР° С…СЂР°РЅРёР»РёС‰ (object stores) Рё РёС… РёРЅРґРµРєСЃРѕРІ.
// keyPath 'id' вЂ” РІРµР·РґРµ СЃС‚СЂРѕРєРѕРІС‹Р№ uuid, РіРµРЅРµСЂРёСЂСѓРµС‚СЃСЏ РЅР° РєР»РёРµРЅС‚Рµ (offline-first,
// РЅРµ Р·Р°РІРёСЃРёС‚ РѕС‚ auto-increment, Р±РµР·РѕРїР°СЃРЅРѕ РґР»СЏ Р±СѓРґСѓС‰РµР№ СЃРёРЅС…СЂРѕРЅРёР·Р°С†РёРё).
// ----------------------------------------------------------------------------
const STORES = {
  users: { keyPath: 'id', indexes: [] },
  banks: { keyPath: 'id', indexes: [] },
  categories: {
    keyPath: 'id',
    indexes: [{ name: 'by_type', keyPath: 'type' }],
  },
  subcategories: {
    keyPath: 'id',
    indexes: [{ name: 'by_category', keyPath: 'categoryId' }],
  },
  transactions: {
    keyPath: 'id',
    indexes: [
      { name: 'by_date', keyPath: 'date' },
      { name: 'by_category', keyPath: 'categoryId' },
      { name: 'by_type', keyPath: 'type' },
      { name: 'by_user', keyPath: 'userId' },
    ],
  },
  recurringPayments: {
    keyPath: 'id',
    indexes: [{ name: 'by_next_date', keyPath: 'nextDate' }],
  },
  reminders: {
    keyPath: 'id',
    indexes: [{ name: 'by_next_date', keyPath: 'nextDate' }],
  },
  loans: { keyPath: 'id', indexes: [] },
  creditCards: { keyPath: 'id', indexes: [] },
  goals: { keyPath: 'id', indexes: [] },
  settings: { keyPath: 'key', indexes: [] },
};

// ----------------------------------------------------------------------------
// РћС‚РєСЂС‹С‚РёРµ Р‘Р” + РјРёРіСЂР°С†РёРё
// ----------------------------------------------------------------------------
let dbPromise = null;

function openDb() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = request.result;
      for (const [storeName, config] of Object.entries(STORES)) {
        if (db.objectStoreNames.contains(storeName)) continue;
        const store = db.createObjectStore(storeName, { keyPath: config.keyPath });
        for (const index of config.indexes) {
          store.createIndex(index.name, index.keyPath, { unique: false });
        }
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  return dbPromise;
}

function uuid() {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

// ----------------------------------------------------------------------------
// РћР±С‘СЂС‚РєРё РЅР°Рґ С‚СЂР°РЅР·Р°РєС†РёСЏРјРё IndexedDB РІ РІРёРґРµ Promise (generic CRUD)
// ----------------------------------------------------------------------------
function requestToPromise(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getAll(storeName) {
  const db = await openDb();
  const tx = db.transaction(storeName, 'readonly');
  return requestToPromise(tx.objectStore(storeName).getAll());
}

export async function getById(storeName, id) {
  const db = await openDb();
  const tx = db.transaction(storeName, 'readonly');
  return requestToPromise(tx.objectStore(storeName).get(id));
}

export async function put(storeName, record) {
  const withId = record.id ? record : { ...record, id: uuid() };
  const db = await openDb();
  const tx = db.transaction(storeName, 'readwrite');
  await requestToPromise(tx.objectStore(storeName).put(withId));
  return withId;
}

export async function remove(storeName, id) {
  const db = await openDb();
  const tx = db.transaction(storeName, 'readwrite');
  await requestToPromise(tx.objectStore(storeName).delete(id));
}

export async function queryByIndex(storeName, indexName, value) {
  const db = await openDb();
  const tx = db.transaction(storeName, 'readonly');
  const index = tx.objectStore(storeName).index(indexName);
  return requestToPromise(index.getAll(value));
}

// ----------------------------------------------------------------------------
// Р”РѕРјРµРЅРЅС‹Рµ РѕРїРµСЂР°С†РёРё вЂ” CRUD РґР»СЏ РєРѕРЅРєСЂРµС‚РЅС‹С… СЃСѓС‰РЅРѕСЃС‚РµР№ РїСЂРёР»РѕР¶РµРЅРёСЏ
// ----------------------------------------------------------------------------

/**
 * РЎРѕР·РґР°С‚СЊ РѕРїРµСЂР°С†РёСЋ РґРѕС…РѕРґР°/СЂР°СЃС…РѕРґР°. Р­С‚Рѕ С†РµРЅС‚СЂР°Р»СЊРЅС‹Р№ СЃС†РµРЅР°СЂРёР№ РїСЂРёР»РѕР¶РµРЅРёСЏ вЂ”
 * РѕС‚ РЅРµРіРѕ Р·Р°РІРёСЃСЏС‚ Р“Р»Р°РІРЅР°СЏ, Р”РѕС…РѕРґС‹, Р Р°СЃС…РѕРґС‹, РљР°С‚РµРіРѕСЂРёРё Рё РЎС‚Р°С‚РёСЃС‚РёРєР°.
 * @param {{type: OperationType, categoryId?: string, subcategoryId?: string,
 *   amount: number, date: string, userId: string, comment?: string,
 *   linkedType?: 'goal'|'loan'|'creditCard'|'recurringPayment', linkedId?: string, label?: string}} data
 */
export async function createTransaction(data) {
  if (!data.categoryId && !data.linkedType) throw new Error('categoryId РёР»Рё linkedType РѕР±СЏР·Р°С‚РµР»РµРЅ');
  if (!(data.amount > 0)) throw new Error('amount РґРѕР»Р¶РµРЅ Р±С‹С‚СЊ РїРѕР»РѕР¶РёС‚РµР»СЊРЅС‹Рј С‡РёСЃР»РѕРј');
  return put('transactions', {
    ...data,
    createdAt: new Date().toISOString(),
  });
}

export async function updateTransaction(id, patch) {
  const existing = await getById('transactions', id);
  if (!existing) throw new Error(`РўСЂР°РЅР·Р°РєС†РёСЏ ${id} РЅРµ РЅР°Р№РґРµРЅР°`);
  return put('transactions', { ...existing, ...patch, id });
}

export async function deleteTransaction(id) {
  return remove('transactions', id);
}

/** РЎРїРёСЃРѕРє С‚СЂР°РЅР·Р°РєС†РёР№ Р·Р° РїРµСЂРёРѕРґ [from, to] (ISO-РґР°С‚С‹, РІРєР»СЋС‡РёС‚РµР»СЊРЅРѕ), РѕРїС†РёРѕРЅР°Р»СЊРЅРѕ РїРѕ С‚РёРїСѓ. */
export async function listTransactions({ from, to, type, categoryId, userId } = {}) {
  let items = await getAll('transactions');
  if (from) items = items.filter((t) => t.date >= from);
  if (to) items = items.filter((t) => t.date <= to);
  if (type) items = items.filter((t) => t.type === type);
  if (categoryId) items = items.filter((t) => t.categoryId === categoryId);
  if (userId) items = items.filter((t) => t.userId === userId);
  return items.sort((a, b) => b.date.localeCompare(a.date) || (b.createdAt || '').localeCompare(a.createdAt || ''));
}

// ----------------------------------------------------------------------------
// Р’С‹С‡РёСЃР»СЏРµРјС‹Рµ Р°РіСЂРµРіР°С‚С‹ вЂ” РќРР§Р•Р“Рћ РёР· СЌС‚РѕРіРѕ РЅРµ С…СЂР°РЅРёС‚СЃСЏ РІ Р‘Р”, РІСЃС‘ СЃС‡РёС‚Р°РµС‚СЃСЏ
// РЅР° Р»РµС‚Сѓ РёР· transactions. Р­С‚Рѕ С‚Рѕ СЃР°РјРѕРµ "РЅРµ РґСѓР±Р»РёСЂРѕРІР°С‚СЊ СЃРѕСЃС‚РѕСЏРЅРёРµ РІ DOM":
// UI РґРѕР»Р¶РµРЅ РІС‹Р·С‹РІР°С‚СЊ СЌС‚Рё С„СѓРЅРєС†РёРё РїСЂРё РєР°Р¶РґРѕРј СЂРµРЅРґРµСЂРµ, Р° РЅРµ РєСЌС€РёСЂРѕРІР°С‚СЊ СЃР°Рј.
// ----------------------------------------------------------------------------

/** Р‘Р°Р»Р°РЅСЃ/РґРѕС…РѕРґС‹/СЂР°СЃС…РѕРґС‹/СЃРІРѕР±РѕРґРЅРѕ Р·Р° РїРµСЂРёРѕРґ вЂ” РєР°СЂС‚РѕС‡РєРё РЅР° Р“Р»Р°РІРЅРѕР№. */
export async function getSummary({ from, to } = {}) {
  const [items, recurringPayments] = await Promise.all([
    listTransactions({ from, to }),
    getAll('recurringPayments'),
  ]);
  const income = items.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const expense = items.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const balance = income - expense;
  const reserved = recurringPayments
    .filter((payment) => payment.nextDate)
    .filter((payment) => !payment.paidAt)
    .filter((payment) => (!from || payment.nextDate >= from) && (!to || payment.nextDate <= to))
    .reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0);
  return {
    income,
    expense,
    balance,
    free: balance - reserved,
  };
}

/** Р Р°Р·Р±РёРІРєР° РїРѕ РєР°С‚РµРіРѕСЂРёСЏРј Р·Р° РїРµСЂРёРѕРґ вЂ” РёСЃРїРѕР»СЊР·СѓРµС‚СЃСЏ РЅР° Р”РѕС…РѕРґР°С…/Р Р°СЃС…РѕРґР°С…/РљР°С‚РµРіРѕСЂРёСЏС…/РЎС‚Р°С‚РёСЃС‚РёРєРµ. */
export async function getCategoryBreakdown({ from, to, type, userId }) {
  const [rawItems, categories] = await Promise.all([
    listTransactions({ from, to, type, userId }),
    getAll('categories'),
  ]);
  const items = rawItems.filter((t) => t.categoryId); // СЃРІСЏР·Р°РЅРЅС‹Рµ РѕРїРµСЂР°С†РёРё (С†РµР»Рё/РєСЂРµРґРёС‚С‹) СЃСЋРґР° РЅРµ РІС…РѕРґСЏС‚
  const total = items.reduce((sum, t) => sum + t.amount, 0);
  const byCategory = new Map();
  for (const t of items) {
    const bucket = byCategory.get(t.categoryId) ?? { amount: 0, count: 0 };
    bucket.amount += t.amount;
    bucket.count += 1;
    byCategory.set(t.categoryId, bucket);
  }
  return [...byCategory.entries()]
    .map(([categoryId, bucket]) => {
      const category = categories.find((c) => c.id === categoryId);
      return {
        categoryId,
        name: category?.name ?? 'Р‘РµР· РєР°С‚РµРіРѕСЂРёРё',
        tone: category?.tone ?? 'violet',
        icon: category?.icon ?? 'tag',
        amount: bucket.amount,
        count: bucket.count,
        percent: total > 0 ? Math.round((bucket.amount / total) * 100) : 0,
      };
    })
    .sort((a, b) => b.amount - a.amount);
}

/** РЎС‚Р°С‚СѓСЃ РѕР±СЏР·Р°С‚РµР»СЊРЅРѕРіРѕ РїР»Р°С‚РµР¶Р° вЂ” РІС‹С‡РёСЃР»СЏРµС‚СЃСЏ РёР· РґР°С‚С‹, Р° РЅРµ С…СЂР°РЅРёС‚СЃСЏ (СЃРј. Р°СѓРґРёС‚ UI). */
export async function getSetting(key, defaultValue) {
  try {
    const record = await getById('settings', key);
    return record ? record.value : defaultValue;
  } catch {
    return defaultValue;
  }
}

export async function setSetting(key, value) {
  return put('settings', { key, value });
}

export function getRecurringPaymentStatus(payment, today = new Date()) {
  if (payment.paidAt) return 'paid';
  const due = new Date(payment.nextDate);
  const daysLeft = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
  if (daysLeft < 0) return 'overdue';
  if (daysLeft <= 3) return 'urgent'; // < 3 РґРЅСЏ вЂ” rose
  if (daysLeft <= 7) return 'soon'; // < 7 РґРЅРµР№ вЂ” amber
  return 'scheduled'; // 7+ РґРЅРµР№ вЂ” РЅРµР№С‚СЂР°Р»СЊРЅС‹Р№
}

export function getReminderStatus(reminder, today = new Date()) {
  if (reminder.completed) return 'completed';
  const due = new Date(reminder.nextDate);
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return due < start ? 'overdue' : 'active';
}

export function getNextReminderDate(reminder) {
  if (reminder.repeat === 'none') return reminder.nextDate;
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const [year, month, day] = reminder.nextDate.split('-').map(Number);
  let date = new Date(year, month - 1, day);
  const monthlyDay = Number(reminder.monthlyDay || day);

  const advance = () => {
    if (reminder.repeat === 'daily') date.setDate(date.getDate() + 1);
    if (reminder.repeat === 'weekly') date.setDate(date.getDate() + 7);
    if (reminder.repeat === 'monthly') {
      date.setMonth(date.getMonth() + 1, 1);
      date.setDate(Math.min(monthlyDay, new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()));
    }
    if (reminder.repeat === 'yearly') date.setFullYear(date.getFullYear() + 1);
  };

  do {
    advance();
  } while (date < todayStart);

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export async function seedRemindersIfEmpty() {
  const existing = await getAll('reminders');
  if (existing.length > 0) return;
  const reminders = [
    { title: 'РћРїР»Р°С‚РёС‚СЊ РёРЅС‚РµСЂРЅРµС‚', description: 'РџСЂРѕРІРµСЂРёС‚СЊ СЃСѓРјРјСѓ РІ Р»РёС‡РЅРѕРј РєР°Р±РёРЅРµС‚Рµ.', nextDate: '2026-08-25', assignee: 'user-yulya', repeat: 'monthly', monthlyDay: 25, completed: false },
    { title: 'РџРµСЂРµРґР°С‚СЊ РїРѕРєР°Р·Р°РЅРёСЏ СЃС‡РµС‚С‡РёРєРѕРІ', description: '', nextDate: '2026-08-20', assignee: 'both', repeat: 'monthly', monthlyDay: 20, completed: false },
    { title: 'РџСЂРѕРІРµСЂРёС‚СЊ СЃС‚СЂР°С…РѕРІРєСѓ Р°РІС‚РѕРјРѕР±РёР»СЏ', description: 'РЎСЂР°РІРЅРёС‚СЊ РїСЂРµРґР»РѕР¶РµРЅРёСЏ РїРµСЂРµРґ РїСЂРѕРґР»РµРЅРёРµРј.', nextDate: '2026-08-10', assignee: 'user-danil', repeat: 'yearly', completed: false },
    { title: 'РЎРІРµСЂРёС‚СЊ СЃРµРјРµР№РЅС‹Р№ Р±СЋРґР¶РµС‚', description: 'РљРѕСЂРѕС‚РєРѕ РїСЂРѕР№С‚РёСЃСЊ РїРѕ РєР°С‚РµРіРѕСЂРёСЏРј СЂР°СЃС…РѕРґРѕРІ.', nextDate: '2026-08-12', assignee: 'both', repeat: 'weekly', completed: true, completedAt: '2026-08-12T09:00:00.000Z' },
  ];
  await Promise.all(reminders.map((r) => put('reminders', r)));
}

// ----------------------------------------------------------------------------
// РџРµСЂРІРёС‡РЅРѕРµ Р·Р°РїРѕР»РЅРµРЅРёРµ (seed) вЂ” С‚Рµ Р¶Рµ РґР°РЅРЅС‹Рµ, С‡С‚Рѕ СЃРµР№С‡Р°СЃ Р·Р°С…Р°СЂРґРєРѕР¶РµРЅС‹ РІ
// index.html, С‡С‚РѕР±С‹ РїРµСЂРµС…РѕРґ РЅР° СЂРµР°Р»СЊРЅС‹Р№ data-layer РЅРµ РїРѕРјРµРЅСЏР» РЅРё РѕРґРЅРѕР№ С†РёС„СЂС‹
// РЅР° СЌРєСЂР°РЅРµ РІ РїРµСЂРІС‹Р№ РґРµРЅСЊ РёСЃРїРѕР»СЊР·РѕРІР°РЅРёСЏ.
// ----------------------------------------------------------------------------
export async function seedIfEmpty() {
  const existingUsers = await getAll('users');
  if (existingUsers.length > 0) return; // СѓР¶Рµ Р·Р°СЃРµСЏРЅРѕ

  const danil = { id: 'user-danil', name: 'Р”Р°РЅРёР»', tone: 'violet', initials: 'Р”' };
  const yulya = { id: 'user-yulya', name: 'Р®Р»СЏ', tone: 'teal', initials: 'Р®' };
  await Promise.all([put('users', danil), put('users', yulya)]);

  const categories = [
    { id: 'cat-salary', name: 'Р—Р°СЂРїР»Р°С‚Р°', type: 'income', tone: 'green', icon: 'рџ’ј' },
    { id: 'cat-freelance', name: 'Р¤СЂРёР»Р°РЅСЃ', type: 'income', tone: 'teal', icon: 'рџ’»' },
    { id: 'cat-gifts-in', name: 'РџРѕРґР°СЂРєРё', type: 'income', tone: 'violet', icon: 'рџЋЃ' },
    { id: 'cat-food', name: 'Р•РґР°', type: 'expense', tone: 'rose', icon: 'рџЌЅпёЏ' },
    { id: 'cat-transport', name: 'РўСЂР°РЅСЃРїРѕСЂС‚', type: 'expense', tone: 'amber', icon: 'рџљ•' },
    { id: 'cat-home', name: 'Р”РѕРј', type: 'expense', tone: 'violet', icon: 'рџЏ ' },
    { id: 'cat-health', name: 'Р—РґРѕСЂРѕРІСЊРµ', type: 'expense', tone: 'teal', icon: 'рџ’Љ' },
  ];
  await Promise.all(categories.map((c) => put('categories', c)));

  const subcategories = [
    { id: 'sub-salary-main', categoryId: 'cat-salary', name: 'РћСЃРЅРѕРІРЅР°СЏ' },
    { id: 'sub-salary-advance', categoryId: 'cat-salary', name: 'РђРІР°РЅСЃ' },
    { id: 'sub-salary-bonus', categoryId: 'cat-salary', name: 'РџСЂРµРјРёСЏ' },
    { id: 'sub-freelance-project', categoryId: 'cat-freelance', name: 'РџСЂРѕРµРєС‚' },
    { id: 'sub-freelance-consult', categoryId: 'cat-freelance', name: 'РљРѕРЅСЃСѓР»СЊС‚Р°С†РёСЏ' },
    { id: 'sub-food-groceries', categoryId: 'cat-food', name: 'РџСЂРѕРґСѓРєС‚С‹' },
    { id: 'sub-food-cafe', categoryId: 'cat-food', name: 'РљР°С„Рµ' },
    { id: 'sub-food-restaurants', categoryId: 'cat-food', name: 'Р РµСЃС‚РѕСЂР°РЅС‹' },
  ];
  await Promise.all(subcategories.map((s) => put('subcategories', s)));

  const banks = [
    { id: 'bank-tbank', name: 'Рў-Р‘Р°РЅРє', color: '#fde047' },
    { id: 'bank-sber', name: 'РЎР±РµСЂ', color: '#6ee7b7' },
    { id: 'bank-vtb', name: 'Р’РўР‘', color: '#60a5fa' },
    { id: 'bank-dns', name: 'DNS Р‘Р°РЅРє', color: '#5eead4' },
    { id: 'bank-dom', name: 'Р”РѕРј Р Р¤', color: '#c4b5fd' },
    { id: 'bank-mebel', name: 'РњРµР±РµР»СЊРњР°СЂРєРµС‚ Р‘Р°РЅРє', color: '#86efac' },
  ];
  await Promise.all(banks.map((b) => put('banks', b)));

  const demoTransactions = [
    { categoryId: 'cat-salary', subcategoryId: 'sub-salary-main', type: 'income', amount: 180000, date: '2026-08-01', userId: 'user-danil' },
    { categoryId: 'cat-salary', subcategoryId: 'sub-salary-advance', type: 'income', amount: 48000, date: '2026-08-01', userId: 'user-danil' },
    { categoryId: 'cat-salary', subcategoryId: 'sub-salary-bonus', type: 'income', amount: 15000, date: '2026-08-01', userId: 'user-danil' },
    { categoryId: 'cat-freelance', subcategoryId: 'sub-freelance-project', type: 'income', amount: 32000, date: '2026-07-31', userId: 'user-yulya' },
    { categoryId: 'cat-freelance', subcategoryId: 'sub-freelance-consult', type: 'income', amount: 16000, date: '2026-08-02', userId: 'user-yulya' },
    { categoryId: 'cat-food', subcategoryId: 'sub-food-groceries', type: 'expense', amount: 8450, date: '2026-08-01', userId: 'user-yulya' },
  ];
  await Promise.all(demoTransactions.map((t) => createTransaction(t)));

  await put('goals', {
    id: 'goal-vacation',
    title: 'РћС‚РїСѓСЃРє Сѓ РјРѕСЂСЏ',
    targetAmount: 450000,
    savedAmount: 186000,
    createdDate: '2026-08-01',
    tone: 'teal',
  });

  const recurringPayments = [
    { title: 'РђСЂРµРЅРґР° РєРІР°СЂС‚РёСЂС‹', amount: 45000, userId: 'user-danil', categoryLabel: 'Р”РѕРј', periodicity: 'РµР¶РµРјРµСЃСЏС‡РЅРѕ', nextDate: '2026-08-04' },
    { title: 'Р”РѕРјР°С€РЅРёР№ РёРЅС‚РµСЂРЅРµС‚ Рё РјРѕР±РёР»СЊРЅР°СЏ СЃРІСЏР·СЊ', amount: 2400, userId: 'user-yulya', categoryLabel: 'РЎРІСЏР·СЊ', periodicity: 'РµР¶РµРјРµСЃСЏС‡РЅРѕ', nextDate: '2026-08-09' },
    { title: 'РџРѕРґРїРёСЃРєРё: РјСѓР·С‹РєР°, РєРёРЅРѕ Рё РѕР±Р»Р°РєРѕ', amount: 1690, userId: 'user-danil', categoryLabel: 'РџРѕРґРїРёСЃРєРё', periodicity: 'РµР¶РµРјРµСЃСЏС‡РЅРѕ', nextDate: '2026-08-16', paidAt: '2026-08-01' },
  ];
  await Promise.all(recurringPayments.map((p) => put('recurringPayments', p)));

  const creditCards = [
    { bankId: 'bank-tbank', title: 'Рў-Р‘Р°РЅРє Platinum', userId: 'user-danil', limit: 250000, debt: 86300, minPayment: 12900, nextDate: '2026-09-06', gracePeriodDays: 55 },
    { bankId: 'bank-sber', title: 'РЎР±РµСЂРљР°СЂС‚Р° РєСЂРµРґРёС‚РЅР°СЏ', userId: 'user-yulya', limit: 180000, debt: 40500, minPayment: 8400, nextDate: '2026-09-14', gracePeriodDays: 120 },
  ];
  await Promise.all(creditCards.map((c) => put('creditCards', c)));

  const loans = [
    { kind: 'loan', bankId: 'bank-vtb', title: 'РђРІС‚РѕРєСЂРµРґРёС‚', userId: 'user-danil', initialAmount: 1150000, debt: 684000, rate: 14.9, payment: 36700, nextDate: '2026-09-18', termMonths: 36 },
    { kind: 'loan', bankId: 'bank-dom', title: 'РљСЂРµРґРёС‚ РЅР° СЂРµРјРѕРЅС‚', userId: 'user-yulya', initialAmount: 380000, debt: 210400, rate: 11.5, payment: 18900, nextDate: '2026-09-27', termMonths: 24 },
    { kind: 'installment', bankId: 'bank-dns', title: 'РќРѕСѓС‚Р±СѓРє РґР»СЏ СЂР°Р±РѕС‚С‹', userId: 'user-danil', initialAmount: 120000, debt: 72000, rate: 0, payment: 12000, nextDate: '2026-09-11', termMonths: 10 },
    { kind: 'installment', bankId: 'bank-mebel', title: 'РњРµР±РµР»СЊ РІ РґРµС‚СЃРєСѓСЋ РєРѕРјРЅР°С‚Сѓ', userId: 'user-yulya', initialAmount: 69000, debt: 34500, rate: 0, payment: 11500, nextDate: '2026-09-03', termMonths: 6 },
  ];
  await Promise.all(loans.map((l) => put('loans', l)));
}
