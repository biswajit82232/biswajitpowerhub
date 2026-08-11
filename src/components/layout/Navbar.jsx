import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Menu, X, Phone } from 'lucide-react';
import Button from '@/components/ui/Button';
import { NAV_LINKS, SITE, telUrl } from '@/config/site';
import { useSite } from '@/context/SiteSettingsContext';
import { trackEvent, EVENT } from '@/lib/tracking';
import { cn } from '@/lib/utils';

function DesktopNavItem({ link }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const hasChildren = link.children?.length > 0;
  const childActive = hasChildren && link.children.some((c) => location.pathname.startsWith(c.to));
  const isActive = location.pathname === link.to || childActive;

  if (!hasChildren) {
    return (
      <NavLink
        to={link.to}
        className={cn(
          'relative whitespace-nowrap px-3 py-2 text-[13px] font-semibold uppercase tracking-wide transition-colors xl:px-3.5 xl:text-sm',
          isActive ? 'text-navy' : 'text-body hover:text-navy',
          isActive &&
            'after:absolute after:bottom-0 after:left-3 after:right-3 after:h-[2px] after:bg-brand-500',
        )}
      >
        {link.label}
      </NavLink>
    );
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Link
        to={link.to}
        className={cn(
          'relative inline-flex items-center gap-1 whitespace-nowrap px-3 py-2 text-[13px] font-semibold uppercase tracking-wide transition-colors xl:px-3.5 xl:text-sm',
          isActive ? 'text-navy' : 'text-body hover:text-navy',
          isActive &&
            'after:absolute after:bottom-0 after:left-3 after:right-3 after:h-[2px] after:bg-brand-500',
        )}
        aria-expanded={open}
        aria-haspopup="true"
        onFocus={() => setOpen(true)}
      >
        {link.label}
        <ChevronDown className={cn('h-3.5 w-3.5 transition', open && 'rotate-180')} />
      </Link>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full z-50 min-w-[180px] border border-line bg-white py-2 shadow-card"
          >
            {link.children.map((child) => (
              <Link
                key={child.to}
                to={child.to}
                className="block px-4 py-2.5 text-sm font-medium text-body transition hover:bg-surface-alt hover:text-navy"
              >
                {child.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Navbar() {
  const { site } = useSite();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [mobileProductOpen, setMobileProductOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setMobileProductOpen(false);
  }, [location.pathname]);

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
        'fixed inset-x-0 top-0 z-50 w-full border-b border-black/10 bg-white transition-shadow duration-300',
        'pt-[env(safe-area-inset-top,0px)]',
        scrolled && 'shadow-soft',
      )}
    >
      <nav className="container-px flex h-[var(--header-height)] min-w-0 items-center justify-between gap-2">
        <Link
          to="/"
          className="min-w-0 max-w-[calc(100%-3rem)] shrink font-display text-sm font-extrabold uppercase tracking-wide text-navy sm:text-base"
          aria-label={SITE.name}
        >
          Biswajit <span className="text-brand-500">Power Hub</span>
        </Link>

        <div className="hidden min-w-0 shrink items-center gap-0.5 lg:flex">
          {NAV_LINKS.map((link) => (
            <DesktopNavItem key={link.label} link={link} />
          ))}
        </div>

        <div className="hidden shrink-0 items-center lg:flex">
          <Button
            variant="dealerPrimary"
            size="sm"
            href={telUrl(undefined, site)}
            target="_self"
            icon={Phone}
            onClick={() => trackEvent(EVENT.CALL_CLICK, { from: 'navbar' })}
          >
            Call
          </Button>
        </div>

        <button
          className="tap-target -mr-2 flex items-center justify-center rounded-dealer p-2 text-navy lg:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 top-[var(--header-offset)] z-40 bg-black/40 lg:hidden"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-x-0 top-[var(--header-height)] z-50 max-h-[calc(100dvh-var(--header-offset))] overflow-y-auto border-b border-line bg-white px-4 pb-6 pt-3 shadow-card sm:px-5 lg:hidden"
            >
              <div className="flex flex-col gap-0.5">
                {NAV_LINKS.map((link) =>
                  link.children?.length ? (
                    <div key={link.label}>
                      <button
                        type="button"
                        onClick={() => setMobileProductOpen((v) => !v)}
                        className="flex w-full items-center justify-between rounded-dealer px-4 py-3.5 text-left text-sm font-bold uppercase tracking-wide text-navy"
                      >
                        {link.label}
                        <ChevronDown
                          className={cn('h-4 w-4 transition', mobileProductOpen && 'rotate-180')}
                        />
                      </button>
                      {mobileProductOpen && (
                        <div className="mb-1 ml-3 border-l border-line pl-2">
                          {link.children.map((child) => (
                            <NavLink
                              key={child.to}
                              to={child.to}
                              className={({ isActive }) =>
                                cn(
                                  'block rounded-dealer px-4 py-2.5 text-sm font-semibold',
                                  isActive ? 'bg-brand-50 text-brand-600' : 'text-body hover:bg-surface-alt',
                                )
                              }
                            >
                              {child.label}
                            </NavLink>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      className={({ isActive }) =>
                        cn(
                          'rounded-dealer px-4 py-3.5 text-sm font-bold uppercase tracking-wide transition-colors',
                          isActive ? 'bg-brand-50 text-brand-600' : 'text-navy hover:bg-surface-alt',
                        )
                      }
                    >
                      {link.label}
                    </NavLink>
                  ),
                )}
              </div>
              <div className="mt-4">
                <Button
                  variant="dealerPrimary"
                  href={telUrl(undefined, site)}
                  target="_self"
                  icon={Phone}
                  fullWidth
                  onClick={() => trackEvent(EVENT.CALL_CLICK, { from: 'mobile-menu' })}
                >
                  Call Us
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
