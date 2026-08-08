import { MessageCircle } from 'lucide-react';
import { whatsappUrl } from '@/config/site';
import { useSite } from '@/context/SiteSettingsContext';
import { trackEvent, EVENT } from '@/lib/tracking';

const DEFAULT_MSG =
  'Hi, I want to know about electric scooters';

/**
 * Fixed WhatsApp CTA — visible on all public pages.
 */
export function FloatingWhatsApp() {
  const { site } = useSite();
  const href = whatsappUrl(DEFAULT_MSG, site);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() =>
        trackEvent(EVENT.WHATSAPP_CLICK, {
          from: 'floating_whatsapp',
          event_label: 'floating_whatsapp',
        })
      }
      className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-[max(1.25rem,env(safe-area-inset-right))] z-[9999] inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-[#1ebe57] hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366] max-sm:px-3.5 max-sm:py-3"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="h-5 w-5" strokeWidth={2.2} />
      <span className="hidden sm:inline">Chat on WhatsApp</span>
    </a>
  );
}
