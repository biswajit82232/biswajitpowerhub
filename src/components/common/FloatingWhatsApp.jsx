import { MessageCircle } from 'lucide-react';
import { whatsappUrl } from '@/config/site';
import { useSite } from '@/context/SiteSettingsContext';
import { trackEvent, EVENT } from '@/lib/tracking';

const DEFAULT_MSG = 'Hi, I want to know about electric scooters';

/**
 * Fixed WhatsApp CTA — above mobile sticky bar (z-9998).
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
      className="fixed right-[max(1rem,env(safe-area-inset-right))] z-[9998] inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25d366] text-white shadow-lg transition hover:bg-[#1ebe57] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25d366] bottom-[calc(4.5rem+env(safe-area-inset-bottom))] lg:bottom-[max(1.25rem,env(safe-area-inset-bottom))]"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="h-6 w-6" strokeWidth={2.2} />
    </a>
  );
}
