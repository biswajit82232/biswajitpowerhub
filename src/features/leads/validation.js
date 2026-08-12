export function normalizeIndianMobile(phone) {
  let digits = String(phone || '').replace(/\D/g, '');
  if (digits.startsWith('91') && digits.length === 12) digits = digits.slice(2);
  if (digits.startsWith('0') && digits.length === 11) digits = digits.slice(1);
  return digits;
}

export function isValidPhone(phone) {
  return /^[6-9]\d{9}$/.test(normalizeIndianMobile(phone));
}

export function isValidName(name) {
  return String(name || '').trim().length >= 2;
}

export function isValidEmail(email) {
  if (!email) return true; // optional
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** Honeypot: true when bot-filled (field should stay empty for humans). */
export function isHoneypotFilled(value) {
  return String(value || '').trim().length > 0;
}

export function clearFieldError(setErrors, field) {
  setErrors((prev) => {
    if (!prev?.[field]) return prev;
    const next = { ...prev };
    delete next[field];
    return next;
  });
}

export function focusFirstError(formEl, errors) {
  const key = Object.keys(errors || {})[0];
  if (!key || !formEl) return;
  const el = formEl.querySelector(`[name="${key}"]`);
  if (el && typeof el.focus === 'function') {
    el.focus();
    el.scrollIntoView?.({ block: 'center', behavior: 'smooth' });
  }
}
