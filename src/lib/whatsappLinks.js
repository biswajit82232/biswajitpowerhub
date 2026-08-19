/** WhatsApp Business catalog deep link. Custom URL wins; otherwise wa.me/c/{number}. */

export function whatsappCatalogUrl(site = {}) {
  const custom = String(site.social?.whatsappCatalog || '').trim();
  if (custom) {
    try {
      const u = new URL(custom);
      if (/^(www\.)?(wa\.me|whatsapp\.com|api\.whatsapp\.com)$/i.test(u.hostname)) {
        return u.toString();
      }
    } catch {
      /* fall through to number */
    }
  }
  const digits = String(site.whatsapp || '').replace(/\D/g, '');
  if (!digits) return '';
  const num = digits.length === 10 ? `91${digits}` : digits;
  return `https://wa.me/c/${num}`;
}
