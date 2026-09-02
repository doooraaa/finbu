// ============================================================================
// FamBu data layer — IndexedDB
// ----------------------------------------------------------------------------
// Единственный источник правды для всего приложения. Ни одна страница не должна
// хранить данные в DOM/переменных — только читать/писать через функции ниже.
//
// Хранилище: IndexedDB (не localStorage — нужна структура, индексы и объём
// данных на годы транзакций без деградации производительности).
// ============================================================================

const DB_NAME = 'fambu';
const DB_VERSION = 3;

/** @typedef {'income'|'expense'} OperationType */
/** @typedef {'violet'|'teal'|'green'|'rose'|'amber'} Tone */

// ----------------------------------------------------------------------------
// Схема хранилищ (object stores) и их индексов.
// keyPath 'id' — везде строковый uuid, генерируется на клиенте (offline-first,
// не зависит от auto-increment, безопасно для будущей синхронизации).
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
// Открытие БД + миграции
// ----------------------------------------------------------------------------
let dbPromise = null;

function openDb() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = request.result;
      for (const [storeName, config] of Object.entries(STORES)) {
        const store = db.objectStoreNames.contains(storeName)
          ? request.transaction.objectStore(storeName)
          : db.createObjectStore(storeName, { keyPath: config.keyPath });
        for (const index of config.indexes) {
          if (!store.indexNames.contains(index.name)) {
            store.createIndex(index.name, index.keyPath, { unique: false });
          }
        }
      }
    };

    request.onsuccess = () => {
      const db = request.result;
      db.onversionchange = () => db.close();
      resolve(db);
    };
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('Обновление базы данных заблокировано другой вкладкой'));
  });
  return dbPromise;
}

function uuid() {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

// ----------------------------------------------------------------------------
// Обёртки над транзакциями IndexedDB в виде Promise (generic CRUD)
// ----------------------------------------------------------------------------
function requestToPromise(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function transactionToPromise(transaction) {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onabort = () => reject(transaction.error || new Error('Транзакция базы данных отменена'));
    transaction.onerror = () => reject(transaction.error || new Error('Ошибка транзакции базы данных'));
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
  const completed = transactionToPromise(tx);
  await requestToPromise(tx.objectStore(storeName).put(withId));
  await completed;
  return withId;
}

export async function remove(storeName, id) {
  const db = await openDb();
  const tx = db.transaction(storeName, 'readwrite');
  const completed = transactionToPromise(tx);
  await requestToPromise(tx.objectStore(storeName).delete(id));
  await completed;
}

export async function queryByIndex(storeName, indexName, value) {
  const db = await openDb();
  const tx = db.transaction(storeName, 'readonly');
  const index = tx.objectStore(storeName).index(indexName);
  return requestToPromise(index.getAll(value));
}

async function queryIndexRange(storeName, indexName, { from, to }) {
  const db = await openDb();
  const tx = db.transaction(storeName, 'readonly');
  const index = tx.objectStore(storeName).index(indexName);
  const range = from && to
    ? IDBKeyRange.bound(from, to)
    : from
      ? IDBKeyRange.lowerBound(from)
      : IDBKeyRange.upperBound(to);
  return requestToPromise(index.getAll(range));
}

export async function runAtomic(storeNames, callback) {
  const db = await openDb();
  const names = [...new Set(storeNames)];
  const tx = db.transaction(names, 'readwrite');
  const completed = transactionToPromise(tx);
  const api = {
    get: (storeName, id) => requestToPromise(tx.objectStore(storeName).get(id)),
    getAll: (storeName) => requestToPromise(tx.objectStore(storeName).getAll()),
    put: async (storeName, record) => {
      const withId = record.id ? record : { ...record, id: uuid() };
      await requestToPromise(tx.objectStore(storeName).put(withId));
      return withId;
    },
    remove: (storeName, id) => requestToPromise(tx.objectStore(storeName).delete(id)),
  };

  try {
    const result = await callback(api);
    await completed;
    return result;
  } catch (error) {
    try {
      tx.abort();
    } catch {
      // Транзакция уже могла завершиться собственной ошибкой.
    }
    await completed.catch(() => {});
    throw error;
  }
}

// ----------------------------------------------------------------------------
// Доменные операции — CRUD для конкретных сущностей приложения
// ----------------------------------------------------------------------------

/**
 * Создать операцию дохода/расхода. Это центральный сценарий приложения —
 * от него зависят Главная, Доходы, Расходы, Категории и Статистика.
 * @param {{type: OperationType, categoryId?: string, subcategoryId?: string,
 *   amount: number, date: string, userId: string, comment?: string,
 *   linkedType?: 'goal'|'loan'|'creditCard'|'recurringPayment', linkedId?: string, label?: string}} data
 */
export async function createTransaction(data) {
  if (!data.categoryId && !data.linkedType) throw new Error('categoryId или linkedType обязателен');
  if (!(data.amount > 0)) throw new Error('amount должен быть положительным числом');
  return put('transactions', {
    ...data,
    createdAt: new Date().toISOString(),
  });
}

export async function updateTransaction(id, patch) {
  const existing = await getById('transactions', id);
  if (!existing) throw new Error(`Транзакция ${id} не найдена`);
  return put('transactions', { ...existing, ...patch, id });
}

export async function deleteTransaction(id) {
  return remove('transactions', id);
}

/** Список транзакций за период [from, to] (ISO-даты, включительно), опционально по типу. */
export async function listTransactions({ from, to, type, categoryId, userId } = {}) {
  let items = from || to
    ? await queryIndexRange('transactions', 'by_date', { from, to })
    : await getAll('transactions');
  if (type) items = items.filter((t) => t.type === type);
  if (categoryId) items = items.filter((t) => t.categoryId === categoryId);
  if (userId) items = items.filter((t) => t.userId === userId);
  return items.sort((a, b) => b.date.localeCompare(a.date) || (b.createdAt || '').localeCompare(a.createdAt || ''));
}

// ----------------------------------------------------------------------------
// Вычисляемые агрегаты — НИЧЕГО из этого не хранится в БД, всё считается
// на лету из transactions. Это то самое "не дублировать состояние в DOM":
// UI должен вызывать эти функции при каждом рендере, а не кэшировать сам.
// ----------------------------------------------------------------------------

/** Баланс/доходы/расходы/свободно за период — карточки на Главной. */
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

/** Разбивка по категориям за период — используется на Доходах/Расходах/Категориях/Статистике. */
export async function getCategoryBreakdown({ from, to, type, userId }) {
  const [rawItems, categories] = await Promise.all([
    listTransactions({ from, to, type, userId }),
    getAll('categories'),
  ]);
  const items = rawItems.filter((t) => t.categoryId); // связанные операции (цели/кредиты) сюда не входят
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
        name: category?.name ?? 'Без категории',
        tone: category?.tone ?? 'violet',
        icon: category?.icon ?? 'tag',
        amount: bucket.amount,
        count: bucket.count,
        percent: total > 0 ? Math.round((bucket.amount / total) * 100) : 0,
      };
    })
    .sort((a, b) => b.amount - a.amount);
}

/** Статус обязательного платежа — вычисляется из даты, а не хранится (см. аудит UI). */
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

const REPAIRABLE_STORES = [
  'users',
  'banks',
  'categories',
  'subcategories',
  'transactions',
  'recurringPayments',
  'reminders',
  'loans',
  'creditCards',
  'goals',
];

function decodeMojibake(value) {
  if (typeof value !== 'string' || !/[РС][\u00a0-\u00ff\u2010-\u2122]|[рР]џ|вЂ/.test(value)) return value;

  const cp1251 = new TextDecoder('windows-1251');
  const utf8 = new TextDecoder('utf-8', { fatal: true });
  const highChars = [...cp1251.decode(Uint8Array.from({ length: 128 }, (_, index) => index + 128))];
  const byteByChar = new Map(highChars.map((char, index) => [char, index + 128]));
  const bytes = [];

  for (const char of value) {
    const code = char.codePointAt(0);
    if (code < 128) bytes.push(code);
    else if (byteByChar.has(char)) bytes.push(byteByChar.get(char));
    else return value;
  }

  try {
    return utf8.decode(new Uint8Array(bytes));
  } catch {
    return value;
  }
}

function repairRecordValue(value) {
  if (typeof value === 'string') return decodeMojibake(value);
  if (Array.isArray(value)) return value.map(repairRecordValue);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, repairRecordValue(nested)]));
}

export async function repairCorruptedTextData() {
  if (await getSetting('encodingRepairV1', false)) return;

  for (const storeName of REPAIRABLE_STORES) {
    const records = await getAll(storeName);
    for (const record of records) {
      const repaired = repairRecordValue(record);
      if (JSON.stringify(repaired) !== JSON.stringify(record)) await put(storeName, repaired);
    }
  }

  await setSetting('encodingRepairV1', true);
}

export function getRecurringPaymentStatus(payment, today = new Date()) {
  if (payment.paidAt) return 'paid';
  const due = new Date(payment.nextDate);
  const daysLeft = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
  if (daysLeft < 0) return 'overdue';
  if (daysLeft < 3) return 'urgent'; // < 3 дня — rose
  if (daysLeft < 7) return 'soon'; // < 7 дней — amber
  return 'scheduled'; // 7+ дней — нейтральный
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
  const yearlyDay = Number(reminder.yearlyDay || day);
  const yearlyMonth = Number(reminder.yearlyMonth || month);

  const advance = () => {
    if (reminder.repeat === 'daily') date.setDate(date.getDate() + 1);
    if (reminder.repeat === 'weekly') date.setDate(date.getDate() + 7);
    if (reminder.repeat === 'monthly') {
      date.setMonth(date.getMonth() + 1, 1);
      date.setDate(Math.min(monthlyDay, new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()));
    }
    if (reminder.repeat === 'yearly') {
      const targetYear = date.getFullYear() + 1;
      const targetDay = Math.min(yearlyDay, new Date(targetYear, yearlyMonth, 0).getDate());
      date = new Date(targetYear, yearlyMonth - 1, targetDay);
    }
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
    { title: 'Оплатить интернет', description: 'Проверить сумму в личном кабинете.', nextDate: '2026-08-25', assignee: 'user-yulya', repeat: 'monthly', monthlyDay: 25, completed: false },
    { title: 'Передать показания счетчиков', description: '', nextDate: '2026-08-20', assignee: 'both', repeat: 'monthly', monthlyDay: 20, completed: false },
    { title: 'Проверить страховку автомобиля', description: 'Сравнить предложения перед продлением.', nextDate: '2026-08-10', assignee: 'user-danil', repeat: 'yearly', completed: false },
    { title: 'Сверить семейный бюджет', description: 'Коротко пройтись по категориям расходов.', nextDate: '2026-08-12', assignee: 'both', repeat: 'weekly', completed: true, completedAt: '2026-08-12T09:00:00.000Z' },
  ];
  await Promise.all(reminders.map((r) => put('reminders', r)));
}

// ----------------------------------------------------------------------------
// Первичное заполнение (seed) — те же данные, что сейчас захардкожены в
// index.html, чтобы переход на реальный data-layer не поменял ни одной цифры
// на экране в первый день использования.
// ----------------------------------------------------------------------------
export async function seedIfEmpty() {
  const existingUsers = await getAll('users');
  if (existingUsers.length > 0) return; // уже засеяно

  const danil = { id: 'user-danil', name: 'Данил', tone: 'violet', initials: 'Д' };
  const yulya = { id: 'user-yulya', name: 'Юля', tone: 'teal', initials: 'Ю' };
  await Promise.all([put('users', danil), put('users', yulya)]);

  const categories = [
    { id: 'cat-salary', name: 'Зарплата', type: 'income', tone: 'green', icon: '💼' },
    { id: 'cat-freelance', name: 'Фриланс', type: 'income', tone: 'teal', icon: '💻' },
    { id: 'cat-gifts-in', name: 'Подарки', type: 'income', tone: 'violet', icon: '🎁' },
    { id: 'cat-food', name: 'Еда', type: 'expense', tone: 'rose', icon: '🍽️' },
    { id: 'cat-transport', name: 'Транспорт', type: 'expense', tone: 'amber', icon: '🚕' },
    { id: 'cat-home', name: 'Дом', type: 'expense', tone: 'violet', icon: '🏠' },
    { id: 'cat-health', name: 'Здоровье', type: 'expense', tone: 'teal', icon: '💊' },
  ];
  await Promise.all(categories.map((c) => put('categories', c)));

  const subcategories = [
    { id: 'sub-salary-main', categoryId: 'cat-salary', name: 'Основная' },
    { id: 'sub-salary-advance', categoryId: 'cat-salary', name: 'Аванс' },
    { id: 'sub-salary-bonus', categoryId: 'cat-salary', name: 'Премия' },
    { id: 'sub-freelance-project', categoryId: 'cat-freelance', name: 'Проект' },
    { id: 'sub-freelance-consult', categoryId: 'cat-freelance', name: 'Консультация' },
    { id: 'sub-food-groceries', categoryId: 'cat-food', name: 'Продукты' },
    { id: 'sub-food-cafe', categoryId: 'cat-food', name: 'Кафе' },
    { id: 'sub-food-restaurants', categoryId: 'cat-food', name: 'Рестораны' },
  ];
  await Promise.all(subcategories.map((s) => put('subcategories', s)));

  const banks = [
    { id: 'bank-tbank', name: 'Т-Банк', color: '#fde047' },
    { id: 'bank-sber', name: 'Сбер', color: '#6ee7b7' },
    { id: 'bank-vtb', name: 'ВТБ', color: '#60a5fa' },
    { id: 'bank-dns', name: 'DNS Банк', color: '#5eead4' },
    { id: 'bank-dom', name: 'Дом РФ', color: '#c4b5fd' },
    { id: 'bank-mebel', name: 'МебельМаркет Банк', color: '#86efac' },
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
    title: 'Отпуск у моря',
    targetAmount: 450000,
    savedAmount: 186000,
    createdDate: '2026-08-01',
    tone: 'teal',
  });

  const recurringPayments = [
    { title: 'Аренда квартиры', amount: 45000, userId: 'user-danil', categoryLabel: 'Дом', periodicity: 'ежемесячно', nextDate: '2026-08-04' },
    { title: 'Домашний интернет и мобильная связь', amount: 2400, userId: 'user-yulya', categoryLabel: 'Связь', periodicity: 'ежемесячно', nextDate: '2026-08-09' },
    { title: 'Подписки: музыка, кино и облако', amount: 1690, userId: 'user-danil', categoryLabel: 'Подписки', periodicity: 'ежемесячно', nextDate: '2026-08-16', paidAt: '2026-08-01' },
  ];
  await Promise.all(recurringPayments.map((p) => put('recurringPayments', p)));

  const creditCards = [
    { bankId: 'bank-tbank', title: 'Т-Банк Platinum', userId: 'user-danil', limit: 250000, debt: 86300, minPayment: 12900, nextDate: '2026-09-06', gracePeriodDays: 55 },
    { bankId: 'bank-sber', title: 'СберКарта кредитная', userId: 'user-yulya', limit: 180000, debt: 40500, minPayment: 8400, nextDate: '2026-09-14', gracePeriodDays: 120 },
  ];
  await Promise.all(creditCards.map((c) => put('creditCards', c)));

  const loans = [
    { kind: 'loan', bankId: 'bank-vtb', title: 'Автокредит', userId: 'user-danil', initialAmount: 1150000, debt: 684000, rate: 14.9, payment: 36700, nextDate: '2026-09-18', termMonths: 36 },
    { kind: 'loan', bankId: 'bank-dom', title: 'Кредит на ремонт', userId: 'user-yulya', initialAmount: 380000, debt: 210400, rate: 11.5, payment: 18900, nextDate: '2026-09-27', termMonths: 24 },
    { kind: 'installment', bankId: 'bank-dns', title: 'Ноутбук для работы', userId: 'user-danil', initialAmount: 120000, debt: 72000, rate: 0, payment: 12000, nextDate: '2026-09-11', termMonths: 10 },
    { kind: 'installment', bankId: 'bank-mebel', title: 'Мебель в детскую комнату', userId: 'user-yulya', initialAmount: 69000, debt: 34500, rate: 0, payment: 11500, nextDate: '2026-09-03', termMonths: 6 },
  ];
  await Promise.all(loans.map((l) => put('loans', l)));
}
