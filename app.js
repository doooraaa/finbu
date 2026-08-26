import * as db from './db.js';

const screens = {
  dashboard: document.querySelector('#dashboardScreen'),
  incomes: document.querySelector('#incomesScreen'),
  expenses: document.querySelector('#expensesScreen'),
  categories: document.querySelector('#categoriesScreen'),
  credits: document.querySelector('#creditsScreen'),
  recurring: document.querySelector('#recurringScreen'),
  calendar: document.querySelector('#calendarScreen'),
  goals: document.querySelector('#goalsScreen'),
  analytics: document.querySelector('#analyticsScreen'),
  archive: document.querySelector('#archiveScreen'),
  reminders: document.querySelector('#remindersScreen'),
  settings: document.querySelector('#settingsScreen'),
  more: document.querySelector('#moreScreen'),
};

const navItems = document.querySelectorAll('.side-nav [data-action], .mobilebar [data-action="dashboard"], .mobilebar [data-action="more"]');
const sheet = document.querySelector('#addSheet');
const backdrop = document.querySelector('.sheet-backdrop');
const rangeButtons = document.querySelectorAll('.date-range button');
const sheetTypeStep = document.querySelector('[data-sheet-step="type"]');
const sheetFormStep = document.querySelector('[data-sheet-step="form"]');
const sheetTitle = document.querySelector('#sheetTitle');
const categoryValue = document.querySelector('#categoryValue');
const subcategoryValue = document.querySelector('#subcategoryValue');
const dateValue = document.querySelector('#dateValue');
const categoryMenu = document.querySelector('#categoryMenu');
const subcategoryMenu = document.querySelector('#subcategoryMenu');
const calendarTitle = document.querySelector('#calendarTitle');
const calendarDays = document.querySelector('#calendarDays');
const rangeCalendar = document.querySelector('#rangeCalendar');
const rangeCalendarTitle = document.querySelector('#rangeCalendarTitle');
const rangeCalendarDays = document.querySelector('#rangeCalendarDays');
const pageRangeCalendars = document.querySelectorAll('[data-page-range-calendar]');
const categoryNameInput = document.querySelector('#categoryNameInput');
const parentCategorySelect = document.querySelector('#parentCategorySelect');
const categoryIconPicker = document.querySelector('#categoryIconPicker');
const categoryIconValue = document.querySelector('#categoryIconValue');
const categoryColorSelect = document.querySelector('#categoryColorSelect');
const categoryIconPreview = document.querySelector('#categoryIconPreview');
const categoryStatus = document.querySelector('#categoryStatus');
const appModal = document.querySelector('#appModal');
const appModalBackdrop = document.querySelector('.app-modal-backdrop');
const appModalBody = document.querySelector('#appModalBody');
const appModalTitle = document.querySelector('#appModalTitle');
const appModalMode = document.querySelector('#appModalMode');
const appModalWarning = document.querySelector('#appModalWarning');
const appShell = document.querySelector('.shell');
const toastStack = document.querySelector('#toastStack');
const calendarEventFilterValue = document.querySelector('#calendarEventFilterValue');
const calendarEventList = document.querySelector('#calendarEventList');
const calendarEventCount = document.querySelector('#calendarEventCount');
const calendarEmptyState = document.querySelector('#calendarEmptyState');
const analyticsFlowTitle = document.querySelector('#analyticsFlowTitle');
const analyticsFlowChart = document.querySelector('#analyticsFlowChart');
const dashboardToday = document.querySelector('#dashboardToday');
const insightsSlider = document.querySelector('[data-insights-slider]');
const insightsViewport = insightsSlider?.querySelector('.insights-viewport');
const insightSlides = insightsSlider?.querySelectorAll('[data-insight-slide]') || [];
const insightDots = insightsSlider?.querySelectorAll('[data-action="insight-dot"]') || [];
const choiceMenus = document.querySelectorAll('.choice-menu');
const operationMainView = document.querySelector('[data-operation-view="main"]');
const operationCategoryView = document.querySelector('[data-operation-view="categories"]');
const operationCategoryValue = document.querySelector('#operationCategoryValue');
const operationCategoryIcon = document.querySelector('.operation-category-select .category-orb');
const operationAmountValue = document.querySelector('#operationAmountValue');
const operationCommentPopover = document.querySelector('#operationCommentPopover');
const operationCommentInput = document.querySelector('#operationCommentInput');
const operationCommentValue = document.querySelector('#operationCommentValue');
let operationSubcategoryPopup = document.querySelector('#operationSubcategoryPopup');
let selectedDate = new Date();
let calendarMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
let selectedRangeStart = null;
let customRangeStart = null;
let customRangeEnd = null;
let selectedRangeEnd = null;
let rangeCalendarMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
let isSelectingRange = false;
const pageCalendarState = {};
let currentTransactionType = 'expense';
let selectedPlannerDate = todayIsoDate();
let plannerMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
let selectedPlannerFilter = 'Все события';
let operationAmount = '0';
let pendingOperationCategory = null;
let editingTransactionId = null;
let editingCategoryCard = null;
let editingSubcategoryRow = null;
let activeModal = null;
let activeConfirm = null;
let modalReturnFocus = null;

const editorTitles = {
  categoryEditor: 'Категория',
  creditsEditor: 'Кредит',
  recurringEditor: 'Обязательный платеж',
  goalsEditor: 'Финансовая цель',
  reminderEditor: 'Напоминание',
  bankEditor: 'Банк',
  userEditor: 'Пользователь',
};

const iconPaths = {
  archive: '<rect width="20" height="5" x="2" y="3" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/><path d="M10 12h4"/>',
  banknote: '<rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/>',
  bell: '<path d="M10.3 21a2 2 0 0 0 3.4 0"/><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/>',
  briefcase: '<rect width="20" height="14" x="2" y="7" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><path d="M2 12h20"/>',
  calendar: '<path d="M8 2v4M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',
  calendarClock: '<path d="M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6"/><path d="M16 2v4M8 2v4M3 10h18"/><circle cx="17" cy="17" r="5"/><path d="M17 14.5V17l1.5 1"/>',
  chart: '<path d="M3 3v18h18"/><path d="M18 17V9M13 17V5M8 17v-3"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  chevronDown: '<path d="m6 9 6 6 6-6"/>',
  chevronLeft: '<path d="m15 18-6-6 6-6"/>',
  chevronRight: '<path d="m9 18 6-6-6-6"/>',
  creditCard: '<rect width="20" height="14" x="2" y="5" rx="2"/><path d="M2 10h20"/>',
  fileText: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z"/><path d="M14 2v6h6M8 13h8M8 17h5"/>',
  filter: '<path d="M22 3H2l8 9.5V19l4 2v-8.5z"/>',
  folderTree: '<path d="M3 5a2 2 0 0 1 2-2h3l2 2h9a2 2 0 0 1 2 2v3"/><path d="M7 10v8a2 2 0 0 0 2 2h8"/><path d="M14 14h7v6h-7z"/>',
  gift: '<rect width="18" height="14" x="3" y="8" rx="2"/><path d="M12 8v14M3 12h18"/><path d="M7.5 8a2.5 2.5 0 1 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 0 1 0 5"/>',
  heartPulse: '<path d="M19.5 12.5 12 20l-7.5-7.5a5 5 0 0 1 7.1-7.1l.4.4.4-.4a5 5 0 0 1 7.1 7.1Z"/><path d="M3.5 12h4l1.5-3 3 6 1.5-3h7"/>',
  home: '<path d="m3 10 9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M9 20v-6h6v6"/>',
  landmark: '<path d="m3 10 9-7 9 7"/><path d="M4 10h16M6 10v8M10 10v8M14 10v8M18 10v8M4 18h16M2 22h20"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  messageSquare: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  minus: '<path d="M5 12h14"/>',
  pencil: '<path d="M21.2 6.8 17.2 2.8 4 16v4h4z"/><path d="m14 6 4 4"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  receipt: '<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2z"/><path d="M8 7h8M8 11h8M8 15h5"/>',
  repeat: '<path d="m17 2 4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>',
  shoppingCart: '<circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2 2h3l3.6 12.6a2 2 0 0 0 1.9 1.4h7.8a2 2 0 0 0 1.9-1.4L22 7H6"/>',
  smartphone: '<rect width="14" height="20" x="5" y="2" rx="2"/><path d="M12 18h.01"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  settings: '<path d="M12 15.5A3.5 3.5 0 1 0 12 8a3.5 3.5 0 0 0 0 7.5Z"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-.4-1 1.7 1.7 0 0 0-1-.6 1.7 1.7 0 0 0-1.88.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1-.4H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1-.4 1.7 1.7 0 0 0 .6-1 1.7 1.7 0 0 0-.34-1.88l-.06-.06A2 2 0 1 1 7.12 3.43l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 .4 1 1.7 1.7 0 0 0 1 .6 1.7 1.7 0 0 0 1.88-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9c.3.3.52.64.6 1h.09a2 2 0 1 1 0 4H20a1.7 1.7 0 0 0-.6 1Z"/>',
  star: '<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21 7 14.2 2 9.3l6.9-1z"/>',
  tag: '<path d="M12.5 2H2v10.5L11.5 22 22 11.5z"/><circle cx="7" cy="7" r="1"/>',
  target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
  trash: '<path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/>',
  trendingDown: '<path d="m22 17-8.5-8.5-5 5L2 7"/><path d="M16 17h6v-6"/>',
  trendingUp: '<path d="m22 7-8.5 8.5-5-5L2 17"/><path d="M16 7h6v6"/>',
  car: '<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18 10l-2-4H8l-2 4-2.5 1.1C2.7 11.3 2 12.1 2 13v3c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/>',
  user: '<path d="M20 21a8 8 0 0 0-16 0"/><circle cx="12" cy="7" r="4"/>',
  wallet: '<path d="M19 7V5a2 2 0 0 0-2-2H5a3 3 0 0 0 0 6h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H5a3 3 0 0 1-3-3V6"/><path d="M18 12h.01"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
};

const screenIconMap = {
  dashboard: 'home',
  incomes: 'wallet',
  expenses: 'receipt',
  categories: 'tag',
  credits: 'landmark',
  recurring: 'calendarClock',
  calendar: 'calendar',
  goals: 'target',
  analytics: 'chart',
  archive: 'archive',
  reminders: 'bell',
  settings: 'settings',
  more: 'menu',
};

const categoryIconMap = {
  income: 'trendingUp',
  expense: 'trendingDown',
  credit: 'landmark',
  card: 'creditCard',
  recurring: 'calendarClock',
  goal: 'target',
};

function icon(name, className = 'ui-icon') {
  const path = iconPaths[name] || iconPaths.tag;
  return `<svg class="${className}" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;
}

function setIcon(el, name) {
  if (!el || el.dataset.iconRendered === name) return;
  el.innerHTML = icon(name);
  el.dataset.iconRendered = name;
}

const legacyCategoryEmojiMap = {
  tag: '💸',
  wallet: '💰',
  trendingUp: '💼',
  trendingDown: '🧾',
  briefcase: '💻',
  shoppingCart: '🛒',
  car: '🚕',
  home: '🏠',
  heartPulse: '💊',
  gift: '🎁',
  calendarClock: '📅',
  target: '🎯',
  landmark: '🏦',
  creditCard: '💳',
  receipt: '🧾',
  smartphone: '📱',
  folderTree: '🗂️',
};

function isEmojiIcon(value = '') {
  return /\p{Extended_Pictographic}/u.test(String(value));
}

function categoryEmoji(category, fallbackText = '') {
  const value = typeof category === 'string' ? category : category?.icon;
  if (isEmojiIcon(value)) return value;
  if (value && legacyCategoryEmojiMap[value]) return legacyCategoryEmojiMap[value];
  return legacyCategoryEmojiMap[inferCategoryIcon(fallbackText || category?.name || '')] || '💸';
}

function setEmoji(el, emoji) {
  if (!el) return;
  const nextEmoji = categoryEmoji(emoji);
  if (el.dataset.emojiRendered === nextEmoji) return;
  el.textContent = nextEmoji;
  el.dataset.emojiRendered = nextEmoji;
  delete el.dataset.iconRendered;
}

function inferCategoryIcon(text = '') {
  const value = text.toLowerCase();
  if (value.includes('зарп')) return 'wallet';
  if (value.includes('фрил') || value.includes('проект') || value.includes('консультац')) return 'briefcase';
  if (value.includes('подар') || value.includes('кэш')) return 'gift';
  if (value.includes('продукт') || value.includes('еда') || value.includes('кафе') || value.includes('ресторан')) return 'shoppingCart';
  if (value.includes('транспорт') || value.includes('такси') || value.includes('бензин')) return 'car';
  if (value.includes('дом') || value.includes('аренд')) return 'home';
  if (value.includes('здоров') || value.includes('аптек') || value.includes('врач')) return 'heartPulse';
  if (value.includes('интернет') || value.includes('связ')) return 'smartphone';
  if (value.includes('карт') || value.includes('tinkoff') || value.includes('platinum') || value.includes('т-банк')) return 'creditCard';
  if (value.includes('кредит') || value.includes('втб') || value.includes('dns')) return 'landmark';
  if (value.includes('цель') || value.includes('отпуск')) return 'target';
  if (value.includes('плат')) return 'calendarClock';
  return 'receipt';
}

function renderFunctionalIcons(root = document.body) {
  root.querySelectorAll('.side-nav a').forEach((link) => {
    if (link.querySelector('.ui-icon')) return;
    const screen = link.dataset.screen || (link.dataset.action === 'dashboard' ? 'dashboard' : 'more');
    link.insertAdjacentHTML('afterbegin', icon(screenIconMap[screen], 'ui-icon nav-icon'));
  });

  root.querySelectorAll('.section-item').forEach((item) => {
    setIcon(item.querySelector('span'), screenIconMap[item.dataset.screen] || 'tag');
  });

  root.querySelectorAll('.icon-picker-grid [data-icon]').forEach((button) => {
    if (isEmojiIcon(button.dataset.icon)) {
      button.textContent = button.dataset.icon;
    } else {
      setEmoji(button, button.dataset.icon);
    }
  });

  root.querySelectorAll('.mobilebar [data-action="dashboard"]').forEach((button) => {
    if (!button.querySelector('.ui-icon')) button.insertAdjacentHTML('afterbegin', icon('home', 'ui-icon mobile-nav-icon'));
  });
  root.querySelectorAll('.mobilebar [data-action="more"]').forEach((button) => {
    if (!button.querySelector('.ui-icon')) button.insertAdjacentHTML('afterbegin', icon('menu', 'ui-icon mobile-nav-icon'));
  });
  root.querySelectorAll('.mobile-add').forEach((button) => {
    button.querySelector('.ui-icon')?.remove();
    button.textContent = '';
    button.setAttribute('aria-label', 'Добавить');
  });

  root.querySelectorAll('.desktop-action[data-action="open-sheet"], .button[data-action="open-sheet"], .button[data-action="toggle-editor"], .button[data-action="category-mode"], .ghost-button[data-action="toggle-editor"]').forEach((button) => {
    if (!button.querySelector('.ui-icon')) button.insertAdjacentHTML('afterbegin', icon('plus', 'ui-icon button-icon'));
  });

  root.querySelectorAll('.search-field span, .category-search span').forEach((label) => {
    if (!label.querySelector('.ui-icon')) label.insertAdjacentHTML('afterbegin', icon('search', 'ui-icon label-icon'));
  });
  root.querySelectorAll('.ghost-button').forEach((button) => {
    const text = button.textContent.trim().toLowerCase();
    if (button.querySelector('.ui-icon')) return;
    if (text.includes('фильтр')) button.insertAdjacentHTML('afterbegin', icon('filter', 'ui-icon button-icon'));
    if (text.includes('сорт')) button.insertAdjacentHTML('afterbegin', icon('chart', 'ui-icon button-icon'));
    if (text.includes('подроб')) button.insertAdjacentHTML('afterbegin', icon('fileText', 'ui-icon button-icon'));
    if (text.includes('редакт')) button.insertAdjacentHTML('afterbegin', icon('pencil', 'ui-icon button-icon'));
  });

  root.querySelectorAll('.record-actions button, [data-action="remove-finance-item"], [data-action="edit-category"], [data-action="delete-category"], [data-action="edit-subcategory"], [data-action="delete-subcategory"]').forEach((button) => {
    const label = button.getAttribute('aria-label') || button.dataset.action || button.textContent;
    const isDelete = /delete|remove|удал|×/i.test(label);
    if (!button.dataset.action && !isDelete) button.dataset.action = 'edit-record';
    if (!button.dataset.action && isDelete) button.dataset.action = 'remove-finance-item';
    setIcon(button, isDelete ? 'trash' : 'pencil');
  });

  root.querySelectorAll('.category-icon').forEach((item) => {
    if (item.id === 'categoryIconPreview') return;
    const card = item.closest('.category-card');
    const source = card?.dataset.categoryName || card?.textContent || item.textContent;
    setEmoji(item, card?.dataset.categoryIcon || source);
  });
  root.querySelectorAll('.category-orb').forEach((item) => {
    if (item.dataset.emoji) {
      setEmoji(item, item.dataset.emoji);
      return;
    }
    if (item.closest('.operation-category-select') && item.dataset.categoryIcon) {
      setEmoji(item, item.dataset.categoryIcon);
      return;
    }
    const card = item.closest('[data-category], .stats-operation, .operation-category-select');
    const source = card?.dataset?.category || card?.textContent || item.textContent;
    if (!item.querySelector('.ui-icon') && item.textContent.trim()) return;
    setIcon(item, inferCategoryIcon(source));
  });

  root.querySelectorAll('.operation-meta-card.date-field i').forEach((item) => setIcon(item, 'calendar'));
  root.querySelectorAll('.comment-meta-button i').forEach((item) => setIcon(item, 'messageSquare'));
  root.querySelectorAll('.operation-category-select > i, .choice-control i').forEach((item) => setIcon(item, 'chevronDown'));
  root.querySelectorAll('[data-action$="prev"]').forEach((button) => {
    if (!button.querySelector('.ui-icon')) button.innerHTML = icon('chevronLeft');
  });
  root.querySelectorAll('[data-action$="next"]').forEach((button) => {
    if (!button.querySelector('.ui-icon')) button.innerHTML = icon('chevronRight');
  });
  root.querySelectorAll('[data-action^="close"], .modal-close, [data-action="request-close-modal"]').forEach((button) => {
    if (button.textContent.trim() === '×') setIcon(button, 'x');
  });
}

function setCategoryIconChoice(iconName) {
  const nextIcon = categoryEmoji(iconName || '💸');
  if (categoryIconValue) categoryIconValue.value = nextIcon;
  if (categoryIconPreview) setEmoji(categoryIconPreview, nextIcon);
  categoryIconPicker?.querySelectorAll('[data-icon]').forEach((button) => {
    button.classList.toggle('is-selected', categoryEmoji(button.dataset.icon) === nextIcon);
  });
}

async function migrateCategoryEmojiIcons() {
  const categories = await db.getAll('categories');
  await Promise.all(categories.map((category) => {
    const nextIcon = categoryEmoji(category, category.name);
    if (category.icon === nextIcon) return Promise.resolve();
    return db.put('categories', { ...category, icon: nextIcon });
  }));
}

function showToast(type, message) {
  if (!toastStack) return;
  const titles = { error: 'Ошибка', success: 'Готово', info: 'Информация' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<b>${titles[type] || 'Готово'}</b><small>${message}</small>`;
  toastStack.append(toast);
  window.setTimeout(() => toast.classList.add('is-visible'), 20);
  window.setTimeout(() => {
    toast.classList.remove('is-visible');
    window.setTimeout(() => toast.remove(), 220);
  }, 2600);
}

function getEditorTitle(editor, mode = 'create') {
  const base = editorTitles[editor?.id] || editor?.querySelector('b')?.textContent?.trim() || 'Запись';
  return base;
}

function markModalDirty() {
  if (activeModal) activeModal.dirty = true;
}

function getScreenFromHash() {
  const hash = decodeURIComponent(window.location.hash.replace('#', '')).trim();
  return screens[hash] ? hash : 'dashboard';
}

function updateScreenRoute(name, replace = false) {
  const nextHash = `#${name}`;
  if (window.location.hash === nextHash) return;
  const method = replace ? 'replaceState' : 'pushState';
  window.history[method]({ screen: name }, '', nextHash);
}

function isSheetOpen() {
  return Boolean(sheet && !sheet.hidden && sheet.classList.contains('is-open'));
}

function getDialogFocusableElements(root = appModal) {
  if (!root) return [];
  const selector = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(',');

  return [...root.querySelectorAll(selector)].filter((element) => {
    if (element.closest('[hidden]')) return false;
    return element.offsetParent !== null || element === document.activeElement;
  });
}

function activateModalLayer() {
  if (!activeModal && !activeConfirm && !isSheetOpen()) {
    modalReturnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  }
  appShell?.setAttribute('inert', '');
  document.body.classList.add('is-modal-open');
}

function releaseModalLayer() {
  if (activeModal || activeConfirm || isSheetOpen()) return;
  appShell?.removeAttribute('inert');
  document.body.classList.remove('is-modal-open');
  const returnTarget = modalReturnFocus;
  modalReturnFocus = null;
  if (returnTarget && document.contains(returnTarget)) returnTarget.focus?.({ preventScroll: true });
}

function focusModalStart(preferredRoot = appModal) {
  window.setTimeout(() => {
    const focusables = getDialogFocusableElements(preferredRoot);
    const firstInRoot = preferredRoot?.querySelector?.('input, select, textarea, button');
    const target = focusables.includes(firstInRoot) ? firstInRoot : focusables[0];
    target?.focus?.({ preventScroll: true });
  }, 40);
}

function trapModalFocus(event) {
  const root = activeModal || activeConfirm ? appModal : isSheetOpen() ? sheet : null;
  if (!root) return;
  if (event.key !== 'Tab') return;
  const focusables = getDialogFocusableElements(root);
  if (!focusables.length) {
    event.preventDefault();
    root?.focus?.({ preventScroll: true });
    return;
  }

  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus({ preventScroll: true });
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus({ preventScroll: true });
  }
}

function primeEditorFromRecord(editor, source) {
  if (!editor || !source) return;
  const firstInput = editor.querySelector('input[type="text"]');
  const title = source.querySelector('.finance-main b, .record b, .goal-head b, .bank-directory-card b')?.textContent?.trim();
  if (firstInput && title) firstInput.value = title.replace(/\s+/g, ' ');
}

function openEditorModal(editor, { mode = 'create', source = null } = {}) {
  if (!editor || !appModal || !appModalBackdrop || !appModalBody) return;
  if (activeModal?.editor === editor) return;
  if (activeModal) closeEditorModal({ force: true, silent: true });
  activateModalLayer();

  const placeholder = document.createComment(`modal-placeholder:${editor.id}`);
  editor.parentNode.insertBefore(placeholder, editor);
  activeModal = { editor, placeholder, dirty: false, mode };
  appModalTitle.textContent = getEditorTitle(editor, mode);
  appModalMode.textContent = mode === 'edit' ? 'Редактирование' : 'Создание';
  appModalWarning.hidden = true;

  primeEditorFromRecord(editor, source);
  editor.hidden = false;
  editor.classList.add('in-modal');
  appModalBody.append(editor);
  appModal.hidden = false;
  appModalBackdrop.hidden = false;
  requestAnimationFrame(() => {
    appModal.classList.add('is-open');
    appModalBackdrop.classList.add('is-open');
  });
  renderFunctionalIcons(editor);
  focusModalStart(editor);
}

function closeEditorModal({ force = false, saved = false, silent = false } = {}) {
  if (!activeModal) return true;
  if (activeModal.dirty && !force && !saved) {
    appModalWarning.hidden = false;
    showToast('error', 'Есть несохраненные изменения');
    return false;
  }

  const { editor, placeholder } = activeModal;
  editor.classList.remove('in-modal');
  editor.hidden = true;
  placeholder.replaceWith(editor);
  appModal.classList.remove('is-open');
  appModalBackdrop.classList.remove('is-open');
  appModalWarning.hidden = true;
  activeModal = null;
  releaseModalLayer();
  window.setTimeout(() => {
    if (!activeModal) {
      appModal.hidden = true;
      appModalBackdrop.hidden = true;
    }
  }, 180);
  if (saved && !silent) showToast('success', 'Запись сохранена');
  return true;
}

function openDeleteConfirm({ title = 'Удалить запись?', message = 'Это действие уберет запись из интерфейса.', onConfirm } = {}) {
  if (!appModal || !appModalBackdrop || !appModalBody) return;
  if (activeModal) closeEditorModal({ force: true, silent: true });
  activateModalLayer();
  activeConfirm = { onConfirm };
  appModalMode.textContent = 'Подтверждение';
  appModalTitle.textContent = title;
  appModalWarning.hidden = true;
  appModalBody.innerHTML = `
    <div class="delete-confirm">
      <p>${message}</p>
      <div class="button-stack inline-buttons">
        <button class="ghost-button" type="button" data-action="cancel-delete">Отмена</button>
        <button class="button danger-button" type="button" data-action="confirm-delete">Удалить</button>
      </div>
    </div>
  `;
  appModal.hidden = false;
  appModalBackdrop.hidden = false;
  requestAnimationFrame(() => {
    appModal.classList.add('is-open');
    appModalBackdrop.classList.add('is-open');
  });
  renderFunctionalIcons(appModalBody);
  focusModalStart(appModalBody);
}

function closeDeleteConfirm() {
  if (!activeConfirm) return false;
  activeConfirm = null;
  appModal.classList.remove('is-open');
  appModalBackdrop.classList.remove('is-open');
  appModalBody.innerHTML = '';
  releaseModalLayer();
  window.setTimeout(() => {
    if (!activeModal && !activeConfirm) {
      appModal.hidden = true;
      appModalBackdrop.hidden = true;
    }
  }, 180);
  return true;
}

async function confirmDeleteAction() {
  if (!activeConfirm) return;
  const callback = activeConfirm.onConfirm;
  closeDeleteConfirm();
  try {
    await callback?.();
  } catch (error) {
    console.error(error);
    showToast('error', error?.message || 'Не удалось удалить. Попробуйте снова.');
    return;
  }
  showToast('success', 'Запись удалена');
}

function openEditorById(id, options) {
  const editor = document.querySelector(`#${id}`);
  openEditorModal(editor, options);
}

function openRecordEditor(control) {
  const source = control.closest('.finance-card, .goal-card, .bank-directory-card, .record, .category-card');
  const screen = control.closest('.screen')?.id;
  const editorId =
    screen === 'creditsScreen' ? 'creditsEditor' :
    screen === 'recurringScreen' ? 'recurringEditor' :
    screen === 'goalsScreen' ? 'goalsEditor' :
    screen === 'settingsScreen' ? 'bankEditor' :
    screen === 'categoriesScreen' ? 'categoryEditor' :
    null;
  if (editorId) openEditorById(editorId, { mode: 'edit', source });
}

const ownerClassMap = {
  ['\u0414\u0430\u043d\u0438\u043b']: 'owner-danil',
  ['\u042e\u043b\u044f']: 'owner-yulia',
  ['\u042e\u043b\u0438\u044f']: 'owner-yulia',
};

const categoryMap = {
  income: {
    label: 'Доход',
    badgeClass: 'green',
    categories: {
      Зарплата: ['Основная', 'Аванс', 'Премия'],
      Фриланс: ['Проект', 'Консультация', 'Разовая работа'],
      Подарки: ['Семья', 'Друзья', 'Кэшбэк'],
    },
  },
  expense: {
    label: 'Расход',
    badgeClass: 'rose',
    categories: {
      Продукты: ['Супермаркет', 'Доставка', 'Рынок'],
      Транспорт: ['Такси', 'Топливо', 'Общественный'],
      Дом: ['Аренда', 'Коммунальные', 'Бытовые товары'],
      Здоровье: ['Аптека', 'Врач', 'Анализы'],
      Развлечения: ['Кафе', 'Кино', 'Подписки'],
    },
  },
};

const monthNames = [
  'января',
  'февраля',
  'марта',
  'апреля',
  'мая',
  'июня',
  'июля',
  'августа',
  'сентября',
  'октября',
  'ноября',
  'декабря',
];


function isSameDate(left, right) {
  if (!left || !right) return false;
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function isDateInRange(date, start, end) {
  if (!start || !end) return false;
  const time = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const startTime = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
  const endTime = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();
  return time > startTime && time < endTime;
}

function selectDateRange(start, end, date) {
  if (!start || end || date < start) return { start: date, end: null };
  if (isSameDate(date, start)) return { start: date, end: null };
  return { start, end: date };
}

function getOwnerClass(owner, userId = '') {
  if (userId === 'user-danil') return 'owner-danil';
  if (userId === 'user-yulya') return 'owner-yulia';
  return ownerClassMap[owner] || '';
}

function ownerMarkup(owner, userId = '') {
  const className = getOwnerClass(owner, userId);
  return className ? `<span class="owner-name ${className}">${owner}</span>` : owner;
}

function colorOwnerNames(root = document.body) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || parent.closest('script, style, button, label, input, textarea, select, option, .owner-name')) {
        return NodeFilter.FILTER_REJECT;
      }
      return /\u0414\u0430\u043d\u0438\u043b|\u042e\u043b\u044f/.test(node.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    },
  });
  const nodes = [];

  while (walker.nextNode()) nodes.push(walker.currentNode);

  nodes.forEach((node) => {
    const fragment = document.createDocumentFragment();
    node.nodeValue.split(/(\u0414\u0430\u043d\u0438\u043b|\u042e\u043b\u044f)/g).forEach((part) => {
      if (!part) return;
      if (ownerClassMap[part]) {
        const span = document.createElement('span');
        span.className = `owner-name ${ownerClassMap[part]}`;
        span.textContent = part;
        fragment.append(span);
      } else {
        fragment.append(document.createTextNode(part));
      }
    });
    node.replaceWith(fragment);
  });
}

function setOwnerColors(root) {
  colorOwnerNames(root);
}

function resolveTheme(theme) {
  if (theme === 'system') {
    return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
  return theme === 'light' ? 'light' : 'dark';
}

async function applyTheme(theme = 'dark') {
  const nextTheme = theme || 'dark';
  document.body.dataset.theme = resolveTheme(nextTheme);
  document.querySelectorAll('input[name="theme"]').forEach((input) => {
    input.checked = input.value === nextTheme;
  });
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', document.body.dataset.theme === 'light' ? '#eef2f8' : '#080b12');
}

async function loadTheme() {
  const theme = await db.getSetting('theme', 'dark');
  await applyTheme(theme);
}

function formatOperationDate(date) {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const readable = `${date.getDate()} ${monthNames[date.getMonth()]}`;

  if (isSameDate(date, today)) return `сегодня, ${readable}`;
  if (isSameDate(date, yesterday)) return `вчера, ${readable}`;
  return readable;
}

function formatDashboardDate(date) {
  return `Сегодня ${date.getDate()} ${monthNames[date.getMonth()]}`;
}

function setOperationDate(date) {
  selectedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  calendarMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
  dateValue.textContent = formatOperationDate(date);
  renderCalendar();
}

function renderCalendar() {
  renderCalendarInto({
    monthDate: calendarMonth,
    selected: selectedDate,
    titleElement: calendarTitle,
    daysElement: calendarDays,
    selectAction: 'select-calendar-date',
  });
}

function renderRangeCalendar() {
  renderCalendarInto({
    monthDate: rangeCalendarMonth,
    selectedStart: selectedRangeStart,
    selectedEnd: selectedRangeEnd,
    titleElement: rangeCalendarTitle,
    daysElement: rangeCalendarDays,
    selectAction: 'select-range-calendar-date',
  });
}

function getPageCalendarState(calendarId) {
  if (!pageCalendarState[calendarId]) {
    const today = new Date();
    pageCalendarState[calendarId] = {
      selectedStart: null,
      selectedEnd: null,
      isSelectingRange: false,
      month: new Date(today.getFullYear(), today.getMonth(), 1),
    };
  }

  return pageCalendarState[calendarId];
}

function renderPageRangeCalendar(calendarId) {
  const calendar = document.querySelector(`#${calendarId}`);
  const state = getPageCalendarState(calendarId);

  renderCalendarInto({
    monthDate: state.month,
    selectedStart: state.selectedStart,
    selectedEnd: state.selectedEnd,
    titleElement: calendar.querySelector('[data-calendar-title]'),
    daysElement: calendar.querySelector('[data-calendar-days]'),
    selectAction: 'select-page-range-date',
  });

  calendar.querySelectorAll('[data-action="select-page-range-date"]').forEach((button) => {
    button.dataset.calendar = calendarId;
  });
}

function renderCalendarInto({ monthDate, selected, selectedStart, selectedEnd, titleElement, daysElement, selectAction }) {
  const today = new Date();
  const rangeStart = selectedStart || selected;
  const rangeEnd = selectedEnd || null;
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingEmptyDays = (firstDay.getDay() + 6) % 7;
  const cells = [];

  titleElement.textContent = `${monthNames[month][0].toUpperCase()}${monthNames[month].slice(1)} ${year}`;

  for (let index = 0; index < leadingEmptyDays; index += 1) {
    cells.push('<span class="calendar-empty"></span>');
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day);
    const classes = [
      isSameDate(date, today) ? 'is-today' : '',
      isSameDate(date, rangeStart) ? 'is-selected is-range-start' : '',
      isSameDate(date, rangeEnd) ? 'is-selected is-range-end' : '',
      isDateInRange(date, rangeStart, rangeEnd) ? 'is-in-range' : '',
    ]
      .filter(Boolean)
      .join(' ');

    cells.push(`<button class="${classes}" type="button" data-action="${selectAction}" data-day="${day}">${day}</button>`);
  }

  daysElement.innerHTML = cells.join('');
}

function toggleOperationRecordActions(record) {
  if (!record) return;
  const isOpen = record.classList.toggle('is-actions-open');
  record.setAttribute('aria-expanded', String(isOpen));
}

function showScreen(name, { updateRoute = true, replaceRoute = false } = {}) {
  const nextName = screens[name] ? name : 'dashboard';
  Object.entries(screens).forEach(([key, element]) => {
    element.classList.toggle('is-active', key === nextName);
  });

  navItems.forEach((item) => {
    const targetScreen = item.dataset.screen || item.dataset.action;
    item.classList.toggle('is-active', targetScreen === nextName);
  });

  if (updateRoute) updateScreenRoute(nextName, replaceRoute);
  renderFunctionalIcons(document.body);
  const scrollTarget = window.matchMedia('(max-width: 900px)').matches ? window : document.querySelector('.content');
  scrollTarget?.scrollTo?.({ top: 0, left: 0, behavior: 'auto' });
  if (nextName === 'archive') {
    const archiveRange = screens.archive?.querySelector('.page-range');
    if (archiveRange) archiveRange.scrollLeft = 0;
  }
  closeSheet();
}

function showStatsTab(tab) {
  document.querySelectorAll('[data-stats-pane]').forEach((pane) => {
    const isActive = pane.dataset.statsPane === tab;
    pane.hidden = !isActive;
    pane.classList.toggle('is-active', isActive);
  });

  document.querySelectorAll('[data-action="stats-tab"]').forEach((label) => {
    const isActive = label.dataset.tab === tab;
    const input = label.querySelector('input');
    if (input) input.checked = isActive;
  });

  document.querySelectorAll('[data-stats-overview-only]').forEach((section) => {
    section.hidden = tab !== 'overview';
  });
}

function setInsightSlide(index) {
  if (!insightsViewport || !insightSlides.length) return;
  const nextIndex = Math.max(0, Math.min(index, insightSlides.length - 1));
  insightsViewport.scrollTo({ left: insightsViewport.clientWidth * nextIndex, behavior: 'smooth' });
  updateInsightState(nextIndex);
}

function updateInsightState(index = null) {
  if (!insightsViewport || !insightSlides.length) return;
  const activeIndex = index ?? Math.round(insightsViewport.scrollLeft / Math.max(1, insightsViewport.clientWidth));
  insightSlides.forEach((slide, slideIndex) => slide.classList.toggle('is-active', slideIndex === activeIndex));
  insightDots.forEach((dot, dotIndex) => dot.classList.toggle('is-active', dotIndex === activeIndex));
}

function moveInsightSlide(direction) {
  if (!insightsViewport || !insightSlides.length) return;
  const currentIndex = Math.round(insightsViewport.scrollLeft / Math.max(1, insightsViewport.clientWidth));
  const nextIndex = (currentIndex + direction + insightSlides.length) % insightSlides.length;
  setInsightSlide(nextIndex);
}

async function openSheet(transaction = null) {
  showOperationMain();
  editingTransactionId = transaction?.id ?? null;

  if (transaction) {
    operationAmount = String(transaction.amount);
    if (operationAmountValue) operationAmountValue.textContent = operationAmount;

    if (transaction.linkedType) {
      pendingOperationCategory = {
        linkedType: transaction.linkedType,
        linkedId: transaction.linkedId,
        label: transaction.label,
        tone: LINKED_TONES[transaction.linkedType] || 'violet',
        icon: LINKED_ICONS[transaction.linkedType] || 'tag',
      };
      applyOperationCategorySelection(pendingOperationCategory);
    } else {
      const category = await db.getById('categories', transaction.categoryId);
      let subcategory = '';
      if (transaction.subcategoryId) {
        const sub = await db.getById('subcategories', transaction.subcategoryId);
        subcategory = sub?.name ?? '';
      }
      pendingOperationCategory = category
        ? { category: category.name, tone: category.tone, icon: category.icon, subcategory }
        : null;
      applyOperationCategorySelection(pendingOperationCategory, subcategory);
    }

    const [year, month, day] = transaction.date.split('-').map(Number);
    setOperationDate(new Date(year, month - 1, day));
    const ownerInput = document.querySelector(`input[name="owner"][value="${transaction.userId}"]`);
    if (ownerInput) ownerInput.checked = true;
    if (operationCommentValue) operationCommentValue.textContent = transaction.comment || 'Добавить';
    if (operationCommentInput) operationCommentInput.value = transaction.comment || '';
  } else {
    operationAmount = '0';
    if (operationAmountValue) operationAmountValue.textContent = operationAmount;
    if (operationCategoryValue) operationCategoryValue.textContent = 'Выбрать';
    if (operationCommentValue) operationCommentValue.textContent = 'Добавить';
    if (operationCommentInput) operationCommentInput.value = '';
    if (operationCategoryIcon) {
      operationCategoryIcon.className = 'category-orb';
      delete operationCategoryIcon.dataset.categoryIcon;
      setEmoji(operationCategoryIcon, '💸');
    }
    pendingOperationCategory = null;
    setOperationDate(new Date());
    categoryPickerSearchQuery = '';
    const pickerSearchInput = document.querySelector('#categoryPickerSearchInput');
    if (pickerSearchInput) pickerSearchInput.value = '';
    filterCategoryPickerCards();
  }

  closeOperationComment();
  activateModalLayer();
  backdrop.hidden = false;
  sheet.hidden = false;
  requestAnimationFrame(() => {
    sheet.classList.add('is-open');
    focusModalStart(sheet);
  });
}

function closeSheet() {
  sheet.classList.remove('is-open');
  closeOperationComment();
  closeOperationSubcategories();
  editingTransactionId = null;
  releaseModalLayer();
  window.setTimeout(() => {
    if (!sheet.classList.contains('is-open')) {
      sheet.hidden = true;
      backdrop.hidden = true;
    }
  }, 220);
}

function showOperationMain() {
  if (operationMainView) operationMainView.hidden = false;
  if (operationCategoryView) operationCategoryView.hidden = true;
  closeOperationSubcategories();
}

function showCategoryPicker() {
  if (operationMainView) operationMainView.hidden = true;
  if (operationCategoryView) operationCategoryView.hidden = false;
  closeOperationSubcategories();
  closeOperationComment();
}

function ensureOperationSubcategoryPopup() {
  if (operationSubcategoryPopup) return operationSubcategoryPopup;

  operationSubcategoryPopup = document.createElement('div');
  operationSubcategoryPopup.id = 'operationSubcategoryPopup';
  operationSubcategoryPopup.className = 'subcategory-popover';
  operationSubcategoryPopup.hidden = true;
  operationSubcategoryPopup.innerHTML = `
    <div class="subcategory-popover-card">
      <header>
        <span>
          <small>Подкатегория</small>
          <b data-subcategory-title></b>
        </span>
        <button type="button" data-action="close-operation-subcategories" aria-label="Закрыть">×</button>
      </header>
      <div class="subcategory-popover-list" data-subcategory-list></div>
    </div>
  `;
  operationCategoryView?.append(operationSubcategoryPopup);
  renderFunctionalIcons(operationSubcategoryPopup);
  return operationSubcategoryPopup;
}

function closeOperationSubcategories() {
  if (operationSubcategoryPopup) operationSubcategoryPopup.hidden = true;
}

function toggleOperationComment() {
  if (!operationCommentPopover) return;
  operationCommentPopover.hidden = !operationCommentPopover.hidden;
  if (!operationCommentPopover.hidden) operationCommentInput?.focus();
}

function closeOperationComment() {
  if (operationCommentPopover) operationCommentPopover.hidden = true;
}

function saveOperationComment() {
  const value = operationCommentInput?.value.trim() || '';
  if (operationCommentValue) operationCommentValue.textContent = value || 'Добавить';
  closeOperationComment();
}

function getOperationSubcategories(control) {
  const raw = control.querySelector('small')?.textContent || '';
  const list = raw.includes(':') ? raw.split(':').slice(1).join(':') : raw;
  return list
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function closeChoiceMenus() {
  document.querySelectorAll('.choice-menu').forEach((menu) => {
    menu.hidden = true;
    menu.previousElementSibling?.setAttribute('aria-expanded', 'false');
  });
  rangeCalendar.hidden = true;
}

function syncCustomSelect(select) {
  const custom = select.nextElementSibling?.classList?.contains('custom-select') ? select.nextElementSibling : null;
  if (!custom) return;
  const value = custom.querySelector('[data-custom-select-value]');
  if (value) value.textContent = select.options[select.selectedIndex]?.textContent || '';
}

function enhanceNativeSelects() {
  document.querySelectorAll('.field select:not([data-customized-select])').forEach((select, index) => {
    const id = select.id || `customSelect${index}`;
    select.id = id;
    select.dataset.customizedSelect = 'true';
    select.classList.add('enhanced-native-select');

    const custom = document.createElement('div');
    custom.className = 'custom-select choice-field';
    custom.innerHTML = `
      <button class="choice-control" type="button" data-action="toggle-custom-select" aria-haspopup="listbox" aria-expanded="false">
        <b data-custom-select-value></b>
        <i>⌄</i>
      </button>
      <div class="choice-menu custom-select-menu" hidden role="listbox"></div>
    `;

    const menu = custom.querySelector('.choice-menu');
    Array.from(select.options).forEach((option) => {
      const item = document.createElement('button');
      item.type = 'button';
      item.dataset.action = 'select-custom-option';
      item.dataset.selectId = id;
      item.dataset.value = option.value;
      item.textContent = option.textContent;
      item.setAttribute('role', 'option');
      menu.append(item);
    });

    select.after(custom);
    syncCustomSelect(select);
  });
}

function setCategoryStatus(message) {
  if (categoryStatus) categoryStatus.textContent = message;
}

function clearCategorySelection() {
  document.querySelectorAll('.category-card.is-selected').forEach((item) => item.classList.remove('is-selected'));
  editingCategoryCard = null;
  editingSubcategoryRow = null;
  if (categoryNameInput) categoryNameInput.value = 'Новая категория';
  setCategoryIconChoice('💸');
  setCategoryStatus('Ничего не выбрано');
}

function getActiveCategoryPanel() {
  return Array.from(document.querySelectorAll('[data-category-panel]')).find((panel) => !panel.hidden);
}

function selectCategoryCard(card) {
  if (!card) return;
  document.querySelectorAll('.category-card.is-selected').forEach((item) => item.classList.remove('is-selected'));
  card.classList.add('is-selected');
  const name = card.dataset.categoryName || card.querySelector('b')?.textContent || 'Категория';
  categoryNameInput.value = name;
  setCategoryIconChoice(card.dataset.categoryIcon || categoryEmoji('', name));
  setCategoryStatus(`Выбрана категория “${name}”`);
}

function setCategoryMode(mode) {
  document.querySelectorAll('[name="categoryMode"]').forEach((input) => {
    input.checked = input.closest('[data-mode]')?.dataset.mode === mode;
  });
  parentCategorySelect.closest('.field').hidden = mode !== 'subcategory';
  editingCategoryCard = null;
  categoryNameInput.value = mode === 'subcategory' ? 'Новая подкатегория' : 'Новая категория';
  setCategoryIconChoice(mode === 'subcategory' ? '🗂️' : '💸');
  setCategoryStatus(mode === 'subcategory' ? 'Создание подкатегории' : 'Создание категории');
}

function getCategoryMode() {
  return document.querySelector('[name="categoryMode"]:checked')?.closest('[data-mode]')?.dataset.mode || 'category';
}

async function saveNewCategory(name) {
  const activeTab = document.querySelector('[data-action="category-tab"] input:checked')?.closest('[data-action]')?.dataset.tab;
  const type = activeTab === 'expense' ? 'expense' : 'income';
  const icon = categoryEmoji(categoryIconValue?.value || '💸', name);
  const tone = categoryColorSelect?.value || 'violet';
  await db.put('categories', { name, type, icon, tone });
  await renderCategoriesScreen();
  setCategoryStatus(`Категория «${name}» создана`);
}

async function saveEditedCategory(categoryId, name) {
  const existing = await db.getById('categories', categoryId);
  if (!existing) return;
  const icon = categoryEmoji(categoryIconValue?.value || existing.icon, name);
  const tone = categoryColorSelect?.value || existing.tone;
  await db.put('categories', { ...existing, name, icon, tone });
  await renderCategoriesScreen();
  setCategoryStatus(`Категория «${name}» обновлена`);
}

async function saveNewSubcategory(name) {
  const panel = getActiveCategoryPanel();
  const selectedCard = panel?.querySelector('.category-card.is-selected');
  let categoryId = selectedCard?.dataset.categoryId;

  if (!categoryId && parentCategorySelect?.value) {
    const categories = await db.getAll('categories');
    categoryId = categories.find((c) => c.name === parentCategorySelect.value)?.id;
  }
  if (!categoryId) {
    setCategoryStatus('Выберите родительскую категорию');
    return;
  }

  await db.put('subcategories', { categoryId, name });
  await renderCategoriesScreen();
  setCategoryStatus(`Подкатегория «${name}» добавлена`);
}

async function saveEditedSubcategory(subcategoryId, name) {
  const existing = await db.getById('subcategories', subcategoryId);
  if (!existing) return;
  await db.put('subcategories', { ...existing, name });
  await renderCategoriesScreen();
  setCategoryStatus(`Подкатегория «${name}» обновлена`);
}

/** Наполняет select «Родительская категория» реальными категориями активного типа. */
async function populateParentCategorySelect() {
  if (!parentCategorySelect) return;
  const activeTab = document.querySelector('[data-action="category-tab"] input:checked')?.closest('[data-action]')?.dataset.tab;
  const type = activeTab === 'expense' ? 'expense' : 'income';
  const categories = (await db.getAll('categories')).filter((c) => c.type === type);
  parentCategorySelect.innerHTML = categories.map((c) => `<option>${escapeHtml(c.name)}</option>`).join('');
  refreshCustomSelectOptions(parentCategorySelect);
}

/**
 * Кастомный dropdown (enhanceNativeSelects) строит список опций один раз при
 * инициализации и помечает select как data-customized-select, чтобы не
 * задваивать обёртку. Если опции select'а поменялись динамически (как здесь —
 * список категорий), старую обёртку нужно снести и построить заново.
 */
function refreshCustomSelectOptions(select) {
  select.nextElementSibling?.classList.contains('custom-select') && select.nextElementSibling.remove();
  delete select.dataset.customizedSelect;
  select.classList.remove('enhanced-native-select');
  enhanceNativeSelects();
}

async function removeCategoryFromDb(categoryId, name) {
  const subcategories = await db.queryByIndex('subcategories', 'by_category', categoryId);
  await Promise.all(subcategories.map((sub) => db.remove('subcategories', sub.id)));
  await db.remove('categories', categoryId);
  await renderCategoriesScreen();
  categoryNameInput.value = 'Новая категория';
  setCategoryStatus(`Категория «${name}» удалена`);
}

async function requestCategoryDelete(card) {
  const categoryId = card?.dataset.categoryId;
  if (!categoryId) {
    setCategoryStatus('Выберите категорию для удаления');
    return;
  }
  const name = card.dataset.categoryName || 'категорию';
  const relatedTransactions = await db.listTransactions({ categoryId });
  const warning = relatedTransactions.length > 0
    ? ` У неё есть ${relatedTransactions.length} ${pluralizeOperations(relatedTransactions.length)} — они останутся, но будут показаны как «Без категории».`
    : '';
  openDeleteConfirm({
    title: 'Удалить категорию?',
    message: `Категория «${name}» и её подкатегории будут удалены безвозвратно.${warning}`,
    onConfirm: () => removeCategoryFromDb(categoryId, name),
  });
}

async function requestSubcategoryDelete(row) {
  const subcategoryId = row?.dataset.subcategoryId;
  if (!subcategoryId) return;
  const name = row.querySelector('span')?.textContent || 'подкатегория';
  openDeleteConfirm({
    title: 'Удалить подкатегорию?',
    message: `Подкатегория «${name}» будет удалена безвозвратно.`,
    onConfirm: async () => {
      await db.remove('subcategories', subcategoryId);
      await renderCategoriesScreen();
      setCategoryStatus(`Подкатегория «${name}» удалена`);
    },
  });
}

async function removeFinanceItem(control) {
  const item = control.closest('[data-removable], .bank-directory-card');
  if (item?.dataset.goalId) {
    await db.remove('goals', item.dataset.goalId);
    await renderGoalsScreen();
    return;
  }
  if (item?.dataset.recurringId) {
    await db.remove('recurringPayments', item.dataset.recurringId);
    await Promise.all([renderRecurringScreen(), renderUpcomingPayments()]);
    return;
  }
  if (item?.dataset.creditCardId) {
    await db.remove('creditCards', item.dataset.creditCardId);
    await Promise.all([renderCreditsScreen(), renderUpcomingPayments()]);
    return;
  }
  if (item?.dataset.loanId) {
    await db.remove('loans', item.dataset.loanId);
    await Promise.all([renderCreditsScreen(), renderUpcomingPayments()]);
    return;
  }
  if (item?.dataset.bankId) {
    const [cards, loans] = await Promise.all([db.getAll('creditCards'), db.getAll('loans')]);
    const isUsed = cards.some((card) => card.bankId === item.dataset.bankId) || loans.some((loan) => loan.bankId === item.dataset.bankId);
    if (isUsed) {
      throw new Error('Банк используется в кредитах. Сначала измените банк в связанных записях.');
    }
    await db.remove('banks', item.dataset.bankId);
    await Promise.all([renderBanksSettings(), renderCreditsScreen(), populateCreditBankSelect()]);
    return;
  }

  const list = item?.closest('.finance-list');
  item?.remove();

  if (list && !list.querySelector('[data-removable]')) {
    const emptyState = list.querySelector('.empty-state') || list.parentElement.querySelector('.empty-state');
    if (emptyState) emptyState.hidden = false;
  }
}

function parseRuDate(text) {
  const match = String(text || '').match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (!match) return null;
  const [, day, month, year] = match;
  const dayNumber = Number(day);
  const monthNumber = Number(month);
  const yearNumber = Number(year);
  const date = new Date(yearNumber, monthNumber - 1, dayNumber);
  if (
    date.getFullYear() !== yearNumber ||
    date.getMonth() !== monthNumber - 1 ||
    date.getDate() !== dayNumber
  ) {
    return null;
  }
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

function formatRuDate(isoDate) {
  const [year, month, day] = isoDate.split('-');
  return `${day}.${month}.${year}`;
}

function parseAmountInput(value) {
  return parseFloat(String(value ?? '').replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
}

async function renderGoalsScreen() {
  const list = document.querySelector('#goalsList');
  if (!list) return;
  const [goals, transactions, users] = await Promise.all([
    db.getAll('goals'),
    db.listTransactions(),
    db.getAll('users'),
  ]);
  const userName = (id) => users.find((user) => user.id === id)?.name ?? '—';

  list.querySelectorAll('.goal-card').forEach((el) => el.remove());
  const emptyState = list.querySelector('.empty-state');
  if (emptyState) emptyState.hidden = goals.length > 0;

  goals.forEach((goal) => {
    const percent = goal.targetAmount > 0 ? Math.min(100, Math.round((goal.savedAmount / goal.targetAmount) * 100)) : 0;
    const remaining = Math.max(0, goal.targetAmount - goal.savedAmount);
    const history = transactions
      .filter((transaction) => transaction.linkedType === 'goal' && transaction.linkedId === goal.id)
      .sort((a, b) => b.date.localeCompare(a.date) || (b.createdAt || '').localeCompare(a.createdAt || ''));
    const card = document.createElement('article');
    card.className = 'card goal-card';
    card.dataset.removable = '';
    card.dataset.goalId = goal.id;
    card.innerHTML = `
      <div class="goal-card-top">
        <button class="goal-head" type="button" data-action="toggle-detail"><span><b>${escapeHtml(goal.title)}</b><em>${percent}%</em></span></button>
        <button class="goal-manage-toggle" type="button" data-action="toggle-goal-actions" aria-label="Управление целью" aria-expanded="false">${icon('settings')}</button>
      </div>
      <small class="muted">Создана ${formatRuDate(goal.createdDate)}</small>
      <div class="finance-metrics goal-metrics">
        <span><small>Нужно</small><b>${formatRub(goal.targetAmount)}</b></span>
        <span><small>Накоплено</small><b>${formatRub(goal.savedAmount)}</b></span>
        <span><small>Осталось</small><b>${formatRub(remaining)}</b></span>
      </div>
      <div class="goal-control-cell" hidden><span class="record-actions goal-actions">
          <button type="button" data-action="edit-goal" aria-label="Редактировать">✎</button>
          <button type="button" data-action="remove-finance-item" aria-label="Удалить">×</button>
      </span></div>
      <span class="meter"><i style="width:${percent}%"></i></span>
      <div class="finance-detail goal-history" hidden>
        <b>История цели</b>
        ${
          history.length
            ? history
                .map((transaction) => {
                  const sign = transaction.type === 'income' ? '+' : '−';
                  const tone = transaction.type === 'income' ? 'green' : 'rose';
                  return `
                    <div class="record" data-transaction-id="${transaction.id}">
                      <div><b>${escapeHtml(transaction.label || goal.title)} → ${ownerMarkup(escapeHtml(userName(transaction.userId)), transaction.userId)}</b><small>${formatRelativeShortDate(transaction.date)}${transaction.comment ? ` · ${escapeHtml(transaction.comment)}` : ''}</small></div>
                      <strong class="${tone}">${sign}${formatRub(transaction.amount)}</strong>
                    </div>
                  `;
                })
                .join('')
            : '<div class="ui-state empty-state"><b>Истории пока нет</b><small>Пополнения и снятия по цели появятся здесь после операций через кнопку добавления.</small></div>'
        }
      </div>
    `;
    list.append(card);
  });

  renderFunctionalIcons(list);
  renderCategoryPicker();
}

/** @returns {Promise<boolean>} true если сохранение прошло успешно */
async function saveGoalDraft() {
  const name = document.querySelector('#goalNameInput')?.value.trim();
  const targetAmount = parseAmountInput(document.querySelector('#goalNeededInput')?.value);
  const savedAmount = parseAmountInput(document.querySelector('#goalSavedInput')?.value);
  const createdDate = parseRuDate(document.querySelector('#goalDateInput')?.value) || new Date().toISOString().slice(0, 10);
  const editingId = document.querySelector('#goalEditingId')?.value;

  if (!name) {
    showToast('error', 'Введите название цели');
    return false;
  }
  if (!(targetAmount > 0)) {
    showToast('error', 'Укажите нужную сумму больше нуля');
    return false;
  }

  const payload = { title: name, targetAmount, savedAmount, createdDate, tone: 'teal' };
  if (editingId) {
    const existing = await db.getById('goals', editingId);
    await db.put('goals', { ...existing, ...payload, id: editingId });
  } else {
    await db.put('goals', payload);
  }
  await renderGoalsScreen();
  return true;
}

function resetGoalEditor() {
  const idInput = document.querySelector('#goalEditingId');
  if (idInput) idInput.value = '';
  const today = new Date();
  const isoToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const fields = {
    '#goalNameInput': 'Новая цель',
    '#goalNeededInput': '',
    '#goalSavedInput': '0',
    '#goalDateInput': formatRuDate(isoToday),
  };
  for (const [selector, value] of Object.entries(fields)) {
    const field = document.querySelector(selector);
    if (field) field.value = value;
  }
}

async function openGoalEditor(goalId) {
  const goal = await db.getById('goals', goalId);
  if (!goal) return;
  const idInput = document.querySelector('#goalEditingId');
  if (idInput) idInput.value = goal.id;
  const fields = {
    '#goalNameInput': goal.title,
    '#goalNeededInput': goal.targetAmount,
    '#goalSavedInput': goal.savedAmount,
    '#goalDateInput': formatRuDate(goal.createdDate),
  };
  for (const [selector, value] of Object.entries(fields)) {
    const field = document.querySelector(selector);
    if (field) field.value = value;
  }
  openEditorById('goalsEditor', { mode: 'edit' });
}

async function renderRecurringScreen() {
  const list = document.querySelector('#recurringList');
  if (!list) return;
  const now = new Date();
  const from = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  const to = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-31`;

  const payments = await db.getAll('recurringPayments');
  const thisMonth = payments.filter((p) => p.nextDate >= from && p.nextDate <= to);
  const planned = thisMonth.reduce((sum, p) => sum + p.amount, 0);
  const paid = thisMonth.filter((p) => p.paidAt).reduce((sum, p) => sum + p.amount, 0);

  const plannedEl = document.querySelector('[data-recurring-summary="planned"]');
  const paidEl = document.querySelector('[data-recurring-summary="paid"]');
  if (plannedEl) plannedEl.textContent = formatRub(planned);
  if (paidEl) paidEl.textContent = formatRub(paid);

  list.querySelectorAll('.recurring-card').forEach((el) => el.remove());
  const emptyState = list.querySelector('.empty-state');
  if (emptyState) emptyState.hidden = payments.length > 0;

  const users = await db.getAll('users');
  const statusMeta = {
    overdue: { label: 'просрочен', tone: 'rose', stateClass: 'is-overdue' },
    urgent: { label: 'скоро', tone: 'rose', stateClass: 'is-soon' },
    soon: { label: 'скоро', tone: 'amber', stateClass: 'is-soon' },
    scheduled: { label: 'запланирован', tone: '', stateClass: '' },
    paid: { label: 'оплачен', tone: 'green', stateClass: '' },
  };

  payments
    .sort((a, b) => a.nextDate.localeCompare(b.nextDate))
    .forEach((payment) => {
      const status = db.getRecurringPaymentStatus(payment, now);
      const meta = statusMeta[status];
      const user = users.find((u) => u.id === payment.userId);
      const [year, month, day] = payment.nextDate.split('-');
      const paymentIcon = inferCategoryIcon(`${payment.title} ${payment.categoryLabel || ''}`);

      const indicatorField = status === 'paid'
        ? `<span><small>Категория</small><b>${escapeHtml(payment.categoryLabel || 'Прочее')}</b></span>`
        : `<span><small>Индикатор</small><b class="${meta.tone}">${meta.label}</b></span>`;

      const card = document.createElement('article');
      card.className = `card finance-card recurring-card${meta.stateClass ? ` ${meta.stateClass}` : ''}`;
      card.dataset.removable = '';
      card.dataset.recurringId = payment.id;
      card.innerHTML = `
        <button class="finance-main" type="button" data-action="toggle-detail">
          <span class="bank-logo payment-type-icon ${meta.tone || 'teal'}">${icon(paymentIcon)}</span>
          <div><b>${escapeHtml(payment.title)}</b><small>${ownerMarkup(escapeHtml(user?.name ?? '—'), payment.userId)} · ${escapeHtml(payment.categoryLabel || 'Прочее')}</small></div>
          <strong class="${meta.tone}">${formatRub(payment.amount)}</strong>
        </button>
        <div class="finance-metrics">
          <span><small>Дата оплаты</small><b>${day}.${month}</b></span>
          <span><small>Периодичность</small><b>${escapeHtml(payment.periodicity)}</b></span>
          <span><small>Статус</small><b class="${status === 'paid' ? 'green' : ''}">${status === 'paid' ? 'оплачен' : 'запланирован'}</b></span>
          ${indicatorField}
        </div>
        <div class="finance-detail" hidden>
          <p>Следующая оплата ${day}.${month}.${year}.</p>
          ${status !== 'paid' ? `<button class="button quick-action-button" type="button" data-action="mark-recurring-paid" aria-label="Отметить оплаченным">${icon('check', 'ui-icon button-icon')}Отметить оплаченным</button>` : ''}
          <div class="record-actions">
            <button type="button" data-action="edit-recurring" aria-label="Редактировать">✎</button>
            <button type="button" data-action="remove-finance-item" aria-label="Удалить">×</button>
          </div>
        </div>
      `;
      list.append(card);
    });

  renderFunctionalIcons(list);
  renderCategoryPicker();
}

async function saveRecurringDraft() {
  const title = document.querySelector('#recurringTitleInput')?.value.trim();
  const amount = parseAmountInput(document.querySelector('#recurringAmountInput')?.value);
  const nextDate = parseRuDate(document.querySelector('#recurringDateInput')?.value);
  const categoryLabel = document.querySelector('#recurringCategoryInput')?.value.trim() || 'Прочее';
  const periodicity = document.querySelector('#recurringPeriodicitySelect')?.value || 'ежемесячно';
  const userId = document.querySelector('#recurringOwnerSelect')?.value || 'user-danil';
  const editingId = document.querySelector('#recurringEditingId')?.value;

  if (!title) {
    showToast('error', 'Введите название платежа');
    return false;
  }
  if (!(amount > 0)) {
    showToast('error', 'Укажите сумму больше нуля');
    return false;
  }
  if (!nextDate) {
    showToast('error', 'Укажите дату оплаты в формате ДД.ММ.ГГГГ');
    return false;
  }

  const payload = { title, amount, nextDate, categoryLabel, periodicity, userId };
  if (editingId) {
    const existing = await db.getById('recurringPayments', editingId);
    await db.put('recurringPayments', { ...existing, ...payload, id: editingId });
  } else {
    await db.put('recurringPayments', payload);
  }
  await Promise.all([renderRecurringScreen(), renderUpcomingPayments()]);
  return true;
}

function resetRecurringEditor() {
  const idInput = document.querySelector('#recurringEditingId');
  if (idInput) idInput.value = '';
  const fields = {
    '#recurringTitleInput': 'Новый платеж',
    '#recurringAmountInput': '',
    '#recurringDateInput': '',
    '#recurringCategoryInput': 'Прочее',
  };
  for (const [selector, value] of Object.entries(fields)) {
    const field = document.querySelector(selector);
    if (field) field.value = value;
  }
}

async function openRecurringEditor(id) {
  const payment = await db.getById('recurringPayments', id);
  if (!payment) return;
  const idInput = document.querySelector('#recurringEditingId');
  if (idInput) idInput.value = payment.id;
  const fields = {
    '#recurringTitleInput': payment.title,
    '#recurringAmountInput': payment.amount,
    '#recurringDateInput': formatRuDate(payment.nextDate),
    '#recurringCategoryInput': payment.categoryLabel || 'Прочее',
  };
  for (const [selector, value] of Object.entries(fields)) {
    const field = document.querySelector(selector);
    if (field) field.value = value;
  }
  const periodicitySelect = document.querySelector('#recurringPeriodicitySelect');
  if (periodicitySelect) periodicitySelect.value = payment.periodicity;
  const ownerSelect = document.querySelector('#recurringOwnerSelect');
  if (ownerSelect) ownerSelect.value = payment.userId;
  openEditorById('recurringEditor', { mode: 'edit' });
}

const REMINDER_REPEAT_LABELS = {
  none: 'Не повторять',
  daily: 'Каждый день',
  weekly: 'Каждую неделю',
  monthly: 'Каждый месяц',
  yearly: 'Каждый год',
};

const REMINDER_ASSIGNEE_LABELS = {
  'user-danil': 'Данил',
  'user-yulya': 'Юля',
  both: 'Оба',
};

function reminderAssigneeLabel(value) {
  return REMINDER_ASSIGNEE_LABELS[value] || 'Оба';
}

function reminderAssigneeMarkup(value) {
  if (value === 'both') return `${ownerMarkup('Данил', 'user-danil')} · ${ownerMarkup('Юля', 'user-yulya')}`;
  return ownerMarkup(escapeHtml(reminderAssigneeLabel(value)), value);
}

function reminderRepeatLabel(reminder) {
  const label = REMINDER_REPEAT_LABELS[reminder.repeat] || 'Не повторять';
  return reminder.repeat === 'monthly' && reminder.monthlyDay ? `${label} · ${reminder.monthlyDay} числа` : label;
}

function syncReminderMonthlyField() {
  const repeat = document.querySelector('#reminderRepeatSelect')?.value;
  const monthlyField = document.querySelector('#reminderMonthlyDayField');
  if (monthlyField) monthlyField.hidden = repeat !== 'monthly';
}

function resetReminderEditor() {
  const idInput = document.querySelector('#reminderEditingId');
  if (idInput) idInput.value = '';
  const today = new Date();
  const dateValue = `${String(today.getDate()).padStart(2, '0')}.${String(today.getMonth() + 1).padStart(2, '0')}.${today.getFullYear()}`;
  const fields = {
    '#reminderTitleInput': 'Новое напоминание',
    '#reminderDescriptionInput': '',
    '#reminderDateInput': dateValue,
    '#reminderMonthlyDayInput': String(today.getDate()),
  };
  for (const [selector, value] of Object.entries(fields)) {
    const field = document.querySelector(selector);
    if (field) field.value = value;
  }
  const assignee = document.querySelector('#reminderAssigneeSelect');
  const repeat = document.querySelector('#reminderRepeatSelect');
  if (assignee) assignee.value = 'both';
  if (repeat) repeat.value = 'none';
  syncCustomSelect(assignee);
  syncCustomSelect(repeat);
  syncReminderMonthlyField();
}

async function renderRemindersScreen() {
  const activeList = document.querySelector('#activeRemindersList');
  const completedList = document.querySelector('#completedRemindersList');
  if (!activeList || !completedList) return;

  const reminders = (await db.getAll('reminders')).sort((a, b) =>
    Number(a.completed) - Number(b.completed) || a.nextDate.localeCompare(b.nextDate)
  );
  const active = reminders.filter((r) => !r.completed);
  const completed = reminders.filter((r) => r.completed);
  const overdue = active.filter((r) => db.getReminderStatus(r) === 'overdue');

  const setText = (selector, value) => {
    const el = document.querySelector(selector);
    if (el) el.textContent = String(value);
  };
  setText('[data-reminders-summary="active"]', active.length);
  setText('[data-reminders-summary="overdue"]', overdue.length);
  setText('[data-reminders-summary="completed"]', completed.length);
  setText('#activeRemindersBadge', active.length);
  setText('#completedRemindersBadge', completed.length);

  const renderCard = (reminder) => {
    const status = db.getReminderStatus(reminder);
    const statusMeta = {
      active: { label: 'Активно', tone: 'violet' },
      overdue: { label: 'Просрочено', tone: 'rose' },
      completed: { label: 'Выполнено', tone: 'green' },
    }[status];
    const dateText = formatRuDate(reminder.nextDate).slice(0, 5);
    const description = reminder.description ? `<p>${escapeHtml(reminder.description)}</p>` : '';
    return `
      <article class="card finance-card reminder-card is-${status}" data-reminder-id="${reminder.id}" data-removable>
        <button class="reminder-check" type="button" data-action="toggle-reminder-complete" aria-label="${status === 'completed' ? 'Вернуть в работу' : 'Отметить выполненным'}">${status === 'completed' ? icon('check') : ''}</button>
        <button class="finance-main reminder-main" type="button" data-action="toggle-detail">
          <div><b>${escapeHtml(reminder.title)}</b><small>${dateText} · ${reminderRepeatLabel(reminder)} · ${reminderAssigneeMarkup(reminder.assignee)}</small></div>
          <strong class="${statusMeta.tone}">${statusMeta.label}</strong>
        </button>
        <div class="finance-detail" hidden>
          ${description || '<p>Описание не добавлено.</p>'}
          <div class="record-actions">
            <button type="button" data-action="edit-reminder" aria-label="Редактировать">✎</button>
            <button type="button" data-action="delete-reminder" aria-label="Удалить">×</button>
          </div>
        </div>
      </article>
    `;
  };

  activeList.innerHTML = active.map(renderCard).join('');
  completedList.innerHTML = completed.map(renderCard).join('');
  const activeEmpty = document.querySelector('#activeRemindersEmpty');
  const completedEmpty = document.querySelector('#completedRemindersEmpty');
  if (activeEmpty) activeEmpty.hidden = active.length > 0;
  if (completedEmpty) completedEmpty.hidden = completed.length > 0;
  renderFunctionalIcons(document.querySelector('#remindersScreen'));
}

async function saveReminderDraft() {
  const title = document.querySelector('#reminderTitleInput')?.value.trim();
  const description = document.querySelector('#reminderDescriptionInput')?.value.trim() || '';
  const nextDate = parseRuDate(document.querySelector('#reminderDateInput')?.value);
  const assignee = document.querySelector('#reminderAssigneeSelect')?.value || 'both';
  const repeat = document.querySelector('#reminderRepeatSelect')?.value || 'none';
  const monthlyDay = Number(document.querySelector('#reminderMonthlyDayInput')?.value || '');
  const editingId = document.querySelector('#reminderEditingId')?.value;

  if (!title) {
    showToast('error', 'Введите название напоминания');
    return false;
  }
  if (!nextDate) {
    showToast('error', 'Укажите дату в формате ДД.ММ.ГГГГ');
    return false;
  }
  if (repeat === 'monthly' && (!(monthlyDay >= 1) || !(monthlyDay <= 31))) {
    showToast('error', 'Укажите число месяца от 1 до 31');
    return false;
  }

  const payload = { title, description, nextDate, assignee, repeat, monthlyDay: repeat === 'monthly' ? monthlyDay : undefined };
  if (editingId) {
    const existing = await db.getById('reminders', editingId);
    await db.put('reminders', { ...existing, ...payload, id: editingId, completed: false, completedAt: undefined });
  } else {
    await db.put('reminders', { ...payload, completed: false });
  }
  await Promise.all([renderRemindersScreen(), renderDashboardReminders()]);
  return true;
}

async function openReminderEditor(id) {
  const reminder = await db.getById('reminders', id);
  if (!reminder) return;
  document.querySelector('#reminderEditingId').value = reminder.id;
  document.querySelector('#reminderTitleInput').value = reminder.title;
  document.querySelector('#reminderDescriptionInput').value = reminder.description || '';
  document.querySelector('#reminderDateInput').value = formatRuDate(reminder.nextDate);
  document.querySelector('#reminderAssigneeSelect').value = reminder.assignee || 'both';
  document.querySelector('#reminderRepeatSelect').value = reminder.repeat || 'none';
  document.querySelector('#reminderMonthlyDayInput').value = reminder.monthlyDay || new Date(`${reminder.nextDate}T00:00:00`).getDate();
  syncCustomSelect(document.querySelector('#reminderAssigneeSelect'));
  syncCustomSelect(document.querySelector('#reminderRepeatSelect'));
  syncReminderMonthlyField();
  openEditorById('reminderEditor', { mode: 'edit' });
}

async function toggleReminderComplete(id) {
  const reminder = await db.getById('reminders', id);
  if (!reminder) return;
  if (reminder.completed) {
    await db.put('reminders', { ...reminder, completed: false, completedAt: undefined });
    showToast('success', 'Напоминание возвращено в работу');
  } else if (reminder.repeat && reminder.repeat !== 'none') {
    await db.put('reminders', { ...reminder, nextDate: db.getNextReminderDate(reminder), completed: false, completedAt: undefined });
    showToast('success', 'Напоминание выполнено, следующая дата обновлена');
  } else {
    await db.put('reminders', { ...reminder, completed: true, completedAt: new Date().toISOString() });
    showToast('success', 'Напоминание выполнено');
  }
  await Promise.all([renderRemindersScreen(), renderDashboardReminders()]);
}

function requestReminderDelete(id) {
  openDeleteConfirm({
    title: 'Удалить напоминание?',
    message: 'Напоминание будет удалено без возможности восстановления.',
    onConfirm: async () => {
      await db.remove('reminders', id);
      await Promise.all([renderRemindersScreen(), renderDashboardReminders()]);
    },
  });
}

async function populateCreditBankSelect() {
  const select = document.querySelector('#creditBankSelect');
  if (!select) return;
  const banks = await db.getAll('banks');
  select.innerHTML = banks.map((b) => `<option value="${b.id}">${escapeHtml(b.name)}</option>`).join('');
  refreshCustomSelectOptions(select);
}

function renderDebtCard({ id, datasetKey, bankName, bankColor, bankLogo, subtitle, debt, paidAmount, paidPercent, meterTone, metrics, editAction, paymentKind }) {
  const card = document.createElement('article');
  card.className = 'card finance-card credit-card';
  card.dataset.removable = '';
  card.dataset[datasetKey] = id;
  const logoMarkup = bankLogo
    ? `<img class="bank-logo-image" src="${bankLogo}" alt="">`
    : `<span class="bank-logo" style="${bankColor ? `background:${bankColor}22; color:${bankColor}` : ''}">${escapeHtml((bankName || '??').slice(0, 2).toUpperCase())}</span>`;
  card.innerHTML = `
    <button class="finance-main" type="button" data-action="toggle-detail">
      ${logoMarkup}
      <div><b class="bank-brand" style="${bankColor ? `color:${bankColor}` : ''}">${escapeHtml(bankName || 'Банк')}</b><small>${subtitle}</small></div>
      <strong class="${meterTone} debt-title">${formatRub(paidAmount)} <em>${paidPercent}%</em></strong>
    </button>
    <div class="finance-metrics">${metrics}</div>
    <span class="meter${meterTone === 'rose' ? ' rose-meter' : ''}"><i style="width:${paidPercent}%"></i></span>
    <div class="finance-detail" hidden>
      ${debt > 0 ? `<button class="button quick-action-button" type="button" data-action="make-quick-payment" data-payment-kind="${paymentKind}" aria-label="Внести платёж">${icon('banknote', 'ui-icon button-icon')}Внести платёж</button>` : ''}
      <div class="record-actions">
        <button type="button" data-action="${editAction}" aria-label="Редактировать">✎</button>
        <button type="button" data-action="remove-finance-item" aria-label="Удалить">×</button>
      </div>
    </div>
  `;
  return card;
}

async function renderCreditsScreen() {
  const [cards, loansAndInstallments, banks, users] = await Promise.all([
    db.getAll('creditCards'),
    db.getAll('loans'),
    db.getAll('banks'),
    db.getAll('users'),
  ]);
  const loans = loansAndInstallments.filter((l) => l.kind !== 'installment');
  const installments = loansAndInstallments.filter((l) => l.kind === 'installment');
  const bankName = (id) => banks.find((b) => b.id === id)?.name ?? '—';
  const bankColorOf = (id) => banks.find((b) => b.id === id)?.color ?? '';
  const bankLogoOf = (id) => banks.find((b) => b.id === id)?.logoDataUrl ?? '';
  const userName = (id) => users.find((u) => u.id === id)?.name ?? '—';

  // --- сводка сверху ---
  const totalDebt = cards.reduce((s, c) => s + c.debt, 0) + loansAndInstallments.reduce((s, l) => s + l.debt, 0);
  const totalBase = cards.reduce((s, c) => s + c.limit, 0) + loansAndInstallments.reduce((s, l) => s + l.initialAmount, 0);
  const totalDebtPercent = totalBase > 0 ? Math.round((totalDebt / totalBase) * 100) : 0;
  const allPayable = [
    ...cards.map((c) => ({ amount: c.minPayment, date: c.nextDate, userId: c.userId })),
    ...loansAndInstallments.map((l) => ({ amount: l.payment, date: l.nextDate, userId: l.userId })),
  ].sort((a, b) => a.date.localeCompare(b.date));
  const nextPayment = allPayable[0];
  const totalDebtEl = document.querySelector('[data-credits-summary="total-debt"]');
  const nextPaymentEl = document.querySelector('[data-credits-summary="next-payment"]');
  const nextPaymentMetaEl = document.querySelector('[data-credits-summary="next-payment-meta"]');
  if (totalDebtEl) totalDebtEl.innerHTML = `${formatRub(totalDebt)} <em>${totalDebtPercent}%</em>`;
  if (nextPaymentEl) nextPaymentEl.textContent = nextPayment ? formatRub(nextPayment.amount) : '—';
  if (nextPaymentMetaEl) {
    nextPaymentMetaEl.textContent = nextPayment
      ? `${formatRelativeShortDate(nextPayment.date)} · ${userName(nextPayment.userId)}`
      : 'Нет предстоящих платежей';
  }

  // --- карточки ---
  const cardsList = document.querySelector('#creditCardsList');
  const loansList = document.querySelector('#loansList');
  const installmentsList = document.querySelector('#installmentsList');

  for (const [list, items] of [[cardsList, cards], [loansList, loans], [installmentsList, installments]]) {
    if (!list) continue;
    list.querySelectorAll('.finance-card').forEach((el) => el.remove());
    const emptyState = list.querySelector('.empty-state');
    if (emptyState) emptyState.hidden = items.length > 0;
  }

  document.querySelector('[data-credits-count="card"]').textContent = `${cards.length} ${cards.length === 1 ? 'карта' : 'карты'}`;
  document.querySelector('[data-credits-count="loan"]').textContent = `${loans.length} ${loans.length === 1 ? 'договор' : 'договора'}`;
  document.querySelector('[data-credits-count="installment"]').textContent = `${installments.length} ${installments.length === 1 ? 'покупка' : 'покупки'}`;

  cards.forEach((card) => {
    const paidAmount = Math.max(0, card.limit - card.debt);
    const paidPercent = card.limit > 0 ? Math.round((paidAmount / card.limit) * 100) : 0;
    const el = renderDebtCard({
      id: card.id,
      datasetKey: 'creditCardId',
      bankName: bankName(card.bankId),
      bankColor: bankColorOf(card.bankId),
      bankLogo: bankLogoOf(card.bankId),
      subtitle: `${ownerMarkup(escapeHtml(userName(card.userId)), card.userId)} · льготный период ${card.gracePeriodDays || 0} дней`,
      debt: card.debt,
      paidAmount,
      paidPercent,
      meterTone: 'rose',
      editAction: 'edit-credit-card',
      paymentKind: 'card',
      metrics: `
        <span><small>Кредитный лимит</small><b>${formatRub(card.limit)}</b></span>
        <span><small>Задолженность</small><b>${formatRub(card.debt)}</b></span>
        <span><small>Мин. платеж</small><b>${formatRub(card.minPayment)}</b></span>
        <span><small>Дата платежа</small><b>${formatRuDate(card.nextDate).slice(0, 5)}</b></span>
      `,
    });
    cardsList.append(el);
  });

  const renderLoanLike = (item, list) => {
    const paidAmount = Math.max(0, item.initialAmount - item.debt);
    const paidPercent = item.initialAmount > 0 ? Math.round((paidAmount / item.initialAmount) * 100) : 0;
    const el = renderDebtCard({
      id: item.id,
      datasetKey: 'loanId',
      bankName: bankName(item.bankId),
      bankColor: bankColorOf(item.bankId),
      bankLogo: bankLogoOf(item.bankId),
      subtitle: `${ownerMarkup(escapeHtml(userName(item.userId)), item.userId)} · ${item.termMonths || 0} месяцев`,
      debt: item.debt,
      paidAmount,
      paidPercent,
      meterTone: '',
      editAction: 'edit-loan',
      paymentKind: 'loan',
      metrics: `
        <span><small>Первоначальная сумма</small><b>${formatRub(item.initialAmount)}</b></span>
        <span><small>Ставка</small><b>${item.rate}%</b></span>
        <span><small>Платеж</small><b>${formatRub(item.payment)}</b></span>
        <span><small>Дата</small><b>${formatRuDate(item.nextDate).slice(0, 5)}</b></span>
      `,
    });
    list.append(el);
  };
  loans.forEach((loan) => renderLoanLike(loan, loansList));
  installments.forEach((installment) => renderLoanLike(installment, installmentsList));

  renderFunctionalIcons(document.body);
  renderCategoryPicker();
}

async function saveCreditDraft() {
  const kind = document.querySelector('#creditKindSelect')?.value || 'card';
  const bankId = document.querySelector('#creditBankSelect')?.value;
  const title = document.querySelector('#creditTitleInput')?.value.trim();
  const userId = document.querySelector('#creditOwnerSelect')?.value || 'user-danil';
  const initial = parseAmountInput(document.querySelector('#creditInitialInput')?.value);
  const debt = parseAmountInput(document.querySelector('#creditDebtInput')?.value);
  const rate = parseAmountInput(document.querySelector('#creditRateInput')?.value);
  const payment = parseAmountInput(document.querySelector('#creditPaymentInput')?.value);
  const nextDate = parseRuDate(document.querySelector('#creditDateInput')?.value);
  const term = parseInt(document.querySelector('#creditTermInput')?.value, 10) || 0;
  const grace = parseInt(document.querySelector('#creditGraceInput')?.value, 10) || 0;
  const editingId = document.querySelector('#creditEditingId')?.value;

  if (!title) {
    showToast('error', 'Введите название');
    return false;
  }
  if (!bankId) {
    showToast('error', 'Выберите банк из справочника');
    return false;
  }
  if (!(initial > 0)) {
    showToast('error', 'Укажите начальную сумму / лимит больше нуля');
    return false;
  }
  if (!nextDate) {
    showToast('error', 'Укажите дату платежа в формате ДД.ММ.ГГГГ');
    return false;
  }

  if (kind === 'card') {
    const payload = { bankId, title, userId, limit: initial, debt, minPayment: payment, nextDate, gracePeriodDays: grace };
    if (editingId) {
      const existing = await db.getById('creditCards', editingId);
      await db.put('creditCards', { ...existing, ...payload, id: editingId });
    } else {
      await db.put('creditCards', payload);
    }
  } else {
    const payload = { kind, bankId, title, userId, initialAmount: initial, debt, rate, payment, nextDate, termMonths: term };
    if (editingId) {
      const existing = await db.getById('loans', editingId);
      await db.put('loans', { ...existing, ...payload, id: editingId });
    } else {
      await db.put('loans', payload);
    }
  }

  await Promise.all([renderCreditsScreen(), renderUpcomingPayments()]);
  return true;
}

function resetCreditEditor() {
  const idInput = document.querySelector('#creditEditingId');
  if (idInput) idInput.value = '';
  const fields = {
    '#creditTitleInput': 'Новая запись',
    '#creditInitialInput': '',
    '#creditDebtInput': '0',
    '#creditRateInput': '0',
    '#creditPaymentInput': '0',
    '#creditDateInput': '',
    '#creditTermInput': '',
    '#creditGraceInput': '',
  };
  for (const [selector, value] of Object.entries(fields)) {
    const field = document.querySelector(selector);
    if (field) field.value = value;
  }
  const kindSelect = document.querySelector('#creditKindSelect');
  if (kindSelect) kindSelect.value = 'card';
}

async function openCreditCardEditor(id) {
  const card = await db.getById('creditCards', id);
  if (!card) return;
  resetCreditEditor();
  document.querySelector('#creditEditingId').value = card.id;
  document.querySelector('#creditKindSelect').value = 'card';
  document.querySelector('#creditBankSelect').value = card.bankId;
  document.querySelector('#creditTitleInput').value = card.title;
  document.querySelector('#creditOwnerSelect').value = card.userId;
  document.querySelector('#creditInitialInput').value = card.limit;
  document.querySelector('#creditDebtInput').value = card.debt;
  document.querySelector('#creditPaymentInput').value = card.minPayment;
  document.querySelector('#creditDateInput').value = formatRuDate(card.nextDate);
  document.querySelector('#creditGraceInput').value = card.gracePeriodDays;
  openEditorById('creditsEditor', { mode: 'edit' });
}

async function openLoanEditor(id) {
  const loan = await db.getById('loans', id);
  if (!loan) return;
  resetCreditEditor();
  document.querySelector('#creditEditingId').value = loan.id;
  document.querySelector('#creditKindSelect').value = loan.kind || 'loan';
  document.querySelector('#creditBankSelect').value = loan.bankId;
  document.querySelector('#creditTitleInput').value = loan.title;
  document.querySelector('#creditOwnerSelect').value = loan.userId;
  document.querySelector('#creditInitialInput').value = loan.initialAmount;
  document.querySelector('#creditDebtInput').value = loan.debt;
  document.querySelector('#creditRateInput').value = loan.rate;
  document.querySelector('#creditPaymentInput').value = loan.payment;
  document.querySelector('#creditDateInput').value = formatRuDate(loan.nextDate);
  document.querySelector('#creditTermInput').value = loan.termMonths;
  openEditorById('creditsEditor', { mode: 'edit' });
}

const TONE_HEX = { violet: '#a78bfa', teal: '#5eead4', green: '#6ee7b7', rose: '#fda4af', amber: '#fde68a' };
const TONE_BG = {
  violet: 'rgba(167, 139, 250, 0.18)',
  teal: 'rgba(94, 234, 212, 0.16)',
  green: 'rgba(110, 231, 183, 0.16)',
  rose: 'rgba(253, 164, 175, 0.16)',
  amber: 'rgba(253, 230, 138, 0.16)',
};

/** Применяет реальный цвет пользователей ко всему приложению через CSS-переменные. */
async function applyOwnerColors() {
  const users = await db.getAll('users');
  const danil = users.find((u) => u.id === 'user-danil');
  const yulya = users.find((u) => u.id === 'user-yulya');
  const root = document.documentElement.style;
  if (danil) {
    root.setProperty('--owner-danil-color', TONE_HEX[danil.tone] || TONE_HEX.violet);
    root.setProperty('--owner-danil-bg', TONE_BG[danil.tone] || TONE_BG.violet);
  }
  if (yulya) {
    root.setProperty('--owner-yulia-color', TONE_HEX[yulya.tone] || TONE_HEX.teal);
    root.setProperty('--owner-yulia-bg', TONE_BG[yulya.tone] || TONE_BG.teal);
  }
}

async function openUserEditor(userId) {
  const user = await db.getById('users', userId);
  if (!user) return;
  const idInput = document.querySelector('#userEditingId');
  const nameInput = document.querySelector('#userNameInput');
  const toneSelect = document.querySelector('#userToneSelect');
  if (idInput) idInput.value = user.id;
  if (nameInput) nameInput.value = user.name;
  if (toneSelect) {
    toneSelect.value = user.tone || 'violet';
    syncCustomSelect(toneSelect);
  }
  openEditorById('userEditor', { mode: 'edit' });
}

function userInitials(name) {
  return String(name || '')
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'U';
}

async function saveUserDraft() {
  const userId = document.querySelector('#userEditingId')?.value;
  const name = document.querySelector('#userNameInput')?.value.trim();
  const tone = document.querySelector('#userToneSelect')?.value || 'violet';
  if (!userId) return false;
  if (!name) {
    showToast('error', 'Введите имя пользователя');
    return false;
  }
  const user = await db.getById('users', userId);
  if (!user) return false;
  await db.put('users', { ...user, name, tone, initials: userInitials(name) });
  await Promise.all([
    renderUsersSettings(),
    renderOwnerControls(),
    applyOwnerColors(),
    refreshDashboard(),
    renderTransactionScreen('income'),
    renderTransactionScreen('expense'),
    renderArchiveScreen(),
    renderPlannerEvents(),
  ]);
  return true;
}

async function renderUsersSettings() {
  const list = document.querySelector('#usersList');
  const countEl = document.querySelector('#usersCount');
  if (!list) return;
  const users = await db.getAll('users');
  if (countEl) countEl.textContent = String(users.length);
  const toneLabel = { violet: 'фиолетовый', teal: 'бирюзовый', green: 'зелёный', rose: 'розовый', amber: 'жёлтый' };
  list.innerHTML = users
    .map(
      (user) => `
    <div class="user-row">
      <span class="avatar ${user.id === 'user-yulya' ? 'yulia' : 'danil'}">${escapeHtml(user.initials)}</span>
      <div><b>${escapeHtml(user.name)}</b><small>Цвет пользователя · ${toneLabel[user.tone] || user.tone}</small></div>
      <button class="ghost-button" type="button" data-action="edit-user" data-user-id="${user.id}">Редактировать</button>
    </div>
  `
    )
    .join('');
  renderFunctionalIcons(list);
}

async function renderBanksSettings() {
  const directory = document.querySelector('#bankDirectory');
  if (!directory) return;
  const [banks, cards, loans] = await Promise.all([db.getAll('banks'), db.getAll('creditCards'), db.getAll('loans')]);

  directory.innerHTML = banks.length
    ? banks
        .map((bank) => {
          const usage = [];
          if (cards.some((c) => c.bankId === bank.id)) usage.push('кредитных картах');
          if (loans.some((l) => l.bankId === bank.id && l.kind !== 'installment')) usage.push('кредитах');
          if (loans.some((l) => l.bankId === bank.id && l.kind === 'installment')) usage.push('рассрочках');
          return `
        <div class="bank-directory-card" data-removable data-bank-id="${bank.id}">
          ${bank.logoDataUrl ? `<img class="bank-logo-image" src="${bank.logoDataUrl}" alt="">` : '<span class="bank-logo-slot">Лого</span>'}
          <div><b style="color:${bank.color}">${escapeHtml(bank.name)}</b><small>${usage.length ? `Используется в ${usage.join(', ')}` : 'Пока не используется'}</small></div>
          <i style="background:${bank.color}"></i>
          <div class="record-actions">
            <button type="button" data-action="edit-bank" aria-label="Редактировать">✎</button>
            <button type="button" data-action="remove-finance-item" aria-label="Удалить">×</button>
          </div>
        </div>
      `;
        })
        .join('')
    : `
      <div class="ui-state empty-state bank-empty-state">
        <b>Банков пока нет</b>
        <small>Добавьте банк, чтобы использовать его логотип и фирменный цвет в кредитах, картах и рассрочках.</small>
      </div>
    `;

  renderFunctionalIcons(directory);
}

function resetBankEditor() {
  document.querySelector('#bankEditingId').value = '';
  document.querySelector('#bankNameInput').value = 'Новый банк';
  document.querySelector('#bankColorInput').value = '#a78bfa';
  const logoInput = document.querySelector('#bankLogoInput');
  if (logoInput) logoInput.value = '';
}

async function openBankEditor(id) {
  const bank = await db.getById('banks', id);
  if (!bank) return;
  document.querySelector('#bankEditingId').value = bank.id;
  document.querySelector('#bankNameInput').value = bank.name;
  document.querySelector('#bankColorInput').value = bank.color;
  openEditorById('bankEditor', { mode: 'edit' });
}

async function saveBankDraft() {
  const name = document.querySelector('#bankNameInput')?.value.trim();
  const color = document.querySelector('#bankColorInput')?.value || '#a78bfa';
  const editingId = document.querySelector('#bankEditingId')?.value;
  const logoFile = document.querySelector('#bankLogoInput')?.files?.[0];

  if (!name) {
    showToast('error', 'Введите название банка');
    return false;
  }

  let logoDataUrl;
  if (logoFile) {
    if (logoFile.size > 500 * 1024) {
      showToast('error', 'Логотип слишком большой (максимум 500 КБ)');
      return false;
    }
    logoDataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(logoFile);
    });
  }

  if (editingId) {
    const existing = await db.getById('banks', editingId);
    await db.put('banks', { ...existing, name, color, logoDataUrl: logoDataUrl ?? existing.logoDataUrl, id: editingId });
  } else {
    await db.put('banks', { name, color, logoDataUrl });
  }
  await Promise.all([renderBanksSettings(), renderCreditsScreen(), populateCreditBankSelect()]);
  return true;
}

function renderCategoryBars(container, breakdown) {
  if (!container) return;
  if (breakdown.length === 0) {
    container.innerHTML = '<p class="muted">Пока нет операций за выбранный период.</p>';
    return;
  }
  container.innerHTML = breakdown
    .map(
      (row) => `
      <span style="--value:${row.percent}%; --tone: var(--${row.tone})">
        <i></i><em><span class="category-emoji-inline">${escapeHtml(categoryEmoji(row.icon, row.name))}</span>${escapeHtml(row.name)}</em><b class="${row.tone}">${formatRub(row.amount)} (${row.percent}%)</b>
      </span>
    `
    )
    .join('');
}

function daysBetween(fromIso, toIso) {
  const [fy, fm, fd] = fromIso.split('-').map(Number);
  const [ty, tm, td] = toIso.split('-').map(Number);
  const diff = Math.round((new Date(ty, tm - 1, td) - new Date(fy, fm - 1, fd)) / 86400000);
  return Math.max(1, diff + 1);
}

function shiftIsoDate(iso, days) {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function trendPercent(current, previous) {
  if (!(previous > 0)) return null;
  return Math.round(((current - previous) / previous) * 100);
}

function setStat(name, text) {
  const el = document.querySelector(`[data-stat="${name}"]`);
  if (el) el.textContent = text;
}

async function renderStatisticsOverview() {
  const { from, to } = getPeriodRange(currentPeriod);
  const range = from && to ? { from, to } : { from: '0000-01-01', to: '9999-12-31' };

  const [incomeBreakdown, expenseBreakdown, allTx] = await Promise.all([
    db.getCategoryBreakdown({ type: 'income', from: range.from, to: range.to }),
    db.getCategoryBreakdown({ type: 'expense', from: range.from, to: range.to }),
    db.listTransactions({ from: range.from, to: range.to }),
  ]);

  renderCategoryBars(document.querySelector('#statsIncomeBars'), incomeBreakdown);
  renderCategoryBars(document.querySelector('#statsExpenseBars'), expenseBreakdown);

  const incomeTx = allTx.filter((t) => t.type === 'income');
  const expenseTx = allTx.filter((t) => t.type === 'expense');
  const totalIncome = incomeTx.reduce((s, t) => s + t.amount, 0);
  const totalExpense = expenseTx.reduce((s, t) => s + t.amount, 0);

  const maxIncomeTx = incomeTx.slice().sort((a, b) => b.amount - a.amount)[0];
  const maxExpenseTx = expenseTx.slice().sort((a, b) => b.amount - a.amount)[0];
  const categories = await db.getAll('categories');
  const categoryName = (id) => {
    const category = categories.find((c) => c.id === id);
    return category ? `${categoryEmoji(category, category.name)} ${category.name}` : '—';
  };

  setStat('max-income-name', maxIncomeTx ? categoryName(maxIncomeTx.categoryId) : 'Нет операций');
  setStat('max-income-value', maxIncomeTx ? formatRub(maxIncomeTx.amount) : '—');
  setStat('max-income-percent', maxIncomeTx && totalIncome > 0 ? `${Math.round((maxIncomeTx.amount / totalIncome) * 100)}%` : '');

  setStat('max-expense-name', maxExpenseTx ? categoryName(maxExpenseTx.categoryId) : 'Нет операций');
  setStat('max-expense-value', maxExpenseTx ? formatRub(maxExpenseTx.amount) : '—');
  setStat('max-expense-percent', maxExpenseTx && totalExpense > 0 ? `${Math.round((maxExpenseTx.amount / totalExpense) * 100)}%` : '');

  const periodLabel = currentPeriod === 'thisMonth'
    ? new Date().toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })
    : `${formatRuDate(range.from === '0000-01-01' ? (allTx[0]?.date ?? range.from) : range.from)} – ${formatRuDate(range.to === '9999-12-31' ? new Date().toISOString().slice(0, 10) : range.to)}`;
  setStat('period-label-1', periodLabel);
  setStat('period-label-2', periodLabel);

  const days = from && to ? daysBetween(from, to) : Math.max(1, daysBetween(allTx.at(-1)?.date ?? to, to || new Date().toISOString().slice(0, 10)));
  const avgIncome = totalIncome / days;
  const avgExpense = totalExpense / days;

  let incomeTrend = null;
  let expenseTrend = null;
  if (from && to) {
    const prevTo = shiftIsoDate(from, -1);
    const prevFrom = shiftIsoDate(prevTo, -(days - 1));
    const prevTx = await db.listTransactions({ from: prevFrom, to: prevTo });
    const prevIncome = prevTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0) / days;
    const prevExpense = prevTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0) / days;
    incomeTrend = trendPercent(avgIncome, prevIncome);
    expenseTrend = trendPercent(avgExpense, prevExpense);
  }

  setStat('avg-income-value', formatRub(avgIncome));
  setStat('avg-income-trend', incomeTrend === null ? '' : `${incomeTrend > 0 ? '+' : ''}${incomeTrend}%`);
  setStat('avg-expense-value', formatRub(avgExpense));
  setStat('avg-expense-trend', expenseTrend === null ? '' : `${expenseTrend > 0 ? '+' : ''}${expenseTrend}%`);

  setStat('operations-count', String(allTx.length));

  const topIncome = incomeBreakdown[0];
  const topExpense = expenseBreakdown[0];
  setStat('top-income-category-name', topIncome?.name ?? 'Нет данных');
  setStat('top-income-category-value', topIncome ? formatRub(topIncome.amount) : '—');
  setStat('top-income-category-percent', topIncome ? `${topIncome.percent}%` : '');
  setStat('top-expense-category-name', topExpense?.name ?? 'Нет данных');
  setStat('top-expense-category-value', topExpense ? formatRub(topExpense.amount) : '—');
  setStat('top-expense-category-percent', topExpense ? `${topExpense.percent}%` : '');

  const everything = await db.listTransactions();
  const byMonth = new Map();
  everything.forEach((t) => {
    const key = t.date.slice(0, 7);
    const bucket = byMonth.get(key) ?? { income: 0, expense: 0 };
    if (t.type === 'income') bucket.income += t.amount;
    else bucket.expense += t.amount;
    byMonth.set(key, bucket);
  });

  const monthLabel = (key) => {
    const [y, m] = key.split('-').map(Number);
    const name = new Date(y, m - 1, 1).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  let bestMonth = null;
  let bestNet = -Infinity;
  let worstMonth = null;
  let worstExpense = -Infinity;
  for (const [key, bucket] of byMonth) {
    const net = bucket.income - bucket.expense;
    if (net > bestNet) {
      bestNet = net;
      bestMonth = { key, ...bucket, net };
    }
    if (bucket.expense > worstExpense) {
      worstExpense = bucket.expense;
      worstMonth = { key, ...bucket };
    }
  }

  setStat('best-month-name', bestMonth ? monthLabel(bestMonth.key) : 'Нет данных');
  setStat('best-month-value', bestMonth ? `Прибыль ${formatRub(bestMonth.net)}` : '—');
  setStat('worst-month-name', worstMonth ? monthLabel(worstMonth.key) : 'Нет данных');
  setStat('worst-month-value', worstMonth ? `Расходы ${formatRub(worstMonth.expense)}` : '—');
}

let statsOperationsFilter = 'all';
let statsOperationsSearchQuery = '';

async function renderStatisticsOperations() {
  const { from, to } = getPeriodRange(currentPeriod);
  const [transactions, categories, users] = await Promise.all([
    db.listTransactions({ from, to, type: statsOperationsFilter === 'all' ? undefined : statsOperationsFilter }),
    db.getAll('categories'),
    db.getAll('users'),
  ]);

  const list = document.querySelector('#statsHistoryList');
  const emptyState = document.querySelector('#statsHistoryEmpty');
  if (!list) return;
  list.innerHTML = '';

  if (transactions.length === 0) {
    if (emptyState) {
      emptyState.hidden = false;
      emptyState.querySelector('b').textContent = 'Операций нет';
      emptyState.querySelector('small').textContent = 'Когда за выбранный период появятся операции, они будут сгруппированы по дням.';
    }
    return;
  }
  if (emptyState) emptyState.hidden = true;

  const searchQuery = statsOperationsSearchQuery.trim().toLowerCase();
  const visibleTransactions = searchQuery
    ? transactions.filter((t) => {
        const category = categories.find((c) => c.id === t.categoryId);
        const user = users.find((u) => u.id === t.userId);
        const haystack = [
          category?.name,
          t.label,
          user?.name,
          t.comment,
          t.date,
          String(t.amount),
          t.type === 'income' ? 'доход' : 'расход',
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return haystack.includes(searchQuery);
      })
    : transactions;

  if (visibleTransactions.length === 0) {
    if (emptyState) {
      emptyState.hidden = false;
      emptyState.querySelector('b').textContent = searchQuery ? 'Ничего не найдено' : 'Операций нет';
      emptyState.querySelector('small').textContent = searchQuery
        ? `По запросу «${searchQuery}» операций не найдено.`
        : 'Когда за выбранный период появятся операции, они будут сгруппированы по дням.';
    }
    return;
  }
  if (emptyState) emptyState.hidden = true;

  const byDay = new Map();
  visibleTransactions.forEach((t) => {
    if (!byDay.has(t.date)) byDay.set(t.date, []);
    byDay.get(t.date).push(t);
  });

  [...byDay.keys()]
    .sort((a, b) => b.localeCompare(a))
    .forEach((date) => {
      const dayTx = byDay.get(date);
      const net = dayTx.reduce((s, t) => s + (t.type === 'income' ? t.amount : -t.amount), 0);
      const day = document.createElement('article');
      day.className = 'card operation-day';
      day.innerHTML = `
        <div class="operation-day-head"><h3>${formatDayHeading(date)}</h3><strong class="${net >= 0 ? 'green' : 'rose'}">${net >= 0 ? '+' : '−'}${formatRub(Math.abs(net))}</strong></div>
        ${dayTx
          .map((t) => {
            const category = categories.find((c) => c.id === t.categoryId);
            const user = users.find((u) => u.id === t.userId);
            const sign = t.type === 'income' ? '+' : '−';
            const tone = t.type === 'income' ? 'green' : 'rose';
            return `
            <div class="stats-operation operation-record" data-transaction-id="${t.id}" role="button" tabindex="0" aria-expanded="false">
              <span class="category-orb ${category?.tone ?? 'violet'}" data-emoji="${escapeHtml(categoryEmoji(category, category?.name ?? t.label))}"></span>
              <div><b>${escapeHtml(category?.name ?? t.label ?? 'Без категории')} <em class="owner-name owner-${user?.id === 'user-yulya' ? 'yulia' : 'danil'}">${escapeHtml(user?.name ?? '—')}</em></b><small>${t.type === 'income' ? 'Доход' : 'Расход'}</small></div>
              <strong class="${tone}">${sign}${formatRub(t.amount)}</strong>
              <div class="record-actions">
                <button type="button" data-action="edit-transaction" aria-label="Редактировать">✎</button>
                <button type="button" data-action="delete-transaction" aria-label="Удалить">×</button>
              </div>
            </div>
          `;
          })
          .join('')}
      `;
      list.append(day);
    });

  renderFunctionalIcons(list);
}

function formatDayHeading(isoDate) {
  const [year, month, day] = isoDate.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (isSameDate(date, today)) return 'Сегодня';
  if (isSameDate(date, yesterday)) return 'Вчера';
  return `${String(day).padStart(2, '0')}.${String(month).padStart(2, '0')}`;
}

async function renderStatisticsScreen() {
  await Promise.all([renderStatisticsOverview(), renderStatisticsOperations()]);
}

async function renderArchiveScreen() {
  const { from, to } = getPeriodRange(currentPeriod);
  const list = document.querySelector('#archiveRecordList');
  const emptyState = document.querySelector('#archiveEmptyState');
  if (!list) return;
  const ownerFilter = ownerFilterState.archive;

  const [transactions, loansAndInstallments, categories, users] = await Promise.all([
    db.listTransactions({ from, to, userId: ownerFilter !== 'all' ? ownerFilter : undefined }),
    db.getAll('loans'),
    db.getAll('categories'),
    db.getAll('users'),
  ]);

  const matchesOwner = (userId) => ownerFilter === 'all' || userId === ownerFilter;
  const matchesPeriod = (date) => (!from || date >= from) && (!to || date <= to);
  const ownerNameHtml = (userId, name) =>
    `<span class="owner-name owner-${userId === 'user-yulya' ? 'yulia' : 'danil'}">${escapeHtml(name ?? '—')}</span>`;

  const entries = [];

  transactions.forEach((t) => {
    const category = categories.find((c) => c.id === t.categoryId);
    const user = users.find((u) => u.id === t.userId);
    entries.push({
      kind: 'transaction',
      id: t.id,
      date: t.date,
      titleHtml: `<span class="category-emoji-inline">${escapeHtml(categoryEmoji(category, category?.name ?? t.label))}</span>${escapeHtml(category?.name ?? t.label ?? 'Без категории')} → ${ownerNameHtml(t.userId, user?.name)}`,
      searchText: `${category?.name ?? t.label ?? 'Без категории'} ${user?.name ?? ''}`,
      meta: `${formatRuDate(t.date).slice(0, 5)} · ${t.type === 'income' ? 'Доход' : 'Расход'} · выполнено`,
      amount: t.amount,
      tone: t.type === 'income' ? 'green' : 'rose',
      sign: t.type === 'income' ? '+' : '−',
      detail: `Категория: ${category?.name ?? '—'}. Статус: ${t.type === 'income' ? 'получено' : 'оплачено'}.`,
    });
  });

  loansAndInstallments
    .filter((l) => l.debt <= 0 && matchesOwner(l.userId) && matchesPeriod(l.nextDate))
    .forEach((l) => {
      const user = users.find((u) => u.id === l.userId);
      entries.push({
        kind: 'loan',
        id: l.id,
        date: l.nextDate,
        titleHtml: `Закрытая ${l.kind === 'installment' ? 'рассрочка' : 'кредит'} ${escapeHtml(l.title)} → ${ownerNameHtml(l.userId, user?.name)}`,
        searchText: `${l.title} ${user?.name ?? ''}`,
        meta: `${formatRuDate(l.nextDate).slice(0, 5)} · ${l.kind === 'installment' ? 'Рассрочка' : 'Кредит'} · закрыто`,
        amount: 0,
        tone: '',
        sign: '',
        detail: `Первоначальная сумма ${formatRub(l.initialAmount)}, обязательства закрыты.`,
      });
    });

  if (archiveSortMode === 'date-asc') {
    entries.sort((a, b) => a.date.localeCompare(b.date));
  } else if (archiveSortMode === 'amount-desc') {
    entries.sort((a, b) => b.amount - a.amount);
  } else {
    entries.sort((a, b) => b.date.localeCompare(a.date));
  }

  const searchQuery = archiveSearchQuery.trim().toLowerCase();
  const visibleEntries = searchQuery ? entries.filter((e) => e.searchText.toLowerCase().includes(searchQuery)) : entries;

  list.innerHTML = '';
  if (emptyState) {
    emptyState.hidden = visibleEntries.length > 0;
    if (visibleEntries.length === 0 && searchQuery) {
      emptyState.querySelector('b').textContent = 'Ничего не найдено';
      emptyState.querySelector('small').textContent = `По запросу «${searchQuery}» записей не найдено.`;
    } else {
      emptyState.querySelector('b').textContent = 'Архив пуст';
      emptyState.querySelector('small').textContent = 'Завершенные операции появятся здесь после закрытия.';
    }
  }

  visibleEntries.forEach((entry) => {
    const row = document.createElement('div');
    row.className = `record archive-record${entry.kind === 'transaction' ? ' operation-record' : ''}`;
    if (entry.kind === 'transaction') {
      row.tabIndex = 0;
      row.setAttribute('role', 'button');
      row.setAttribute('aria-expanded', 'false');
    }
    row.dataset.removable = '';
    row.dataset.archiveKind = entry.kind;
    row.dataset.archiveId = entry.id;
    row.innerHTML = `
      <div><b>${entry.titleHtml}</b><small>${entry.meta}</small></div>
      <strong class="${entry.tone}">${entry.amount > 0 ? `${entry.sign}${formatRub(entry.amount)}` : '0 ₽'}</strong>
      <div class="record-actions">
        <button type="button" data-action="edit-archive-entry" aria-label="Редактировать">✎</button>
        <button type="button" data-action="delete-archive-entry" aria-label="Удалить">×</button>
      </div>
    `;
    list.append(row);
  });

  renderFunctionalIcons(list);
}

async function renderCategoryPicker() {
  const [categories, subcategories] = await Promise.all([
    db.getAll('categories'),
    db.getAll('subcategories'),
  ]);
  const subcategoryPreview = (categoryId) =>
    subcategories
      .filter((s) => s.categoryId === categoryId)
      .map((s) => s.name)
      .join(', ');

  const buildCard = (category) => `
    <button class="category-choice-card" type="button" data-action="select-operation-category" data-category="${escapeHtml(category.name)}" data-category-icon="${escapeHtml(categoryEmoji(category, category.name))}" data-tone="${category.tone}">
      <span class="category-orb ${category.tone}" data-emoji="${escapeHtml(categoryEmoji(category, category.name))}"></span>
      <b>${escapeHtml(category.name)}</b>
      <small>${escapeHtml(subcategoryPreview(category.id))}</small>
    </button>
  `;

  const incomeCategories = categories.filter((c) => c.type === 'income');
  const expenseCategories = categories.filter((c) => c.type === 'expense');

  const frequentRow = document.querySelector('#categoryPickerFrequent');
  const incomeRow = document.querySelector('#categoryPickerIncome');
  const expenseRow = document.querySelector('#categoryPickerExpense');

  if (frequentRow) {
    frequentRow.innerHTML = [...incomeCategories.slice(0, 1), ...expenseCategories.slice(0, 1)].map(buildCard).join('');
  }
  if (incomeRow) {
    incomeRow.innerHTML = incomeCategories.length
      ? incomeCategories.map(buildCard).join('')
      : '<p class="muted">Пока нет категорий доходов — добавьте на экране «Категории».</p>';
  }
  if (expenseRow) {
    expenseRow.innerHTML = expenseCategories.length
      ? expenseCategories.map(buildCard).join('')
      : '<p class="muted">Пока нет категорий расходов — добавьте на экране «Категории».</p>';
  }

  const buildLinkedCard = (linkedType, id, label, subtitle, tone) => `
    <button class="category-choice-card" type="button" data-action="select-operation-linked" data-linked-type="${linkedType}" data-linked-id="${id}" data-linked-label="${escapeHtml(label)}" data-tone="${tone}">
      <span class="category-orb ${tone}"></span>
      <b>${escapeHtml(label)}</b>
      <small>${subtitle}</small>
    </button>
  `;

  const [goals, loansAndInstallments, creditCards, recurringPayments] = await Promise.all([
    db.getAll('goals'),
    db.getAll('loans'),
    db.getAll('creditCards'),
    db.getAll('recurringPayments'),
  ]);

  const goalsRow = document.querySelector('#categoryPickerGoals');
  const loansRow = document.querySelector('#categoryPickerLoans');
  const cardsRow = document.querySelector('#categoryPickerCreditCards');
  const recurringRow = document.querySelector('#categoryPickerRecurring');

  if (goalsRow) {
    goalsRow.innerHTML = goals.length
      ? goals.map((g) => buildLinkedCard('goal', g.id, g.title, 'Пополнение цели', 'violet')).join('')
      : '<p class="muted">Пока нет целей — добавьте на экране «Цели».</p>';
  }
  if (loansRow) {
    const openLoans = loansAndInstallments.filter((l) => l.debt > 0);
    loansRow.innerHTML = openLoans.length
      ? openLoans.map((l) => buildLinkedCard('loan', l.id, l.title, `Платёж по ${l.kind === 'installment' ? 'рассрочке' : 'кредиту'}`, 'amber')).join('')
      : '<p class="muted">Нет открытых кредитов — добавьте на экране «Кредиты».</p>';
  }
  if (cardsRow) {
    const openCards = creditCards.filter((c) => c.debt > 0);
    cardsRow.innerHTML = openCards.length
      ? openCards.map((c) => buildLinkedCard('creditCard', c.id, c.title, 'Платёж по карте', 'teal')).join('')
      : '<p class="muted">Нет карт с задолженностью.</p>';
  }
  if (recurringRow) {
    const unpaid = recurringPayments.filter((p) => !p.paidAt);
    recurringRow.innerHTML = unpaid.length
      ? unpaid.map((p) => buildLinkedCard('recurringPayment', p.id, p.title, 'Отметить оплаченным', 'rose')).join('')
      : '<p class="muted">Все обязательные платежи уже отмечены оплаченными.</p>';
  }

  renderFunctionalIcons(document.body);
}

function requestFinanceDelete(control) {
  const item = control.closest('[data-removable], .bank-directory-card');
  const name = item?.querySelector('.finance-main b, .goal-head b, .record b, .bank-directory-card b')?.textContent?.trim() || 'запись';
  const isPersisted = Boolean(item?.dataset.goalId || item?.dataset.recurringId || item?.dataset.creditCardId || item?.dataset.loanId || item?.dataset.bankId);
  openDeleteConfirm({
    title: 'Удалить запись?',
    message: isPersisted ? `«${name}» будет удалена безвозвратно.` : `«${name}» будет убрана из интерфейса.`,
    onConfirm: () => removeFinanceItem(control),
  });
}

function toIsoDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function pluralizeEvents(count) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return 'событие';
  if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return 'события';
  return 'событий';
}

/** Собирает все финансовые события за диапазон дат в один Map(дата → события[]). */
async function getEventsByDate(fromIso, toIso) {
  const [transactions, categories, recurringPayments, loansAndInstallments, users] = await Promise.all([
    db.listTransactions({ from: fromIso, to: toIso }),
    db.getAll('categories'),
    db.getAll('recurringPayments'),
    db.getAll('loans'),
    db.getAll('users'),
  ]);

  const userName = (id) => users.find((u) => u.id === id)?.name ?? '—';
  const byDate = new Map();
  const push = (date, event) => {
    if (!byDate.has(date)) byDate.set(date, []);
    byDate.get(date).push(event);
  };

  transactions.forEach((t) => {
    const sign = t.type === 'income' ? '+' : '−';
    let category = t.type === 'income' ? 'Доход' : 'Расход';
    let color = t.type === 'income' ? 'green' : 'rose';
    let title = t.label;
    let emoji = t.type === 'income' ? '💰' : '🧾';
    if (!t.linkedType) {
      const sourceCategory = categories.find((c) => c.id === t.categoryId);
      title = sourceCategory?.name ?? 'Без категории';
      emoji = categoryEmoji(sourceCategory, title);
    } else if (t.linkedType === 'goal') {
      category = 'Цель';
      color = 'violet';
      emoji = '🎯';
    } else if (t.linkedType === 'loan' || t.linkedType === 'creditCard') {
      category = 'Кредит';
      color = 'amber';
      emoji = '🏦';
    } else if (t.linkedType === 'recurringPayment') {
      category = 'Обязательный платеж';
      color = 'rose';
      emoji = '📅';
    }
    push(t.date, { title, emoji, amount: `${sign}${formatRub(t.amount)}`, owner: userName(t.userId), ownerId: t.userId, category, status: t.type === 'income' ? 'получено' : 'оплачено', color });
  });

  recurringPayments
    .filter((p) => !p.paidAt && p.nextDate >= fromIso && p.nextDate <= toIso)
    .forEach((p) =>
      push(p.nextDate, { title: p.title, amount: `−${formatRub(p.amount)}`, owner: userName(p.userId), ownerId: p.userId, category: 'Обязательный платеж', status: 'запланирован', color: 'amber' })
    );

  loansAndInstallments
    .filter((l) => l.debt > 0 && l.nextDate >= fromIso && l.nextDate <= toIso)
    .forEach((l) =>
      push(l.nextDate, { title: l.title, amount: `−${formatRub(l.payment)}`, owner: userName(l.userId), ownerId: l.userId, category: 'Кредит', status: 'запланирован', color: 'amber' })
    );

  return byDate;
}

async function renderPlannerCalendar() {
  const grid = document.querySelector('#plannerGrid');
  const titleEl = document.querySelector('#plannerMonthTitle');
  if (!grid) return;

  const year = plannerMonth.getFullYear();
  const month = plannerMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const selectedDate = new Date(`${selectedPlannerDate}T00:00:00`);
  if (selectedDate.getFullYear() !== year || selectedDate.getMonth() !== month) {
    const today = new Date();
    const nextSelected = today.getFullYear() === year && today.getMonth() === month
      ? today
      : firstDay;
    selectedPlannerDate = toIsoDate(nextSelected);
  }
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingEmptyDays = (firstDay.getDay() + 6) % 7;
  const totalCells = Math.ceil((leadingEmptyDays + daysInMonth) / 7) * 7;
  const gridStart = new Date(year, month, 1 - leadingEmptyDays);

  const lastCellDate = new Date(gridStart);
  lastCellDate.setDate(gridStart.getDate() + totalCells - 1);
  const eventsByDate = await getEventsByDate(toIsoDate(gridStart), toIsoDate(lastCellDate));

  const monthLabel = firstDay.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
  if (titleEl) titleEl.textContent = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);

  const todayIso = todayIsoDate();
  let html = '';
  for (let i = 0; i < totalCells; i += 1) {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + i);
    const iso = toIsoDate(date);
    const isMuted = date.getMonth() !== month;
    const isSelected = iso === selectedPlannerDate;
    const isToday = iso === todayIso;
    const dayEvents = eventsByDate.get(iso) || [];
    const uniqueColors = [...new Set(dayEvents.map((e) => e.color))];
    const title = `${date.getDate()} ${monthNames[date.getMonth()]}`;
    html += `<button class="planner-day${isMuted ? ' is-muted' : ''}${isSelected ? ' is-selected' : ''}${isToday ? ' is-today' : ''}" type="button" data-action="select-planner-day" data-date="${iso}" data-title="${title}"><b>${date.getDate()}</b>${uniqueColors.map((c) => `<i class="event-dot ${c}"></i>`).join('')}</button>`;
  }
  grid.innerHTML = html;
}

async function renderPlannerEvents() {
  if (!calendarEventList) return;
  const [selectedYear, selectedMonth, selectedDay] = selectedPlannerDate.split('-').map(Number);
  const selectedDate = new Date(selectedYear, selectedMonth - 1, selectedDay);
  const titleEl = document.querySelector('#calendarDayTitle');
  if (titleEl) titleEl.textContent = `${selectedDate.getDate()} ${monthNames[selectedDate.getMonth()]}`;

  const eventsByDate = await getEventsByDate(selectedPlannerDate, selectedPlannerDate);
  const events = (eventsByDate.get(selectedPlannerDate) || []).filter(
    (event) => selectedPlannerFilter === 'Все события' || event.category === selectedPlannerFilter
  );

  calendarEventCount.textContent = `${events.length} ${pluralizeEvents(events.length)}`;
  calendarEventList.innerHTML = events
    .map(
      (event) => `
      <div class="record">
        <div><b><span class="category-emoji-inline">${escapeHtml(event.emoji || '')}</span>${escapeHtml(event.title)} → ${ownerMarkup(escapeHtml(event.owner), event.ownerId)}</b><small>${event.category} · ${event.status}</small></div>
        <strong class="${event.color}">${event.amount}</strong>
      </div>
    `
    )
    .join('');
  calendarEmptyState.hidden = events.length > 0;
}

function setAnalyticsFlow(period) {
  if (!analyticsFlowTitle || !analyticsFlowChart) return;

  const allTime = period === 'Все время';
  analyticsFlowTitle.textContent = allTime ? 'Доходы и расходы по месяцам' : 'Доходы и расходы по неделям';

  analyticsFlowChart.innerHTML = allTime
    ? '<i data-tip="Май · доход 210 000 ₽" style="height:52%"></i><i class="rose-bg" data-tip="Май · расход 96 000 ₽" style="height:28%"></i><i data-tip="Июнь · доход 258 000 ₽" style="height:64%"></i><i class="rose-bg" data-tip="Июнь · расход 118 000 ₽" style="height:36%"></i><i data-tip="Июль · доход 312 000 ₽" style="height:78%"></i><i class="rose-bg" data-tip="Июль · расход 164 800 ₽" style="height:42%"></i><i data-tip="Август · доход 280 000 ₽" style="height:70%"></i><i class="rose-bg" data-tip="Август · расход 125 580 ₽" style="height:34%"></i>'
    : '<i data-tip="1 неделя · доход 74 000 ₽" style="height:52%"></i><i class="rose-bg" data-tip="1 неделя · расход 31 400 ₽" style="height:28%"></i><i data-tip="2 неделя · доход 86 000 ₽" style="height:64%"></i><i class="rose-bg" data-tip="2 неделя · расход 36 200 ₽" style="height:32%"></i><i data-tip="3 неделя · доход 69 000 ₽" style="height:48%"></i><i class="rose-bg" data-tip="3 неделя · расход 26 500 ₽" style="height:24%"></i><i data-tip="4 неделя · доход 83 000 ₽" style="height:60%"></i><i class="rose-bg" data-tip="4 неделя · расход 31 480 ₽" style="height:29%"></i>';
}

function fillChoiceMenu(menu, values, action) {
  menu.innerHTML = values
    .map((value) => `<button type="button" data-action="${action}" data-value="${value}" role="option">${value}</button>`)
    .join('');
}

function showTypeStep() {
  showOperationMain();
}

function showTransactionForm(type) {
  if (!categoryValue || !subcategoryValue || !categoryMenu || !subcategoryMenu || !sheetTypeStep || !sheetFormStep || !sheetTitle) return;
  const config = categoryMap[type];
  const categories = Object.keys(config.categories);

  currentTransactionType = type;
  sheetTitle.textContent = config.label;
  sheetTitle.className = `section-title ${config.badgeClass}`;
  categoryValue.textContent = categories[0];
  subcategoryValue.textContent = config.categories[categories[0]][0];
  fillChoiceMenu(categoryMenu, categories, 'select-category');
  fillChoiceMenu(subcategoryMenu, config.categories[categories[0]], 'select-subcategory');
  sheetTypeStep.hidden = true;
  sheetFormStep.hidden = false;
}

function applyKeypadKey(key) {
  if (!operationAmountValue) return;

  if (key === 'back') {
    operationAmount = operationAmount.length > 1 ? operationAmount.slice(0, -1) : '0';
  } else if (key === '.') {
    if (!operationAmount.includes('.')) operationAmount += '.';
  } else if (/^\d$/.test(key)) {
    operationAmount = operationAmount === '0' ? key : `${operationAmount}${key}`;
  }

  operationAmountValue.textContent = operationAmount;
}

function selectOperationCategory(control) {
  if (operationCategoryValue) operationCategoryValue.textContent = control.dataset.category;
  if (operationCategoryIcon) {
    operationCategoryIcon.className = `category-orb ${control.dataset.tone || 'rose'}`;
    operationCategoryIcon.dataset.categoryIcon = categoryEmoji(control.dataset.categoryIcon, control.dataset.category);
    setEmoji(operationCategoryIcon, operationCategoryIcon.dataset.categoryIcon);
  }
  showOperationMain();
}

const LINKED_ICONS = { goal: 'target', loan: 'landmark', creditCard: 'creditCard', recurringPayment: 'calendarClock' };
const LINKED_TONES = { goal: 'violet', loan: 'amber', creditCard: 'teal', recurringPayment: 'rose' };

/**
 * Применяет побочный эффект связанной операции: пополнение цели уменьшает
 * "нужно накопить", платёж по кредиту/карте уменьшает задолженность,
 * оплата обязательного платежа помечает его оплаченным.
 * sign = 1 — применить (операция создана), sign = -1 — откатить (операция удалена/изменена).
 */
async function applyLinkedSideEffect(linkedType, linkedId, amount, sign, date) {
  if (linkedType === 'goal') {
    const goal = await db.getById('goals', linkedId);
    if (goal) await db.put('goals', { ...goal, savedAmount: Math.max(0, goal.savedAmount + sign * amount) });
  } else if (linkedType === 'loan') {
    const loan = await db.getById('loans', linkedId);
    if (loan) await db.put('loans', { ...loan, debt: Math.max(0, loan.debt - sign * amount) });
  } else if (linkedType === 'creditCard') {
    const card = await db.getById('creditCards', linkedId);
    if (card) await db.put('creditCards', { ...card, debt: Math.max(0, card.debt - sign * amount) });
  } else if (linkedType === 'recurringPayment') {
    const payment = await db.getById('recurringPayments', linkedId);
    if (payment) await db.put('recurringPayments', { ...payment, paidAt: sign > 0 ? date : null });
  }
}

async function refreshLinkedScreens() {
  await Promise.all([renderGoalsScreen(), renderCreditsScreen(), renderRecurringScreen(), renderCategoryPicker()]);
}

function todayIsoDate() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

async function markRecurringPaid(id) {
  const payment = await db.getById('recurringPayments', id);
  if (!payment) return;
  const date = todayIsoDate();
  await db.createTransaction({
    type: 'expense',
    linkedType: 'recurringPayment',
    linkedId: id,
    label: payment.title,
    amount: payment.amount,
    date,
    userId: payment.userId,
  });
  await applyLinkedSideEffect('recurringPayment', id, payment.amount, 1, date);
  showToast('success', `«${payment.title}» отмечен оплаченным`);
  await Promise.all([refreshLinkedScreens(), refreshDashboard(), renderTransactionScreen('income'), renderTransactionScreen('expense'), renderStatisticsScreen(), renderArchiveScreen()]);
}

async function makeQuickDebtPayment(kind, id) {
  const store = kind === 'card' ? 'creditCards' : 'loans';
  const record = await db.getById(store, id);
  if (!record) return;
  const amount = Math.min(kind === 'card' ? record.minPayment : record.payment, record.debt);
  if (!(amount > 0)) {
    showToast('error', 'Задолженность уже погашена');
    return;
  }
  const date = todayIsoDate();
  const linkedType = kind === 'card' ? 'creditCard' : 'loan';
  await db.createTransaction({
    type: 'expense',
    linkedType,
    linkedId: id,
    label: record.title,
    amount,
    date,
    userId: record.userId,
  });
  await applyLinkedSideEffect(linkedType, id, amount, 1, date);
  showToast('success', `Платёж по «${record.title}» на ${formatRub(amount)} внесён`);
  await Promise.all([refreshLinkedScreens(), refreshDashboard(), renderTransactionScreen('income'), renderTransactionScreen('expense'), renderStatisticsScreen(), renderArchiveScreen()]);
}

function selectOperationLinkedItem(control) {
  pendingOperationCategory = {
    linkedType: control.dataset.linkedType,
    linkedId: control.dataset.linkedId,
    label: control.dataset.linkedLabel,
    tone: control.dataset.tone || 'violet',
    icon: LINKED_ICONS[control.dataset.linkedType] || 'tag',
  };
  applyOperationCategorySelection(pendingOperationCategory);
}

function selectOperationCategoryWithSubcategories(control) {
  const subcategories = getOperationSubcategories(control);
  pendingOperationCategory = {
    category: control.dataset.category,
    tone: control.dataset.tone || 'rose',
    icon: categoryEmoji(control.dataset.categoryIcon, control.dataset.category),
  };

  if (subcategories.length) {
    const popup = ensureOperationSubcategoryPopup();
    const title = popup.querySelector('[data-subcategory-title]');
    const list = popup.querySelector('[data-subcategory-list]');
    if (title) title.textContent = pendingOperationCategory.category;
    if (list) {
      list.innerHTML = '';
      subcategories.forEach((subcategory) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.dataset.action = 'select-operation-subcategory';
        button.dataset.subcategory = subcategory;
        button.innerHTML = `<span>${subcategory}</span><i>${icon('chevronRight')}</i>`;
        list.append(button);
      });
    }
    popup.hidden = false;
    return;
  }

  applyOperationCategorySelection(pendingOperationCategory);
}

function applyOperationCategorySelection(categoryData, subcategory = '') {
  if (!categoryData) return;
  categoryData.subcategory = subcategory;
  const name = categoryData.category || categoryData.label;
  const label = subcategory ? `${name} · ${subcategory}` : name;
  if (operationCategoryValue) operationCategoryValue.textContent = label;
  if (operationCategoryIcon) {
    operationCategoryIcon.className = `category-orb ${categoryData.tone}`;
    operationCategoryIcon.dataset.categoryIcon = categoryData.icon;
    setEmoji(operationCategoryIcon, categoryData.icon);
  }
  closeOperationSubcategories();
  showOperationMain();
}

function escapeHtml(value) {
  const div = document.createElement('div');
  div.textContent = value ?? '';
  return div.innerHTML;
}

function formatRub(value) {
  return `${Math.round(value).toLocaleString('ru-RU')} ₽`;
}

function formatRelativeShortDate(isoDate) {
  const [year, month, day] = isoDate.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (isSameDate(date, today)) return 'сегодня';
  if (isSameDate(date, yesterday)) return 'вчера';
  return `${String(day).padStart(2, '0')}.${String(month).padStart(2, '0')}`;
}

let currentPeriod = 'thisMonth';

function getPeriodRange(period, base = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  switch (period) {
    case 'custom': {
      if (!customRangeStart || !customRangeEnd) return { from: undefined, to: undefined };
      return { from: toISO(customRangeStart), to: toISO(customRangeEnd) };
    }
    case 'today': {
      const iso = toISO(base);
      return { from: iso, to: iso };
    }
    case 'yesterday': {
      const y = new Date(base);
      y.setDate(base.getDate() - 1);
      const iso = toISO(y);
      return { from: iso, to: iso };
    }
    case '7d': {
      const start = new Date(base);
      start.setDate(base.getDate() - 6);
      return { from: toISO(start), to: toISO(base) };
    }
    case '30d': {
      const start = new Date(base);
      start.setDate(base.getDate() - 29);
      return { from: toISO(start), to: toISO(base) };
    }
    case 'all':
      return { from: undefined, to: undefined };
    case 'thisMonth':
    default: {
      const start = new Date(base.getFullYear(), base.getMonth(), 1);
      return { from: toISO(start), to: toISO(base) };
    }
  }
}

/** Переключает период везде и перерисовывает все зависимые от него экраны. */
async function setPeriod(period) {
  currentPeriod = period;
  document.querySelectorAll('.date-range').forEach((group) => {
    group.querySelectorAll('button[data-period]').forEach((button) => {
      button.classList.toggle('is-active', button.dataset.period === period);
    });
  });
  document.querySelectorAll('[data-action="toggle-range-calendar"], [data-action="toggle-page-range-calendar"]').forEach((button) => {
    button.textContent = 'Свой период';
  });
  await Promise.all([
    refreshDashboardSummary(),
    renderTransactionScreen('income'),
    renderTransactionScreen('expense'),
    renderCategoriesScreen(),
    renderCategoryPicker(),
    renderStatisticsScreen(),
    renderArchiveScreen(),
    renderPlannerCalendar(),
    renderPlannerEvents(),
  ]);
}

/** Применяет выбранный в календаре произвольный диапазон дат как активный период — везде. */
async function applyCustomPeriod(start, end) {
  customRangeStart = start;
  customRangeEnd = end;
  currentPeriod = 'custom';

  const pad = (n) => String(n).padStart(2, '0');
  const label = `${start.getDate()}.${pad(start.getMonth() + 1)}–${end.getDate()}.${pad(end.getMonth() + 1)}`;
  document.querySelectorAll('[data-action="toggle-range-calendar"], [data-action="toggle-page-range-calendar"]').forEach((button) => {
    button.textContent = label;
  });
  document.querySelectorAll('.date-range button[data-period]').forEach((button) => {
    button.classList.remove('is-active');
  });

  await Promise.all([
    refreshDashboardSummary(),
    renderTransactionScreen('income'),
    renderTransactionScreen('expense'),
    renderCategoriesScreen(),
    renderCategoryPicker(),
    renderStatisticsScreen(),
    renderArchiveScreen(),
    renderPlannerCalendar(),
    renderPlannerEvents(),
  ]);
}

async function saveOperation() {
  const amount = parseFloat(operationAmount.replace(',', '.'));
  if (!pendingOperationCategory) {
    showToast('error', 'Выберите категорию');
    return;
  }
  if (!(amount > 0)) {
    showToast('error', 'Введите сумму больше нуля');
    return;
  }

  const ownerInput = document.querySelector('input[name="owner"]:checked');
  const userId = ownerInput?.value || 'user-danil';
  const comment = operationCommentValue?.textContent !== 'Добавить' ? operationCommentValue.textContent : undefined;
  const date = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;

  let payload;
  if (pendingOperationCategory.linkedType) {
    payload = {
      type: 'expense',
      linkedType: pendingOperationCategory.linkedType,
      linkedId: pendingOperationCategory.linkedId,
      label: pendingOperationCategory.label,
      amount,
      date,
      userId,
      comment,
    };
  } else {
    const categories = await db.getAll('categories');
    const category = categories.find((c) => c.name === pendingOperationCategory.category);
    if (!category) {
      showToast('error', 'Категория не найдена. Сначала добавьте её в разделе «Категории».');
      return;
    }
    let subcategoryId;
    if (pendingOperationCategory.subcategory) {
      const subcategories = await db.queryByIndex('subcategories', 'by_category', category.id);
      subcategoryId = subcategories.find((s) => s.name === pendingOperationCategory.subcategory)?.id;
    }
    payload = { type: category.type, categoryId: category.id, subcategoryId, amount, date, userId, comment };
  }

  if (editingTransactionId) {
    const previous = await db.getById('transactions', editingTransactionId);
    if (previous?.linkedType) await applyLinkedSideEffect(previous.linkedType, previous.linkedId, previous.amount, -1, previous.date);
    await db.updateTransaction(editingTransactionId, payload);
  } else {
    await db.createTransaction(payload);
  }
  if (payload.linkedType) await applyLinkedSideEffect(payload.linkedType, payload.linkedId, amount, 1, date);
  editingTransactionId = null;

  closeSheet();
  showToast('success', 'Операция сохранена');
  await Promise.all([
    refreshDashboard(),
    renderTransactionScreen('income'),
    renderTransactionScreen('expense'),
    renderCategoriesScreen(),
    renderCategoryPicker(),
    renderStatisticsScreen(),
    renderArchiveScreen(),
    renderPlannerCalendar(),
    renderPlannerEvents(),
    refreshLinkedScreens(),
  ]);
}

/** Перечитывает баланс/доходы/расходы из БД и обновляет карточки на Главной. */
async function refreshDashboardSummary() {
  const { from, to } = getPeriodRange(currentPeriod);
  const summary = await db.getSummary({ from, to });

  const balanceEl = document.querySelector('[data-summary="balance"]');
  const incomeEl = document.querySelector('[data-summary="income"]');
  const expenseEl = document.querySelector('[data-summary="expense"]');
  const freeEl = document.querySelector('[data-summary="free"]');
  if (balanceEl) balanceEl.textContent = formatRub(summary.balance);
  if (incomeEl) incomeEl.textContent = formatRub(summary.income);
  if (expenseEl) expenseEl.textContent = formatRub(summary.expense);
  if (freeEl) freeEl.textContent = formatRub(summary.free);
}

/** Рендерит блок «Последние операции» на Главной из реальных данных IndexedDB. */
async function renderRecentOperations(limit = 3) {
  const card = document.querySelector('#recentOperationsCard');
  if (!card) return;

  const [transactions, categories, users] = await Promise.all([
    db.listTransactions(),
    db.getAll('categories'),
    db.getAll('users'),
  ]);

  const emptyState = card.querySelector('.operations-empty');
  card.querySelectorAll('[data-operation-row]').forEach((row) => row.remove());

  if (transactions.length === 0) {
    if (emptyState) emptyState.hidden = false;
    return;
  }
  if (emptyState) emptyState.hidden = true;

  const template = card.querySelector('[data-operation-template]');
  const fragment = document.createDocumentFragment();

  transactions.slice(0, limit).forEach((transaction) => {
    const category = categories.find((c) => c.id === transaction.categoryId);
    const user = users.find((u) => u.id === transaction.userId);
    const isIncome = transaction.type === 'income';
    const sign = isIncome ? '+' : '−';
    const toneClass = isIncome ? 'green' : 'rose';

    const row = document.createElement('div');
    row.className = 'operation';
    row.dataset.operationRow = '';
    row.innerHTML = `
      <span><span class="operation-title"><span class="category-emoji-inline">${escapeHtml(categoryEmoji(category, category?.name ?? transaction.label))}</span>${escapeHtml(category?.name ?? transaction.label ?? 'Без категории')} → <span class="owner-name owner-${user?.id === 'user-yulya' ? 'yulia' : 'danil'}">${escapeHtml(user?.name ?? '—')}</span></span><strong class="${toneClass}">${sign}${formatRub(transaction.amount)}</strong></span>
      <small>${formatRelativeShortDate(transaction.date)}</small>
    `;
    fragment.append(row);
  });

  template?.before(fragment);
}

async function refreshDashboard() {
  await Promise.all([
    refreshDashboardSummary(),
    renderRecentOperations(),
    renderDashboardInsights(),
    renderUpcomingPayments(),
    renderDashboardReminders(),
  ]);
}

function pluralizePayments(count) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return 'обязательный платёж';
  if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return 'обязательных платежа';
  return 'обязательных платежей';
}

async function renderUpcomingPayments() {
  const list = document.querySelector('#upcomingPaymentsList');
  const emptyState = document.querySelector('#upcomingPaymentsEmpty');
  if (!list) return;

  const [recurringPayments, loansAndInstallments, creditCards] = await Promise.all([
    db.getAll('recurringPayments'),
    db.getAll('loans'),
    db.getAll('creditCards'),
  ]);

  const now = new Date();
  const todayIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const in14Days = shiftIsoDate(todayIso, 14);
  const items = [
    ...recurringPayments.filter((p) => !p.paidAt).map((p) => ({ title: p.title, amount: p.amount, date: p.nextDate, owner: p.userId })),
    ...loansAndInstallments.filter((l) => l.debt > 0).map((l) => ({ title: l.title, amount: l.payment, date: l.nextDate, owner: l.userId })),
    ...creditCards.filter((c) => c.debt > 0).map((c) => ({ title: c.title, amount: c.minPayment, date: c.nextDate, owner: c.userId })),
  ]
    .filter((item) => item.date >= todayIso && item.date <= in14Days)
    .sort((a, b) => a.date.localeCompare(b.date));

  const users = await db.getAll('users');
  const userName = (id) => users.find((u) => u.id === id)?.name ?? '—';

  list.innerHTML = '';
  if (emptyState) emptyState.hidden = items.length > 0;

  items.slice(0, 4).forEach((item) => {
    const status = db.getRecurringPaymentStatus({ nextDate: item.date, paidAt: null });
    const urgencyClass = status === 'overdue' || status === 'urgent' ? 'is-urgent' : status === 'soon' ? 'is-warning' : '';
    const urgencyTone = status === 'overdue' || status === 'urgent' ? 'rose' : status === 'soon' ? 'amber' : 'neutral';
    const row = document.createElement('div');
    row.className = `payment${urgencyClass ? ` ${urgencyClass}` : ''}`;
    row.innerHTML = `<span>${escapeHtml(item.title)}</span><b>${formatRub(item.amount)}</b><small><span class="payment-date-mark ${urgencyTone}">${formatRelativeShortDate(item.date)}</span> · ${ownerMarkup(escapeHtml(userName(item.owner)), item.owner)}</small>`;
    list.append(row);
  });
}

async function renderDashboardReminders() {
  const list = document.querySelector('#dashboardRemindersList');
  const emptyState = document.querySelector('#dashboardRemindersEmpty');
  if (!list) return;

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const from = `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, '0')}-01`;
  const to = `${monthEnd.getFullYear()}-${String(monthEnd.getMonth() + 1).padStart(2, '0')}-${String(monthEnd.getDate()).padStart(2, '0')}`;

  const reminders = (await db.getAll('reminders'))
    .filter((r) => !r.completed && r.nextDate >= from && r.nextDate <= to)
    .sort((a, b) => a.nextDate.localeCompare(b.nextDate))
    .slice(0, 4);

  list.innerHTML = '';
  if (emptyState) emptyState.hidden = reminders.length > 0;

  reminders.forEach((reminder) => {
    const status = db.getRecurringPaymentStatus({ nextDate: reminder.nextDate, paidAt: null }, now);
    const urgencyClass = status === 'overdue' || status === 'urgent' ? 'is-urgent' : status === 'soon' ? 'is-warning' : '';
    const urgencyTone = status === 'overdue' || status === 'urgent' ? 'rose' : status === 'soon' ? 'amber' : 'neutral';
    const row = document.createElement('div');
    row.className = `payment${urgencyClass ? ` ${urgencyClass}` : ''}`;
    row.innerHTML = `<span>${escapeHtml(reminder.title)}</span><b class="${urgencyTone}">${formatRuDate(reminder.nextDate).slice(0, 5)}</b><small>${reminderRepeatLabel(reminder)} · ${reminderAssigneeMarkup(reminder.assignee)}</small>`;
    list.append(row);
  });
}

async function renderDashboardInsights() {
  const [upcomingEnabled, topCategoryEnabled] = await Promise.all([
    db.getSetting('insight-upcoming', true),
    db.getSetting('insight-topCategory', true),
  ]);

  const upcomingToggle = document.querySelector('#insightToggleUpcoming');
  const topCategoryToggle = document.querySelector('#insightToggleTopCategory');
  if (upcomingToggle) upcomingToggle.checked = upcomingEnabled;
  if (topCategoryToggle) topCategoryToggle.checked = topCategoryEnabled;

  const upcomingSlide = document.querySelector('[data-insight-key="upcoming"]');
  const topCategorySlide = document.querySelector('[data-insight-key="topCategory"]');
  const widget = document.querySelector('[data-insights-slider]');
  if (widget) widget.hidden = !upcomingEnabled && !topCategoryEnabled;
  if (upcomingSlide) upcomingSlide.hidden = !upcomingEnabled;
  if (topCategorySlide) topCategorySlide.hidden = !topCategoryEnabled;

  const now = new Date();
  const monthFrom = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  const monthLastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const monthTo = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(monthLastDay).padStart(2, '0')}`;
  const todayIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const in14Days = shiftIsoDate(todayIso, 14);

  if (upcomingEnabled) {
    const payments = await db.getAll('recurringPayments');
    const dueThisMonth = payments.filter((p) => !p.paidAt && p.nextDate >= monthFrom && p.nextDate <= monthTo);
    const dueSoon = dueThisMonth.filter((p) => p.nextDate >= todayIso && p.nextDate <= in14Days);
    const totalDue = dueThisMonth.reduce((s, p) => s + p.amount, 0);
    const totalSoon = dueSoon.reduce((s, p) => s + p.amount, 0);

    const upcomingTotalEl = document.querySelector('[data-insight="upcoming-total"]');
    const upcomingCountEl = document.querySelector('[data-insight="upcoming-count"]');
    const upcomingSoonEl = document.querySelector('[data-insight="upcoming-soon"]');
    if (upcomingTotalEl) upcomingTotalEl.textContent = formatRub(totalDue);
    if (upcomingCountEl) upcomingCountEl.textContent = `${dueThisMonth.length} ${pluralizePayments(dueThisMonth.length)} в этом месяце`;
    if (upcomingSoonEl) upcomingSoonEl.textContent = `В ближайшие 2 недели: ${formatRub(totalSoon)}`;
  }

  if (topCategoryEnabled) {
    const expenseBreakdown = await db.getCategoryBreakdown({ type: 'expense', from: monthFrom, to: monthTo });
    const top = expenseBreakdown[0];
    const topAmountEl = document.querySelector('[data-insight="top-category-amount"]');
    const topPercentEl = document.querySelector('[data-insight="top-category-percent"]');
    const topNameEl = document.querySelector('[data-insight="top-category-name"]');
    if (topAmountEl) topAmountEl.textContent = top ? formatRub(top.amount) : '0 ₽';
    if (topPercentEl) topPercentEl.textContent = top ? `${top.percent}% всех расходов` : 'Пока нет расходов в этом месяце';
    if (topNameEl) topNameEl.textContent = top ? `${categoryEmoji(top.icon, top.name)} ${top.name}` : '—';
  }

  const badge = document.querySelector('#insightsActiveBadge');
  if (badge) badge.textContent = `${[upcomingEnabled, topCategoryEnabled].filter(Boolean).length} активных`;

  updateInsightState(0);
}

/**
 * Рендерит экран "Доходы" или "Расходы" из реальных данных: сводку,
 * разбивку по категориям и список операций. Общая функция для обоих
 * экранов — у них идентичная структура, отличается только type/tone.
 */
let incomesSearchQuery = '';
let expensesSearchQuery = '';
let archiveSearchQuery = '';
let categoryPickerSearchQuery = '';
const ownerFilterState = { income: 'all', expense: 'all', archive: 'all' };
const OWNER_FILTER_CYCLE = ['all', 'user-danil', 'user-yulya'];
const OWNER_FILTER_LABELS = { all: 'Все', 'user-danil': 'Данил', 'user-yulya': 'Юля' };
let archiveSortMode = 'date-desc';

async function ownerFilterLabel(value) {
  if (value === 'all') return 'Все';
  const user = await db.getById('users', value);
  return user?.name || OWNER_FILTER_LABELS[value] || value;
}

async function renderOwnerControls() {
  const users = await db.getAll('users');
  const optionMarkup = users.map((user) => `<option value="${user.id}">${escapeHtml(user.name)}</option>`).join('');
  ['#creditOwnerSelect', '#recurringOwnerSelect'].forEach((selector) => {
    const select = document.querySelector(selector);
    if (!select) return;
    const current = select.value || users[0]?.id;
    select.innerHTML = optionMarkup;
    select.value = users.some((user) => user.id === current) ? current : users[0]?.id || '';
    refreshCustomSelectOptions(select);
  });

  const reminderSelect = document.querySelector('#reminderAssigneeSelect');
  if (reminderSelect) {
    const current = reminderSelect.value || 'both';
    reminderSelect.innerHTML = `${optionMarkup}<option value="both">Оба</option>`;
    reminderSelect.value = current === 'both' || users.some((user) => user.id === current) ? current : 'both';
    refreshCustomSelectOptions(reminderSelect);
  }

  const ownerToggle = document.querySelector('.operation-owner-toggle');
  if (ownerToggle && users.length > 0) {
    const checked = ownerToggle.querySelector('input:checked')?.value || users[0].id;
    ownerToggle.innerHTML = users
      .map((user, index) => {
        const ownerClass = user.id === 'user-yulya' ? 'owner-yulia' : 'owner-danil';
        const isChecked = checked === user.id || (!users.some((item) => item.id === checked) && index === 0);
        return `<label><input type="radio" name="owner" value="${user.id}" ${isChecked ? 'checked' : ''}><span class="owner-name ${ownerClass}">${escapeHtml(user.name)}</span></label>`;
      })
      .join('');
  }
  setOwnerColors(document.body);
}

async function renderTransactionScreen(type) {
  const tone = type === 'income' ? 'green' : 'rose';
  const { from, to } = getPeriodRange(currentPeriod);
  const ownerFilter = ownerFilterState[type];
  const userIdFilter = ownerFilter !== 'all' ? ownerFilter : undefined;

  const [transactions, breakdown, users] = await Promise.all([
    db.listTransactions({ type, from, to, userId: userIdFilter }),
    db.getCategoryBreakdown({ type, from, to, userId: userIdFilter }),
    db.getAll('users'),
  ]);

  const total = transactions.reduce((sum, t) => sum + t.amount, 0);

  const totalEl = document.querySelector(`[data-page-total="${type}"]`);
  if (totalEl) totalEl.textContent = formatRub(total);

  const topCategory = breakdown[0];
  const topNameEl = document.querySelector(`[data-top-category-name="${type}"]`);
  const topDetailEl = document.querySelector(`[data-top-category-detail="${type}"]`);
  if (topNameEl) topNameEl.textContent = topCategory ? `${categoryEmoji(topCategory.icon, topCategory.name)} ${topCategory.name}` : '—';
  if (topDetailEl) {
    topDetailEl.textContent = topCategory
      ? `${topCategory.percent}% всех ${type === 'income' ? 'поступлений' : 'расходов'}`
      : 'Пока нет операций за период';
  }

  const rowsContainer = document.querySelector(`[data-category-rows="${type}"]`);
  if (rowsContainer) {
    rowsContainer.innerHTML = '';
    if (breakdown.length === 0) {
      rowsContainer.innerHTML = '<p class="muted">Пока нет операций за выбранный период.</p>';
    }
    breakdown.forEach((row) => {
      const el = document.createElement('div');
      el.className = 'category-row';
      el.innerHTML = `
        <div><b><span class="category-emoji-inline">${escapeHtml(categoryEmoji(row.icon, row.name))}</span>${escapeHtml(row.name)}</b><small>${row.count} ${pluralizeOperations(row.count)}</small></div>
        <strong>${formatRub(row.amount)}</strong>
        <span class="meter${type === 'expense' ? ' rose-meter' : ''}"><i style="width:${row.percent}%"></i></span>
      `;
      rowsContainer.append(el);
    });
  }

  const listContainer = document.querySelector(`[data-record-list="${type}"]`);
  const emptyState = document.querySelector(`[data-empty-state="${type}"]`);
  const searchQuery = (type === 'income' ? incomesSearchQuery : expensesSearchQuery).trim().toLowerCase();
  const visibleTransactions = searchQuery
    ? transactions.filter((t) => {
        const category = breakdown.find((b) => b.categoryId === t.categoryId);
        const user = users.find((u) => u.id === t.userId);
        const haystack = [category?.name, t.label, user?.name, t.comment].filter(Boolean).join(' ').toLowerCase();
        return haystack.includes(searchQuery);
      })
    : transactions;

  if (listContainer) {
    listContainer.innerHTML = '';
    if (emptyState) {
      emptyState.hidden = visibleTransactions.length > 0;
      if (visibleTransactions.length === 0 && searchQuery) {
        emptyState.querySelector('b').textContent = 'Ничего не найдено';
        emptyState.querySelector('small').textContent = `По запросу «${searchQuery}» операций не найдено.`;
      } else {
        emptyState.querySelector('b').textContent = type === 'income' ? 'Доходов пока нет' : 'Расходов пока нет';
        emptyState.querySelector('small').textContent = 'Когда за выбранный период появятся операции, они будут отображаться здесь.';
      }
    }
    visibleTransactions.forEach((transaction) => {
      const category = breakdown.find((b) => b.categoryId === transaction.categoryId);
      const user = users.find((u) => u.id === transaction.userId);
      const sign = type === 'income' ? '+' : '−';
      const el = document.createElement('div');
      el.className = 'record operation-record';
      el.tabIndex = 0;
      el.setAttribute('role', 'button');
      el.setAttribute('aria-expanded', 'false');
      el.dataset.transactionId = transaction.id;
      el.innerHTML = `
        <div><b><span class="category-emoji-inline">${escapeHtml(categoryEmoji(category?.icon, category?.name ?? transaction.label))}</span>${escapeHtml(category?.name ?? transaction.label ?? 'Без категории')} → <span class="owner-name owner-${user?.id === 'user-yulya' ? 'yulia' : 'danil'}">${escapeHtml(user?.name ?? '—')}</span></b><small>${formatRelativeShortDate(transaction.date)}</small></div>
        <strong class="${tone}">${sign}${formatRub(transaction.amount)}</strong>
        <div class="record-actions">
          <button type="button" aria-label="Редактировать" data-action="edit-transaction">✎</button>
          <button type="button" aria-label="Удалить" data-action="delete-transaction">×</button>
        </div>
      `;
      listContainer.append(el);
    });
  }

  renderFunctionalIcons(document.body);
}

function pluralizeOperations(count) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return 'операция';
  if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return 'операции';
  return 'операций';
}

function requestTransactionDelete(control) {
  const row = control.closest('[data-transaction-id]');
  const id = row?.dataset.transactionId;
  if (!id) return;
  const name = row.querySelector('b')?.textContent?.trim() || 'операция';
  openDeleteConfirm({
    title: 'Удалить операцию?',
    message: `«${name}» будет удалена без возможности восстановления.`,
    onConfirm: () => deleteTransactionAndRefresh(id),
  });
}

async function deleteTransactionAndRefresh(id) {
  const transaction = await db.getById('transactions', id);
  await db.deleteTransaction(id);
  if (transaction?.linkedType) {
    await applyLinkedSideEffect(transaction.linkedType, transaction.linkedId, transaction.amount, -1, transaction.date);
  }
  await Promise.all([
    renderTransactionScreen('income'),
    renderTransactionScreen('expense'),
    renderCategoriesScreen(),
    renderCategoryPicker(),
    renderStatisticsScreen(),
    renderArchiveScreen(),
    renderPlannerCalendar(),
    renderPlannerEvents(),
    refreshDashboard(),
    refreshLinkedScreens(),
  ]);
}

/**
 * Рендерит панели категорий (Доходы/Расходы) на экране "Категории":
 * карточка категории + список подкатегорий из реальных транзакций.
 * Сохраняет структуру "category-card сразу за ним subcategory-list",
 * от которой зависит toggle-category (раскрытие списка подкатегорий).
 */
async function renderCategoriesScreen() {
  const { from, to } = getPeriodRange(currentPeriod);

  for (const type of ['income', 'expense']) {
    const panel = document.querySelector(`[data-category-panel="${type}"]`);
    if (!panel) continue;

    const [allCategories, breakdown, allSubcategories, transactions] = await Promise.all([
      db.getAll('categories'),
      db.getCategoryBreakdown({ type, from, to }),
      db.getAll('subcategories'),
      db.listTransactions({ type, from, to }),
    ]);

    const categoriesOfType = allCategories.filter((c) => c.type === type);
    const total = breakdown.reduce((sum, row) => sum + row.amount, 0);
    const badge = panel.querySelector('.badge');
    if (badge) badge.textContent = formatRub(total);

    panel.querySelectorAll('.category-card, .subcategory-list, .categories-empty-message').forEach((el) => el.remove());

    if (categoriesOfType.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'muted categories-empty-message';
      empty.textContent = 'Категорий пока нет. Создайте первую через форму выше.';
      panel.append(empty);
      continue;
    }

    categoriesOfType
      .slice()
      .sort((a, b) => (breakdown.find((r) => r.categoryId === b.id)?.amount ?? 0) - (breakdown.find((r) => r.categoryId === a.id)?.amount ?? 0))
      .forEach((category) => {
        const row = breakdown.find((r) => r.categoryId === category.id);
        const amount = row?.amount ?? 0;
        const count = row?.count ?? 0;
        const percent = row?.percent ?? 0;

        const subcategoriesForCategory = allSubcategories.filter((s) => s.categoryId === category.id);
        const subRows = subcategoriesForCategory.map((sub) => {
          const subAmount = transactions
            .filter((t) => t.subcategoryId === sub.id)
            .reduce((sum, t) => sum + t.amount, 0);
          return { sub, amount: subAmount };
        });

        const card = document.createElement('div');
        card.className = 'category-card';
        card.dataset.categoryId = category.id;
        card.dataset.categoryName = category.name;
        card.dataset.categoryIcon = categoryEmoji(category, category.name);
        card.innerHTML = `
          <span class="category-icon ${category.tone}"></span>
          <button class="category-summary" type="button" data-action="toggle-category"><b>${escapeHtml(category.name)}</b><small>${count} ${pluralizeOperations(count)} · ${percent}%</small></button>
          <strong>${formatRub(amount)}</strong>
          <span class="meter${type === 'expense' ? ' rose-meter' : ''}"><i style="width:${percent}%"></i></span>
          <div class="record-actions category-actions">
            <button type="button" data-action="edit-category" aria-label="Редактировать">✎</button>
            <button type="button" data-action="delete-category" aria-label="Удалить">×</button>
          </div>
        `;
        panel.append(card);

        const subList = document.createElement('div');
        subList.className = 'subcategory-list';
        subList.hidden = true;
        subList.innerHTML = subRows
          .map(
            ({ sub, amount: subAmount }) => `
          <div data-subcategory-id="${sub.id}"><span>${escapeHtml(sub.name)}</span><b>${formatRub(subAmount)}</b><button type="button" data-action="edit-subcategory">✎</button><button type="button" data-action="delete-subcategory">×</button></div>
        `
          )
          .join('');
        panel.append(subList);
      });
  }

  renderFunctionalIcons(document.body);
}

document.addEventListener('click', async (event) => {
  const operationRecord = event.target.closest('.operation-record');
  if (operationRecord && !event.target.closest('button, a, input, label, textarea, select')) {
    toggleOperationRecordActions(operationRecord);
    return;
  }

  const control = event.target.closest('[data-action]');
  if (!control) return;
  event.preventDefault();

  const action = control.dataset.action;
  if (['select-calendar-date', 'select-range-calendar-date', 'select-page-range-date'].includes(action)) {
    event.stopImmediatePropagation();
  }
  if (action === 'dashboard') showScreen('dashboard');
  if (action === 'more') showScreen('more');
  if (action === 'show-screen') showScreen(control.dataset.screen);
  if (action === 'show-stats-operations') {
    showScreen('analytics');
    showStatsTab('operations');
  }
  if (action === 'stats-tab') showStatsTab(control.dataset.tab);
  if (action === 'insight-prev') moveInsightSlide(-1);
  if (action === 'insight-next') moveInsightSlide(1);
  if (action === 'insight-dot') setInsightSlide(Number(control.dataset.index || 0));
  if (action === 'calendar-mode') {
    control.closest('.segmented')?.querySelectorAll('input').forEach((input) => {
      input.checked = input.closest('[data-mode]') === control;
    });
  }
  if (action === 'planner-prev') {
    plannerMonth = new Date(plannerMonth.getFullYear(), plannerMonth.getMonth() - 1, 1);
    await renderPlannerCalendar();
    await renderPlannerEvents();
  }
  if (action === 'planner-next') {
    plannerMonth = new Date(plannerMonth.getFullYear(), plannerMonth.getMonth() + 1, 1);
    await renderPlannerCalendar();
    await renderPlannerEvents();
  }
  if (action === 'select-planner-day') {
    document.querySelectorAll('.planner-day.is-selected').forEach((day) => day.classList.remove('is-selected'));
    control.classList.add('is-selected');
    selectedPlannerDate = control.dataset.date;
    document.querySelector('#calendarDayTitle').textContent = control.dataset.title;
    renderPlannerEvents();
  }
  if (action === 'select-calendar-event-filter') {
    selectedPlannerFilter = control.dataset.value;
    calendarEventFilterValue.textContent = selectedPlannerFilter;
    closeChoiceMenus();
    renderPlannerEvents();
  }
  if (action === 'toggle-editor') {
    if (control.dataset.target === 'goalsEditor') resetGoalEditor();
    if (control.dataset.target === 'recurringEditor') resetRecurringEditor();
    if (control.dataset.target === 'creditsEditor') resetCreditEditor();
    if (control.dataset.target === 'bankEditor') resetBankEditor();
    if (control.dataset.target === 'reminderEditor') resetReminderEditor();
    openEditorById(control.dataset.target, { mode: 'create' });
  }
  if (action === 'toggle-detail') {
    const details = control.closest('.finance-card, .archive-record, .goal-card')?.querySelector('.finance-detail');
    if (details) details.hidden = !details.hidden;
  }
  if (action === 'toggle-goal-actions') {
    const card = control.closest('.goal-card');
    const actions = card?.querySelector('.goal-control-cell');
    if (actions) {
      actions.hidden = !actions.hidden;
      card.classList.toggle('is-actions-open', !actions.hidden);
      control.setAttribute('aria-expanded', String(!actions.hidden));
    }
  }
  if (action === 'remove-finance-item') requestFinanceDelete(control);
  if (action === 'delete-transaction') requestTransactionDelete(control);
  if (action === 'edit-transaction') {
    const id = control.closest('[data-transaction-id]')?.dataset.transactionId;
    if (id) db.getById('transactions', id).then((transaction) => transaction && openSheet(transaction));
  }
  if (action === 'edit-record') openRecordEditor(control);
  if (action === 'edit-goal') {
    const goalId = control.closest('[data-goal-id]')?.dataset.goalId;
    if (goalId) openGoalEditor(goalId);
  }
  if (action === 'edit-archive-entry') {
    const row = control.closest('[data-archive-kind]');
    const kind = row?.dataset.archiveKind;
    const id = row?.dataset.archiveId;
    if (kind === 'transaction') {
      db.getById('transactions', id).then((transaction) => transaction && openSheet(transaction));
    } else if (kind === 'loan') {
      openLoanEditor(id);
    }
  }
  if (action === 'delete-archive-entry') {
    const row = control.closest('[data-archive-kind]');
    const kind = row?.dataset.archiveKind;
    const id = row?.dataset.archiveId;
    const name = row.querySelector('b')?.textContent?.trim() || 'запись';
    if (kind === 'transaction') {
      openDeleteConfirm({
        title: 'Удалить операцию?',
        message: `«${name}» будет удалена без возможности восстановления.`,
        onConfirm: () => deleteTransactionAndRefresh(id),
      });
    } else if (kind === 'loan') {
      openDeleteConfirm({
        title: 'Удалить кредит?',
        message: `«${name}» будет удалён без возможности восстановления.`,
        onConfirm: () => db.remove('loans', id).then(() => Promise.all([renderCreditsScreen(), renderUpcomingPayments(), renderArchiveScreen()])),
      });
    }
  }
  if (action === 'edit-recurring') {
    const recurringId = control.closest('[data-recurring-id]')?.dataset.recurringId;
    if (recurringId) openRecurringEditor(recurringId);
  }
  if (action === 'edit-reminder') {
    const reminderId = control.closest('[data-reminder-id]')?.dataset.reminderId;
    if (reminderId) openReminderEditor(reminderId);
  }
  if (action === 'toggle-reminder-complete') {
    const reminderId = control.closest('[data-reminder-id]')?.dataset.reminderId;
    if (reminderId) toggleReminderComplete(reminderId);
  }
  if (action === 'delete-reminder') {
    const reminderId = control.closest('[data-reminder-id]')?.dataset.reminderId;
    if (reminderId) requestReminderDelete(reminderId);
  }
  if (action === 'mark-recurring-paid') {
    const recurringId = control.closest('[data-recurring-id]')?.dataset.recurringId;
    if (recurringId) markRecurringPaid(recurringId);
  }
  if (action === 'make-quick-payment') {
    const id = control.closest('[data-credit-card-id], [data-loan-id]')?.dataset.creditCardId
      || control.closest('[data-credit-card-id], [data-loan-id]')?.dataset.loanId;
    if (id) makeQuickDebtPayment(control.dataset.paymentKind, id);
  }
  if (action === 'edit-credit-card') {
    const id = control.closest('[data-credit-card-id]')?.dataset.creditCardId;
    if (id) openCreditCardEditor(id);
  }
  if (action === 'edit-loan') {
    const id = control.closest('[data-loan-id]')?.dataset.loanId;
    if (id) openLoanEditor(id);
  }
  if (action === 'edit-bank') {
    const id = control.closest('[data-bank-id]')?.dataset.bankId;
    if (id) openBankEditor(id);
  }
  if (action === 'save-finance-draft') {
    const editor = control.closest('.finance-editor, .bank-editor');
    const status = editor?.querySelector('[data-draft-status]');
    if (editor?.id === 'goalsEditor') {
      saveGoalDraft().then((ok) => {
        if (ok) {
          if (status) status.textContent = 'Цель сохранена';
          closeEditorModal({ saved: true });
        }
      });
    } else if (editor?.id === 'recurringEditor') {
      saveRecurringDraft().then((ok) => {
        if (ok) {
          if (status) status.textContent = 'Платеж сохранен';
          closeEditorModal({ saved: true });
        }
      });
    } else if (editor?.id === 'reminderEditor') {
      saveReminderDraft().then((ok) => {
        if (ok) {
          if (status) status.textContent = 'Напоминание сохранено';
          closeEditorModal({ saved: true });
        }
      });
    } else if (editor?.id === 'creditsEditor') {
      saveCreditDraft().then((ok) => {
        if (ok) {
          if (status) status.textContent = 'Запись сохранена';
          closeEditorModal({ saved: true });
        }
      });
    } else if (editor?.id === 'bankEditor') {
      saveBankDraft().then((ok) => {
        if (ok) {
          if (status) status.textContent = 'Банк сохранен';
          closeEditorModal({ saved: true });
        }
      });
    } else if (editor?.id === 'userEditor') {
      saveUserDraft().then((ok) => {
        if (ok) {
          if (status) status.textContent = 'Пользователь сохранен';
          closeEditorModal({ saved: true });
        }
      });
    } else {
      const isErrorDemo = control.dataset.result === 'error';
      if (isErrorDemo) {
        showToast('error', 'Не удалось сохранить. Проверьте поля и повторите попытку.');
      } else {
        if (status) status.textContent = 'Черновик сохранен в интерфейсе';
        closeEditorModal({ saved: true });
      }
    }
  }
  if (action === 'save-operation') {
    await saveOperation();
  }
  if (action === 'open-sheet') openSheet();
  if (action === 'close-sheet') closeSheet();
  if (action === 'open-category-picker') showCategoryPicker();
  if (action === 'close-category-picker') showOperationMain();
  if (action === 'close-operation-subcategories') {
    pendingOperationCategory = null;
    closeOperationSubcategories();
  }
  if (action === 'select-operation-category') selectOperationCategoryWithSubcategories(control);
  if (action === 'select-operation-linked') selectOperationLinkedItem(control);
  if (action === 'select-operation-subcategory') applyOperationCategorySelection(pendingOperationCategory, control.dataset.subcategory);
  if (action === 'toggle-operation-comment') toggleOperationComment();
  if (action === 'close-operation-comment') closeOperationComment();
  if (action === 'save-operation-comment') saveOperationComment();
  if (action === 'keypad-key') applyKeypadKey(control.dataset.key);
  if (action === 'start-add') showTransactionForm(control.dataset.type);
  if (action === 'back-to-add-types') showTypeStep();
  if (action === 'toggle-range-calendar') {
    const shouldOpen = rangeCalendar.hidden;
    closeChoiceMenus();
    rangeCalendar.hidden = !shouldOpen;
    if (shouldOpen) {
      selectedRangeStart = null;
      selectedRangeEnd = null;
      isSelectingRange = true;
      rangeCalendarMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    }
    renderRangeCalendar();
  }
  if (action === 'toggle-page-range-calendar') {
    const calendar = document.querySelector(`#${control.dataset.calendar}`);
    const shouldOpen = calendar.hidden;
    closeChoiceMenus();
    calendar.hidden = !shouldOpen;
    if (shouldOpen) {
      const state = getPageCalendarState(control.dataset.calendar);
      const today = new Date();
      state.selectedStart = null;
      state.selectedEnd = null;
      state.isSelectingRange = true;
      state.month = new Date(today.getFullYear(), today.getMonth(), 1);
      renderPageRangeCalendar(control.dataset.calendar);
    }
  }
  if (action === 'toggle-choice') {
    const menu = control.nextElementSibling;
    const shouldOpen = menu.hidden;
    closeChoiceMenus();
    menu.hidden = !shouldOpen;
    control.setAttribute('aria-expanded', String(shouldOpen));
  }
  if (action === 'toggle-custom-select') {
    const menu = control.nextElementSibling;
    const shouldOpen = menu.hidden;
    closeChoiceMenus();
    menu.hidden = !shouldOpen;
    control.setAttribute('aria-expanded', String(shouldOpen));
  }
  if (action === 'select-custom-option') {
    const select = document.querySelector(`#${CSS.escape(control.dataset.selectId)}`);
    if (select) {
      select.value = control.dataset.value;
      select.dispatchEvent(new Event('change', { bubbles: true }));
      syncCustomSelect(select);
    }
    closeChoiceMenus();
  }
  if (action === 'select-category') {
    categoryValue.textContent = control.dataset.value;
    const subcategories = categoryMap[currentTransactionType].categories[control.dataset.value];
    subcategoryValue.textContent = subcategories[0];
    fillChoiceMenu(subcategoryMenu, subcategories, 'select-subcategory');
    closeChoiceMenus();
  }
  if (action === 'select-subcategory') {
    subcategoryValue.textContent = control.dataset.value;
    closeChoiceMenus();
  }
  if (action === 'calendar-prev') {
    calendarMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1);
    renderCalendar();
  }
  if (action === 'calendar-next') {
    calendarMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1);
    renderCalendar();
  }
  if (action === 'select-calendar-date') {
    setOperationDate(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), Number(control.dataset.day)));
    closeChoiceMenus();
  }
  if (action === 'range-calendar-prev') {
    rangeCalendarMonth = new Date(rangeCalendarMonth.getFullYear(), rangeCalendarMonth.getMonth() - 1, 1);
    renderRangeCalendar();
  }
  if (action === 'range-calendar-next') {
    rangeCalendarMonth = new Date(rangeCalendarMonth.getFullYear(), rangeCalendarMonth.getMonth() + 1, 1);
    renderRangeCalendar();
  }
  if (action === 'select-range-calendar-date') {
    const nextDate = new Date(rangeCalendarMonth.getFullYear(), rangeCalendarMonth.getMonth(), Number(control.dataset.day));
    if (!isSelectingRange || !selectedRangeStart || selectedRangeEnd || nextDate < selectedRangeStart || isSameDate(nextDate, selectedRangeStart)) {
      selectedRangeStart = nextDate;
      selectedRangeEnd = null;
      isSelectingRange = true;
    } else {
      selectedRangeEnd = nextDate;
      isSelectingRange = false;
    }
    renderRangeCalendar();
    if (selectedRangeEnd) {
      rangeCalendar.hidden = true;
      applyCustomPeriod(selectedRangeStart, selectedRangeEnd);
    }
  }
  if (action === 'page-calendar-prev') {
    const state = getPageCalendarState(control.dataset.calendar);
    state.month = new Date(state.month.getFullYear(), state.month.getMonth() - 1, 1);
    renderPageRangeCalendar(control.dataset.calendar);
  }
  if (action === 'page-calendar-next') {
    const state = getPageCalendarState(control.dataset.calendar);
    state.month = new Date(state.month.getFullYear(), state.month.getMonth() + 1, 1);
    renderPageRangeCalendar(control.dataset.calendar);
  }
  if (action === 'select-page-range-date') {
    const state = getPageCalendarState(control.dataset.calendar);
    const nextDate = new Date(state.month.getFullYear(), state.month.getMonth(), Number(control.dataset.day));
    if (!state.isSelectingRange || !state.selectedStart || state.selectedEnd || nextDate < state.selectedStart || isSameDate(nextDate, state.selectedStart)) {
      state.selectedStart = nextDate;
      state.selectedEnd = null;
      state.isSelectingRange = true;
    } else {
      state.selectedEnd = nextDate;
      state.isSelectingRange = false;
    }
    renderPageRangeCalendar(control.dataset.calendar);
    if (state.selectedEnd) {
      document.querySelector(`#${control.dataset.calendar}`).hidden = true;
      applyCustomPeriod(state.selectedStart, state.selectedEnd);
    }
  }
  if (action === 'toggle-category') {
    const card = control.closest('.category-card');
    selectCategoryCard(card);
    const subcategories = card.nextElementSibling;
    if (subcategories?.classList.contains('subcategory-list')) {
      subcategories.hidden = !subcategories.hidden;
      card.classList.toggle('is-open', !subcategories.hidden);
    }
  }
  if (action === 'cycle-owner-filter') {
    const scope = control.dataset.scope;
    const currentIndex = OWNER_FILTER_CYCLE.indexOf(ownerFilterState[scope]);
    ownerFilterState[scope] = OWNER_FILTER_CYCLE[(currentIndex + 1) % OWNER_FILTER_CYCLE.length];
    control.textContent = `Фильтр: ${await ownerFilterLabel(ownerFilterState[scope])}`;
    if (scope === 'income' || scope === 'expense') renderTransactionScreen(scope);
    else if (scope === 'archive') renderArchiveScreen();
  }
  if (action === 'cycle-archive-sort') {
    const modes = ['date-desc', 'date-asc', 'amount-desc'];
    const labels = { 'date-desc': 'сначала новые', 'date-asc': 'сначала старые', 'amount-desc': 'по сумме' };
    archiveSortMode = modes[(modes.indexOf(archiveSortMode) + 1) % modes.length];
    control.textContent = `Сортировка: ${labels[archiveSortMode]}`;
    renderArchiveScreen();
  }
  if (action === 'edit-user') {
    const userId = control.dataset.userId;
    if (userId) openUserEditor(userId);
  }
  if (action === 'select-period') setPeriod(control.dataset.period);
  if (action === 'category-tab') {
    control.querySelector('input').checked = true;
    document.querySelectorAll('[data-category-panel]').forEach((panel) => {
      panel.hidden = panel.dataset.categoryPanel !== control.dataset.tab;
    });
    clearCategorySelection();
    populateParentCategorySelect();
  }
  if (action === 'category-mode') {
    setCategoryMode(control.dataset.mode);
    if (control.dataset.mode === 'subcategory') populateParentCategorySelect();
    if (control.classList.contains('desktop-action')) openEditorById('categoryEditor', { mode: 'create' });
  }
  if (action === 'select-category-icon') {
    setCategoryIconChoice(control.dataset.icon);
  }
  if (action === 'edit-category') {
    const activePanel = getActiveCategoryPanel();
    const card = control.closest('.category-card') || activePanel?.querySelector('.category-card.is-selected');
    if (card) {
      editingCategoryCard = card;
      editingSubcategoryRow = null;
      selectCategoryCard(card);
      openEditorById('categoryEditor', { mode: 'edit', source: card });
    }
    setCategoryStatus(card ? `Редактирование “${categoryNameInput.value}”` : 'Выберите категорию для редактирования');
  }
  if (action === 'edit-subcategory') {
    const row = control.closest('.subcategory-list div');
    setCategoryMode('subcategory');
    editingCategoryCard = null;
    editingSubcategoryRow = row;
    categoryNameInput.value = row.querySelector('span').textContent;
    setCategoryIconChoice('🗂️');
    openEditorById('categoryEditor', { mode: 'edit', source: row });
    setCategoryStatus(`Редактирование подкатегории “${categoryNameInput.value}”`);
  }
  if (action === 'delete-category') {
    const activePanel = getActiveCategoryPanel();
    const card = control.closest('.category-card') || activePanel?.querySelector('.category-card.is-selected');
    requestCategoryDelete(card);
  }
  if (action === 'delete-subcategory') {
    const row = control.closest('.subcategory-list div');
    requestSubcategoryDelete(row);
  }
  if (action === 'save-category-draft') {
    const name = categoryNameInput.value.trim() || (getCategoryMode() === 'subcategory' ? 'Новая подкатегория' : 'Новая категория');
    if (getCategoryMode() === 'subcategory') {
      if (editingSubcategoryRow) {
        await saveEditedSubcategory(editingSubcategoryRow.dataset.subcategoryId, name);
        editingSubcategoryRow = null;
      } else {
        await saveNewSubcategory(name);
      }
    } else if (editingCategoryCard) {
      await saveEditedCategory(editingCategoryCard.dataset.categoryId, name);
      editingCategoryCard = null;
    } else {
      await saveNewCategory(name);
    }
    await refreshDashboard();
    await Promise.all([
      renderTransactionScreen('income'),
      renderTransactionScreen('expense'),
      renderStatisticsScreen(),
      renderArchiveScreen(),
      renderPlannerCalendar(),
      renderPlannerEvents(),
    ]);
    closeEditorModal({ saved: true });
  }
  if (action === 'request-close-modal') {
    if (activeConfirm) closeDeleteConfirm();
    else closeEditorModal();
  }
  if (action === 'force-close-modal') closeEditorModal({ force: true });
  if (action === 'hide-modal-warning') appModalWarning.hidden = true;
  if (action === 'confirm-delete') confirmDeleteAction();
  if (action === 'cancel-delete') closeDeleteConfirm();
});

insightsViewport?.addEventListener('scroll', () => {
  window.requestAnimationFrame(() => updateInsightState());
}, { passive: true });

rangeButtons.forEach((button) => {
  button.addEventListener('click', () => {
    button.closest('.date-range')?.querySelectorAll('button').forEach((item) => {
      item.classList.toggle('is-active', item === button);
    });
    if (button.closest('#analyticsScreen')) setAnalyticsFlow(button.textContent.trim());
  });
});

document.querySelectorAll('.goal-card').forEach((card) => {
  card.addEventListener('click', (event) => {
    if (event.target.closest('button, input, label, a')) return;
    const details = card.querySelector('.finance-detail');
    if (details) details.hidden = !details.hidden;
  });
});

document.addEventListener('keydown', (event) => {
  trapModalFocus(event);
  if ((event.key === 'Enter' || event.key === ' ') && event.target.closest?.('.operation-record')) {
    if (!event.target.closest('button, a, input, label, textarea, select')) {
      event.preventDefault();
      toggleOperationRecordActions(event.target.closest('.operation-record'));
    }
  }
  if (event.key === 'Escape') {
    if (activeConfirm) closeDeleteConfirm();
    else if (activeModal) closeEditorModal();
    else closeSheet();
  }
});

window.addEventListener('popstate', () => {
  showScreen(getScreenFromHash(), { updateRoute: false });
});

document.addEventListener('change', (event) => {
  if (event.target.name === 'statsFilter') {
    statsOperationsFilter = event.target.value;
    renderStatisticsOperations();
  }
  if (event.target.name === 'theme') {
    db.setSetting('theme', event.target.value).then(() => applyTheme(event.target.value));
  }
  if (event.target.id === 'reminderRepeatSelect') syncReminderMonthlyField();
});

document.addEventListener('change', (event) => {
  const key = event.target.dataset?.insightKey;
  if (key) {
    db.setSetting(`insight-${key}`, event.target.checked).then(() => renderDashboardInsights());
  }
});

document.addEventListener('input', (event) => {
  const id = event.target.id;
  if (id === 'incomesSearchInput') {
    incomesSearchQuery = event.target.value;
    renderTransactionScreen('income');
  } else if (id === 'expensesSearchInput') {
    expensesSearchQuery = event.target.value;
    renderTransactionScreen('expense');
  } else if (id === 'archiveSearchInput') {
    archiveSearchQuery = event.target.value;
    renderArchiveScreen();
  } else if (id === 'statsSearchInput') {
    statsOperationsSearchQuery = event.target.value;
    renderStatisticsOperations();
  } else if (id === 'categoryPickerSearchInput') {
    categoryPickerSearchQuery = event.target.value;
    filterCategoryPickerCards();
  } else if (id === 'reminderDateInput') {
    const date = parseRuDate(event.target.value);
    const monthlyDayInput = document.querySelector('#reminderMonthlyDayInput');
    if (date && monthlyDayInput && document.querySelector('#reminderRepeatSelect')?.value === 'monthly') {
      monthlyDayInput.value = String(new Date(`${date}T00:00:00`).getDate());
    }
  }
});

window.matchMedia?.('(prefers-color-scheme: light)').addEventListener?.('change', async () => {
  if ((await db.getSetting('theme', 'dark')) === 'system') applyTheme('system');
});

function filterCategoryPickerCards() {
  const query = categoryPickerSearchQuery.trim().toLowerCase();
  document.querySelectorAll('.category-picker-section').forEach((section) => {
    let anyVisible = false;
    section.querySelectorAll('.category-choice-card').forEach((card) => {
      const name = card.querySelector('b')?.textContent?.toLowerCase() ?? '';
      const matches = !query || name.includes(query);
      card.hidden = !matches;
      if (matches) anyVisible = true;
    });
    if (section.querySelector('.category-choice-card')) section.hidden = query ? !anyVisible : false;
  });
}

appModalBody?.addEventListener('input', markModalDirty);
appModalBody?.addEventListener('change', markModalDirty);

appModal?.addEventListener('click', (event) => {
  if (event.target === appModal) {
    if (activeConfirm) closeDeleteConfirm();
    else closeEditorModal();
  }
});

document.addEventListener('click', (event) => {
  if (
    !event.target.closest('.choice-field') &&
    !event.target.closest('.custom-select') &&
    !event.target.closest('.date-range-wrap') &&
    !event.target.closest('.calendar-menu')
  ) {
    closeChoiceMenus();
  }
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}

setOperationDate(new Date());
enhanceNativeSelects();
renderRangeCalendar();
pageRangeCalendars.forEach((calendar) => renderPageRangeCalendar(calendar.id));
setCategoryMode('category');
clearCategorySelection();
renderPlannerCalendar();
renderPlannerEvents();
if (dashboardToday) dashboardToday.textContent = formatDashboardDate(new Date());
setOwnerColors(document.body);
renderFunctionalIcons(document.body);
setCategoryIconChoice(categoryIconValue?.value || '💸');
updateInsightState(0);

db.seedIfEmpty()
  .then(() => migrateCategoryEmojiIcons())
  .then(() => db.seedRemindersIfEmpty())
  .then(() => Promise.all([
    refreshDashboard(),
    renderTransactionScreen('income'),
    renderTransactionScreen('expense'),
    renderCategoriesScreen(),
    renderCategoryPicker(),
    populateParentCategorySelect(),
    renderGoalsScreen(),
    renderStatisticsScreen(),
    renderArchiveScreen(),
    renderPlannerCalendar(),
    renderPlannerEvents(),
    renderRecurringScreen(),
    renderRemindersScreen(),
    renderCreditsScreen(),
    populateCreditBankSelect(),
    renderUsersSettings(),
    renderOwnerControls(),
    renderBanksSettings(),
    applyOwnerColors(),
    loadTheme(),
  ]))
  .then(() => showScreen(getScreenFromHash(), { replaceRoute: true }))
  .catch((error) => console.error('Не удалось инициализировать базу данных', error));

