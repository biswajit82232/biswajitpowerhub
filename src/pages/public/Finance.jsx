import { Phone, MessageCircle } from 'lucide-react';
import { SEO } from '@/components/common/SEO';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { LocateUs } from '@/components/sections/LocateUs';
import Button from '@/components/ui/Button';
import { EMICalculator } from '@/features/emi/EMICalculator';
import { EVSimulator } from '@/features/simulator/EVSimulator';
import { useAsync } from '@/hooks/useAsync';
import { getScooters } from '@/features/scooters/scooterService';
import { useFinance } from '@/context/FinanceSettingsContext';
import { useSite } from '@/context/SiteSettingsContext';
import { telUrl, whatsappUrl } from '@/config/site';
import { breadcrumbList } from '@/lib/schemaHelpers';
import { trackEvent, EVENT } from '@/lib/tracking';
import { SCOOTERS } from '@/data/scooters';

const FINANCE_WA =
  "Hi Biswajit Power Hub, I'd like to enquire about EMI / finance options for an electric scooter.";

export default function FinancePage() {
  const { data: scooters, loading } = useAsync(() => getScooters(), []);
  const { settings } = useFinance();
  const { site } = useSite();
  const list = scooters?.length ? scooters : SCOOTERS;

  const jsonLd = breadcrumbList([
    { name: 'Home', path: '/' },
    { name: 'Finance', path: '/finance' },
  ]);

  return (
    <>
      <SEO
        title="Finance & EMI | Biswajit Power Hub Berhampore"
        description="Easy EMI and finance options for electric scooters at Biswajit Power Hub, Berhampore. Calculate savings vs petrol."
        path="/finance"
        jsonLd={[jsonLd]}
        titleTemplate={false}
      />

      <section className="border-b border-line bg-white">
        <div className="container-px py-8 sm:py-12">
          <Breadcrumbs items={[{ name: 'Home', to: '/' }, { name: 'Finance' }]} />
          <p className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-brand-500">Finance</p>
          <h1 className="mt-2 font-display text-2xl font-extrabold uppercase tracking-wide text-navy sm:text-3xl">
            Finance &amp; EMI Options
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-body sm:text-base">
            Flexible monthly installments for electric scooters. Visit our finance desk at Chunakhali
            Bus Stand or calculate an estimate below — final terms confirmed at the showroom.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              href={telUrl(undefined, site)}
              target="_self"
              variant="dealerPrimary"
              icon={Phone}
              onClick={() => trackEvent(EVENT.CALL_CLICK, { from: 'finance-page' })}
            >
              Call Showroom
            </Button>
            <Button
              href={whatsappUrl(FINANCE_WA, site)}
              target="_blank"
              rel="noopener noreferrer"
              variant="dealerSecondary"
              icon={MessageCircle}
              onClick={() => trackEvent(EVENT.WHATSAPP_CLICK, { from: 'finance-page' })}
            >
              WhatsApp Finance
            </Button>
          </div>
        </div>
      </section>

      <section className="bg-white py-10 sm:py-14">
        <div className="container-px">
          <h2 className="dealer-section-title">EMI Calculator</h2>
          <p className="mt-2 max-w-xl text-sm text-muted">
            Pick a scooter and tenure — see an indicative monthly payment.
          </p>
          <div className="mt-6 max-w-xl">
            <EMICalculator scooters={list} settings={settings} />
          </div>
        </div>
      </section>

      <section id="simulator" className="scroll-mt-[var(--header-offset)] border-t border-line bg-surface-alt py-10 sm:py-14">
        <div className="container-px">
          <h2 className="dealer-section-title">See What You&apos;d Save Going Electric</h2>
          <p className="mt-2 max-w-xl text-sm text-muted">
            Pick your scooter and daily travel — yearly savings vs petrol show up instantly.
          </p>
          <div className="mt-8">
            <EVSimulator scooters={list} settings={settings} loading={loading} />
          </div>
        </div>
      </section>

      <LocateUs />
    </>
  );
}
