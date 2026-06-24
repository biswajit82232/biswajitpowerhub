export function isValidPhone(phone) {
  return /^[6-9]\d{9}$/.test(String(phone || '').trim());
}

export function isValidName(name) {
  return String(name || '').trim().length >= 2;
}

export function isValidEmail(email) {
  if (!email) return true; // optional
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
