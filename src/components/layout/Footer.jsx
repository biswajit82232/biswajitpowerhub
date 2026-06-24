import { Link } from 'react-router-dom';
import {
  Phone, MapPin, Clock, MessageCircle, ChevronRight,
  Zap, ShieldCheck, BatteryCharging, ArrowUpRight, Wrench,
} from 'lucide-react';
import { Logo } from '@/components/common/Logo';
import Button from '@/components/ui/Button';
import { NAV_LINKS, SITE, whatsappUrl, telUrl } from '@/config/site';
import { useSite } from '@/context/SiteSettingsContext';
import { trackEvent, EVENT } from '@/lib/tracking';

const TRUST = [
  { icon: Wrench, label: '3 free servicing' },
  { icon: ShieldCheck, label: '1 yr motor & controller warranty' },
  { icon: BatteryCharging, label: 'Home charging' },
  { icon: Zap, label: 'Low running cost' },
];

export function Footer() {
  const year = new Date().getFullYear();
  const { site } = useSite();
  const hourLines = site.hours.groups || [];

  return (
    <footer className="relative mt-auto overflow-x-hidden bg-heading text-white [&_h2]:text-white [&_h3]:text-white [&_h4]:text-white/60">
      {/* Brand gradient accent line */}
      <div className="h-1 bg-brand-gradient" />

      {/* Ambient glow */}
      <div className="pointer-events-none absolute -left-32 top-0 h-64 w-64 rounded-full bg-brand-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-56 w-56 rounded-full bg-accent-500/10 blur-3xl" />

      {/* CTA strip */}
      <div className="relative z-10 border-b border-white/10 bg-white/[0.03]">
        <div className="container-px flex flex-col items-start justify-between gap-6 py-10 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent-300">
              {SITE.tagline}
            </p>
            <h2 className="mt-2 font-display text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              Ready to ride electric?
            </h2>
            <p className="mt-2 max-w-md text-sm text-white/70">
              Visit our Berhampore showroom or message us — expert guidance, zero pressure.
            </p>
          </div>
          <div className="flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row">
            <Button to="/scooters" variant="primary" size="md" className="shadow-glow">
              View Scooters
            </Button>
            <Button
              href={whatsappUrl(undefined, site)}
              variant="whatsapp"
              size="md"
              icon={MessageCircle}
              onClick={() => trackEvent(EVENT.WHATSAPP_CLICK, { from: 'footer-cta' })}
            >
              WhatsApp Us
            </Button>
          </div>
        </div>
      </div>

      <div className="container-px relative z-10 py-14">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-4">
            <Logo light />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/70">
              Premium low-speed electric scooters in Berhampore. No licence, no registration* for
              eligible models — low running cost, home charging, expert local support.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {TRUST.map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/8 px-3 py-1.5 text-xs font-medium text-white/85 ring-1 ring-white/10"
                >
                  <Icon className="h-3.5 w-3.5 text-accent-300" strokeWidth={2.2} />
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Explore */}
          <div className="lg:col-span-2 lg:col-start-6">
            <h4 className="text-xs font-bold uppercase tracking-[0.18em] text-white/50">
              Explore
            </h4>
            <ul className="mt-5 space-y-3">
              {NAV_LINKS.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="group inline-flex items-center gap-2 text-sm text-white/75 transition hover:text-white"
                  >
                    <ChevronRight className="h-3.5 w-3.5 text-brand-400 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
                    {l.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/compare"
                  className="group inline-flex items-center gap-2 text-sm text-white/75 transition hover:text-white"
                >
                  <ChevronRight className="h-3.5 w-3.5 text-brand-400 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
                  Compare Models
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="lg:col-span-3">
            <h4 className="text-xs font-bold uppercase tracking-[0.18em] text-white/50">
              Contact
            </h4>
            <ul className="mt-5 space-y-4 text-sm text-white/75">
              {site.phones.map((p) => (
                <li key={p}>
                  <a
                    href={telUrl(p, site)}
                    onClick={() => trackEvent(EVENT.CALL_CLICK, { from: 'footer' })}
                    className="inline-flex items-center gap-2.5 transition hover:text-white"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/8 ring-1 ring-white/10">
                      <Phone className="h-4 w-4 text-brand-300" />
                    </span>
                    +91 {p}
                  </a>
                </li>
              ))}
              <li className="flex gap-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/8 ring-1 ring-white/10">
                  <MapPin className="h-4 w-4 text-brand-300" />
                </span>
                <span className="pt-1.5 leading-relaxed">{site.address.full}</span>
              </li>
              <li className="flex gap-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/8 ring-1 ring-white/10">
                  <Clock className="h-4 w-4 text-brand-300" />
                </span>
                <span className="pt-1.5 leading-relaxed">
                  {hourLines.map((g, i) => (
                    <span key={g.label}>
                      {i > 0 && <br />}
                      {g.label}: {g.text}
                    </span>
                  ))}
                </span>
              </li>
            </ul>
          </div>

          {/* Visit */}
          <div className="lg:col-span-3">
            <h4 className="text-xs font-bold uppercase tracking-[0.18em] text-white/50">
              Visit showroom
            </h4>
            <p className="mt-5 text-sm leading-relaxed text-white/70">
              Walk in for a test ride, EMI guidance, and honest advice on the best model for you.
            </p>
            <a
              href={site.maps.link}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-accent-300 transition hover:text-accent-200"
            >
              Get directions <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="relative border-t border-white/10 bg-black/20">
        <div className="container-px py-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-sm text-white/60">
              © {year} {SITE.name}. All rights reserved.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-1 gap-y-2 text-sm">
              <Link
                to="/terms"
                className="rounded-md px-2 py-1 text-white/70 transition hover:bg-white/8 hover:text-white"
              >
                Terms of Service
              </Link>
              <span className="text-white/25" aria-hidden>
                ·
              </span>
              <Link
                to="/privacy"
                className="rounded-md px-2 py-1 text-white/70 transition hover:bg-white/8 hover:text-white"
              >
                Privacy Policy
              </Link>
            </div>
            <p className="max-w-xl text-[0.7rem] leading-relaxed text-white/40">
              *No licence or registration applies to eligible low-speed models only. Specifications,
              prices, EMI figures, and promotional offers are indicative and subject to change.
              Showroom benefits and promo codes are governed by our{' '}
              <Link to="/terms" className="underline hover:text-white/60">
                Terms of Service
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
