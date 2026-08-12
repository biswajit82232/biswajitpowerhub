/**
 * Google Analytics 4 + optional Google Ads (gtag).
 * GA: VITE_GA_MEASUREMENT_ID (default G-ZPSM06SEY4)
 * Ads remarketing/conversions: VITE_GOOGLE_ADS_ID (e.g. AW-XXXXXXXXX)
 */

export const GA_MEASUREMENT_ID =
  import.meta.env.VITE_GA_MEASUREMENT_ID?.trim() || 'G-ZPSM06SEY4';

/** Google Ads Conversion/Remarketing ID — set in Vercel when Ads account is ready */
export const GOOGLE_ADS_ID = import.meta.env.VITE_GOOGLE_ADS_ID?.trim() || '';

export const isGoogleAnalyticsConfigured = Boolean(GA_MEASUREMENT_ID);
export const isGoogleAdsConfigured = Boolean(GOOGLE_ADS_ID && /^AW-/.test(GOOGLE_ADS_ID));

/** Conversion labels created in Google Ads UI (suffix after AW-XXXX/) */
export const ADS_CONVERSION_LABELS = {
  call_click: 'phone_call_lead',
  phone_click: 'phone_call_lead',
  directions_click: 'directions_click',
  get_directions: 'directions_click',
  whatsapp_click: 'whatsapp_lead',
  form_submit: 'contact_form_submit',
  contact_form: 'contact_form_submit',
  view_item: 'product_view',
  scooter_view: 'product_view',
};

let adsWarned = false;

function warnMissingAdsId() {
  if (adsWarned || !import.meta.env.DEV || isGoogleAdsConfigured) return;
  adsWarned = true;
  console.warn('[Ads] VITE_GOOGLE_ADS_ID not set — Google Ads conversions disabled');
}

/** True when gtag was loaded from index.html (avoid duplicate first page_view). */
export function isGtagLoadedFromHtml() {
  return typeof document !== 'undefined'
    && Boolean(document.querySelector('script[src*="googletagmanager.com/gtag/js"]'));
}

let initStarted = false;
let adsConfigured = false;

/** Attach Google Ads config (remarketing) once gtag is available */
export function configureGoogleAds() {
  warnMissingAdsId();
  if (!isGoogleAdsConfigured || typeof window === 'undefined' || !window.gtag || adsConfigured) return;
  window.gtag('config', GOOGLE_ADS_ID);
  adsConfigured = true;
}

/**
 * Fire a Google Ads conversion.
 * @param {string} label conversion label only (e.g. phone_call_lead) OR full send_to AW-XXX/label
 * @param {number|null} [value]
 * @param {string} [currency]
 */
export function trackAdsConversion(label, value = null, currency = 'INR') {
  if (!isGoogleAdsConfigured || !window.gtag || !label) return;
  const sendTo = label.includes('/') ? label : `${GOOGLE_ADS_ID}/${label}`;
  const params = { send_to: sendTo, currency };
  if (value != null) params.value = value;
  window.gtag('event', 'conversion', params);
}

/** @deprecated use trackAdsConversion */
export function trackGoogleAdsConversion(sendTo, params = {}) {
  if (!isGoogleAdsConfigured || !window.gtag || !sendTo) return;
  window.gtag('event', 'conversion', { send_to: sendTo, currency: 'INR', ...params });
}

function loadGtagScript() {
  if (!GA_MEASUREMENT_ID || typeof window === 'undefined' || window.gtag) {
    configureGoogleAds();
    return;
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  // send_page_view: true — this loader owns the first page_view (index.html no
  // longer loads gtag eagerly). SPA route changes are sent by trackGAPageView.
  window.gtag('config', GA_MEASUREMENT_ID, {
    send_page_view: true,
    anonymize_ip: true,
  });
  configureGoogleAds();

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);
}

/** Initialise GA once — skips if index.html already loaded gtag.js */
export function initGoogleAnalytics() {
  if (!isGoogleAnalyticsConfigured || initStarted || typeof window === 'undefined') return;
  initStarted = true;

  if (window.gtag) {
    configureGoogleAds();
    return;
  }

  const start = () => loadGtagScript();
  // Keep ~300KB of gtag off the LCP window; still loads for Ads/GA on idle.
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(start, { timeout: 5500 });
  } else {
    window.setTimeout(start, 3200);
  }
}

export function trackGAPageView(path) {
  if (!isGoogleAnalyticsConfigured || !window.gtag) return;
  window.gtag('event', 'page_view', {
    page_path: path,
    page_location: `${window.location.origin}${path}`,
  });
  // Remarketing ping for Ads (when configured)
  if (isGoogleAdsConfigured) {
    window.gtag('event', 'page_view', { send_to: GOOGLE_ADS_ID });
  }
}

/** Map internal lead events to GA4 event names */
const GA_EVENT_MAP = {
  page_view: 'page_view',
  scooter_view: 'view_item',
  emi_calculator_used: 'calculator_use',
  simulator_used: 'simulator_use',
  whatsapp_click: 'whatsapp_click',
  call_click: 'phone_click',
  directions_click: 'get_directions',
  callback_request: 'generate_lead',
  test_ride_booked: 'generate_lead',
  contact_form: 'form_submit',
  compare_used: 'compare_models',
};

/** Outbound clicks that must survive page unload / dialer handoff */
const BEACON_EVENTS = new Set(['call_click', 'whatsapp_click', 'directions_click', 'contact_form']);

let lastGaKey = '';
let lastGaAt = 0;

export function trackGAEvent(type, meta = {}) {
  if (!isGoogleAnalyticsConfigured || !window.gtag) return;

  // SPA page views are owned by GoogleAnalytics → trackGAPageView (avoids double-counting).
  // First load page_view still comes from index.html gtag config.
  if (type === 'page_view') return;

  const name = GA_EVENT_MAP[type] || type;
  const dedupeKey = `${name}:${meta.from || meta.event_label || ''}`;
  const now = Date.now();
  if (dedupeKey === lastGaKey && now - lastGaAt < 600) return;
  lastGaKey = dedupeKey;
  lastGaAt = now;

  const params = { event_category: 'engagement', ...meta };

  if (type === 'scooter_view' && meta.scooterId) {
    params.item_id = meta.scooterId;
    params.item_name = meta.name;
    params.item_category = 'Electric Scooter';
    params.event_category = 'ecommerce';
  }
  if (type === 'whatsapp_click') {
    params.event_label = meta.event_label || meta.from || 'whatsapp';
  }
  if (type === 'call_click') {
    params.event_label = meta.from || 'phone';
  }
  if (type === 'directions_click') {
    params.event_label = meta.from || 'directions';
  }
  if (type === 'contact_form') {
    params.event_category = 'lead';
    params.event_label = meta.from || 'contact_form';
  }
  if (type === 'callback_request' || type === 'test_ride_booked') {
    params.lead_source = meta.from || type;
  }
  if (BEACON_EVENTS.has(type)) {
    params.transport_type = 'beacon';
  }

  window.gtag('event', name, params);

  if (type === 'contact_form') {
    window.gtag('event', 'generate_lead', {
      event_category: 'lead',
      lead_source: 'contact_form',
      transport_type: 'beacon',
    });
  }

  // Mirror key events to Google Ads conversion labels
  const adsLabel = ADS_CONVERSION_LABELS[type] || ADS_CONVERSION_LABELS[name];
  if (adsLabel) {
    trackAdsConversion(adsLabel, meta.value ?? null);
  }
}
