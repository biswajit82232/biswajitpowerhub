import { SEO } from '@/components/common/SEO';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { LocateUs } from '@/components/sections/LocateUs';
import { EMICalculator } from '@/features/emi/EMICalculator';
import { EVSimulator } from '@/features/simulator/EVSimulator';
import { useAsync } from '@/hooks/useAsync';
import { getScooters } from '@/features/scooters/scooterService';
import { useFinance } from '@/context/FinanceSettingsContext';
import { getStartingPrice } from '@/lib/scooterVariants';
import { breadcrumbList } from '@/lib/schemaHelpers';
import { SCOOTERS } from '@/data/scooters';

export default function FinancePage() {
  const { data: scooters, loading } = useAsync(() => getScooters(), []);
  const { settings } = useFinance();
  const list = scooters?.length ? scooters : SCOOTERS;
  const samplePrice = getStartingPrice(list[0]) || 44999;

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
            Easy EMI Options
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-body sm:text-base">
            Flexible monthly installments for electric scooters. Visit our finance desk at Chunakhali
            Bus Stand or calculate an estimate below — final terms confirmed at the showroom.
          </p>
        </div>
      </section>

      <section className="bg-white py-10 sm:py-14">
        <div className="container-px">
          <h2 className="dealer-section-title">EMI Calculator</h2>
          <div className="mt-6 max-w-xl border border-line bg-white p-5 shadow-soft sm:p-6">
            <EMICalculator price={samplePrice} settings={settings} scooterId={list[0]?.id} />
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-surface-alt py-10 sm:py-14">
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
