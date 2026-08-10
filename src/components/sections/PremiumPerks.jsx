import { Wrench, ShieldCheck, BatteryCharging } from 'lucide-react';
import { Section } from '@/components/common/Section';
import { Reveal } from '@/components/common/Reveal';
import { useSite } from '@/context/SiteSettingsContext';
import { PREMIUM_PERKS } from '@/config/site';

const ICONS = {
  servicing: Wrench,
  warranty: ShieldCheck,
  batteryUpgrade: BatteryCharging,
};

function usePerks() {
  const { site } = useSite();
  return site.perks?.length ? site.perks : PREMIUM_PERKS;
}

export function PremiumPerks() {
  const perks = usePerks();
  return (
    <Section id="perks" tight className="py-12 sm:py-14">
      <Reveal className="text-center">
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-brand-700">
          Premium Ownership
        </p>
        <h2 className="mt-2 font-display text-xl font-extrabold text-heading sm:text-2xl">
          More than just a scooter
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-body">
          Free servicing, warranty coverage, and custom battery upgrades at our showroom.
        </p>
      </Reveal>

      <Reveal delay={0.05} className="mt-8">
        <div className="grid gap-8 border-t border-line pt-8 sm:grid-cols-3">
          {perks.map((perk) => {
            const Icon = ICONS[perk.id] || SparklesFallback;
            return (
              <div key={perk.id} className="text-center sm:text-left">
                <Icon className="mx-auto h-5 w-5 text-brand-600 sm:mx-0" strokeWidth={2.2} />
                <p className="mt-3 font-display text-base font-bold text-heading">{perk.title}</p>
                <p className="mt-1 text-sm leading-snug text-muted">{perk.desc}</p>
              </div>
            );
          })}
        </div>
      </Reveal>
    </Section>
  );
}

function SparklesFallback(props) {
  return <Wrench {...props} />;
}

/** Compact perks row for product pages */
export function PremiumPerksStrip() {
  const perks = usePerks();
  return (
    <div className="mt-5 grid grid-cols-1 gap-3 border-t border-line pt-5 sm:grid-cols-2">
      {perks.map((perk) => {
        const Icon = ICONS[perk.id] || Wrench;
        return (
          <div key={perk.id} className="flex items-center gap-2.5">
            <Icon className="h-4 w-4 shrink-0 text-brand-600" strokeWidth={2.2} />
            <p className="text-sm font-semibold text-heading">{perk.title}</p>
          </div>
        );
      })}
    </div>
  );
}
