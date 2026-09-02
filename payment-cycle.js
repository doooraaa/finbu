const pad = (value) => String(value).padStart(2, '0');

function daysInMonth(year, monthIndex) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

export function shiftPaymentDate(isoDate, periodicity = 'ежемесячно', direction = 1, anchorDay) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate || '')) return isoDate;
  const [year, month, day] = isoDate.split('-').map(Number);
  const normalized = String(periodicity).toLowerCase();
  if (normalized.includes('недел') || normalized === 'weekly') {
    const date = new Date(year, month - 1, day);
    date.setDate(date.getDate() + 7 * direction);
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }
  if (normalized.includes('день') || normalized.includes('дня') || normalized === 'daily') {
    const date = new Date(year, month - 1, day);
    date.setDate(date.getDate() + direction);
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }
  if (normalized.includes('год') || normalized === 'yearly') {
    const targetYear = year + direction;
    const targetDay = Number(anchorDay) || day;
    return `${targetYear}-${pad(month)}-${pad(Math.min(targetDay, daysInMonth(targetYear, month - 1)))}`;
  }
  const monthIndex = month - 1 + direction;
  const targetYear = year + Math.floor(monthIndex / 12);
  const targetMonth = ((monthIndex % 12) + 12) % 12;
  const targetDay = Number(anchorDay) || day;
  return `${targetYear}-${pad(targetMonth + 1)}-${pad(Math.min(targetDay, daysInMonth(targetYear, targetMonth)))}`;
}

function updateCycle(record, amount, sign, requiredAmount, periodicity) {
  const required = Math.max(0, Number(requiredAmount) || 0);
  if (!required) return { ...record, cyclePaid: 0, paymentCycleVersion: 2 };
  let cyclePaid = Math.max(0, Number(record.cyclePaid) || 0) + sign * amount;
  let nextDate = record.nextDate;
  const paymentDay = Number(record.paymentDay) || Number(String(nextDate || '').slice(-2)) || undefined;
  while (cyclePaid >= required) {
    cyclePaid -= required;
    nextDate = shiftPaymentDate(nextDate, periodicity, 1, paymentDay);
  }
  while (cyclePaid < 0) {
    nextDate = shiftPaymentDate(nextDate, periodicity, -1, paymentDay);
    cyclePaid += required;
  }
  return { ...record, cyclePaid, nextDate, paymentDay, paymentCycleVersion: 2 };
}

export function updateDebtPaymentCycle(record, { amount, sign = 1, kind = 'loan' }) {
  const debtBefore = Math.max(0, Number(record.debt) || 0);
  const ceiling = kind === 'card' ? Number(record.limit) || Infinity : Number(record.initialAmount) || Infinity;
  const appliedAmount = sign > 0 ? Math.min(amount, debtBefore) : amount;
  const debt = Math.max(0, Math.min(ceiling, debtBefore - sign * appliedAmount));
  const required = kind === 'card' ? record.minPayment : record.payment;
  return { ...updateCycle(record, appliedAmount, sign, required, 'ежемесячно'), debt };
}

export function updateRecurringPaymentCycle(record, { amount, sign = 1, date }) {
  const updated = updateCycle(record, amount, sign, record.amount, record.periodicity);
  return {
    ...updated,
    paidAt: null,
    lastPaidAt: sign > 0 && updated.nextDate !== record.nextDate ? date : record.lastPaidAt,
  };
}

export function remainingDebtPayment(record, kind = 'loan') {
  const required = Math.max(0, Number(kind === 'card' ? record.minPayment : record.payment) || 0);
  return Math.min(Math.max(0, required - (Number(record.cyclePaid) || 0)), Math.max(0, Number(record.debt) || 0));
}

export function remainingRecurringPayment(record) {
  const required = Math.max(0, Number(record.amount) || 0);
  return Math.max(0, required - (Number(record.cyclePaid) || 0));
}
