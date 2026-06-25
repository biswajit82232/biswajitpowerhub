import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X, Phone, MessageCircle } from 'lucide-react';
import { Logo } from '@/components/common/Logo';
import Button from '@/components/ui/Button';
import { NAV_LINKS, whatsappUrl, telUrl } from '@/config/site';
import { useSite } from '@/context/SiteSettingsContext';
import { trackEvent, EVENT } from '@/lib/tracking';
import { cn } from '@/lib/utils';

export function Navbar() {
  const { site } = useSite();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [location.pathname]);

  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 w-full border-b transition-shadow duration-300 ease-premium',
        'bg-surface/95 backdrop-blur-xl supports-[backdrop-filter]:bg-surface/90',
        'pt-[env(safe-area-inset-top,0px)]',
        scrolled ? 'border-line/80 shadow-soft' : 'border-line/60',
      )}
    >
      <nav className="container-px flex h-[var(--header-height)] min-w-0 items-center justify-between gap-2">
        <Logo compact className="min-w-0 max-w-[calc(100%-3rem)] shrink" />

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  'rounded-full px-4 py-2 text-sm font-semibold transition-colors',
                  isActive ? 'text-brand-700' : 'text-body hover:text-brand-700'
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          <Button
            variant="secondary"
            size="sm"
            href={telUrl(undefined, site)}
            target="_self"
            icon={Phone}
            onClick={() => trackEvent(EVENT.CALL_CLICK, { from: 'navbar' })}
          >
            Call
          </Button>
          <Button
            variant="primary"
            size="sm"
            href={whatsappUrl(undefined, site)}
            icon={MessageCircle}
            onClick={() => trackEvent(EVENT.WHATSAPP_CLICK, { from: 'navbar' })}
          >
            WhatsApp
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          className="tap-target -mr-2 flex items-center justify-center rounded-xl p-2 text-heading lg:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 top-[var(--header-offset)] z-40 bg-heading/30 backdrop-blur-sm lg:hidden"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-x-0 top-[var(--header-height)] z-50 max-h-[calc(100dvh-var(--header-offset))] overflow-y-auto border-b border-line bg-surface px-4 pb-6 pt-3 shadow-card sm:px-5 lg:hidden"
            >
              <div className="flex flex-col gap-1">
                {NAV_LINKS.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) =>
                      cn(
                        'rounded-xl px-4 py-3.5 text-base font-semibold transition-colors',
                        isActive ? 'bg-brand-50 text-brand-700' : 'text-body hover:bg-slate-50'
                      )
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <Button
                  variant="secondary"
                  href={telUrl(undefined, site)}
                  target="_self"
                  icon={Phone}
                  onClick={() => trackEvent(EVENT.CALL_CLICK, { from: 'mobile-menu' })}
                >
                  Call Us
                </Button>
                <Button
                  variant="primary"
                  href={whatsappUrl(undefined, site)}
                  icon={MessageCircle}
                  onClick={() => trackEvent(EVENT.WHATSAPP_CLICK, { from: 'mobile-menu' })}
                >
                  WhatsApp
                </Button>
              </div>
              <p className="mt-4 text-center text-xs text-muted">
                {site.address.line}, {site.address.pincode}
              </p>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
