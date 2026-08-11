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
