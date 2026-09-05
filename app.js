import * as db from './db.js';

import {
  remainingDebtPayment,
  remainingRecurringPayment,
  shiftPaymentDate,
  updateDebtPaymentCycle,
  updateRecurringPaymentCycle,
} from './payment-cycle.js';
import { parseMoneyInput as parseAmountInput, validateCreditDraft } from './finance-domain.js';

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
let dashboardOwner = 'all';
let operationEntryType = 'expense';
let pendingCategoryType = null;
let selectedPlannerDate = todayIsoDate();
let plannerMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
let selectedPlannerFilter = 'Все события';
let operationAmount = '0';
let operationAccumulator = null;
let operationOperator = null;
let operationAwaitingOperand = false;
let pendingOperationCategory = null;
let editingTransactionId = null;
let operationDraftBaseline = null;
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
  kitchen: '<path d="M6 3v6a3 3 0 0 0 6 0V3"/><path d="M9 3v4"/><path d="M9 12v9"/><path d="M18 3c-1.7 0-3 2.2-3 5s1.3 5 3 5v8"/><path d="M18 3v6"/>',
  shoppingBag: '<path d="M6 7h15l1 13a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2L3 7"/><path d="M9 10V6a3 3 0 0 1 6 0v4"/>',
  movie: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4"/>',
  currencyDollar: '<path d="M12 3v18"/><path d="M17 7c-.8-1.5-2.7-2-5-2-3 0-5 1.3-5 3.5 0 4.5 10 2.5 10 7 0 2.2-2 3.5-5 3.5-2.3 0-4.2-.5-5-2"/>',
  bank: '<path d="m3 10 9-7 9 7"/><path d="M4 10h16"/><path d="M6 10v8M10 10v8M14 10v8M18 10v8"/><path d="M3 20h18"/>',
  cardOff: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/><path d="M4 4l16 16"/>',
  laptop: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M2 20h20"/>',
  bolt: '<path d="M13 2 3 14h7l-1 8 10-12h-7z"/>',
  wifi: '<path d="M5 12.5a10 10 0 0 1 14 0"/><path d="M8.5 16a5 5 0 0 1 7 0"/><path d="M12 19.5h.01"/>',
  dotsVertical: '<circle cx="12" cy="5" r="1.4" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="12" cy="19" r="1.4" fill="currentColor" stroke="none"/>',
  dots: '<circle cx="5" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.4" fill="currentColor" stroke="none"/>',
  calendarDue: '<rect x="4" y="5" width="16" height="16" rx="2"/><path d="M16 3v4M8 3v4M4 11h16"/><path d="M12 14v3l2 2"/>',
  calendarMonth: '<rect x="4" y="5" width="16" height="16" rx="2"/><path d="M16 3v4M8 3v4M4 11h16"/><rect x="8" y="14" width="8" height="4" rx="1"/>',
  calendarTime: '<rect x="4" y="5" width="16" height="16" rx="2"/><path d="M16 3v4M8 3v4M4 11h16"/><path d="M12 13v4M9 16h6"/>',
  bellOff: '<path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h13"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/><path d="M4 4l16 16"/>',
  chartLine: '<path d="M3 3v18h18"/><path d="m7 14 4-4 3 3 5-6"/>',
  receiptOff: '<path d="M5 3h14v18l-2.5-1.5L14 21l-2-1.2L10 21l-2.5-1.5L5 21z"/><path d="M4 4l16 16"/>',
  exchange: '<path d="M7 16V4M7 4 3 8M7 4l4 4"/><path d="M17 8v12M17 20l4-4M17 20l-4-4"/>',
  cash: '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 12h.01M18 12h.01"/>',
  userPlus: '<circle cx="10" cy="8" r="4"/><path d="M2 21a8 8 0 0 1 16 0"/><path d="M19 8v6M22 11h-6"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8"/><path d="M17.5 14.2a6.5 6.5 0 0 1 4 5.8"/>',
  copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  share: '<circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8.2 10.8l7.6-3.6M8.2 13.2l7.6 3.6"/>',
  filterOff: '<path d="M3 5h18l-7 8v6l-4-2v-4z"/><path d="M4 4l16 16"/>',
  sort: '<path d="M11 5h7M11 9h5M11 13h3"/><path d="M6 4v16M3 17l3 3 3-3"/>',
  alert: '<circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/>',
  plane: '<path d="M22 2 11 13"/><path d="M22 2l-7 20-4-9-9-4z"/>',
  heart: '<path d="M12 20s-7-4.6-9.3-9A5.2 5.2 0 0 1 12 6a5.2 5.2 0 0 1 9.3 5c-2.3 4.4-9.3 9-9.3 9z"/>',
  bulb: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-4 10.5c.8.7 1 1.5 1 2.5h6c0-1 .2-1.8 1-2.5A6 6 0 0 0 12 3z"/>',
  moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
  shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="m9 12 2 2 4-4"/>',
  export: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M12 11v6M9 14l3 3 3-3"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18z"/>',
  backspace: '<path d="M9 4h11a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H9l-7-8z"/><path d="m12 10 4 4M16 10l-4 4"/>',
  apps: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  apple: '<path d="M12 8c-4-2-8 0-8 5 0 4 3 9 5 9 1 0 1.5-.5 3-.5s2 .5 3 .5c2 0 5-5 5-9 0-5-4-7-8-5z"/><path d="M12 8c0-3 2-5 4-5"/>',
  bottle: '<path d="M10 2h4M10 5h4l1 4v11a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2V9z"/><path d="M10 13h4"/>',
  candy: '<rect x="8" y="8" width="8" height="8" rx="4" transform="rotate(45 12 12)"/><path d="m5.5 5.5 3 3M15.5 15.5l3 3M18.5 5.5l-3 3M8.5 15.5l-3 3"/>',
  chef: '<path d="M7 13a4 4 0 1 1 .6-7.9A5 5 0 0 1 17 6a4 4 0 1 1-.5 8z"/><path d="M7 13h10v2a5 5 0 0 1-5 5h0a5 5 0 0 1-5-5z"/>',
  coffee: '<path d="M17 8h1a3 3 0 0 1 0 6h-1"/><path d="M3 8h14v6a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5z"/><path d="M7 2v2M11 2v2M15 2v2"/>',
  meat: '<circle cx="14" cy="9" r="5"/><path d="m10.5 12.5-6 6"/><circle cx="4" cy="20" r="1.6"/><circle cx="7" cy="17" r="1.6"/>',
  armchair: '<path d="M6 11V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v5"/><path d="M4 11a2 2 0 0 1 4 0v1h8v-1a2 2 0 0 1 4 0v3a7 7 0 0 1-7 7h-2a7 7 0 0 1-7-7z"/><path d="M6 21v-2M18 21v-2"/>',
  bed: '<path d="M3 18v-8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8"/><path d="M3 18h18"/><path d="M5 8V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v2"/>',
  door: '<rect x="5" y="3" width="14" height="18" rx="1"/><circle cx="15" cy="12" r="1" fill="currentColor" stroke="none"/>',
  radiator: '<rect x="4" y="6" width="16" height="12" rx="2"/><path d="M9 6v12M15 6v12"/><path d="M7 18v2M17 18v2"/>',
  ban: '<circle cx="12" cy="12" r="9"/><path d="M5.5 5.5l13 13"/>',
  pill: '<rect x="3.5" y="8.5" width="17" height="7" rx="3.5" transform="rotate(-45 12 12)"/><path d="m9.5 9.5 5 5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  refresh: '<path d="M21 12a9 9 0 1 1-2.6-6.4"/><path d="M21 3v6h-6"/>',
  sparkles: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>',
  arrowDownLeft: '<path d="M17 7 7 17"/><path d="M7 7h10v10"/>',
  arrowUpRight: '<path d="m7 17 10-10"/><path d="M7 7h10v10"/>',
  searchOff: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/><path d="M4 4l16 16"/>',
  fuel: '<rect x="5" y="4" width="9" height="16" rx="1"/><path d="M14 9h2.5A1.5 1.5 0 0 1 18 10.5V16"/><path d="M18 13.5V18a1.5 1.5 0 0 0 3 0V9l-2.5-2.5"/><path d="M8 8h4M8 12h4"/>',
  plug: '<path d="M9 8V3M15 8V3"/><path d="M7 8h10v4a5 5 0 0 1-10 0z"/><path d="M12 17v4"/>',
  train: '<rect x="5" y="3" width="14" height="14" rx="3"/><path d="M5 10h14"/><circle cx="9" cy="13.5" r=".7" fill="currentColor" stroke="none"/><circle cx="15" cy="13.5" r=".7" fill="currentColor" stroke="none"/><path d="M8 20l1.5-3M16 20l-1.5-3"/>',
  gamepad: '<rect x="2" y="7" width="20" height="11" rx="5.5"/><path d="M7 10.5v4M5 12.5h4"/><circle cx="16" cy="11.5" r=".8" fill="currentColor" stroke="none"/><circle cx="18" cy="14" r=".8" fill="currentColor" stroke="none"/>',
  pizza: '<path d="M4 5c4-1.5 12-1.5 16 0L12 20z"/><path d="M9.5 9.5h.01M13.5 11h.01M11.5 14.5h.01"/>',
  download: '<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M4 21h16"/>',
  handHoldingHeart: '<path d="M12 20s-7-4.5-9-9c-1.2-2.7.5-6 3.5-6 2 0 3.5 1.2 4.3 2.6h2.4C14 6.2 15.5 5 17.5 5c3 0 4.7 3.3 3.5 6-2 4.5-9 9-9 9z"/><path d="M4 14c2 4.5 5 6.5 8 6.5s6-2 8-6.5"/>',
  squareRounded: '<rect x="4" y="4" width="16" height="16" rx="5"/>',
  arrowDownCircle: '<circle cx="12" cy="12" r="9"/><path d="M12 8v8"/><path d="m8 12 4 4 4-4"/>',
  targetArrow: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/>',
  arrowLeft: '<path d="M19 12H5"/><path d="m11 18-6-6 6-6"/>',
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

const EMOJI_TO_ICON = {
  '💸': 'banknote', '💼': 'briefcase', '🎁': 'gift', '📅': 'calendar', '🎯': 'target', '🧾': 'receipt',
  '🍽️': 'kitchen', '🛒': 'shoppingBag', '☕': 'coffee', '🍕': 'pizza', '🏠': 'home', '🛋️': 'armchair',
  '🔌': 'plug', '🧹': 'sparkles', '🚕': 'car', '⛽': 'fuel', '🚇': 'train', '🚗': 'car', '💊': 'pill',
  '❤️': 'heart', '🎬': 'movie', '🎮': 'gamepad', '💻': 'laptop', '🏦': 'landmark', '💳': 'creditCard',
  '📈': 'trendingUp', '🗂️': 'folderTree', '🛏️': 'bed', '🚪': 'door', '🌡️': 'radiator', '💡': 'bulb',
  '💰': 'wallet', '🪙': 'currencyDollar',
};

function resolveIconKey(value, fallbackText = '') {
  if (value && iconPaths[value]) return value;
  if (value && EMOJI_TO_ICON[value]) return EMOJI_TO_ICON[value];
  const emoji = categoryEmoji(value, fallbackText);
  if (emoji && EMOJI_TO_ICON[emoji]) return EMOJI_TO_ICON[emoji];
  return inferCategoryIcon(fallbackText || (typeof value === 'string' ? value : ''));
}

function categoryIcon(value, fallbackText = '') {
  return icon(resolveIconKey(value, fallbackText));
}

function setEmoji(el, emoji) {
  if (!el) return;
  const nextEmoji = categoryEmoji(emoji);
  if (el.dataset.emojiRendered === nextEmoji) return;
  el.dataset.emojiRendered = nextEmoji;
  el.innerHTML = icon(resolveIconKey(emoji, nextEmoji));
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
    if (link.querySelector('.ui-icon, svg')) return;
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
    if (!button.querySelector('.ui-icon, svg')) button.insertAdjacentHTML('afterbegin', icon('home', 'ui-icon mobile-nav-icon'));
  });
  root.querySelectorAll('.mobilebar [data-action="more"]').forEach((button) => {
    if (!button.querySelector('.ui-icon, svg')) button.insertAdjacentHTML('afterbegin', icon('menu', 'ui-icon mobile-nav-icon'));
  });
  root.querySelectorAll('.mobile-add').forEach((button) => {
    button.querySelector('.ui-icon')?.remove();
    button.textContent = '';
    button.setAttribute('aria-label', 'Добавить');
  });

  root.querySelectorAll('.desktop-action[data-action="open-sheet"], .button[data-action="open-sheet"], .button[data-action="toggle-editor"], .button[data-action="category-mode"], .ghost-button[data-action="toggle-editor"]').forEach((button) => {
    if (!button.querySelector('.ui-icon, svg')) button.insertAdjacentHTML('afterbegin', icon('plus', 'ui-icon button-icon'));
  });

  root.querySelectorAll('.search-field > span').forEach((label) => {
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
    if (!button.querySelector('.ui-icon, svg') && !button.textContent.trim()) button.innerHTML = icon('chevronLeft');
  });
  root.querySelectorAll('[data-action$="next"]').forEach((button) => {
    if (!button.querySelector('.ui-icon, svg') && !button.textContent.trim()) button.innerHTML = icon('chevronRight');
  });
  root.querySelectorAll('[data-action^="close"], .modal-close, [data-action="request-close-modal"]').forEach((button) => {
    if (button.textContent.trim() === '×') setIcon(button, 'x');
  });
  root.querySelectorAll('.payment-type-icon[data-emoji]').forEach((item) => {
    if (!item.dataset.emojiRendered) setEmoji(item, item.dataset.emoji);
  });
  injectKebabTriggers(root);
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

async function migrateRecurringPaymentCategories() {
  const [payments, categories, transactions] = await Promise.all([
    db.getAll('recurringPayments'),
    db.getAll('categories'),
    db.getAll('transactions'),
  ]);
  const categoryByPaymentId = new Map();
  for (const payment of payments) {
    let storedCategory = categories.find((category) => category.id === payment.categoryId);
    if (storedCategory) {
      categoryByPaymentId.set(payment.id, storedCategory.id);
      continue;
    }
    const normalizedLabel = String(payment.categoryLabel || '').trim().toLowerCase();
    storedCategory = categories.find((item) => item.type === 'expense' && item.name.trim().toLowerCase() === normalizedLabel);
    if (!storedCategory && normalizedLabel) {
      storedCategory = await db.put('categories', {
        name: payment.categoryLabel.trim(),
        type: 'expense',
        icon: categoryEmoji('', payment.categoryLabel),
        tone: 'violet',
      });
      categories.push(storedCategory);
    }
    if (!storedCategory) continue;
    categoryByPaymentId.set(payment.id, storedCategory.id);
    await db.put('recurringPayments', { ...payment, categoryId: storedCategory.id, categoryLabel: storedCategory.name });
  }
  await Promise.all(
    transactions
      .filter((transaction) => transaction.linkedType === 'recurringPayment' && !transaction.categoryId && categoryByPaymentId.has(transaction.linkedId))
      .map((transaction) => db.put('transactions', { ...transaction, categoryId: categoryByPaymentId.get(transaction.linkedId) })),
  );
}

function showToast(type, message, { actionLabel, onAction, duration } = {}) {
  if (!toastStack) return;
  const titles = { error: 'Ошибка', success: 'Готово', info: 'Информация' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<b>${titles[type] || 'Готово'}</b><small>${escapeHtml(message)}</small>`;
  let dismissed = false;
  const dismiss = () => {
    if (dismissed) return;
    dismissed = true;
    toast.classList.remove('is-visible');
    window.setTimeout(() => toast.remove(), 220);
  };

  if (actionLabel && typeof onAction === 'function') {
    const actionButton = document.createElement('button');
    actionButton.className = 'toast-action';
    actionButton.type = 'button';
    actionButton.textContent = actionLabel;
    actionButton.addEventListener('click', () => {
      dismiss();
      onAction();
    });
    toast.append(actionButton);
  }

  toastStack.append(toast);
  window.setTimeout(() => toast.classList.add('is-visible'), 20);
  window.setTimeout(dismiss, duration ?? (actionLabel ? 7000 : 2600));
}

const pendingActions = new Set();

function setActionPending(control, pending) {
  if (!(control instanceof HTMLButtonElement)) return;
  control.disabled = pending;
  control.classList.toggle('is-pending', pending);
  if (pending) control.setAttribute('aria-busy', 'true');
  else control.removeAttribute('aria-busy');
}

async function runAsyncAction(control, key, task, errorMessage = 'Не удалось выполнить действие.') {
  if (pendingActions.has(key)) return false;
  pendingActions.add(key);
  setActionPending(control, true);

  try {
    return await task();
  } catch (error) {
    console.error(error);
    showToast('error', `${errorMessage} Попробуйте снова.`, {
      actionLabel: 'Попробовать снова',
      onAction: () => runAsyncAction(control, key, task, errorMessage),
    });
    return false;
  } finally {
    pendingActions.delete(key);
    setActionPending(control, false);
  }
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
  const confirm = document.createElement('div');
  confirm.className = 'delete-confirm';
  const art = document.createElement('div');
  art.className = 'delete-art';
  art.innerHTML = icon('trash', 'ui-icon');
  const description = document.createElement('p');
  description.textContent = message;
  confirm.append(art);
  const actions = document.createElement('div');
  actions.className = 'button-stack inline-buttons';
  const cancelButton = document.createElement('button');
  cancelButton.className = 'ghost-button';
  cancelButton.type = 'button';
  cancelButton.dataset.action = 'cancel-delete';
  cancelButton.textContent = 'Отмена';
  const deleteButton = document.createElement('button');
  deleteButton.className = 'button danger-button';
  deleteButton.type = 'button';
  deleteButton.dataset.action = 'confirm-delete';
  deleteButton.textContent = 'Удалить';
  actions.append(cancelButton, deleteButton);
  confirm.append(description, actions);
  appModalBody.replaceChildren(confirm);
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

async function confirmDeleteAction(control) {
  if (!activeConfirm) return;
  const callback = activeConfirm.onConfirm;
  await runAsyncAction(control, 'confirm-delete', async () => {
    await callback?.();
    closeDeleteConfirm();
    showToast('success', 'Запись удалена');
    return true;
  }, 'Не удалось удалить запись.');
}

function openEditorById(id, options) {
  const editor = document.querySelector(`#${id}`);
  openEditorModal(editor, options);
  syncAllPillGroups();
}

function syncPillGroup(selectId) {
  const select = document.getElementById(selectId);
  if (!select) return;
  document.querySelectorAll(`[data-select="${CSS.escape(selectId)}"]`).forEach((b) => {
    const on = b.dataset.value === select.value;
    b.classList.toggle('is-active', on);
    b.querySelector('.pill-check')?.toggleAttribute('hidden', !on);
  });
}

function syncAllPillGroups() {
  document.querySelectorAll('[data-pill-group]').forEach((g) => syncPillGroup(g.dataset.pillGroup));
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

const OWNER_COLOR_BY_TONE = {
  violet: '#afa9ec',
  purple: '#afa9ec',
  teal: '#5dcaa5',
  green: '#5dcaa5',
  rose: '#f0997b',
  coral: '#f0997b',
  red: '#f09595',
  amber: '#fac775',
  yellow: '#fac775',
  pink: '#d4537e',
};
const ownerVisualsById = new Map();

function syncOwnerVisuals(users) {
  ownerVisualsById.clear();
  users.forEach((user, index) => {
    ownerVisualsById.set(user.id, {
      id: user.id,
      name: user.name,
      color: OWNER_COLOR_BY_TONE[user.tone] || Object.values(OWNER_COLOR_BY_TONE)[index % 5],
    });
  });
}

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

function ownerMarkup(owner, userId = '') {
  const visual = ownerVisualsById.get(userId)
    || [...ownerVisualsById.values()].find((item) => item.name === owner);
  return visual
    ? `<span class="owner-name" data-owner-id="${escapeHtml(visual.id)}" style="color:${visual.color}">${owner}</span>`
    : owner;
}

function colorOwnerNames(root = document.body) {
  const visuals = [...ownerVisualsById.values()].filter((item) => item.name);
  if (!visuals.length) return;
  const byName = new Map(visuals.map((item) => [item.name, item]));
  const escapedNames = visuals.map((item) => item.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const matcher = new RegExp(escapedNames.join('|'));
  const splitter = new RegExp(`(${escapedNames.join('|')})`, 'g');
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || parent.closest('script, style, button, label, input, textarea, select, option, .owner-name')) {
        return NodeFilter.FILTER_REJECT;
      }
      return matcher.test(node.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    },
  });
  const nodes = [];

  while (walker.nextNode()) nodes.push(walker.currentNode);

  nodes.forEach((node) => {
    const fragment = document.createDocumentFragment();
    node.nodeValue.split(splitter).forEach((part) => {
      if (!part) return;
      if (byName.has(part)) {
        const visual = byName.get(part);
        const span = document.createElement('span');
        span.className = 'owner-name';
        span.dataset.ownerId = visual.id;
        span.style.color = visual.color;
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
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', document.body.dataset.theme === 'light' ? '#eef2f8' : '#000000');
}

async function loadTheme() {
  const theme = await db.getSetting('theme', 'dark');
  await applyTheme(theme);
  const check = document.querySelector('#themeRowCheck');
  if (check) check.hidden = theme !== 'dark';
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
  const hasUnsavedOperation = sheet
    && !sheet.hidden
    && sheet.classList.contains('is-open')
    && operationDraftBaseline
    && getOperationDraftSignature() !== operationDraftBaseline;
  if (hasUnsavedOperation) {
    showToast('error', 'Есть несохраненные изменения', {
      actionLabel: 'Перейти',
      onAction: () => {
        closeSheet({ force: true });
        showScreen(nextName, { updateRoute, replaceRoute });
      },
    });
    return false;
  }
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
  closeSheet({ force: true });
  return true;
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

async function openSheet(transaction = null) {
  showOperationMain();
  editingTransactionId = transaction?.id ?? null;
  operationAccumulator = null;
  operationOperator = null;
  operationAwaitingOperand = false;

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
        ? { categoryId: category.id, category: category.name, tone: category.tone, icon: category.icon, subcategory }
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
  operationDraftBaseline = getOperationDraftSignature();
  activateModalLayer();
  backdrop.hidden = false;
  sheet.hidden = false;
  requestAnimationFrame(() => {
    sheet.classList.add('is-open');
    focusModalStart(sheet);
  });
}

function getOperationDraftSignature() {
  const ownerInput = document.querySelector('input[name="owner"]:checked');
  return JSON.stringify({
    amount: operationAmount,
    accumulator: operationAccumulator,
    operator: operationOperator,
    category: pendingOperationCategory,
    date: selectedDate.toISOString().slice(0, 10),
    owner: ownerInput?.value || '',
    comment: operationCommentInput?.value || '',
  });
}

function closeSheet({ force = false } = {}) {
  if (!sheet || sheet.hidden) return true;
  if (!force && operationDraftBaseline && getOperationDraftSignature() !== operationDraftBaseline) {
    showToast('error', 'Есть несохраненные изменения', {
      actionLabel: 'Закрыть',
      onAction: () => closeSheet({ force: true }),
    });
    return false;
  }
  sheet.classList.remove('is-open');
  closeOperationComment();
  closeOperationSubcategories();
  editingTransactionId = null;
  operationDraftBaseline = null;
  releaseModalLayer();
  window.setTimeout(() => {
    if (!sheet.classList.contains('is-open')) {
      sheet.hidden = true;
      backdrop.hidden = true;
    }
  }, 220);
  return true;
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
  const type = pendingCategoryType || (activeTab === 'expense' ? 'expense' : 'income');
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
  const type = pendingCategoryType || (activeTab === 'expense' ? 'expense' : 'income');
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
  await db.runAtomic(['categories', 'subcategories', 'transactions', 'recurringPayments'], async (atomicStore) => {
    const [subcategories, transactions, payments] = await Promise.all([
      atomicStore.getAll('subcategories'),
      atomicStore.getAll('transactions'),
      atomicStore.getAll('recurringPayments'),
    ]);
    for (const subcategory of subcategories.filter((item) => item.categoryId === categoryId)) {
      await atomicStore.remove('subcategories', subcategory.id);
    }
    for (const transaction of transactions.filter((item) => item.categoryId === categoryId)) {
      const detached = { ...transaction };
      delete detached.categoryId;
      delete detached.subcategoryId;
      await atomicStore.put('transactions', detached);
    }
    for (const payment of payments.filter((item) => item.categoryId === categoryId)) {
      const detached = { ...payment, categoryLabel: 'Без категории' };
      delete detached.categoryId;
      await atomicStore.put('recurringPayments', detached);
    }
    await atomicStore.remove('categories', categoryId);
  });
  await Promise.all([renderCategoriesScreen(), renderRecurringScreen(), populateRecurringCategorySelect()]);
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
      await db.runAtomic(['subcategories', 'transactions'], async (atomicStore) => {
        const transactions = await atomicStore.getAll('transactions');
        for (const transaction of transactions.filter((item) => item.subcategoryId === subcategoryId)) {
          const detached = { ...transaction };
          delete detached.subcategoryId;
          await atomicStore.put('transactions', detached);
        }
        await atomicStore.remove('subcategories', subcategoryId);
      });
      await renderCategoriesScreen();
      setCategoryStatus(`Подкатегория «${name}» удалена`);
    },
  });
}

async function removeFinanceItem(control) {
  const item = control.closest('[data-removable], .bank-directory-card');
  if (item?.dataset.goalId) {
    await removeLinkedFinanceEntity('goals', item.dataset.goalId, 'goal');
    await renderGoalsScreen();
    return;
  }
  if (item?.dataset.recurringId) {
    await removeLinkedFinanceEntity('recurringPayments', item.dataset.recurringId, 'recurringPayment');
    await Promise.all([renderRecurringScreen(), renderUpcomingPayments()]);
    return;
  }
  if (item?.dataset.creditCardId) {
    await removeLinkedFinanceEntity('creditCards', item.dataset.creditCardId, 'creditCard');
    await Promise.all([renderCreditsScreen(), renderUpcomingPayments()]);
    return;
  }
  if (item?.dataset.loanId) {
    await removeLinkedFinanceEntity('loans', item.dataset.loanId, 'loan');
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

async function removeLinkedFinanceEntity(storeName, id, linkedType) {
  await db.runAtomic(['transactions', storeName], async (atomicStore) => {
    const transactions = await atomicStore.getAll('transactions');
    for (const transaction of transactions) {
      if (transaction.linkedType !== linkedType || transaction.linkedId !== id) continue;
      const detached = { ...transaction };
      delete detached.linkedType;
      delete detached.linkedId;
      await atomicStore.put('transactions', detached);
    }
    await atomicStore.remove(storeName, id);
  });
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

const MONTHS_GENITIVE = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];

function formatLongRuDate(isoDate) {
  const [, month, day] = String(isoDate).split('-').map(Number);
  return `${day} ${MONTHS_GENITIVE[month - 1]}`;
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
    const card = document.createElement('article');
    card.className = 'card-lg goal-card';
    card.dataset.removable = '';
    card.dataset.goalId = goal.id;
    card.innerHTML = `
      <button class="finance-main goal-main" type="button" data-action="open-history">
        <span class="badge" style="background:${TONE_BG[goal.tone] || TONE_BG.violet};color:${TONE_HEX[goal.tone] || TONE_HEX.violet}">${icon(goal.icon && iconPaths[goal.icon] ? goal.icon : 'target', 'ui-icon')}</span>
        <div class="row-1"><p class="name">${escapeHtml(goal.title)}</p><p class="meta">${formatRub(goal.savedAmount)} из ${formatRub(goal.targetAmount)} · <span>Общая</span></p></div>
        <p class="amount">${percent}%</p>
      </button>
      <div class="progress"><div class="progress-fill" style="width:${percent}%"></div></div>
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

  if (editingId) {
    const existing = await db.getById('goals', editingId);
    await db.put('goals', { ...existing, title: name, targetAmount, createdDate, tone: 'teal', id: editingId });
  } else {
    await db.put('goals', { title: name, targetAmount, savedAmount: 0, createdDate, tone: 'teal' });
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

  const [payments, transactions, categories] = await Promise.all([
    db.getAll('recurringPayments'),
    db.getAll('transactions'),
    db.getAll('categories'),
  ]);
  const thisMonth = payments.filter((p) => p.nextDate >= from && p.nextDate <= to);
  const paid = transactions
    .filter((transaction) => transaction.linkedType === 'recurringPayment' && transaction.date >= from && transaction.date <= to)
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const planned = paid + thisMonth.reduce((sum, payment) => sum + remainingRecurringPayment(payment), 0);

  const plannedEl = document.querySelector('[data-recurring-summary="planned"]');
  const paidEl = document.querySelector('[data-recurring-summary="paid"]');
  if (plannedEl) plannedEl.textContent = formatRub(planned);
  if (paidEl) paidEl.textContent = formatRub(paid);

  const incomeList = document.querySelector('#plannedIncomeList');
  list.querySelectorAll('.recurring-card').forEach((el) => el.remove());
  incomeList?.querySelectorAll('.recurring-card').forEach((el) => el.remove());
  const expensePayments = payments.filter((p) => (p.flow || 'expense') !== 'income');
  const incomePayments = payments.filter((p) => (p.flow || 'expense') === 'income');
  const emptyState = list.querySelector('.empty-state');
  if (emptyState) emptyState.hidden = expensePayments.length > 0;
  const incomeEmpty = incomeList?.querySelector('.empty-state');
  if (incomeEmpty) incomeEmpty.hidden = incomePayments.length > 0;
  const incomePlannedSum = incomePayments.reduce((sum, p) => sum + remainingRecurringPayment(p), 0);
  const expensePlannedSum = expensePayments.filter((p) => p.nextDate >= from && p.nextDate <= to).reduce((sum, p) => sum + remainingRecurringPayment(p), 0);
  document.querySelectorAll('#recurringScreen [data-upcoming="income"]').forEach((el) => { el.textContent = '+' + formatRub(incomePlannedSum); });
  document.querySelectorAll('#recurringScreen [data-upcoming="expense"]').forEach((el) => { el.textContent = '−' + formatRub(expensePlannedSum); });

  const users = await db.getAll('users');
  const statusMeta = {
    overdue: { label: 'просрочен', tone: 'rose', stateClass: 'is-overdue' },
    urgent: { label: 'скоро', tone: 'rose', stateClass: 'is-soon' },
    soon: { label: 'скоро', tone: 'amber', stateClass: 'is-soon' },
    scheduled: { label: 'запланирован', tone: '', stateClass: '' },
    paid: { label: 'оплачен', tone: 'green', stateClass: '' },
  };

  [...expensePayments, ...incomePayments]
    .sort((a, b) => a.nextDate.localeCompare(b.nextDate))
    .forEach((payment) => {
      const isIncomeFlow = (payment.flow || 'expense') === 'income';
      const status = db.getRecurringPaymentStatus(payment, now);
      const meta = statusMeta[status];
      const user = users.find((u) => u.id === payment.userId);
      const [year, month, day] = payment.nextDate.split('-');
      const category = categories.find((item) => item.id === payment.categoryId);
      const categoryName = category?.name || payment.categoryLabel || 'Без категории';
      const paymentIcon = categoryEmoji(category, categoryName);



      const isOverdue = status === 'overdue';
      const isPaid = status === 'paid';
      const statusText = isPaid
        ? `${isIncomeFlow ? 'Получено' : 'Оплачено'} ${day}.${month}`
        : isOverdue
          ? `Просрочен · ${day}.${month}`
          : `Оплата ${day}.${month}`;
      const card = document.createElement('article');
      card.className = `card-lg finance-card recurring-card flow-${payment.flow || 'expense'}${meta.stateClass ? ` ${meta.stateClass}` : ''}`;
      card.dataset.flow = payment.flow || 'expense';
      card.dataset.removable = '';
      card.dataset.recurringId = payment.id;
      card.innerHTML = `
        <button class="finance-main" type="button" data-action="open-history">
          <span class="badge" style="background:${TONE_BG[category?.tone] || TONE_BG.teal};color:${TONE_HEX[category?.tone] || TONE_HEX.teal}">${categoryIcon(category, categoryName)}</span>
          <div class="row-1"><p class="name">${escapeHtml(payment.title)}</p><p class="meta">${ownerMarkup(escapeHtml(user?.name ?? '—'), payment.userId)} · ${escapeHtml(categoryName)} · ${escapeHtml(payment.periodicity)}</p></div>
          <p class="amount${isIncomeFlow ? ' positive' : ''}">${isIncomeFlow ? '+' : ''}${formatRub(remainingRecurringPayment(payment) || payment.amount)}</p>
        </button>
        <div class="recurring-foot">
          <p class="${isOverdue ? 'overdue-text' : 'meta'}">${statusText}</p>
          <button class="checkbox${isPaid ? ' done' : ''}" type="button" data-action="mark-recurring-paid" data-recurring-id="${payment.id}" aria-label="Отметить оплаченным"${isPaid ? ' disabled' : ''}>${isPaid ? icon('check', 'ui-icon') : ''}</button>
        </div>
      `;
      ((isIncomeFlow && incomeList) ? incomeList : list).append(card);
    });

  renderFunctionalIcons(list);
  if (incomeList) renderFunctionalIcons(incomeList);
  renderCategoryPicker();
}

async function saveRecurringDraft() {
  const title = document.querySelector('#recurringTitleInput')?.value.trim();
  const amount = parseAmountInput(document.querySelector('#recurringAmountInput')?.value);
  const nextDate = parseRuDate(document.querySelector('#recurringDateInput')?.value);
  const categoryId = document.querySelector('#recurringCategorySelect')?.value;
  const periodicity = document.querySelector('#recurringPeriodicitySelect')?.value || 'ежемесячно';
  const flow = document.querySelector('#recurringFlowInput')?.value === 'income' ? 'income' : 'expense';
  const users = await db.getAll('users');
  const userId = document.querySelector('#recurringOwnerSelect')?.value || users[0]?.id;
  const editingId = document.querySelector('#recurringEditingId')?.value;
  const titleErr = document.querySelector('[data-err="recurringTitleInput"]');
  const amountErr = document.querySelector('[data-err="recurringAmountInput"]');
  const markInvalid = (inputId, errEl, message) => {
    document.querySelector('#' + inputId)?.closest('.field')?.classList.add('invalid');
    if (errEl) { errEl.hidden = false; errEl.textContent = message; }
  };
  const clearInvalid = (inputId, errEl) => {
    document.querySelector('#' + inputId)?.closest('.field')?.classList.remove('invalid');
    if (errEl) errEl.hidden = true;
  };

  if (!title) {
    markInvalid('recurringTitleInput', titleErr, 'Обязательное поле');
    showToast('error', 'Введите название платежа');
    return false;
  }
  clearInvalid('recurringTitleInput', titleErr);
  if (!(amount > 0)) {
    markInvalid('recurringAmountInput', amountErr, 'Сумма должна быть больше нуля');
    showToast('error', 'Укажите сумму больше нуля');
    return false;
  }
  clearInvalid('recurringAmountInput', amountErr);
  if (!nextDate) {
    showToast('error', 'Укажите дату оплаты в формате ДД.ММ.ГГГГ');
    return false;
  }

  const category = categoryId ? await db.getById('categories', categoryId) : null;
  if (!category || category.type !== flow) {
    showToast('error', flow === 'income' ? 'Выберите категорию дохода' : 'Выберите категорию расхода');
    return false;
  }
  const payload = { title, amount, nextDate, paymentDay: Number(nextDate.slice(-2)), categoryId: category.id, categoryLabel: category.name, periodicity, userId, flow };
  if (editingId) {
    const existing = await db.getById('recurringPayments', editingId);
    const normalized = updateRecurringPaymentCycle(
      { ...existing, ...payload, id: editingId },
      { amount: 0, sign: 0, date: todayIsoDate() },
    );
    await db.put('recurringPayments', normalized);
  } else {
    await db.put('recurringPayments', { ...payload, cyclePaid: 0, paymentDay: Number(nextDate.slice(-2)), paymentCycleVersion: 2 });
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
  };
  for (const [selector, value] of Object.entries(fields)) {
    const field = document.querySelector(selector);
    if (field) field.value = value;
  }
  const categorySelect = document.querySelector('#recurringCategorySelect');
  if (categorySelect?.options.length) {
    categorySelect.selectedIndex = 0;
    syncCustomSelect(categorySelect);
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
  };
  for (const [selector, value] of Object.entries(fields)) {
    const field = document.querySelector(selector);
    if (field) field.value = value;
  }
  const categorySelect = document.querySelector('#recurringCategorySelect');
  if (categorySelect) {
    categorySelect.value = payment.categoryId || '';
    syncCustomSelect(categorySelect);
  }
  const periodicitySelect = document.querySelector('#recurringPeriodicitySelect');
  if (periodicitySelect) periodicitySelect.value = payment.periodicity;
  const ownerSelect = document.querySelector('#recurringOwnerSelect');
  if (ownerSelect) ownerSelect.value = payment.userId;
  openEditorById('recurringEditor', { mode: 'edit' });
}

const REMINDER_REPEAT_LABELS = {
  none: 'Разово',
  daily: 'Ежедневно',
  weekly: 'Каждую неделю',
  monthly: 'Каждый месяц',
  yearly: 'Каждый год',
};

function reminderAssigneeLabel(value, users = []) {
  if (value === 'both') return 'Оба';
  return users.find((user) => user.id === value)?.name || 'Пользователь';
}

function reminderAssigneeMarkup(value, users = []) {
  if (value === 'both') {
    return users.map((user) => ownerMarkup(escapeHtml(user.name), user.id)).join(' · ') || 'Оба';
  }
  return ownerMarkup(escapeHtml(reminderAssigneeLabel(value, users)), value);
}

function reminderRepeatLabel(reminder) {
  return REMINDER_REPEAT_LABELS[reminder.repeat] || 'Разово';
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

  const [storedReminders, users] = await Promise.all([db.getAll('reminders'), db.getAll('users')]);
  const reminders = storedReminders.sort((a, b) =>
    Number(a.completed) - Number(b.completed) || a.nextDate.localeCompare(b.nextDate)
  );
  const active = reminders.filter((r) => !r.completed);
  const completed = reminders.filter((r) => r.completed && (!r.repeat || r.repeat === 'none'));
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

  const stripeColor = (reminder) => {
    if (db.getReminderStatus(reminder) === 'overdue') return '#f09595';
    const first = reminder.assignee === 'both' ? users[0] : users.find((u) => u.id === reminder.assignee);
    return (first && OWNER_COLOR_BY_TONE[first.tone]) || '#afa9ec';
  };
  const renderCard = (reminder) => {
    const done = db.getReminderStatus(reminder) === 'completed';
    const dateText = formatRuDate(reminder.nextDate).slice(0, 5);
    return `
      <article class="row finance-card reminder-card" data-reminder-id="${reminder.id}" data-removable>
        <span class="stripe" style="background:${stripeColor(reminder)}"></span>
        <button class="finance-main row-1" type="button" data-action="open-history">
          <p class="name">${escapeHtml(reminder.title)}</p><p class="meta">${dateText} · ${reminderRepeatLabel(reminder)} · ${reminderAssigneeMarkup(reminder.assignee, users)}</p>
        </button>
        <button class="checkbox${done ? ' done' : ''}" type="button" data-action="toggle-reminder-complete" data-reminder-id="${reminder.id}" aria-label="${done ? 'Вернуть в работу' : 'Отметить выполненным'}">${done ? icon('check', 'ui-icon') : ''}</button>
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

  const [, reminderMonth, reminderDay] = nextDate.split('-').map(Number);
  const payload = {
    title,
    description,
    nextDate,
    assignee,
    repeat,
    monthlyDay: repeat === 'monthly' ? monthlyDay : undefined,
    yearlyMonth: repeat === 'yearly' ? reminderMonth : undefined,
    yearlyDay: repeat === 'yearly' ? reminderDay : undefined,
  };
  if (editingId) {
    const existing = await db.getById('reminders', editingId);
    await db.put('reminders', { ...existing, ...payload, id: editingId });
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

async function migrateCompletedRepeatingReminders() {
  const reminders = await db.getAll('reminders');
  await Promise.all(
    reminders
      .filter((reminder) => reminder.completed && reminder.repeat && reminder.repeat !== 'none')
      .map((reminder) => db.put('reminders', {
        ...reminder,
        nextDate: db.getNextReminderDate(reminder),
        completed: false,
        completedAt: undefined,
      })),
  );
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
  select.innerHTML = banks.map((b) => `<option value="${b.id}" data-color="${escapeHtml(b.color || '#8a8f98')}" data-logo="${escapeHtml(b.logoDataUrl || '')}">${escapeHtml(b.name)}</option>`).join('');
  refreshCustomSelectOptions(select);
}

async function migrateCreditProductTitles() {
  const [banks, cards, loans] = await Promise.all([
    db.getAll('banks'),
    db.getAll('creditCards'),
    db.getAll('loans'),
  ]);
  const bankName = (bankId) => banks.find((bank) => bank.id === bankId)?.name;
  await Promise.all([
    ...cards.map((card) => {
      const title = bankName(card.bankId);
      return title && card.title !== title ? db.put('creditCards', { ...card, title }) : Promise.resolve();
    }),
    ...loans.map((loan) => {
      const title = bankName(loan.bankId);
      return title && loan.title !== title ? db.put('loans', { ...loan, title }) : Promise.resolve();
    }),
  ]);
}

async function populateRecurringCategorySelect() {
  const select = document.querySelector('#recurringCategorySelect');
  if (!select) return;
  const current = select.value;
  const allCategories = await db.getAll('categories');
  const categories = [...allCategories.filter((c) => c.type === 'expense'), ...allCategories.filter((c) => c.type === 'income')];
  select.innerHTML = categories
    .map((category) => `<option value="${category.id}">${escapeHtml(categoryEmoji(category, category.name))} ${escapeHtml(category.name)}</option>`)
    .join('');
  select.value = categories.some((category) => category.id === current) ? current : categories[0]?.id || '';
  refreshCustomSelectOptions(select);
}

function renderDebtCard({ id, datasetKey, bankName, ownerLine, metaLine, logoIcon, debt, initialAmount, metrics, paymentKind }) {
  const card = document.createElement('article');
  card.className = 'card-lg finance-card credit-card';
  card.dataset.removable = '';
  card.dataset[datasetKey] = id;
  const remainPct = initialAmount > 0 ? Math.min(100, Math.round((debt / initialAmount) * 100)) : 0;
  card.innerHTML = `
    <button class="finance-main debt-main" type="button" data-action="open-history">
      ${logoIcon}
      <div class="row-1"><p class="name">${escapeHtml(bankName || 'Банк')}${ownerLine ? ` <span>· ${ownerLine}</span>` : ''}</p><p class="meta">${metaLine}</p></div>
    </button>
    <div class="debt-head"><p>${formatRub(debt)}</p><span class="pill">${remainPct}%</span></div>
    <div class="grid-2">${metrics.map(([label, value]) => `<div><p class="meta">${label}</p><p class="name">${value}</p></div>`).join('')}</div>
    <div class="progress"><div class="progress-fill" style="width:${remainPct}%"></div></div>
    <p class="meter-caption">Осталось выплатить ${remainPct}%</p>
  `;
  return card;
}

function debtBadge(bankLogo, bankName, bankColor) {
  if (bankLogo) return `<span class="badge badge-lg bank-badge-img"><img src="${bankLogo}" alt=""></span>`;
  const c = bankColor || '#8a8f98';
  return `<span class="badge badge-lg" style="background:${c}22;color:${c}">${escapeHtml((bankName || '??').slice(0, 2).toUpperCase())}</span>`;
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
    ...cards
      .filter((card) => Number(card.debt) > 0)
      .map((card) => ({ amount: remainingDebtPayment(card, 'card'), date: card.nextDate, userId: card.userId })),
    ...loansAndInstallments
      .filter((loan) => Number(loan.debt) > 0)
      .map((loan) => ({ amount: remainingDebtPayment(loan, 'loan'), date: loan.nextDate, userId: loan.userId })),
  ]
    .filter((payment) => payment.amount > 0 && /^\d{4}-\d{2}-\d{2}$/.test(payment.date || ''))
    .sort((a, b) => a.date.localeCompare(b.date));
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

  const ownerPills = document.querySelector('#creditsOwnerPills');
  if (ownerPills) {
    const debtByOwner = new Map();
    [...cards, ...loansAndInstallments].forEach((item) => {
      debtByOwner.set(item.userId, (debtByOwner.get(item.userId) || 0) + (Number(item.debt) || 0));
    });
    ownerPills.innerHTML = users
      .filter((u) => (debtByOwner.get(u.id) || 0) > 0)
      .map((u) => `<span><span class="owner-name" style="color:${OWNER_COLOR_BY_TONE[u.tone] || '#afa9ec'}">${escapeHtml(u.name)}</span><span>${formatRub(debtByOwner.get(u.id))}</span></span>`)
      .join('');
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
      ownerLine: ownerMarkup(escapeHtml(userName(card.userId)), card.userId),
      metaLine: card.cardNetwork ? `${escapeHtml(card.cardNetwork)} · льготный период ${card.gracePeriodDays || 0} дней` : `Льготный период ${card.gracePeriodDays || 0} дней`,
      logoIcon: debtBadge(bankLogoOf(card.bankId), bankName(card.bankId), bankColorOf(card.bankId)),
      debt: card.debt,
      initialAmount: card.limit,
      paymentKind: 'card',
      metrics: [
        ['Кредитный лимит', formatRub(card.limit)],
        ['Задолженность', formatRub(card.debt)],
        ['Мин. платёж', formatRub(remainingDebtPayment(card, 'card'))],
        ['Дата платежа', formatRuDate(card.nextDate).slice(0, 5)],
      ],
    });
    cardsList.append(el);
  });

  const renderLoanLike = (item, list) => {
    const paidAmount = Math.max(0, item.initialAmount - item.debt);
    const paidPercent = item.initialAmount > 0 ? Math.round((paidAmount / item.initialAmount) * 100) : 0;
    const isInstallment = item.kind === 'installment';
    const el = renderDebtCard({
      id: item.id,
      datasetKey: 'loanId',
      bankName: item.title || bankName(item.bankId),
      ownerLine: ownerMarkup(escapeHtml(userName(item.userId)), item.userId),
      metaLine: isInstallment ? `${escapeHtml(bankName(item.bankId))} · ${item.termMonths || 0} мес.` : `${escapeHtml(bankName(item.bankId))} · ${item.termMonths || 0} месяцев`,
      logoIcon: isInstallment
        ? `<span class="badge badge-lg t-teal">${icon('laptop', 'ui-icon')}</span>`
        : debtBadge(bankLogoOf(item.bankId), item.title || bankName(item.bankId), bankColorOf(item.bankId)),
      debt: item.debt,
      initialAmount: item.initialAmount,
      paymentKind: 'loan',
      metrics: isInstallment ? [
        ['Стоимость', formatRub(item.initialAmount)],
        ['Ставка', `${item.rate || 0}%`],
        ['Платёж', formatRub(remainingDebtPayment(item, 'loan'))],
        ['Дата', formatRuDate(item.nextDate).slice(0, 5)],
      ] : [
        ['Первоначальная сумма', formatRub(item.initialAmount)],
        ['Ставка', `${item.rate || 0}%`],
        ['Платёж', formatRub(remainingDebtPayment(item, 'loan'))],
        ['Дата', formatRuDate(item.nextDate).slice(0, 5)],
      ],
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
  const users = await db.getAll('users');
  const userId = document.querySelector('#creditOwnerSelect')?.value || users[0]?.id;
  const initial = parseAmountInput(document.querySelector('#creditInitialInput')?.value);
  const debt = parseAmountInput(document.querySelector('#creditDebtInput')?.value);
  const rate = parseAmountInput(document.querySelector('#creditRateInput')?.value);
  const payment = parseAmountInput(document.querySelector('#creditPaymentInput')?.value);
  const nextDate = parseRuDate(document.querySelector('#creditDateInput')?.value);
  const term = parseInt(document.querySelector('#creditTermInput')?.value, 10) || 0;
  const grace = parseInt(document.querySelector('#creditGraceInput')?.value, 10) || 0;
  const editingId = document.querySelector('#creditEditingId')?.value;

  const validationError = validateCreditDraft({ bankId, userId, kind, initial, debt, rate, payment, term, nextDate });
  if (validationError) {
    showToast('error', validationError);
    return false;
  }

  const bank = await db.getById('banks', bankId);
  const title = bank?.name;
  if (!title) {
    showToast('error', 'Выбранный банк не найден в справочнике');
    return false;
  }
  if (!userId) {
    showToast('error', 'Добавьте хотя бы одного пользователя в настройках');
    return false;
  }

  if (kind === 'card') {
    const payload = { bankId, title, userId, limit: initial, debt, minPayment: payment, nextDate, paymentDay: Number(nextDate.slice(-2)), gracePeriodDays: grace };
    if (editingId) {
      const existing = await db.getById('creditCards', editingId);
      const normalized = updateDebtPaymentCycle({ ...existing, ...payload, id: editingId }, { amount: 0, sign: 1, kind: 'card' });
      await db.put('creditCards', normalized);
    } else {
      await db.put('creditCards', { ...payload, cyclePaid: 0, paymentDay: Number(nextDate.slice(-2)), paymentCycleVersion: 2 });
    }
  } else {
    const payload = { kind, bankId, title, userId, initialAmount: initial, debt, rate, payment, nextDate, paymentDay: Number(nextDate.slice(-2)), termMonths: term };
    if (editingId) {
      const existing = await db.getById('loans', editingId);
      const normalized = updateDebtPaymentCycle({ ...existing, ...payload, id: editingId }, { amount: 0, sign: 1, kind: 'loan' });
      await db.put('loans', normalized);
    } else {
      await db.put('loans', { ...payload, cyclePaid: 0, paymentDay: Number(nextDate.slice(-2)), paymentCycleVersion: 2 });
    }
  }

  await Promise.all([renderCreditsScreen(), renderUpcomingPayments()]);
  return true;
}

function resetCreditEditor() {
  const idInput = document.querySelector('#creditEditingId');
  if (idInput) idInput.value = '';
  const fields = {
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
  document.querySelector('#creditOwnerSelect').value = loan.userId;
  document.querySelector('#creditInitialInput').value = loan.initialAmount;
  document.querySelector('#creditDebtInput').value = loan.debt;
  document.querySelector('#creditRateInput').value = loan.rate;
  document.querySelector('#creditPaymentInput').value = loan.payment;
  document.querySelector('#creditDateInput').value = formatRuDate(loan.nextDate);
  document.querySelector('#creditTermInput').value = loan.termMonths;
  openEditorById('creditsEditor', { mode: 'edit' });
}

const TONE_HEX = { violet: '#afa9ec', teal: '#5dcaa5', green: '#5d96ec', rose: '#f0997b', amber: '#fac775' };
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
  syncOwnerVisuals(users);
  document.querySelectorAll('.owner-name[data-owner-id]').forEach((element) => {
    const visual = ownerVisualsById.get(element.dataset.ownerId);
    if (visual) element.style.color = visual.color;
  });
  colorOwnerNames(document.body);
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
  await applyOwnerColors();
  await Promise.all([
    renderUsersSettings(),
    renderOwnerControls(),
    refreshDashboard(),
    renderTransactionScreen('income'),
    renderTransactionScreen('expense'),
    renderArchiveScreen(),
    renderPlannerEvents(),
    renderCreditsScreen(),
    renderRecurringScreen(),
    renderRemindersScreen(),
    renderStatisticsScreen(),
    renderDashboardReminders(),
  ]);
  return true;
}

async function renderUsersSettings() {
  const list = document.querySelector('#usersList');
  const countEl = document.querySelector('#usersCount');
  if (!list) return;
  const users = await db.getAll('users');
  syncOwnerVisuals(users);
  if (countEl) countEl.textContent = String(users.length);
  const toneLabel = { violet: 'фиолетовый', teal: 'бирюзовый', green: 'зелёный', rose: 'розовый', amber: 'жёлтый' };
  list.innerHTML = users
    .map(
      (user, index) => `
    <button class="settings-row user-row" type="button" data-action="edit-user" data-user-id="${user.id}">
      <span class="badge" style="color:${TONE_HEX[user.tone] || TONE_HEX.violet};background:${TONE_BG[user.tone] || TONE_BG.violet}">${icon('user', 'ui-icon')}</span>
      <span class="row-1">${escapeHtml(user.name)}</span>
      ${index === 0 ? '<span class="meta">Вы</span>' : '<svg class="ti"><use href="#i-chev-r"/></svg>'}
    </button>
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
  document.querySelector('#bankColorInput').value = '#afa9ec';
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
  const color = document.querySelector('#bankColorInput')?.value || '#afa9ec';
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
  await migrateCreditProductTitles();
  await Promise.all([renderBanksSettings(), renderCreditsScreen(), renderUpcomingPayments(), populateCreditBankSelect()]);
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
        <i></i><em><span class="category-emoji-inline">${categoryIcon(row.icon, row.name)}</span>${escapeHtml(row.name)}</em><b class="${row.tone}">${formatRub(row.amount)} (${row.percent}%)</b>
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

  const today = new Date().toISOString().slice(0, 10);
  const oldestTransactionDate = allTx.at(-1)?.date;
  const periodLabel = currentPeriod === 'thisMonth'
    ? new Date().toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })
    : range.from === '0000-01-01' && !oldestTransactionDate
      ? 'За все время'
      : `${formatRuDate(range.from === '0000-01-01' ? oldestTransactionDate : range.from)} – ${formatRuDate(range.to === '9999-12-31' ? today : range.to)}`;
  setStat('period-label-1', periodLabel);
  setStat('period-label-2', periodLabel);

  const days = from && to
    ? daysBetween(from, to)
    : oldestTransactionDate
      ? Math.max(1, daysBetween(oldestTransactionDate, today))
      : 1;
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
              <div><b>${escapeHtml(category?.name ?? t.label ?? 'Без категории')} ${ownerMarkup(escapeHtml(user?.name ?? '—'), user?.id)}</b><small>${t.type === 'income' ? 'Доход' : 'Расход'}</small></div>
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
  await Promise.all([renderStatisticsOverview(), renderStatisticsOperations(), renderInsightsTab()]);
}

async function renderArchiveScreen() {
  const { from, to } = getPeriodRange(currentPeriod);
  const list = document.querySelector('#archiveRecordList');
  const emptyState = document.querySelector('#archiveEmptyState');
  if (!list) return;
  const ownerFilter = ownerFilterState.archive;

  const [allTransactions, loansAndInstallments, creditCards, goals, categories, users, banks] = await Promise.all([
    db.listTransactions(),
    db.getAll('loans'),
    db.getAll('creditCards'),
    db.getAll('goals'),
    db.getAll('categories'),
    db.getAll('users'),
    db.getAll('banks'),
  ]);

  const matchesOwner = (userId) => ownerFilter === 'all' || userId === ownerFilter;
  const matchesPeriod = (date) => (!from || date >= from) && (!to || date <= to);
  const ownerNameHtml = (userId, name) => ownerMarkup(escapeHtml(name ?? '—'), userId);
  const matchesArchiveType = (t) => archiveTypeFilter === 'all' || t.type === archiveTypeFilter;
  const matchesArchiveCategory = (t) => archiveCategoryFilter.size === 0 || archiveCategoryFilter.has(t.categoryId || '');
  const matchesArchiveAmount = (t) => t.amount >= archiveMinAmount && (archiveMaxAmount <= 0 || t.amount <= archiveMaxAmount);
  const transactions = allTransactions.filter((transaction) => matchesOwner(transaction.userId) && matchesPeriod(transaction.date) && matchesArchiveType(transaction) && matchesArchiveCategory(transaction) && matchesArchiveAmount(transaction));
  const latestLinkedDate = (linkedType, linkedId, fallback) =>
    allTransactions
      .filter((transaction) => transaction.linkedType === linkedType && transaction.linkedId === linkedId)
      .sort((left, right) => right.date.localeCompare(left.date))[0]?.date || fallback;

  const entries = [];

  transactions.forEach((t) => {
    const category = categories.find((c) => c.id === t.categoryId);
    const user = users.find((u) => u.id === t.userId);
    entries.push({
      kind: 'transaction',
      id: t.id,
      date: t.date,
      titleHtml: `<span class="category-emoji-inline">${categoryIcon(category, category?.name ?? t.label)}</span>${escapeHtml(category?.name ?? t.label ?? 'Без категории')} → ${ownerNameHtml(t.userId, user?.name)}`,
      searchText: `${category?.name ?? t.label ?? 'Без категории'} ${user?.name ?? ''}`,
      meta: `${formatRuDate(t.date).slice(0, 5)} · ${t.type === 'income' ? 'Доход' : 'Расход'} · выполнено`,
      amount: t.amount,
      tone: t.type === 'income' ? 'green' : 'rose',
      sign: t.type === 'income' ? '+' : '−',
      detail: `Категория: ${category?.name ?? '—'}. Статус: ${t.type === 'income' ? 'получено' : 'оплачено'}.`,
    });
  });

  loansAndInstallments
    .map((loan) => ({ ...loan, archiveDate: latestLinkedDate('loan', loan.id, loan.nextDate) }))
    .filter((l) => l.debt <= 0 && matchesOwner(l.userId) && matchesPeriod(l.archiveDate))
    .forEach((l) => {
      const user = users.find((u) => u.id === l.userId);
      entries.push({
        kind: 'loan',
        id: l.id,
        date: l.archiveDate,
        titleHtml: `Закрытая ${l.kind === 'installment' ? 'рассрочка' : 'кредит'} ${escapeHtml(l.title)} → ${ownerNameHtml(l.userId, user?.name)}`,
        searchText: `${l.title} ${user?.name ?? ''}`,
        meta: `${formatRuDate(l.archiveDate).slice(0, 5)} · ${l.kind === 'installment' ? 'Рассрочка' : 'Кредит'} · закрыто`,
        amount: 0,
        tone: '',
        sign: '',
        detail: `Первоначальная сумма ${formatRub(l.initialAmount)}, обязательства закрыты.`,
      });
    });

  creditCards
    .map((card) => ({ ...card, archiveDate: latestLinkedDate('creditCard', card.id, card.nextDate) }))
    .filter((card) => card.debt <= 0 && matchesOwner(card.userId) && matchesPeriod(card.archiveDate))
    .forEach((card) => {
      const user = users.find((item) => item.id === card.userId);
      const bank = banks.find((item) => item.id === card.bankId);
      entries.push({
        kind: 'creditCard',
        id: card.id,
        date: card.archiveDate,
        titleHtml: `Закрытая кредитная карта ${escapeHtml(bank?.name || card.title || 'Банк')} → ${ownerNameHtml(card.userId, user?.name)}`,
        searchText: `${bank?.name || card.title || ''} ${user?.name || ''}`,
        meta: `${formatRuDate(card.archiveDate).slice(0, 5)} · Кредитная карта · закрыто`,
        amount: 0,
        tone: '',
        sign: '',
        detail: `Кредитный лимит ${formatRub(card.limit)}, задолженность погашена.`,
      });
    });

  goals
    .map((goal) => ({ ...goal, archiveDate: latestLinkedDate('goal', goal.id, goal.createdDate) }))
    .filter((goal) => goal.targetAmount > 0 && goal.savedAmount >= goal.targetAmount && matchesPeriod(goal.archiveDate))
    .forEach((goal) => {
      entries.push({
        kind: 'goal',
        id: goal.id,
        date: goal.archiveDate,
        titleHtml: `Выполненная цель ${escapeHtml(goal.title)}`,
        searchText: goal.title,
        meta: `${formatRuDate(goal.archiveDate).slice(0, 5)} · Цель · выполнено`,
        amount: goal.savedAmount,
        tone: 'green',
        sign: '+',
        detail: `Накоплено ${formatRub(goal.savedAmount)} из ${formatRub(goal.targetAmount)}.`,
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

  const activeFilterCount = (archiveTypeFilter !== 'all' ? 1 : 0) + (archiveCategoryFilter.size ? 1 : 0) + (archiveMinAmount > 0 || archiveMaxAmount > 0 ? 1 : 0) + (ownerFilter !== 'all' ? 1 : 0);
  const filterButton = document.querySelector('#archiveFilterButton');
  if (filterButton) filterButton.innerHTML = `<svg class="ti"><use href="#i-filter"/></svg>${activeFilterCount ? `Фильтр • ${activeFilterCount}` : 'Фильтр: Все'}`;
  const applyButton = document.querySelector('#filterApplyButton');
  if (applyButton) applyButton.textContent = `Показать ${visibleEntries.length} ${pluralizeOperations(visibleEntries.length)}`;

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
    <button class="category-choice-card" type="button" data-action="select-operation-category" data-category-id="${category.id}" data-category="${escapeHtml(category.name)}" data-category-icon="${escapeHtml(categoryEmoji(category, category.name))}" data-tone="${category.tone}">
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
    const unpaid = recurringPayments;
    recurringRow.innerHTML = unpaid.length
      ? unpaid.map((p) => buildLinkedCard('recurringPayment', p.id, p.title, 'Отметить оплаченным', 'rose')).join('')
      : '<p class="muted">Все обязательные платежи уже отмечены оплаченными.</p>';
  }

  renderFunctionalIcons(document.body);
}

function requestFinanceDelete(control) {
  const item = control.closest('[data-removable], .bank-directory-card');
  const name = item?.querySelector('.finance-main b, .finance-main .name, .goal-head b, .record b, .bank-directory-card b')?.textContent?.trim() || 'запись';
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
      const sourceCategory = categories.find((item) => item.id === t.categoryId);
      emoji = categoryEmoji(sourceCategory, sourceCategory?.name || title);
    }
    push(t.date, { title, emoji, amount: `${sign}${formatRub(t.amount)}`, owner: userName(t.userId), ownerId: t.userId, category, status: t.type === 'income' ? 'получено' : 'оплачено', color });
  });

  recurringPayments
    .filter((p) => p.nextDate >= fromIso && p.nextDate <= toIso)
    .forEach((p) => {
      const sourceCategory = categories.find((item) => item.id === p.categoryId);
      push(p.nextDate, { title: p.title, emoji: categoryEmoji(sourceCategory, sourceCategory?.name || p.title), amount: `−${formatRub(remainingRecurringPayment(p))}`, owner: userName(p.userId), ownerId: p.userId, category: 'Обязательный платеж', status: 'запланирован', color: 'amber' });
    });

  loansAndInstallments
    .filter((l) => l.debt > 0 && l.nextDate >= fromIso && l.nextDate <= toIso)
    .forEach((l) =>
      push(l.nextDate, { title: l.title, amount: `−${formatRub(remainingDebtPayment(l, 'loan'))}`, owner: userName(l.userId), ownerId: l.userId, category: 'Кредит', status: 'запланирован', color: 'amber' })
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
    .map((event) => {
      const title = String(event.title || '').startsWith(event.emoji || '')
        ? String(event.title).slice(String(event.emoji).length).trim()
        : event.title;
      const description = String(event.category || '').replace(/\p{Extended_Pictographic}/gu, '').trim();
      return `
      <div class="record">
        <div><b><span class="category-emoji-inline">${event.emoji ? categoryIcon(event.emoji) : ''}</span>${escapeHtml(title)} → ${ownerMarkup(escapeHtml(event.owner), event.ownerId)}</b><small>${escapeHtml(description)} · ${escapeHtml(event.status)}</small></div>
        <strong class="${event.color}">${event.amount}</strong>
      </div>
    `;
    })
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

  if (['÷', '×', '−', '+'].includes(key)) {
    const current = Number(operationAmount) || 0;
    if (operationOperator && operationAccumulator !== null && !operationAwaitingOperand) {
      operationAccumulator = calculateOperationAmount(operationAccumulator, current, operationOperator);
      operationAmount = String(operationAccumulator);
    } else if (operationAccumulator === null) {
      operationAccumulator = current;
    }
    operationOperator = key;
    operationAwaitingOperand = true;
  } else if (key === 'back') {
    if (operationAwaitingOperand) return;
    operationAmount = operationAmount.length > 1 ? operationAmount.slice(0, -1) : '0';
  } else if (key === '.') {
    if (operationAwaitingOperand) {
      operationAmount = '0';
      operationAwaitingOperand = false;
    }
    if (!operationAmount.includes('.')) operationAmount += '.';
  } else if (/^\d$/.test(key)) {
    if (operationAwaitingOperand) {
      operationAmount = '0';
      operationAwaitingOperand = false;
    }
    operationAmount = operationAmount === '0' ? key : `${operationAmount}${key}`;
  }

  operationAmountValue.textContent = operationAmount;
}

function calculateOperationAmount(left, right, operator) {
  let result = right;
  if (operator === '+') result = left + right;
  if (operator === '−') result = left - right;
  if (operator === '×') result = left * right;
  if (operator === '÷') result = right === 0 ? Number.NaN : left / right;
  return Number.isFinite(result) ? Math.round((result + Number.EPSILON) * 100) / 100 : result;
}

function finalizeOperationCalculation() {
  if (operationOperator && operationAccumulator !== null) {
    const right = operationAwaitingOperand ? 0 : Number(operationAmount) || 0;
    operationAmount = String(calculateOperationAmount(operationAccumulator, right, operationOperator));
    operationAccumulator = null;
    operationOperator = null;
    operationAwaitingOperand = false;
    if (operationAmountValue) operationAmountValue.textContent = operationAmount;
  }
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
const LINKED_STORES = { goal: 'goals', loan: 'loans', creditCard: 'creditCards', recurringPayment: 'recurringPayments' };

/**
 * Применяет побочный эффект связанной операции: пополнение цели уменьшает
 * "нужно накопить", платёж по кредиту/карте уменьшает задолженность,
 * оплата обязательного платежа помечает его оплаченным.
 * sign = 1 — применить (операция создана), sign = -1 — откатить (операция удалена/изменена).
 */
async function applyLinkedSideEffect(linkedType, linkedId, amount, sign, date, atomicStore) {
  const storeName = LINKED_STORES[linkedType];
  if (!storeName) return;
  const getRecord = atomicStore
    ? () => atomicStore.get(storeName, linkedId)
    : () => db.getById(storeName, linkedId);
  const saveRecord = atomicStore
    ? (record) => atomicStore.put(storeName, record)
    : (record) => db.put(storeName, record);
  const linkedRecord = await getRecord();
  if (!linkedRecord) throw new Error('Связанная финансовая запись не найдена');

  if (linkedType === 'goal') {
    await saveRecord({ ...linkedRecord, savedAmount: Math.max(0, Number(linkedRecord.savedAmount || 0) + sign * amount) });
  } else if (linkedType === 'loan') {
    await saveRecord(updateDebtPaymentCycle(linkedRecord, { amount, sign, kind: 'loan' }));
  } else if (linkedType === 'creditCard') {
    await saveRecord(updateDebtPaymentCycle(linkedRecord, { amount, sign, kind: 'card' }));
  } else if (linkedType === 'recurringPayment') {
    await saveRecord(updateRecurringPaymentCycle(linkedRecord, { amount, sign, date }));
  }
}

async function createLinkedTransaction(payload) {
  const storeName = LINKED_STORES[payload.linkedType];
  if (!storeName) throw new Error('Неизвестный тип связанной операции');
  return db.runAtomic(['transactions', storeName], async (atomicStore) => {
    const transaction = await atomicStore.put('transactions', { ...payload, createdAt: new Date().toISOString() });
    await applyLinkedSideEffect(payload.linkedType, payload.linkedId, payload.amount, 1, payload.date, atomicStore);
    return transaction;
  });
}

async function migratePaymentCycles() {
  const [cards, loans, recurringPayments, transactions] = await Promise.all([
    db.getAll('creditCards'),
    db.getAll('loans'),
    db.getAll('recurringPayments'),
    db.getAll('transactions'),
  ]);
  const linkedTotal = (type, id) => transactions
    .filter((transaction) => transaction.linkedType === type && transaction.linkedId === id)
    .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);
  const migrateRecord = async (store, record, type, required, periodicity = 'ежемесячно') => {
    if (record.paymentCycleVersion >= 2) return;
    let paid = linkedTotal(type, record.id);
    if (type === 'recurringPayment' && record.paidAt && paid === 0) paid = Number(required) || 0;
    let nextDate = record.nextDate;
    const paymentDay = Number(record.paymentDay) || Number(String(nextDate || '').slice(-2)) || undefined;
    const cycleAmount = Math.max(0, Number(required) || 0);
    while (cycleAmount > 0 && paid >= cycleAmount) {
      paid -= cycleAmount;
      nextDate = shiftPaymentDate(nextDate, periodicity, 1, paymentDay);
    }
    await db.put(store, {
      ...record,
      nextDate,
      paymentDay,
      cyclePaid: paid,
      paymentCycleVersion: 2,
      ...(type === 'recurringPayment' ? { paidAt: null, lastPaidAt: record.paidAt || record.lastPaidAt } : {}),
    });
  };

  await Promise.all([
    ...cards.map((record) => migrateRecord('creditCards', record, 'creditCard', record.minPayment)),
    ...loans.map((record) => migrateRecord('loans', record, 'loan', record.payment)),
    ...recurringPayments.map((record) => migrateRecord('recurringPayments', record, 'recurringPayment', record.amount, record.periodicity)),
  ]);
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
  const amount = remainingRecurringPayment(payment);
  if (!(amount > 0)) {
    showToast('error', 'Платеж за текущий период уже внесен');
    return;
  }
  await createLinkedTransaction({
    type: 'expense',
    categoryId: payment.categoryId,
    linkedType: 'recurringPayment',
    linkedId: id,
    label: payment.title,
    amount,
    date,
    userId: payment.userId,
  });
  showToast('success', `«${payment.title}» отмечен оплаченным`);
  await Promise.all([refreshLinkedScreens(), refreshDashboard(), renderTransactionScreen('income'), renderTransactionScreen('expense'), renderStatisticsScreen(), renderArchiveScreen()]);
}

async function makeQuickDebtPayment(kind, id) {
  const store = kind === 'card' ? 'creditCards' : 'loans';
  const record = await db.getById(store, id);
  if (!record) return;
  const amount = remainingDebtPayment(record, kind);
  if (!(amount > 0)) {
    showToast('error', 'Задолженность уже погашена');
    return;
  }
  const date = todayIsoDate();
  const linkedType = kind === 'card' ? 'creditCard' : 'loan';
  await createLinkedTransaction({
    type: 'expense',
    linkedType,
    linkedId: id,
    label: record.title,
    amount,
    date,
    userId: record.userId,
  });
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
    categoryId: control.dataset.categoryId,
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
  const periodNames = { thisMonth: 'этот месяц', today: 'сегодня', yesterday: 'вчера', '7d': '7 дней', '30d': '30 дней', all: 'всё время', custom: 'выбранный период' };
  document.querySelectorAll('#dashPeriodLabel').forEach((el) => {
    el.innerHTML = 'Свободно за <b>' + (periodNames[period] || 'этот месяц') + '</b>';
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
  finalizeOperationCalculation();
  const amount = parseAmountInput(operationAmount);
  if (!pendingOperationCategory) {
    showToast('error', 'Выберите категорию');
    return;
  }
  if (!(amount > 0)) {
    showToast('error', 'Введите сумму больше нуля');
    return;
  }

  const ownerInput = document.querySelector('input[name="owner"]:checked');
  const users = await db.getAll('users');
  const userId = ownerInput?.value || users[0]?.id;
  if (!userId) {
    showToast('error', 'Добавьте хотя бы одного пользователя в настройках');
    return;
  }
  const comment = operationCommentValue?.textContent !== 'Добавить' ? operationCommentValue.textContent : undefined;
  const date = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;

  let payload;
  if (pendingOperationCategory.linkedType) {
    let linkedCategoryId;
    if (pendingOperationCategory.linkedType === 'recurringPayment') {
      const payment = await db.getById('recurringPayments', pendingOperationCategory.linkedId);
      const requiredAmount = payment ? remainingRecurringPayment(payment) : 0;
      if (!payment || Math.abs(amount - requiredAmount) > 0.001) {
        showToast('error', `Обязательный платеж нужно внести полностью: ${formatRub(requiredAmount)}`);
        return;
      }
      linkedCategoryId = payment.categoryId;
    }
    payload = {
      type: 'expense',
      linkedType: pendingOperationCategory.linkedType,
      linkedId: pendingOperationCategory.linkedId,
      categoryId: linkedCategoryId,
      label: pendingOperationCategory.label,
      amount,
      date,
      userId,
      comment,
    };
  } else {
    const category = await db.getById('categories', pendingOperationCategory.categoryId);
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

  const previous = editingTransactionId ? await db.getById('transactions', editingTransactionId) : null;
  const storeNames = [
    'transactions',
    previous?.linkedType ? LINKED_STORES[previous.linkedType] : null,
    payload.linkedType ? LINKED_STORES[payload.linkedType] : null,
  ].filter(Boolean);
  await db.runAtomic(storeNames, async (atomicStore) => {
    if (previous?.linkedType) {
      await applyLinkedSideEffect(previous.linkedType, previous.linkedId, previous.amount, -1, previous.date, atomicStore);
    }
    if (previous) {
      await atomicStore.put('transactions', { ...previous, ...payload, id: previous.id });
    } else {
      await atomicStore.put('transactions', { ...payload, createdAt: new Date().toISOString() });
    }
    if (payload.linkedType) {
      await applyLinkedSideEffect(payload.linkedType, payload.linkedId, amount, 1, date, atomicStore);
    }
  });
  editingTransactionId = null;

  closeSheet({ force: true });
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
  const summary = await db.getSummary({ from, to, userId: dashboardOwner === 'all' ? undefined : dashboardOwner });

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
      <span><span class="operation-title"><span class="category-emoji-inline">${categoryIcon(category, category?.name ?? transaction.label)}</span>${escapeHtml(category?.name ?? transaction.label ?? 'Без категории')} → ${ownerMarkup(escapeHtml(user?.name ?? '—'), user?.id)}</span><strong class="${toneClass}">${sign}${formatRub(transaction.amount)}</strong></span>
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
    renderDashboardDayGroups(),
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
    ...recurringPayments.map((p) => ({ title: p.title, amount: remainingRecurringPayment(p), date: p.nextDate, owner: p.userId, flow: p.flow || 'expense' })),
    ...loansAndInstallments.filter((l) => l.debt > 0).map((l) => ({ title: l.title, amount: remainingDebtPayment(l, 'loan'), date: l.nextDate, owner: l.userId })),
    ...creditCards.filter((c) => c.debt > 0).map((c) => ({ title: c.title, amount: remainingDebtPayment(c, 'card'), date: c.nextDate, owner: c.userId })),
  ]
    .filter((item) => item.date >= todayIso && item.date <= in14Days)
    .filter((item) => dashboardOwner === 'all' || item.owner === dashboardOwner || !item.owner)
    .sort((a, b) => a.date.localeCompare(b.date));

  const users = await db.getAll('users');
  const userName = (id) => users.find((u) => u.id === id)?.name ?? '—';
  const dashIncome = items.filter((i) => i.flow === 'income').reduce((s, i) => s + i.amount, 0);
  const dashExpense = items.filter((i) => i.flow !== 'income').reduce((s, i) => s + i.amount, 0);
  document.querySelectorAll('#dashboardScreen [data-upcoming="income"]').forEach((el) => { el.textContent = '+' + formatRub(dashIncome); });
  document.querySelectorAll('#dashboardScreen [data-upcoming="expense"]').forEach((el) => { el.textContent = '−' + formatRub(dashExpense); });
  renderDashDebtLine();

  list.innerHTML = '';
  if (emptyState) emptyState.hidden = items.length > 0;

  items.slice(0, 4).forEach((item) => {
    const status = db.getRecurringPaymentStatus({ nextDate: item.date, paidAt: null });
    const stripe = status === 'overdue' || status === 'urgent' ? '#f09595' : status === 'soon' ? '#fac775' : ((item.owner && OWNER_COLOR_BY_TONE[users.find((u) => u.id === item.owner)?.tone]) || '#5dcaa5');
    const row = document.createElement('div');
    row.className = 'row';
    row.innerHTML = `<span class="stripe" style="background:${stripe}"></span><div class="row-1"><p class="name">${escapeHtml(item.title)}</p><p class="meta">${formatLongRuDate(item.date)} · ${ownerMarkup(escapeHtml(userName(item.owner)), item.owner)}</p></div><p class="amount${item.flow === 'income' ? ' positive' : ''}">${item.flow === 'income' ? '+' : '−'}${formatRub(item.amount)}</p>`;
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

  const [allReminders, users] = await Promise.all([db.getAll('reminders'), db.getAll('users')]);
  const reminders = allReminders
    .filter((r) => !r.completed && r.nextDate >= from && r.nextDate <= to)
    .filter((r) => dashboardOwner === 'all' || r.assignee === 'both' || r.assignee === dashboardOwner)
    .sort((a, b) => a.nextDate.localeCompare(b.nextDate))
    .slice(0, 4);

  list.innerHTML = '';
  if (emptyState) emptyState.hidden = reminders.length > 0;

  reminders.forEach((reminder) => {
    const done = false;
    const stripe = '#afa9ec';
    const row = document.createElement('div');
    row.className = 'row';
    row.innerHTML = `<span class="stripe" style="background:${stripe}"></span><div class="row-1"><p class="name">${escapeHtml(reminder.title)}</p><p class="meta">${formatRuDate(reminder.nextDate).slice(0, 5)} · ${reminderRepeatLabel(reminder)} · ${reminderAssigneeMarkup(reminder.assignee, users)}</p></div><button class="checkbox" type="button" data-action="toggle-reminder-complete" data-reminder-id="${reminder.id}" aria-label="Отметить выполненным"></button>`;
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
    const dueThisMonth = payments.filter((p) => p.nextDate >= monthFrom && p.nextDate <= monthTo);
    const dueSoon = dueThisMonth.filter((p) => p.nextDate >= todayIso && p.nextDate <= in14Days);
    const totalDue = dueThisMonth.reduce((s, p) => s + remainingRecurringPayment(p), 0);
    const totalSoon = dueSoon.reduce((s, p) => s + remainingRecurringPayment(p), 0);

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
let archiveSortMode = 'date-desc';
let archiveTypeFilter = 'all';
let archiveCategoryFilter = new Set();
let archiveMinAmount = 0;
let archiveMaxAmount = 0;

async function ownerFilterLabel(value) {
  if (value === 'all') return 'Все';
  const user = await db.getById('users', value);
  return user?.name || 'Все';
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

  const pillNames = (selectId, extra = []) => {
    const group = document.querySelector(`[data-pill-group="${selectId}"]`);
    if (!group) return;
    const names = [...users.map((u) => [u.id, u.name]), ...extra];
    group.innerHTML = names.map(([value, name]) => `<button type="button" class="owner-pill" data-action="pill-select" data-select="${selectId}" data-value="${value}"><svg class="ti pill-check" hidden><use href="#i-check"/></svg><span>${escapeHtml(name)}</span></button>`).join('');
  };
  pillNames('creditOwnerSelect');
  pillNames('recurringOwnerSelect');
  pillNames('reminderAssigneeSelect', [['both', 'Оба']]);
  syncAllPillGroups();

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
        const isChecked = checked === user.id || (!users.some((item) => item.id === checked) && index === 0);
        return `<label><input type="radio" name="owner" value="${user.id}" ${isChecked ? 'checked' : ''}>${ownerMarkup(escapeHtml(user.name), user.id)}</label>`;
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
        <div><b><span class="category-emoji-inline">${categoryIcon(row.icon, row.name)}</span>${escapeHtml(row.name)}</b><small>${row.count} ${pluralizeOperations(row.count)}</small></div>
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
        <div><b><span class="category-emoji-inline">${categoryIcon(category?.icon, category?.name ?? transaction.label)}</span>${escapeHtml(category?.name ?? transaction.label ?? 'Без категории')} → ${ownerMarkup(escapeHtml(user?.name ?? '—'), user?.id)}</b><small>${formatRelativeShortDate(transaction.date)}</small></div>
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
  if (!transaction) return;
  const linkedStore = transaction.linkedType ? LINKED_STORES[transaction.linkedType] : null;
  await db.runAtomic(['transactions', linkedStore].filter(Boolean), async (atomicStore) => {
    await atomicStore.remove('transactions', id);
    if (transaction.linkedType) {
      await applyLinkedSideEffect(transaction.linkedType, transaction.linkedId, transaction.amount, -1, transaction.date, atomicStore);
    }
  });
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
          <button class="category-summary" type="button" data-action="toggle-category" aria-expanded="false"><b>${escapeHtml(category.name)}</b><small>${count} ${pluralizeOperations(count)} · ${percent}%</small></button>
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
    if (control.dataset.target === 'categoryEditor') {
      setCategoryMode('category');
      clearCategorySelection();
    }
    openEditorById(control.dataset.target, { mode: 'create' });
  }
  if (action === 'toggle-detail') {
    const hostCard = control.closest('.finance-card, .goal-card');
    if (hostCard && kebabCardInfo(hostCard).id) { openCardHistory(hostCard); return; }
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
    } else if (kind === 'creditCard') {
      openCreditCardEditor(id);
    } else if (kind === 'goal') {
      openGoalEditor(id);
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
    } else if (kind === 'creditCard') {
      openDeleteConfirm({
        title: 'Удалить кредитную карту?',
        message: `«${name}» будет удалена без возможности восстановления.`,
        onConfirm: () => db.remove('creditCards', id).then(() => Promise.all([renderCreditsScreen(), renderUpcomingPayments(), renderArchiveScreen()])),
      });
    } else if (kind === 'goal') {
      openDeleteConfirm({
        title: 'Удалить цель?',
        message: `«${name}» будет удалена без возможности восстановления.`,
        onConfirm: () => db.remove('goals', id).then(() => Promise.all([renderGoalsScreen(), renderArchiveScreen()])),
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
    if (reminderId) {
      await runAsyncAction(
        control,
        `toggle-reminder:${reminderId}`,
        () => toggleReminderComplete(reminderId),
        'Не удалось обновить напоминание.',
      );
    }
  }
  if (action === 'delete-reminder') {
    const reminderId = control.closest('[data-reminder-id]')?.dataset.reminderId;
    if (reminderId) requestReminderDelete(reminderId);
  }
  if (action === 'mark-recurring-paid') {
    const recurringId = control.closest('[data-recurring-id]')?.dataset.recurringId;
    if (recurringId) {
      await runAsyncAction(
        control,
        `mark-recurring-paid:${recurringId}`,
        () => markRecurringPaid(recurringId),
        'Не удалось внести обязательный платеж.',
      );
    }
  }
  if (action === 'make-quick-payment') {
    const id = control.closest('[data-credit-card-id], [data-loan-id]')?.dataset.creditCardId
      || control.closest('[data-credit-card-id], [data-loan-id]')?.dataset.loanId;
    if (id) {
      const paymentKind = control.dataset.paymentKind;
      await runAsyncAction(
        control,
        `quick-payment:${paymentKind}:${id}`,
        () => makeQuickDebtPayment(paymentKind, id),
        'Не удалось внести платеж.',
      );
    }
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
    const editorSaves = {
      goalsEditor: { save: saveGoalDraft, label: 'Цель сохранена' },
      recurringEditor: { save: saveRecurringDraft, label: 'Платеж сохранен' },
      reminderEditor: { save: saveReminderDraft, label: 'Напоминание сохранено' },
      creditsEditor: { save: saveCreditDraft, label: 'Запись сохранена' },
      bankEditor: { save: saveBankDraft, label: 'Банк сохранен' },
      userEditor: { save: saveUserDraft, label: 'Пользователь сохранен' },
    };
    const editorSave = editorSaves[editor?.id];
    if (editorSave) {
      await runAsyncAction(control, `save-editor:${editor.id}`, async () => {
        const ok = await editorSave.save();
        if (ok) {
          if (status) status.textContent = editorSave.label;
          closeEditorModal({ saved: true });
        }
        return ok;
      }, 'Не удалось сохранить запись.');
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
    await runAsyncAction(control, 'save-operation', saveOperation, 'Не удалось сохранить операцию.');
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
      control.setAttribute('aria-expanded', String(!subcategories.hidden));
    }
  }
  if (action === 'cycle-owner-filter' && control.dataset.scope === 'archive') { openFilterSheet(); }
  if (action === 'cycle-owner-filter') {
    const scope = control.dataset.scope;
    const users = await db.getAll('users');
    const filterCycle = ['all', ...users.map((user) => user.id)];
    const currentIndex = Math.max(0, filterCycle.indexOf(ownerFilterState[scope]));
    ownerFilterState[scope] = filterCycle[(currentIndex + 1) % filterCycle.length];
    control.textContent = `Фильтр: ${await ownerFilterLabel(ownerFilterState[scope])}`;
    if (scope === 'income' || scope === 'expense') renderTransactionScreen(scope);
    else if (scope === 'archive') renderArchiveScreen();
  }
  if (action === 'cycle-archive-sort') {
    const modes = ['date-desc', 'date-asc', 'amount-desc'];
    const sortLabels = { 'date-desc': 'Новые сначала', 'date-asc': 'Старые сначала', 'amount-desc': 'Сначала крупные' };
    archiveSortMode = modes[(modes.indexOf(archiveSortMode) + 1) % modes.length];
    control.innerHTML = `<svg class="ti"><use href="#i-sort"/></svg>${sortLabels[archiveSortMode]}`;
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
    await runAsyncAction(control, 'save-category', async () => {
      const name = categoryNameInput.value.trim() || (getCategoryMode() === 'subcategory' ? 'Новая подкатегория' : 'Новая категория');
      const normalizedName = name.toLocaleLowerCase('ru-RU');
      if (getCategoryMode() === 'category') {
        const activeTab = document.querySelector('[data-action="category-tab"] input:checked')?.closest('[data-action]')?.dataset.tab;
        const type = pendingCategoryType || (activeTab === 'expense' ? 'expense' : 'income');
        const editingId = editingCategoryCard?.dataset.categoryId;
        const duplicate = (await db.getAll('categories')).some((category) =>
          category.type === type && category.id !== editingId && category.name.trim().toLocaleLowerCase('ru-RU') === normalizedName
        );
        if (duplicate) {
          showToast('error', 'Категория с таким названием уже существует');
          return false;
        }
      } else {
        const editingId = editingSubcategoryRow?.dataset.subcategoryId;
        const parentId = editingSubcategoryRow
          ? editingSubcategoryRow.closest('.subcategory-list')?.previousElementSibling?.dataset.categoryId
          : (await db.getAll('categories')).find((category) => category.name === parentCategorySelect.value)?.id;
        const duplicate = parentId
          ? (await db.queryByIndex('subcategories', 'by_category', parentId)).some((subcategory) =>
              subcategory.id !== editingId && subcategory.name.trim().toLocaleLowerCase('ru-RU') === normalizedName
            )
          : false;
        if (duplicate) {
          showToast('error', 'Подкатегория с таким названием уже существует');
          return false;
        }
      }
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
        renderRecurringScreen(),
        populateRecurringCategorySelect(),
      ]);
      closeEditorModal({ saved: true });
      return true;
    }, 'Не удалось сохранить категорию.');
  }
  if (action === 'request-close-modal') {
    if (activeConfirm) closeDeleteConfirm();
    else closeEditorModal();
  }
  if (action === 'force-close-modal') closeEditorModal({ force: true });
  if (action === 'hide-modal-warning') appModalWarning.hidden = true;
  if (action === 'confirm-delete') await confirmDeleteAction(control);
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
  .then(() => db.repairCorruptedTextData())
  .then(() => migrateCategoryEmojiIcons())
  .then(() => migrateRecurringPaymentCategories())
  .then(() => migrateCreditProductTitles())
  .then(() => db.seedRemindersIfEmpty())
  .then(() => migrateCompletedRepeatingReminders())
  .then(() => migratePaymentCycles())
  .then(() => applyOwnerColors())
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
    populateRecurringCategorySelect(),
    renderUsersSettings(),
    renderOwnerControls(),
    renderBanksSettings(),
    loadTheme(),
  ]))
  .then(() => showScreen(getScreenFromHash(), { replaceRoute: true }))
  .catch((error) => console.error('Не удалось инициализировать базу данных', error));


/* ============================================================
   Finbu mockup layer: day groups, insights, kebab, bank sheet,
   onboarding, filter segments, export. Appended 2026-09-04.
   ============================================================ */

function dashboardRecordRow(t, ownerName) {
  const sign = t.type === 'income' ? '+' : '−';
  const label = t.type === 'income' ? (t.source || t.category || 'Доход') : (t.category || t.source || 'Трата');
  const tone = t.tone || 'teal';
  return `<div class="card row" data-transaction-id="${t.id}">`
    + `<span class="badge" style="background:${TONE_BG[tone] || TONE_BG.teal};color:${TONE_HEX[tone] || TONE_HEX.teal}">${categoryIcon({ icon: t.icon, tone }, t.category || t.source || '')}</span>`
    + `<div class="row-1"><p class="name">${escapeHtml(label)}</p><p class="meta">${ownerMarkup(escapeHtml(ownerName), t.userId)}${t.comment ? ` · ${escapeHtml(t.comment)}` : ''}</p></div>`
    + `<p class="amount${t.type === 'income' ? ' positive' : ''}">${sign}${formatRub(t.amount)}</p></div>`;
}

async function renderDashboardDayGroups() {
  const todayBox = document.querySelector('[data-record="today"]');
  const yesterdayBox = document.querySelector('[data-record="yesterday"]');
  if (!todayBox && !yesterdayBox) return;
  try {
    const pad = (n) => String(n).padStart(2, '0');
    const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const now = new Date();
    const todayIso = iso(now);
    const yest = new Date(now); yest.setDate(yest.getDate() - 1);
    const yestIso = iso(yest);
    const [transactions, users] = await Promise.all([db.listTransactions(), db.getAll('users')]);
    const nameOf = (id) => (users.find((u) => u.id === id)?.name || '—');
    const ok = (t) => dashboardOwner === 'all' || t.userId === dashboardOwner;
    if (todayBox) {
      const rows = transactions.filter((t) => t.date === todayIso && ok(t))
        .sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
      todayBox.innerHTML = rows.length ? rows.map((t) => dashboardRecordRow(t, nameOf(t.userId))).join('') : '';
      const head = todayBox.previousElementSibling;
      if (head && head.classList.contains('title-sm')) head.hidden = !rows.length;
      todayBox.hidden = !rows.length;
      renderFunctionalIcons(todayBox);
    }
    if (yesterdayBox) {
      const rows = transactions.filter((t) => t.date === yestIso && ok(t))
        .sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
      yesterdayBox.innerHTML = rows.length ? rows.map((t) => dashboardRecordRow(t, nameOf(t.userId))).join('') : '';
      const head = yesterdayBox.previousElementSibling;
      if (head && head.classList.contains('title-sm')) head.hidden = !rows.length;
      yesterdayBox.hidden = !rows.length;
      renderFunctionalIcons(yesterdayBox);
    }
  } catch { /* dashboard groups are decorative */ }
}

async function renderDashDebtLine() {
  const line = document.querySelector('#dashDebtLine');
  if (!line) return;
  try {
    const { from, to } = getPeriodRange(currentPeriod);
    const [loans, cards] = await Promise.all([db.getAll('loans'), db.getAll('creditCards')]);
    const ok = (r) => dashboardOwner === 'all' || r.userId === dashboardOwner;
    const items = [
      ...loans.filter((l) => (l.debt || 0) > 0 && ok(l)).map((l) => ({ amount: remainingDebtPayment(l, 'loan'), date: l.nextDate })),
      ...cards.filter((c) => (c.debt || 0) > 0 && ok(c)).map((c) => ({ amount: remainingDebtPayment(c, 'card'), date: c.nextDate })),
    ].filter((i) => (!from || i.date >= from) && (!to || i.date <= to));
    if (!items.length) { line.hidden = true; return; }
    const total = items.reduce((s, i) => s + i.amount, 0);
    line.hidden = false;
    line.innerHTML = `<span class="k">Погашение долгов</span><span class="v neg">−${formatRub(total)}</span>`;
  } catch { line.hidden = true; }
}

/* ---------- kebab menu ---------- */

let kebabSourceCard = null;

function injectKebabTriggers(root) {
  if (!root || !root.querySelectorAll) return;
  root.querySelectorAll('.finance-card, .goal-card').forEach((card) => {
    if (card.dataset.kebabInjected === '1') return;
    card.dataset.kebabInjected = '1';
    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'kebab-trigger';
    trigger.dataset.action = 'open-kebab';
    trigger.setAttribute('aria-label', 'Действия с записью');
    trigger.innerHTML = icon('dotsVertical');
    card.append(trigger);
  });
}

function kebabCardInfo(card) {
  const d = card.dataset;
  if (d.goalId) return { kind: 'goal', id: d.goalId, store: 'goals', link: 'goal' };
  if (d.recurringId) return { kind: 'recurring', id: d.recurringId, store: 'recurringPayments', link: 'recurringPayment' };
  if (d.creditCardId) return { kind: 'card', id: d.creditCardId, store: 'creditCards', link: 'creditCard' };
  if (d.loanId) return { kind: 'loan', id: d.loanId, store: 'loans', link: 'loan' };
  if (d.reminderId) return { kind: 'reminder', id: d.reminderId, store: 'reminders', link: null };
  if (d.bankId) return { kind: 'bank', id: d.bankId, store: 'banks', link: null };
  if (d.categoryId) return { kind: 'category', id: d.categoryId, store: 'categories', link: null };
  if (d.transactionId) return { kind: 'transaction', id: d.transactionId, store: 'transactions', link: null };
  return { kind: 'item', id: null, store: null, link: null };
}

function openKebab(control) {
  closeKebab();
  const card = control.closest('.finance-card, .goal-card');
  if (!card) return;
  kebabSourceCard = card;
  const title = card.querySelector('.finance-main b, .goal-head b')?.textContent?.trim() || 'Запись';
  const menu = document.querySelector('#kebabMenu');
  const backdrop = document.querySelector('#kebabBackdrop');
  const list = document.querySelector('#kebabList');
  if (!menu || !backdrop || !list) return;
  menu.querySelector('.kebab-head b').textContent = title;
  list.innerHTML = `<button type="button" class="kebab-item" data-action="kebab-edit">${icon('pencil')}<span class="row-1">Изменить</span></button>`
    + `<button type="button" class="kebab-item danger" data-action="kebab-delete">${icon('trash')}<span class="row-1">Удалить</span></button>`;
  renderFunctionalIcons(list);
  menu.hidden = false;
  backdrop.hidden = false;
  requestAnimationFrame(() => menu.classList.add('is-open'));
}

function closeKebab() {
  const menu = document.querySelector('#kebabMenu');
  const backdrop = document.querySelector('#kebabBackdrop');
  if (menu) { menu.classList.remove('is-open'); menu.hidden = true; }
  if (backdrop) backdrop.hidden = true;
}

function openInfoModal(title, bodyHtml) {
  closeKebab();
  appModalWarning.hidden = true;
  appModalContent.innerHTML = `<div class="modal-head"><div class="modal-title">${escapeHtml(title)}</div>`
    + `<button type="button" class="icon-btn modal-close" data-action="close-info-modal" aria-label="Закрыть">${icon('x')}</button></div>`
    + bodyHtml
    + `<button type="button" class="primary-button" data-action="close-info-modal">Понятно</button>`;
  renderFunctionalIcons(appModalContent);
  appModal.classList.add('is-open');
  appModalBackdrop.classList.add('is-open');
}

function closeInfoModal() {
  appModal.classList.remove('is-open');
  appModalBackdrop.classList.remove('is-open');
}

function historyMonthTitle(key) {
  const [y, m] = String(key).split('-').map(Number);
  return `${monthNames[m - 1]} ${y}`;
}

function historyRow(t) {
  const sign = t.type === 'income' ? '+' : '−';
  const label = t.comment || t.category || t.source || (t.type === 'income' ? 'Пополнение' : 'Операция');
  const tone = t.tone || 'teal';
  return `<div class="card row"><span class="badge" style="background:${TONE_BG[tone] || TONE_BG.teal};color:${TONE_HEX[tone] || TONE_HEX.teal}">${categoryIcon({ icon: t.icon, tone }, t.category || t.source || '')}</span>`
    + `<div class="row-1"><p class="name">${escapeHtml(label)}</p><p class="meta">${formatRuDate(t.date).slice(0, 5)}</p></div>`
    + `<p class="amount${t.type === 'income' ? ' positive' : ''}">${sign}${formatRub(t.amount)}</p></div>`;
}

function historyGroups(transactions) {
  const sorted = transactions.slice().sort((a, b) => String(b.date).localeCompare(String(a.date)));
  const groups = new Map();
  sorted.forEach((t) => {
    const k = String(t.date).slice(0, 7);
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(t);
  });
  if (!sorted.length) return `<div class="history-empty">Операций пока нет — они появятся здесь после пополнений и платежей.</div>`;
  return [...groups.entries()].map(([k, items]) => `<p class="title-sm">${historyMonthTitle(k)}</p>${items.map(historyRow).join('')}`).join('');
}

async function openCardHistory(card) {
  if (!card) return;
  const info = kebabCardInfo(card);
  if (!info.id || !info.store) { closeKebab(); return; }
  closeKebab();
  try {
    const [item, users] = await Promise.all([db.getById(info.store, info.id), db.getAll('users')]);
    if (!item) return;
    const userName = (id) => users.find((u) => u.id === id)?.name ?? '—';
    let badgeHtml = ''; let nameHtml = ''; let metaHtml = ''; let tilesHtml = ''; let rowsHtml = ''; let actionHtml = '';
    const tilePair = (pairs) => `<div class="grid-2">${pairs.map(([l, v]) => `<div class="card"><p class="title-sm">${l}</p><p>${v}</p></div>`).join('')}</div>`;

    if (info.kind === 'card' || info.kind === 'loan') {
      const banks = await db.getAll('banks');
      const bank = banks.find((b) => b.id === item.bankId);
      const isInstallment = item.kind === 'installment';
      badgeHtml = bank?.logoDataUrl
        ? `<span class="badge badge-lg bank-badge-img"><img src="${bank.logoDataUrl}" alt=""></span>`
        : `<span class="badge badge-lg" style="background:${(bank?.color || '#8a8f98')}22;color:${bank?.color || '#8a8f98'}">${escapeHtml(((item.title || bank?.name || '??').slice(0, 2)).toUpperCase())}</span>`;
      nameHtml = `${escapeHtml(item.title || bank?.name || 'Запись')} <span>· ${escapeHtml(userName(item.userId))}</span>`;
      metaHtml = isInstallment ? 'Рассрочка' : info.kind === 'card' ? 'Кредитная карта' : 'Кредит';
      tilesHtml = tilePair(info.kind === 'card'
        ? [['Задолженность', formatRub(item.debt || 0)], ['Лимит', formatRub(item.limit || 0)]]
        : [['Осталось выплатить', formatRub(item.debt || 0)], ['Изначальная сумма', formatRub(item.initialAmount || 0)]]);
      const linked = await db.listTransactions({ linkedType: info.link, linkedId: info.id });
      rowsHtml = historyGroups(linked);
      actionHtml = (item.debt || 0) > 0
        ? `<button type="button" class="primary-button" data-action="make-quick-payment" data-payment-kind="${info.kind === 'card' ? 'card' : 'loan'}" data-credit-card-id="${info.kind === 'card' ? info.id : ''}" data-loan-id="${info.kind === 'loan' ? info.id : ''}">${icon('banknote', 'ui-icon')}Внести платёж</button>`
        : '';
    } else if (info.kind === 'goal') {
      badgeHtml = `<span class="badge badge-lg" style="background:${TONE_BG[item.tone] || TONE_BG.violet};color:${TONE_HEX[item.tone] || TONE_HEX.violet}">${icon('target', 'ui-icon')}</span>`;
      nameHtml = `${escapeHtml(item.title)} <span>· Общая</span>`;
      metaHtml = 'Цель';
      tilesHtml = tilePair([['Накоплено', formatRub(item.savedAmount || 0)], ['Цель', formatRub(item.targetAmount || 0)]]);
      const linked = await db.listTransactions({ linkedType: 'goal', linkedId: info.id });
      rowsHtml = historyGroups(linked);
    } else if (info.kind === 'recurring') {
      const isIncomeFlow = (item.flow || 'expense') === 'income';
      const cats = await db.getAll('categories');
      const cat = cats.find((c) => c.id === item.categoryId);
      const catName = cat?.name || item.categoryLabel || 'Без категории';
      badgeHtml = `<span class="badge badge-lg" style="background:${TONE_BG[cat?.tone] || TONE_BG.teal};color:${TONE_HEX[cat?.tone] || TONE_HEX.teal}">${categoryIcon(cat, catName)}</span>`;
      nameHtml = escapeHtml(item.title);
      metaHtml = isIncomeFlow ? 'Запланированный доход' : 'Обязательный платёж';
      tilesHtml = tilePair([['Сумма', `${isIncomeFlow ? '+' : ''}${formatRub(item.amount || 0)}`], ['Следующая дата', formatLongRuDate(item.nextDate)]]);
      const linked = await db.listTransactions({ linkedType: 'recurringPayment', linkedId: info.id });
      rowsHtml = historyGroups(linked);
      const paid = db.getRecurringPaymentStatus(item) === 'paid';
      actionHtml = paid ? '' : `<button type="button" class="primary-button" data-action="mark-recurring-paid" data-recurring-id="${info.id}">${icon('check', 'ui-icon')}Отметить оплаченным</button>`;
    } else if (info.kind === 'reminder') {
      badgeHtml = `<span class="badge badge-lg t-yellow">${icon('bell', 'ui-icon')}</span>`;
      nameHtml = escapeHtml(item.title);
      metaHtml = 'Напоминание';
      tilesHtml = tilePair([['Дата', formatLongRuDate(item.nextDate)], ['Повтор', reminderRepeatLabel(item)]]);
      rowsHtml = item.description ? `<div class="card"><p class="meta">${escapeHtml(item.description)}</p></div>` : '';
    } else if (info.kind === 'category') {
      const { from, to } = getPeriodRange(currentPeriod);
      const linked = (await db.listTransactions({ from, to })).filter((t) => t.categoryId === info.id);
      badgeHtml = `<span class="badge badge-lg" style="background:${TONE_BG[item.tone] || TONE_BG.rose};color:${TONE_HEX[item.tone] || TONE_HEX.rose}">${categoryIcon(item, item.name)}</span>`;
      nameHtml = escapeHtml(item.name);
      metaHtml = item.type === 'income' ? 'Категория доходов' : 'Категория расходов';
      tilesHtml = tilePair([['Оборот за период', formatRub(linked.reduce((s, t) => s + t.amount, 0))], ['Операций', String(linked.length)]]);
      rowsHtml = historyGroups(linked);
    } else {
      return;
    }

    appModalWarning.hidden = true;
    appModalContent.innerHTML = `<div class="modal-head history-head"><button type="button" class="icon-btn modal-close" data-action="close-info-modal" aria-label="Закрыть">${icon('arrowLeft')}</button>`
      + `<span class="history-head-badge">${badgeHtml}</span>`
      + `<div><p class="name">${nameHtml}</p><p class="meta">${metaHtml}</p></div></div>`
      + tilesHtml
      + `<div class="history-list">${rowsHtml}</div>`
      + actionHtml;
    renderFunctionalIcons(appModalContent);
    appModal.classList.add('is-open');
    appModalBackdrop.classList.add('is-open');
  } catch { closeKebab(); }
}

function kebabEditCard() {
  const card = kebabSourceCard;
  const info = card ? kebabCardInfo(card) : null;
  closeKebab();
  if (!card || !info || !info.id) return;
  if (info.kind === 'goal') { openGoalEditor(info.id); return; }
  if (info.kind === 'recurring') { openRecurringEditor(info.id); return; }
  if (info.kind === 'card') { openCreditCardEditor(info.id); return; }
  if (info.kind === 'loan') { openLoanEditor(info.id); return; }
  if (info.kind === 'reminder') { openReminderEditor(info.id); return; }
  card.querySelector('[data-action^="edit-"]')?.click();
}

function kebabDeleteCard() {
  const card = kebabSourceCard;
  const info = card ? kebabCardInfo(card) : null;
  closeKebab();
  if (!card) return;
  if (info && info.kind === 'reminder' && info.id) { requestReminderDelete(info.id); return; }
  requestFinanceDelete(card);
}

/* ---------- bank picker sheet ---------- */

function bankBadgeStyle(color) {
  const c = color || '#8a8f98';
  return ` style="--bank-badge-bg:${c}22;--bank-badge-fg:${c}"`;
}

async function openBankPicker() {
  const sheet = document.querySelector('#bankSheet');
  const backdrop = document.querySelector('#bankBackdrop');
  const list = document.querySelector('#bankPickList');
  if (!sheet || !backdrop || !list) return;
  try {
    const banks = await db.getAll('banks');
    const query = (document.querySelector('#bankSearchInput')?.value || '').trim().toLowerCase();
    const current = document.querySelector('#creditBankSelect')?.value || '';
    const filtered = banks.filter((b) => !query || (b.name || '').toLowerCase().includes(query));
    list.innerHTML = filtered.length
      ? filtered.map((b) => {
        const initials = (b.name || '?').trim().slice(0, 2).toUpperCase();
        return `<button type="button" class="bank-row${String(b.id) === String(current) ? ' is-selected' : ''}" data-action="pick-bank" data-bank-id="${b.id}">`
          + `<span class="bank-badge"${bankBadgeStyle(b.color)}>${b.logoDataUrl ? `<img src="${b.logoDataUrl}" alt="">` : escapeHtml(initials)}</span>`
          + `<span class="row-1">${escapeHtml(b.name)}</span>`
          + `<span class="radio" aria-hidden="true"></span></button>`;
      }).join('')
      : `<div class="history-empty">Банк не найден. Добавьте его в настройках.</div>`;
  } catch {
    list.innerHTML = `<div class="history-empty">Не удалось загрузить банки.</div>`;
  }
  sheet.hidden = false;
  backdrop.hidden = false;
  requestAnimationFrame(() => sheet.classList.add('is-open'));
}

function closeBankPicker() {
  const sheet = document.querySelector('#bankSheet');
  const backdrop = document.querySelector('#bankBackdrop');
  if (sheet) { sheet.classList.remove('is-open'); sheet.hidden = true; }
  if (backdrop) backdrop.hidden = true;
}

function pickBank(id) {
  const select = document.querySelector('#creditBankSelect');
  const nameEl = document.querySelector('#creditBankName');
  const badgeEl = document.querySelector('#creditBankBadge');
  const option = select?.querySelector(`option[value="${CSS.escape(String(id))}"]`);
  if (select && option) {
    select.value = String(id);
    syncCustomSelect(select);
  }
  if (nameEl) nameEl.textContent = option ? option.textContent : 'Выберите банк';
  if (badgeEl && option) {
    const color = option.dataset.color || '#8a8f98';
    badgeEl.style.setProperty('--bank-badge-bg', `${color}22`);
    badgeEl.style.setProperty('--bank-badge-fg', color);
    badgeEl.innerHTML = option.dataset.logo ? `<img src="${option.dataset.logo}" alt="">` : escapeHtml((option.textContent || '?').trim().slice(0, 2).toUpperCase());
  }
  closeBankPicker();
}

/* ---------- onboarding ---------- */

function obShow(step) {
  const root = document.querySelector('#onboarding');
  if (!root) return;
  root.hidden = false;
  root.querySelectorAll('.ob-step').forEach((el) => { el.hidden = el.dataset.obStep !== step; });
}

function obFinish() {
  try { localStorage.setItem('finbu.onboarded', '1'); } catch { /* private mode */ }
  const root = document.querySelector('#onboarding');
  if (root) root.hidden = true;
}

function obInviteCode() {
  let code = '';
  try { code = localStorage.getItem('finbu.invite') || ''; } catch { /* ignore */ }
  if (!code) {
    code = Array.from({ length: 6 }, () => 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]).join('');
    try { localStorage.setItem('finbu.invite', code); } catch { /* ignore */ }
  }
  return code;
}

function obShowInvite() {
  const codeEl = document.querySelector('#obInviteCode');
  if (codeEl) codeEl.textContent = obInviteCode();
  obShow('invite');
}

function obFamilyName() {
  try { return localStorage.getItem('finbu.familyName') || 'Семейный бюджет'; } catch { return 'Семейный бюджет'; }
}

/* ---------- operation sheet: type filter + quick categories ---------- */

function syncOpTypeSeg() {
  document.querySelectorAll('.op-type-seg').forEach((seg) => {
    seg.querySelectorAll('button[data-type]').forEach((b) => b.classList.toggle('is-active', b.dataset.type === operationEntryType));
  });
}

function filterPickerByType() {
  document.querySelectorAll('.category-picker-section[data-picker-type="income"]').forEach((s) => { s.hidden = operationEntryType !== 'income'; });
  document.querySelectorAll('.category-picker-section[data-picker-type="expense"]').forEach((s) => { s.hidden = operationEntryType === 'income'; });
}

async function renderSheetQuickCats() {
  const box = document.querySelector('#sheetQuickCats');
  if (!box) return;
  try {
    const cats = (await db.getAll('categories')).filter((c) => (c.type || 'expense') === operationEntryType).slice(0, 6);
    box.innerHTML = cats.map((c) => `<button type="button" class="cat-tile" data-action="select-operation-category" data-category-id="${c.id}" data-category="${escapeHtml(c.name)}" data-category-icon="${escapeHtml(categoryEmoji(c, c.name))}" data-tone="${c.tone || 'rose'}" aria-label="${escapeHtml(c.name)}">`
      + `<span class="category-orb ${c.tone || 'rose'}">${categoryIcon(c, c.name)}</span></button>`).join('');
    renderFunctionalIcons(box);
  } catch { /* sheet opens without quick cats */ }
}

function setOperationEntryType(type) {
  operationEntryType = type === 'income' ? 'income' : 'expense';
  syncOpTypeSeg();
  filterPickerByType();
  renderSheetQuickCats();
}

/* ---------- insights tab ---------- */

async function renderInsightsTab() {
  const pane = document.querySelector('[data-stats-pane="insights"]');
  if (!pane) return;
  try {
    const { from, to } = getPeriodRange(currentPeriod);
    const [txns, users] = await Promise.all([
      db.listTransactions({ from, to }),
      db.getAll('users'),
    ]);
    void users;
    const income = txns.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = txns.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const net = income - expense;
    const days = from && to ? Math.max(1, Math.round((new Date(to) - new Date(from)) / 86400000) + 1) : 1;

    const heroTotal = document.querySelector('#insHeroTotal');
    if (heroTotal) { heroTotal.textContent = `${net < 0 ? '−' : ''}${formatRub(Math.abs(net))}`; heroTotal.classList.toggle('negative', net < 0); }
    const periodLabel = document.querySelector('#insPeriodLabel');
    if (periodLabel) {
      const names = { thisMonth: 'Этот месяц', today: 'Сегодня', yesterday: 'Вчера', '7d': '7 дней', '30d': '30 дней', all: 'Всё время', custom: 'Свой период' };
      periodLabel.textContent = names[currentPeriod] || 'Период';
    }
    const maxSide = Math.max(income, expense, 1);
    const barE = document.querySelector('#insBarExpense');
    const barI = document.querySelector('#insBarIncome');
    if (barE) barE.style.flexGrow = String(Math.max(1, Math.round((expense / maxSide) * 100)));
    if (barI) barI.style.flexGrow = String(Math.max(1, Math.round((income / maxSide) * 100)));
    const savedLine = document.querySelector('#insSavedLine');
    if (savedLine) {
      if (income > 0 && net >= 0) savedLine.innerHTML = `${icon('handHoldingHeart', 'ui-icon')}Сохранено ${Math.round((net / income) * 100)}% дохода`;
      else if (income > 0) savedLine.innerHTML = `${icon('handHoldingHeart', 'ui-icon')}Траты превысили доход на ${formatRub(-net)}`;
      else savedLine.innerHTML = `${icon('handHoldingHeart', 'ui-icon')}Доходов за период не было`;
    }

    const allTxns = await db.listTransactions();
    const monthKey = (d) => String(d).slice(0, 7);
    const monthTitle = (key) => {
      const [y, m] = key.split('-').map(Number);
      const nowD = new Date();
      if (y === nowD.getFullYear() && m === nowD.getMonth() + 1) return 'Этот месяц';
      return `${monthNames[m - 1]} ${y}`;
    };
    // Накопления по месяцам за последние полгода.
    const nets = {}; const incByMonth = {};
    allTxns.forEach((t) => {
      const k = monthKey(t.date);
      nets[k] = (nets[k] || 0) + (t.type === 'income' ? t.amount : -t.amount);
      if (t.type === 'income') incByMonth[k] = (incByMonth[k] || 0) + t.amount;
    });
    const last6 = Object.keys(nets).sort().slice(-6);
    const saveRate = last6.filter((k) => (incByMonth[k] || 0) > 0);
    const avgSavePct = saveRate.length
      ? Math.round(saveRate.reduce((s, k) => s + (nets[k] / incByMonth[k]) * 100, 0) / saveRate.length)
      : 0;
    const goodTip = document.querySelector('#insTipGood');
    const goodText = document.querySelector('#insTipGoodText');
    if (goodTip && goodText) {
      if (net > 0 && avgSavePct > 0) {
        goodTip.hidden = false;
        goodText.textContent = `Это лучший месяц по накоплениям за последние полгода — обычно откладывается около ${avgSavePct}% дохода`;
      } else goodTip.hidden = true;
    }
    const warnTip = document.querySelector('#insTipWarn');
    const warnText = document.querySelector('#insTipWarnText');
    if (warnTip && warnText) {
      const nowD = new Date();
      const cur = `${nowD.getFullYear()}-${String(nowD.getMonth() + 1).padStart(2, '0')}`;
      const prev = [1, 2, 3].map((i) => { const d = new Date(nowD.getFullYear(), nowD.getMonth() - i, 1); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; });
      const curByCat = {}; const prevByCat = {};
      allTxns.forEach((t) => {
        if (t.type !== 'expense') return;
        const k = monthKey(t.date);
        if (k === cur) curByCat[t.category] = (curByCat[t.category] || 0) + t.amount;
        else if (prev.includes(k)) prevByCat[t.category] = (prevByCat[t.category] || 0) + t.amount;
      });
      let worst = null;
      Object.entries(curByCat).forEach(([cat, sum]) => {
        const avg = (prevByCat[cat] || 0) / 3;
        if (avg > 500 && sum > avg * 1.2 && (!worst || sum / avg > worst.ratio)) worst = { cat, sum, ratio: sum / avg };
      });
      if (worst) {
        warnTip.hidden = false;
        warnText.innerHTML = `<b>Траты на «${escapeHtml(worst.cat)}» выросли</b><br>На ${Math.round((worst.ratio - 1) * 100)}% больше, чем в среднем за последние 3 месяца — сейчас ${formatRub(worst.sum)}`;
      } else warnTip.hidden = true;
    }

    const tiles = document.querySelector('#insightsTiles');
    if (tiles) {
      const expTx = txns.filter((t) => t.type === 'expense');
      const incTx = txns.filter((t) => t.type === 'income');
      const biggestExp = expTx.slice().sort((a, b) => b.amount - a.amount)[0];
      const biggestInc = incTx.slice().sort((a, b) => b.amount - a.amount)[0];
      const byDay = {};
      expTx.forEach((t) => { byDay[t.date] = (byDay[t.date] || 0) + t.amount; });
      const topDay = Object.entries(byDay).sort((a, b) => b[1] - a[1])[0];
      const weekend = expTx.filter((t) => { const d = new Date(`${t.date}T00:00:00`).getDay(); return d === 0 || d === 6; }).reduce((s, t) => s + t.amount, 0);
      const weekendPct = expense ? Math.round((weekend / expense) * 100) : 0;
      const byMonth = {};
      expTx.forEach((t) => { const k = monthKey(t.date); byMonth[k] = (byMonth[k] || 0) + t.amount; });
      const topMonth = Object.entries(byMonth).sort((a, b) => b[1] - a[1])[0];
      const avgMonthly = Object.keys(byMonth).length ? Object.values(byMonth).reduce((s, v) => s + v, 0) / Object.keys(byMonth).length : 0;
      const balance = allTxns.reduce((s, t) => s + (t.type === 'income' ? t.amount : -t.amount), 0);
      const cushion = avgMonthly > 0 && balance > 0 ? (balance / avgMonthly).toFixed(1).replace('.', ',') : null;
      const ratedMonths = Object.keys(nets).filter((k) => (incByMonth[k] || 0) > 0);
      const bestSave = ratedMonths.length ? ratedMonths.reduce((a, b) => ((nets[a] / incByMonth[a]) >= (nets[b] / incByMonth[b]) ? a : b)) : null;
      const dayLabel = (iso) => {
        const pad = (n) => String(n).padStart(2, '0');
        const nowD = new Date();
        const isoOf = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
        if (iso === isoOf(nowD)) return 'Сегодня';
        const y = new Date(nowD); y.setDate(y.getDate() - 1);
        if (iso === isoOf(y)) return 'Вчера';
        return formatRuDate(iso);
      };
      const tileA = (label, ic, value) => `<div class="insight-tile"><div class="insight-tile-top"><p>${label}</p>${icon(ic, 'ui-icon')}</div><p class="insight-tile-value">${value}</p></div>`;
      const tileB = (label, ic, sub, value) => `<div class="insight-tile"><p class="insight-tile-label">${label}</p><div class="insight-tile-badge">${icon(ic, 'ui-icon')}</div><p class="insight-tile-sub">${sub}</p><p class="insight-tile-value">${value}</p></div>`;
      const tileC = (label, sub, value) => `<div class="insight-tile"><p class="insight-tile-label">${label}</p><p class="insight-tile-sub">${sub}</p><p class="insight-tile-value">${value}</p></div>`;
      const tileD = (label, ic, sub, value) => `<div class="insight-tile"><div class="insight-tile-top"><p>${label}</p>${icon(ic, 'ui-icon')}</div><p class="insight-tile-sub">${sub}</p><p class="insight-tile-value">${value}</p></div>`;
      tiles.innerHTML =
        tileA('Средние траты в день', 'calendar', formatRub(expense / days)) +
        tileA('Средние траты в месяц', 'calendarMonth', formatRub(days >= 28 ? expense : (avgMonthly || expense))) +
        tileB('Самая большая трата', 'shoppingBag', biggestExp ? escapeHtml(biggestExp.category || 'Трата') : '—', biggestExp ? formatRub(biggestExp.amount) : '—') +
        tileB('Самый большой доход', 'chartLine', biggestInc ? escapeHtml(biggestInc.source || biggestInc.category || 'Доход') : '—', biggestInc ? formatRub(biggestInc.amount) : '—') +
        (topDay ? tileD('Самый дорогой день', 'briefcase', dayLabel(topDay[0]), formatRub(topDay[1])) : tileA('Самый дорогой день', 'briefcase', '—')) +
        tileD('Траты в выходные', 'moon', `${weekendPct}% трат приходится на выходные`, `${weekendPct}%`) +
        tileC('Количество операций', 'Операций за выбранный период', String(txns.length)) +
        (topMonth ? tileD('Самый дорогой месяц', 'briefcase', monthTitle(topMonth[0]), formatRub(topMonth[1])) : tileA('Самый дорогой месяц', 'briefcase', '—')) +
        (bestSave ? tileD('Лучший месяц по сбережениям', 'handHoldingHeart', monthTitle(bestSave), `${Math.round((nets[bestSave] / incByMonth[bestSave]) * 100)}%`) : '') +
        (cushion ? tileD('Подушка безопасности', 'squareRounded', `Текущих средств хватит на ${cushion} мес. расходов`, cushion) : tileC('Подушка безопасности', 'Пока недостаточно данных', '—'));
      renderFunctionalIcons(tiles);
    }
  } catch { /* insights are decorative */ }
}

/* ---------- export ---------- */

async function exportAllData(format) {
  try {
    if (format === 'csv') {
      const txns = (await db.listTransactions()).slice().sort((a, b) => String(a.date).localeCompare(String(b.date)));
      const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
      const lines = ['Дата;Тип;Категория;Сумма;Владелец;Комментарий',
        ...txns.map((t) => [t.date, t.type === 'income' ? 'Доход' : 'Расход', t.category || t.source || '', t.amount, userName(t.userId), t.comment || ''].map(esc).join(';'))];
      downloadFile(`\uFEFF${lines.join('\n')}`, 'finbu-operations.csv', 'text/csv;charset=utf-8');
    } else {
      const stores = ['users', 'categories', 'subcategories', 'transactions', 'goals', 'loans', 'creditCards', 'recurringPayments', 'reminders', 'banks'];
      const dump = { app: 'Finbu', version: 1, exportedAt: new Date().toISOString() };
      for (const s of stores) { try { dump[s] = await db.getAll(s); } catch { dump[s] = []; } }
      downloadFile(JSON.stringify(dump, null, 2), `finbu-backup-${new Date().toISOString().slice(0, 10)}.json`, 'application/json');
    }
    showToast('success', format === 'csv' ? 'CSV-файл скачан' : 'Резервная копия скачана');
  } catch { showToast('error', 'Не удалось выгрузить данные'); }
}

function downloadFile(content, filename, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

/* ---------- second action dispatcher: mockup-only actions ---------- */

document.addEventListener('click', async (event) => {
  const control = event.target.closest('[data-action]');
  if (!control || control.disabled) return;
  const action = control.dataset.action;

  if (action === 'open-sheet') { setOperationEntryType('expense'); return; }
  if (action === 'op-type') { setOperationEntryType(control.dataset.type); return; }

  if (action === 'open-history') {
    const card = control.closest('.finance-card, .goal-card, .category-card');
    if (card) openCardHistory(card);
    return;
  }
  if (action === 'open-kebab') { openKebab(control); return; }
  if (action === 'close-kebab') { closeKebab(); return; }
  if (action === 'kebab-history') { openCardHistory(); return; }
  if (action === 'kebab-edit') { kebabEditCard(); return; }
  if (action === 'kebab-delete') { kebabDeleteCard(); return; }
  if (action === 'close-info-modal') { closeInfoModal(); return; }

  if (action === 'open-bank-picker') { openBankPicker(); return; }
  if (action === 'close-bank-picker') { closeBankPicker(); return; }
  if (action === 'pick-bank') { pickBank(control.dataset.bankId); return; }
  if (action === 'open-banks') { const box = document.querySelector('#banksInline'); if (box) box.hidden = !box.hidden; return; }
  if (action === 'bank-add-hint') {
    showScreen('settings');
    const box = document.querySelector('#banksInline'); if (box) box.hidden = false;
    showToast('info', 'Нажмите «Добавить» и заполните название и цвет банка');
    return;
  }

  if (action === 'dash-owner') {
    dashboardOwner = control.dataset.owner || 'all';
    control.closest('.owner-seg')?.querySelectorAll('button').forEach((b) => b.classList.toggle('is-active', b === control));
    refreshDashboard();
    return;
  }
  if (action === 'show-insights') { showScreen('analytics'); showStatsTab('insights'); return; }
  if (action === 'cycle-theme' || action === 'toggle-theme') {
    const next = document.body.dataset.theme === 'light' ? 'dark' : 'light';
    try { await db.setSetting('theme', next); } catch { /* theme stays local */ }
    await applyTheme(next);
    const check = document.querySelector('#themeRowCheck');
    if (check) check.hidden = next !== 'dark';
    return;
  }

  if (action === 'category-type') {
    pendingCategoryType = control.dataset.type || 'expense';
    control.closest('.type-seg')?.querySelectorAll('button').forEach((b) => b.classList.toggle('is-active', b === control));
    populateParentCategorySelect();
    return;
  }
  if (action === 'select-category-color') {
    const select = document.querySelector('#categoryColorSelect');
    if (select && control.dataset.color) {
      select.value = control.dataset.color;
      try { syncCustomSelect(select); } catch { /* native select */ }
    }
    control.closest('.swatch-row')?.querySelectorAll('button').forEach((st) => st.classList.toggle('is-selected', st === control));
    const badge = document.querySelector('#categoryIconPreview');
    if (badge && control.dataset.color) badge.className = `badge t-${control.dataset.color}`;
    return;
  }
  if (action === 'credit-kind') {
    const select = document.querySelector('#creditKindSelect');
    if (select && control.dataset.kind) {
      select.value = control.dataset.kind;
      try { syncCustomSelect(select); } catch { /* native select */ }
    }
    control.closest('.type-seg')?.querySelectorAll('button').forEach((b) => b.classList.toggle('is-active', b === control));
    return;
  }
  if (action === 'recurring-flow') {
    const input = document.querySelector('#recurringFlowInput');
    if (input && control.dataset.flow) input.value = control.dataset.flow;
    control.closest('.type-seg')?.querySelectorAll('button').forEach((b) => b.classList.toggle('is-active', b === control));
    return;
  }
  if (action === 'add-planned-income' || action === 'add-planned-expense') {
    resetRecurringEditor();
    const flow = action === 'add-planned-income' ? 'income' : 'expense';
    const input = document.querySelector('#recurringFlowInput');
    if (input) input.value = flow;
    document.querySelector('#recurringEditor')?.querySelectorAll('[data-action="recurring-flow"]').forEach((b) => b.classList.toggle('is-active', b.dataset.flow === flow));
    openEditorById('recurringEditor', { mode: 'create' });
    return;
  }
  if (action === 'mark-recurring-paid' || action === 'make-quick-payment' || action === 'toggle-reminder-complete') { closeInfoModal(); return; }
  if (action === 'pill-select') {
    const select = document.getElementById(control.dataset.select);
    if (select) {
      select.value = control.dataset.value;
      select.dispatchEvent(new Event('change', { bubbles: true }));
      syncPillGroup(select.id);
    }
    return;
  }
  if (action === 'open-filter') { openFilterSheet(); return; }
  if (action === 'close-filter') { closeFilterSheet(); return; }
  if (action === 'filter-apply') { readFilterAmounts(); renderArchiveScreen(); closeFilterSheet(); return; }
  if (action === 'filter-reset') {
    archiveTypeFilter = 'all'; archiveCategoryFilter = new Set(); archiveMinAmount = 0; archiveMaxAmount = 0;
    ownerFilterState.archive = 'all';
    openFilterSheet();
    return;
  }
  if (action === 'filter-type') {
    archiveTypeFilter = control.dataset.value || 'all';
    document.querySelectorAll('[data-pill-group="archiveTypeFilter"] .pill').forEach((b) => b.classList.toggle('is-active', b === control));
    renderArchiveScreen();
    return;
  }
  if (action === 'filter-category') {
    const id = control.dataset.value;
    if (archiveCategoryFilter.has(id)) archiveCategoryFilter.delete(id); else archiveCategoryFilter.add(id);
    control.classList.toggle('is-active');
    control.querySelector('.ui-icon')?.remove();
    if (control.classList.contains('is-active')) control.insertAdjacentHTML('afterbegin', icon('check', 'ui-icon'));
    renderArchiveScreen();
    return;
  }
  if (action === 'filter-owner') {
    ownerFilterState.archive = control.dataset.value || 'all';
    control.closest('#filterOwnerPills')?.querySelectorAll('.owner-pill').forEach((b) => {
      const on = b === control;
      b.classList.toggle('is-active', on);
      b.querySelector('.pill-check')?.toggleAttribute('hidden', !on);
    });
    renderArchiveScreen();
    return;
  }
  if (action === 'export-data') { exportAllData('json'); return; }
  if (action === 'export-csv') { exportAllData('csv'); return; }

  if (action === 'open-invite') { obShowInvite(); return; }
  if (action === 'ob-next') { obShow('register'); return; }
  if (action === 'ob-back') { obShow('welcome'); return; }
  if (action === 'ob-register') {
    const name = document.querySelector('#obNameInput')?.value?.trim();
    const email = document.querySelector('#obEmailInput')?.value?.trim();
    if (!name) { showToast('error', 'Введите ваше имя'); return; }
    try { localStorage.setItem('finbu.name', name); if (email) localStorage.setItem('finbu.email', email); } catch { /* ignore */ }
    obShow('mode');
    return;
  }
  if (action === 'ob-mode') {
    control.closest('.ob-modes')?.querySelectorAll('.ob-mode').forEach((m) => m.classList.toggle('is-selected', m === control));
    return;
  }
  if (action === 'ob-mode-next') {
    const selected = document.querySelector('.ob-mode.is-selected')?.dataset.mode || 'family';
    if (selected === 'family') obShowInvite();
    else obFinish();
    return;
  }
  if (action === 'ob-copy') {
    const code = obInviteCode();
    try { await navigator.clipboard.writeText(code); showToast('success', 'Код скопирован'); }
    catch { showToast('info', `Код семьи: ${code}`); }
    return;
  }
  if (action === 'ob-share') {
    const code = obInviteCode();
    const text = `Присоединяйтесь к семейному бюджету Finbu! Код семьи: ${code}`;
    if (navigator.share) { try { await navigator.share({ title: 'Finbu', text }); } catch { /* dismissed */ } }
    else { try { await navigator.clipboard.writeText(text); showToast('success', 'Приглашение скопировано'); } catch { showToast('info', text); } }
    return;
  }
  if (action === 'ob-join-open') { obShow('join'); return; }
  if (action === 'ob-back-invite') { obShowInvite(); return; }
  if (action === 'ob-join-show') {
    const code = (document.querySelector('#obJoinCode')?.value || '').trim();
    if (code.length < 4) { showToast('error', 'Введите код семьи из приглашения'); return; }
    try { localStorage.setItem('finbu.invite', code.toUpperCase()); } catch { /* ignore */ }
    const preview = document.querySelector('#obJoinPreview');
    if (preview) {
      preview.hidden = false;
      const title = preview.querySelector('.row-1 b');
      const sub = preview.querySelector('.row-1 small');
      if (title) title.textContent = `Семья · код ${code.toUpperCase()}`;
      if (sub) sub.textContent = '1 участник · создана сегодня';
    }
    control.textContent = 'Войти';
    control.dataset.action = 'ob-finish';
    return;
  }
  if (action === 'ob-close' || action === 'ob-finish') { obFinish(); return; }
});

document.addEventListener('input', (event) => {
  if (event.target?.id === 'bankSearchInput' && !document.querySelector('#bankSheet')?.hidden) openBankPicker();
  if ((event.target?.id === 'filterMinInput' || event.target?.id === 'filterMaxInput') && !document.querySelector('#filterSheet')?.hidden) {
    readFilterAmounts();
    renderArchiveScreen();
  }
});

/* mockup-layer init (runs after the main init chain starts) */
(function initMockupLayer() {
  try {
    if (!localStorage.getItem('finbu.onboarded')) obShow('welcome');
  } catch { /* onboarding stays hidden */ }
  syncOpTypeSeg();
  renderSheetQuickCats().catch(() => {});
  renderDashboardDayGroups().catch(() => {});
  renderDashDebtLine().catch(() => {});
  renderInsightsTab().catch(() => {});
})();

/* ---------- archive filter sheet ---------- */

async function openFilterSheet() {
  const sheet = document.querySelector('#filterSheet');
  const backdrop = document.querySelector('[data-action="close-filter"].sheet-backdrop');
  if (!sheet) return;
  try {
    const [categories, users] = await Promise.all([db.getAll('categories'), db.getAll('users')]);
    const catBox = document.querySelector('#filterCategoryPills');
    if (catBox) {
      catBox.innerHTML = categories.map((c) => `<button type="button" class="pill${archiveCategoryFilter.has(c.id) ? ' is-active' : ''}" data-action="filter-category" data-value="${c.id}">${archiveCategoryFilter.has(c.id) ? icon('check', 'ui-icon') : ''}${escapeHtml(c.name)}</button>`).join('');
      renderFunctionalIcons(catBox);
    }
    const ownerBox = document.querySelector('#filterOwnerPills');
    if (ownerBox) {
      const opts = [['all', 'Все'], ...users.map((u) => [u.id, u.name])];
      ownerBox.innerHTML = opts.map(([value, name]) => {
        const on = ownerFilterState.archive === value;
        return `<button type="button" class="owner-pill${on ? ' is-active' : ''}" data-action="filter-owner" data-value="${value}"><svg class="ti pill-check"${on ? '' : ' hidden'}><use href="#i-check"/></svg><span>${escapeHtml(name)}</span></button>`;
      }).join('');
    }
    document.querySelectorAll('[data-pill-group="archiveTypeFilter"] .pill').forEach((b) => b.classList.toggle('is-active', b.dataset.value === archiveTypeFilter));
    const minI = document.querySelector('#filterMinInput');
    const maxI = document.querySelector('#filterMaxInput');
    if (minI && document.activeElement !== minI) minI.value = archiveMinAmount > 0 ? String(archiveMinAmount) : '';
    if (maxI && document.activeElement !== maxI) maxI.value = archiveMaxAmount > 0 ? String(archiveMaxAmount) : '';
  } catch { /* sheet opens with defaults */ }
  renderArchiveScreen();
  sheet.hidden = false;
  if (backdrop) backdrop.hidden = false;
  requestAnimationFrame(() => sheet.classList.add('is-open'));
}

function closeFilterSheet() {
  const sheet = document.querySelector('#filterSheet');
  const backdrop = document.querySelector('[data-action="close-filter"].sheet-backdrop');
  if (sheet) { sheet.classList.remove('is-open'); sheet.hidden = true; }
  if (backdrop) backdrop.hidden = true;
}

function readFilterAmounts() {
  const num = (id) => Math.max(0, Math.round(parseAmountInput(document.querySelector(id)?.value) || 0));
  archiveMinAmount = num('#filterMinInput');
  archiveMaxAmount = num('#filterMaxInput');
}
