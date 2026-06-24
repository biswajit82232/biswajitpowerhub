/**
 * Google Analytics 4 — optional via VITE_GA_MEASUREMENT_ID (e.g. G-XXXXXXXXXX).
 * Loads deferred after first paint to protect performance.
 */

export const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID?.trim() || '';

export const isGoogleAnalyticsConfigured = Boolean(GA_MEASUREMENT_ID);

let initStarted = false;

function loadGtagScript() {
  if (!GA_MEASUREMENT_ID || typeof window === 'undefined' || window.gtag) return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, {
    send_page_view: false,
    anonymize_ip: true,
  });

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);
}

/** Initialise GA once — deferred until browser is idle */
export function initGoogleAnalytics() {
  if (!isGoogleAnalyticsConfigured || initStarted || typeof window === 'undefined') return;
  initStarted = true;

  const start = () => loadGtagScript();
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(start, { timeout: 2500 });
  } else {
    window.setTimeout(start, 1200);
  }
}

export function trackGAPageView(path) {
  if (!isGoogleAnalyticsConfigured || !window.gtag) return;
  window.gtag('event', 'page_view', {
    page_path: path,
    page_location: `${window.location.origin}${path}`,
  });
}

/** Map internal lead events to GA4 event names */
const GA_EVENT_MAP = {
  page_view: 'page_view',
  scooter_view: 'view_item',
  emi_calculator_used: 'calculator_use',
  simulator_used: 'simulator_use',
  whatsapp_click: 'whatsapp_click',
  call_click: 'call_click',
  callback_request: 'generate_lead',
  test_ride_booked: 'generate_lead',
  contact_form: 'generate_lead',
  compare_used: 'compare_models',
};

export function trackGAEvent(type, meta = {}) {
  if (!isGoogleAnalyticsConfigured || !window.gtag) return;

  const name = GA_EVENT_MAP[type] || type;
  const params = { event_category: 'engagement', ...meta };

  if (type === 'scooter_view' && meta.scooterId) {
    params.item_id = meta.scooterId;
    params.item_name = meta.name;
  }
  if (type === 'generate_lead' || type === 'callback_request' || type === 'test_ride_booked' || type === 'contact_form') {
    params.lead_source = meta.from || type;
  }

  window.gtag('event', name, params);
}
