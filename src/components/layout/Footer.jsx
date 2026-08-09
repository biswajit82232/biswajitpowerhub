import { Link } from 'react-router-dom';
import { Phone, MessageCircle, Clock } from 'lucide-react';
import { Logo } from '@/components/common/Logo';
import {
  FOOTER_QUICK_LINKS,
  SITE,
  whatsappUrl,
  telUrl,
  formatPhoneDisplay,
} from '@/config/site';
import { useSite } from '@/context/SiteSettingsContext';
import { trackEvent, EVENT } from '@/lib/tracking';

export function Footer() {
  const year = new Date().getFullYear();
  const { site } = useSite();
  const primaryPhone = site.phones[0];

  return (
    <footer
      className="relative mt-auto overflow-x-hidden text-white"
      style={{ backgroundColor: '#0f0f0f' }}
    >
      <div className="h-1" style={{ background: 'linear-gradient(90deg, #ff6600, #4285f4)' }} />

      <div className="container-px relative z-10 py-12 sm:py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-12">
          {/* Brand */}
          <div>
            <Logo light className="scale-90 origin-left" />
            <p className="mt-4 font-display text-lg font-bold text-white">{SITE.name}</p>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/70">
              Premium Electric Scooters in Berhampore, Murshidabad
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-white/50">
              Quick Links
            </h3>
            <ul className="mt-5 space-y-3">
              {FOOTER_QUICK_LINKS.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="text-sm text-white/75 transition hover:text-white hover:underline"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-white/50">
              Contact
            </h3>
            <div className="mt-5 space-y-4 text-sm text-white/75">
              <address className="not-italic leading-relaxed">
                Chunakhali Bus Stand, Nimtala
                <br />
                Berhampore, Murshidabad
                <br />
                West Bengal — 742149
              </address>

              <p>
                Phone:{' '}
                <a
                  href={telUrl(primaryPhone, site)}
                  onClick={() => trackEvent(EVENT.CALL_CLICK, { from: 'footer' })}
                  className="font-semibold text-white transition hover:underline"
                >
                  {formatPhoneDisplay(primaryPhone)}
                </a>
              </p>

              <p>
                WhatsApp:{' '}
                <a
                  href={whatsappUrl(undefined, site)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent(EVENT.WHATSAPP_CLICK, { from: 'footer-nap' })}
                  className="inline-flex items-center gap-1.5 font-semibold text-white transition hover:underline"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden />
                  Chat on WhatsApp
                </a>
              </p>

              <p className="flex items-start gap-2 leading-relaxed">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-white/50" aria-hidden />
                <span>
                  Hours: Mon–Sat: 9:00 AM – 8:00 PM | Sunday: Closed
                </span>
              </p>

              <a
                href={telUrl(primaryPhone, site)}
                onClick={() => trackEvent(EVENT.CALL_CLICK, { from: 'footer-icon' })}
                className="inline-flex items-center gap-2 text-white/60 transition hover:text-white"
                aria-label={`Call ${formatPhoneDisplay(primaryPhone)}`}
              >
                <Phone className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10" style={{ backgroundColor: '#1a1a1a' }}>
        <div className="container-px py-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <p className="text-sm text-white/60">
              © {year} Biswajit Power Hub. Electric Scooter Dealer in Berhampore, Murshidabad.
            </p>
            <p className="text-sm font-medium text-white/80">
              Best Electric Scooters in Berhampore | No Licence Required | Low Running Cost
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-1 gap-y-2 text-sm">
              <Link to="/terms" className="rounded-md px-2 py-1 text-white/70 transition hover:bg-white/8 hover:text-white">
                Terms of Service
              </Link>
              <span className="text-white/25" aria-hidden>·</span>
              <Link to="/privacy" className="rounded-md px-2 py-1 text-white/70 transition hover:bg-white/8 hover:text-white">
                Privacy Policy
              </Link>
              <span className="text-white/25" aria-hidden>·</span>
              <Link to="/about" className="rounded-md px-2 py-1 text-white/70 transition hover:bg-white/8 hover:text-white">
                About
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
