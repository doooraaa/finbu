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
const categoryIconPreview = document.querySelector('#categoryIconPreview');
const categoryStatus = document.querySelector('#categoryStatus');
const appModal = document.querySelector('#appModal');
const appModalBackdrop = document.querySelector('.app-modal-backdrop');
const appModalBody = document.querySelector('#appModalBody');
const appModalTitle = document.querySelector('#appModalTitle');
const appModalMode = document.querySelector('#appModalMode');
const appModalWarning = document.querySelector('#appModalWarning');
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
let selectedRangeStart = new Date();
let selectedRangeEnd = null;
let rangeCalendarMonth = new Date(selectedRangeStart.getFullYear(), selectedRangeStart.getMonth(), 1);
const pageCalendarState = {};
let currentTransactionType = 'expense';
let selectedPlannerDate = '2026-08-01';
let selectedPlannerFilter = 'Все события';
let operationAmount = '0';
let pendingOperationCategory = null;
let editingCategoryCard = null;
let activeModal = null;
let activeConfirm = null;

const editorTitles = {
  categoryEditor: 'Категория',
  creditsEditor: 'Кредит',
  recurringEditor: 'Обязательный платеж',
  goalsEditor: 'Финансовая цель',
  bankEditor: 'Банк',
};

const iconPaths = {
  archive: '<rect width="20" height="5" x="2" y="3" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/><path d="M10 12h4"/>',
  banknote: '<rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/>',
  bell: '<path d="M10.3 21a2 2 0 0 0 3.4 0"/><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/>',
  briefcase: '<rect width="20" height="14" x="2" y="7" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><path d="M2 12h20"/>',
  calendar: '<path d="M8 2v4M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',
  calendarClock: '<path d="M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6"/><path d="M16 2v4M8 2v4M3 10h18"/><circle cx="17" cy="17" r="5"/><path d="M17 14.5V17l1.5 1"/>',
  chart: '<path d="M3 3v18h18"/><path d="M18 17V9M13 17V5M8 17v-3"/>',
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
    setIcon(button, button.dataset.icon);
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
    setIcon(item, card?.dataset.categoryIcon || inferCategoryIcon(source));
  });
  root.querySelectorAll('.category-orb').forEach((item) => {
    const card = item.closest('[data-category], .stats-operation, .operation-category-select');
    const source = card?.dataset?.category || card?.textContent || item.textContent;
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
  root.querySelectorAll('[data-action^="close"]').forEach((button) => {
    if (button.textContent.trim() === '×') setIcon(button, 'x');
  });
}

function setCategoryIconChoice(iconName) {
  const nextIcon = iconName || 'tag';
  if (categoryIconValue) categoryIconValue.value = nextIcon;
  if (categoryIconPreview) setIcon(categoryIconPreview, nextIcon);
  categoryIconPicker?.querySelectorAll('[data-icon]').forEach((button) => {
    button.classList.toggle('is-selected', button.dataset.icon === nextIcon);
  });
}

function showToast(type, message) {
  if (!toastStack) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<b>${type === 'error' ? 'Ошибка' : 'Готово'}</b><small>${message}</small>`;
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
  editor.querySelector('input, select, textarea, button')?.focus?.();
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
}

function closeDeleteConfirm() {
  if (!activeConfirm) return false;
  activeConfirm = null;
  appModal.classList.remove('is-open');
  appModalBackdrop.classList.remove('is-open');
  appModalBody.innerHTML = '';
  window.setTimeout(() => {
    if (!activeModal && !activeConfirm) {
      appModal.hidden = true;
      appModalBackdrop.hidden = true;
    }
  }, 180);
  return true;
}

function confirmDeleteAction() {
  if (!activeConfirm) return;
  const callback = activeConfirm.onConfirm;
  closeDeleteConfirm();
  callback?.();
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

const calendarEvents = {
  '2026-08-01': [
    { title: 'Зарплата', amount: '+180 000 ₽', owner: 'Данил', category: 'Доход', status: 'получено', color: 'green' },
    { title: 'Аренда квартиры', amount: '−45 000 ₽', owner: 'Данил', category: 'Обязательный платеж', status: 'запланирован', color: 'rose' },
    { title: 'Автокредит ВТБ', amount: '−36 700 ₽', owner: 'Данил', category: 'Кредит', status: 'скоро', color: 'amber' },
    { title: 'Цель: отпуск', amount: '+15 000 ₽', owner: 'Семья', category: 'Цель', status: 'пополнение', color: 'teal' },
  ],
  '2026-08-03': [
    { title: 'Минимальный платеж по карте', amount: '−12 900 ₽', owner: 'Данил', category: 'Кредит', status: 'запланирован', color: 'amber' },
  ],
  '2026-08-06': [
    { title: 'Продукты на неделю', amount: '−8 450 ₽', owner: 'Юля', category: 'Расход', status: 'оплачено', color: 'rose' },
  ],
  '2026-08-09': [
    { title: 'Фриланс проект', amount: '+32 000 ₽', owner: 'Юля', category: 'Доход', status: 'получено', color: 'green' },
  ],
  '2026-08-17': [
    { title: 'Домашний интернет', amount: '−2 400 ₽', owner: 'Юля', category: 'Обязательный платеж', status: 'скоро', color: 'amber' },
    { title: 'Такси', amount: '−1 200 ₽', owner: 'Данил', category: 'Расход', status: 'оплачено', color: 'rose' },
  ],
  '2026-08-21': [
    { title: 'Кэшбэк', amount: '+6 500 ₽', owner: 'Данил', category: 'Доход', status: 'получено', color: 'green' },
  ],
  '2026-08-24': [
    { title: 'Пополнение цели', amount: '+20 000 ₽', owner: 'Семья', category: 'Цель', status: 'выполнено', color: 'teal' },
  ],
  '2026-08-30': [
    { title: 'Подписки', amount: '−1 690 ₽', owner: 'Данил', category: 'Обязательный платеж', status: 'оплачен', color: 'rose' },
  ],
  '2026-08-31': [
    { title: 'Аванс', amount: '+48 000 ₽', owner: 'Юля', category: 'Доход', status: 'получено', color: 'green' },
  ],
};

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

function getOwnerClass(owner) {
  return ownerClassMap[owner] || '';
}

function ownerMarkup(owner) {
  const className = getOwnerClass(owner);
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
      selectedStart: today,
      selectedEnd: null,
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

function showScreen(name) {
  Object.entries(screens).forEach(([key, element]) => {
    element.classList.toggle('is-active', key === name);
  });

  navItems.forEach((item) => {
    const targetScreen = item.dataset.screen || item.dataset.action;
    item.classList.toggle('is-active', targetScreen === name);
  });

  renderFunctionalIcons(document.body);
  if (name === 'archive') {
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

function openSheet() {
  showOperationMain();
  operationAmount = '0';
  if (operationAmountValue) operationAmountValue.textContent = operationAmount;
  if (operationCategoryValue) operationCategoryValue.textContent = 'Выбрать';
  if (operationCommentValue) operationCommentValue.textContent = 'Добавить';
  if (operationCommentInput) operationCommentInput.value = '';
  closeOperationComment();
  if (operationCategoryIcon) {
    operationCategoryIcon.className = 'category-orb rose';
    operationCategoryIcon.innerHTML = icon('receipt');
  }
  setOperationDate(new Date());
  backdrop.hidden = false;
  sheet.hidden = false;
  requestAnimationFrame(() => sheet.classList.add('is-open'));
}

function closeSheet() {
  sheet.classList.remove('is-open');
  closeOperationComment();
  closeOperationSubcategories();
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
  pendingOperationCategory = null;
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
  if (categoryNameInput) categoryNameInput.value = 'Новая категория';
  setCategoryIconChoice('tag');
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
  setCategoryIconChoice(card.dataset.categoryIcon || inferCategoryIcon(name));
  setCategoryStatus(`Выбрана категория “${name}”`);
}

function setCategoryMode(mode) {
  document.querySelectorAll('[name="categoryMode"]').forEach((input) => {
    input.checked = input.closest('[data-mode]')?.dataset.mode === mode;
  });
  parentCategorySelect.closest('.field').hidden = mode !== 'subcategory';
  editingCategoryCard = null;
  categoryNameInput.value = mode === 'subcategory' ? 'Новая подкатегория' : 'Новая категория';
  setCategoryIconChoice(mode === 'subcategory' ? 'folderTree' : 'tag');
  setCategoryStatus(mode === 'subcategory' ? 'Создание подкатегории' : 'Создание категории');
}

function getCategoryMode() {
  return document.querySelector('[name="categoryMode"]:checked')?.closest('[data-mode]')?.dataset.mode || 'category';
}

function createCategoryCard(name) {
  const panel = getActiveCategoryPanel();
  const isIncome = panel.dataset.categoryPanel === 'income';
  const iconClass = isIncome ? 'green' : 'rose';
  const meterClass = isIncome ? '' : ' rose-meter';
  const categoryIcon = categoryIconValue?.value || inferCategoryIcon(name);
  const card = document.createElement('div');
  const subcategories = document.createElement('div');

  card.className = 'category-card';
  card.dataset.categoryName = name;
  card.dataset.categoryIcon = categoryIcon;
  card.innerHTML = `
    <span class="category-icon ${iconClass}">${icon(categoryIcon)}</span>
    <button class="category-summary" type="button" data-action="toggle-category"><b>${name}</b><small>0 операций · 0%</small></button>
    <strong>0 ₽</strong>
    <span class="meter${meterClass}"><i style="width:0%"></i></span>
    <div class="record-actions category-actions">
      <button type="button" data-action="edit-category" aria-label="Редактировать">✎</button>
      <button type="button" data-action="delete-category" aria-label="Удалить">×</button>
    </div>
  `;

  subcategories.className = 'subcategory-list';
  subcategories.hidden = true;
  panel.append(card, subcategories);
  renderFunctionalIcons(card);
  selectCategoryCard(card);
  setCategoryStatus(`Категория “${name}” добавлена в интерфейс`);
}

function updateCategoryCard(card, name) {
  if (!card) return false;
  const nextName = name || card.dataset.categoryName || 'Категория';
  const nextIcon = categoryIconValue?.value || card.dataset.categoryIcon || inferCategoryIcon(nextName);
  card.dataset.categoryName = nextName;
  card.dataset.categoryIcon = nextIcon;
  const title = card.querySelector('.category-summary b');
  const categoryIconEl = card.querySelector('.category-icon');
  if (title) title.textContent = nextName;
  setIcon(categoryIconEl, nextIcon);
  selectCategoryCard(card);
  editingCategoryCard = null;
  setCategoryStatus(`Категория “${nextName}” обновлена в интерфейсе`);
  return true;
}

function createSubcategoryRow(name) {
  const panel = getActiveCategoryPanel();
  const card = panel.querySelector('.category-card.is-selected') || panel.querySelector('.category-card');
  if (!card) return;

  const subcategories = card.nextElementSibling;
  subcategories.hidden = false;
  card.classList.add('is-open');
  subcategories.insertAdjacentHTML(
    'beforeend',
    `<div><span>${name}</span><b>0 ₽</b><button type="button" data-action="edit-subcategory">✎</button><button type="button" data-action="delete-subcategory">×</button></div>`
  );
  renderFunctionalIcons(subcategories);
  setCategoryStatus(`Подкатегория “${name}” добавлена к “${card.dataset.categoryName}”`);
}

function removeCategoryCard(card) {
  if (!card) {
    setCategoryStatus('Выберите категорию для удаления');
    return;
  }
  const name = card.dataset.categoryName;
  const subcategories = card.nextElementSibling;
  if (subcategories?.classList.contains('subcategory-list')) subcategories.remove();
  card.remove();
  categoryNameInput.value = 'Новая категория';
  setCategoryStatus(`Категория “${name}” удалена из интерфейса`);
}

function requestCategoryDelete(card) {
  if (!card) {
    setCategoryStatus('Выберите категорию для удаления');
    return;
  }
  const name = card.dataset.categoryName || 'категорию';
  openDeleteConfirm({
    title: 'Удалить категорию?',
    message: `Категория “${name}” и ее подкатегории будут убраны из интерфейса.`,
    onConfirm: () => removeCategoryCard(card),
  });
}

function requestSubcategoryDelete(row) {
  if (!row) return;
  const name = row.querySelector('span')?.textContent || 'подкатегория';
  openDeleteConfirm({
    title: 'Удалить подкатегорию?',
    message: `Подкатегория “${name}” будет убрана из интерфейса.`,
    onConfirm: () => {
      row.remove();
      setCategoryStatus(`Подкатегория “${name}” удалена из интерфейса`);
    },
  });
}

function removeFinanceItem(control) {
  const item = control.closest('[data-removable], .bank-directory-card');
  const list = item?.closest('.finance-list');
  item?.remove();

  if (list && !list.querySelector('[data-removable]')) {
    const emptyState = list.querySelector('.empty-state') || list.parentElement.querySelector('.empty-state');
    if (emptyState) emptyState.hidden = false;
  }
}

function requestFinanceDelete(control) {
  const item = control.closest('[data-removable], .bank-directory-card');
  const name = item?.querySelector('.finance-main b, .goal-head b, .record b, .bank-directory-card b')?.textContent?.trim() || 'запись';
  openDeleteConfirm({
    title: 'Удалить запись?',
    message: `“${name}” будет убрана из интерфейса.`,
    onConfirm: () => removeFinanceItem(control),
  });
}

function renderPlannerEvents() {
  if (!calendarEventList) return;

  const events = (calendarEvents[selectedPlannerDate] || []).filter((event) => {
    return selectedPlannerFilter === 'Все события' || event.category === selectedPlannerFilter;
  });

  calendarEventCount.textContent = `${events.length} ${events.length === 1 ? 'событие' : 'события'}`;
  calendarEventList.innerHTML = events
    .map((event) => `
      <div class="record">
        <div><b>${event.title} → ${ownerMarkup(event.owner)}</b><small>${event.category} · ${event.status}</small></div>
        <strong class="${event.color}">${event.amount}</strong>
      </div>
    `)
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
    operationCategoryIcon.innerHTML = icon(inferCategoryIcon(control.dataset.category));
  }
  showOperationMain();
}

function selectOperationCategoryWithSubcategories(control) {
  const subcategories = getOperationSubcategories(control);
  pendingOperationCategory = {
    category: control.dataset.category,
    tone: control.dataset.tone || 'rose',
    icon: inferCategoryIcon(control.dataset.category),
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
  const label = subcategory ? `${categoryData.category} · ${subcategory}` : categoryData.category;
  if (operationCategoryValue) operationCategoryValue.textContent = label;
  if (operationCategoryIcon) {
    operationCategoryIcon.className = `category-orb ${categoryData.tone}`;
    operationCategoryIcon.innerHTML = icon(categoryData.icon);
  }
  closeOperationSubcategories();
  showOperationMain();
}

document.addEventListener('click', (event) => {
  const control = event.target.closest('[data-action]');
  if (!control) return;
  event.preventDefault();

  const action = control.dataset.action;
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
    openEditorById(control.dataset.target, { mode: 'create' });
  }
  if (action === 'toggle-detail') {
    const details = control.closest('.finance-card, .archive-record, .goal-card')?.querySelector('.finance-detail');
    if (details) details.hidden = !details.hidden;
  }
  if (action === 'remove-finance-item') requestFinanceDelete(control);
  if (action === 'edit-record') openRecordEditor(control);
  if (action === 'save-finance-draft') {
    const status = control.closest('.finance-editor')?.querySelector('[data-draft-status]');
    const isErrorDemo = control.dataset.result === 'error';
    if (isErrorDemo) {
      showToast('error', 'Не удалось сохранить. Проверьте поля и повторите попытку.');
    } else {
      if (status) status.textContent = 'Черновик сохранен в интерфейсе';
      closeEditorModal({ saved: true });
    }
  }
  if (action === 'save-operation') {
    closeSheet();
    showToast('success', 'Операция сохранена');
  }
  if (action === 'open-sheet') openSheet();
  if (action === 'close-sheet') closeSheet();
  if (action === 'open-category-picker') showCategoryPicker();
  if (action === 'close-category-picker') showOperationMain();
  if (action === 'close-operation-subcategories') closeOperationSubcategories();
  if (action === 'select-operation-category') selectOperationCategoryWithSubcategories(control);
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
    renderRangeCalendar();
  }
  if (action === 'toggle-page-range-calendar') {
    const calendar = document.querySelector(`#${control.dataset.calendar}`);
    const shouldOpen = calendar.hidden;
    closeChoiceMenus();
    calendar.hidden = !shouldOpen;
    if (shouldOpen) renderPageRangeCalendar(control.dataset.calendar);
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
    const nextRange = selectDateRange(selectedRangeStart, selectedRangeEnd, nextDate);
    selectedRangeStart = nextRange.start;
    selectedRangeEnd = nextRange.end;
    renderRangeCalendar();
    if (selectedRangeEnd) rangeCalendar.hidden = true;
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
    const nextRange = selectDateRange(state.selectedStart, state.selectedEnd, nextDate);
    state.selectedStart = nextRange.start;
    state.selectedEnd = nextRange.end;
    renderPageRangeCalendar(control.dataset.calendar);
    if (state.selectedEnd) document.querySelector(`#${control.dataset.calendar}`).hidden = true;
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
  if (action === 'category-tab') {
    control.querySelector('input').checked = true;
    document.querySelectorAll('[data-category-panel]').forEach((panel) => {
      panel.hidden = panel.dataset.categoryPanel !== control.dataset.tab;
    });
    clearCategorySelection();
  }
  if (action === 'category-mode') {
    setCategoryMode(control.dataset.mode);
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
      selectCategoryCard(card);
      openEditorById('categoryEditor', { mode: 'edit', source: card });
    }
    setCategoryStatus(card ? `Редактирование “${categoryNameInput.value}”` : 'Выберите категорию для редактирования');
  }
  if (action === 'edit-subcategory') {
    const row = control.closest('.subcategory-list div');
    setCategoryMode('subcategory');
    editingCategoryCard = null;
    categoryNameInput.value = row.querySelector('span').textContent;
    setCategoryIconChoice('folderTree');
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
      createSubcategoryRow(name);
    } else if (editingCategoryCard) {
      updateCategoryCard(editingCategoryCard, name);
    } else {
      createCategoryCard(name);
    }
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
  if (event.key === 'Escape') {
    if (activeConfirm) closeDeleteConfirm();
    else if (activeModal) closeEditorModal();
    else closeSheet();
  }
});

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
renderPlannerEvents();
if (dashboardToday) dashboardToday.textContent = formatDashboardDate(new Date());
setOwnerColors(document.body);
renderFunctionalIcons(document.body);
setCategoryIconChoice(categoryIconValue?.value || 'tag');
updateInsightState(0);
