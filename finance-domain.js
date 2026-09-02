export function parseMoneyInput(value) {
  const normalized = String(value ?? '')
    .trim()
    .replace(/[\s₽]/g, '')
    .replace(',', '.');
  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) return 0;
  const amount = Number(normalized);
  if (!Number.isFinite(amount) || !Number.isSafeInteger(Math.round(amount * 100))) return 0;
  return amount;
}

export function validateCreditDraft({ bankId, userId, kind, initial, debt, rate, payment, term, nextDate }) {
  if (!bankId) return 'Выберите банк из справочника';
  if (!userId) return 'Добавьте хотя бы одного пользователя в настройках';
  if (!(initial > 0)) return 'Укажите начальную сумму / лимит больше нуля';
  if (debt < 0 || debt > initial) return 'Задолженность не может превышать начальную сумму или лимит';
  if (debt > 0 && (!(payment > 0) || payment > debt)) {
    return 'Платеж должен быть больше нуля и не превышать задолженность';
  }
  if (rate < 0 || rate > 100) return 'Укажите ставку от 0 до 100%';
  if (kind !== 'card' && !(term > 0)) return 'Укажите срок кредита или рассрочки больше нуля';
  if (!nextDate) return 'Укажите дату платежа в формате ДД.ММ.ГГГГ';
  return null;
}
