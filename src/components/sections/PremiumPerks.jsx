import { Wrench, ShieldCheck, BatteryCharging } from 'lucide-react';
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
