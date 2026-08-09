import { MessageCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
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
    <Button
      href={href}
      variant="whatsapp"
      size="icon"
      icon={MessageCircle}
      aria-label="Chat on WhatsApp"
      onClick={() =>
        trackEvent(EVENT.WHATSAPP_CLICK, {
          from: 'floating_whatsapp',
          event_label: 'floating_whatsapp',
        })
      }
      className="fixed right-[max(1rem,env(safe-area-inset-right))] z-[9998] shadow-lg bottom-[calc(8.25rem+env(safe-area-inset-bottom))] lg:bottom-[max(1.25rem,env(safe-area-inset-bottom))]"
    />
  );
}
