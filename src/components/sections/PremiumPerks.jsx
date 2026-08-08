import { Wrench, ShieldCheck, BatteryCharging } from 'lucide-react';
import { Section } from '@/components/common/Section';
import { Reveal } from '@/components/common/Reveal';
import { PREMIUM_PERKS } from '@/config/site';

const ICONS = {
  servicing: Wrench,
  warranty: ShieldCheck,
  batteryUpgrade: BatteryCharging,
};

const CARD_STYLE = {
  servicing: {
    gradient: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-50/60',
    ring: 'ring-amber-100',
  },
  warranty: {
    gradient: 'from-blue-500 to-cyan-500',
    bg: 'bg-blue-50/60',
    ring: 'ring-blue-100',
  },
  batteryUpgrade: {
    gradient: 'from-emerald-500 to-teal-500',
    bg: 'bg-emerald-50/60',
    ring: 'ring-emerald-100',
  },
};

function PerkTile({ perk }) {
  const Icon = ICONS[perk.id];
  const style = CARD_STYLE[perk.id];

  return (
    <div className={`flex items-center gap-3 rounded-xl ${style.bg} p-3 ring-1 ${style.ring}`}>
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${style.gradient}`}
      >
        <Icon className="h-4 w-4 text-white" strokeWidth={2.2} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold leading-tight text-heading">{perk.title}</p>
        <p className="mt-0.5 text-xs leading-snug text-muted">{perk.desc}</p>
      </div>
      <span className="shrink-0 font-display text-sm font-extrabold text-brand-600">{perk.highlight}</span>
    </div>
  );
}

export function PremiumPerks() {
  return (
    <Section id="perks" alt tight className="py-10 sm:py-12">
      <Reveal className="text-center">
        <span className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-brand-600">
          Premium Ownership
        </span>
        <h2 className="mt-1.5 font-display text-xl font-extrabold text-heading sm:text-2xl">
          More than just a scooter
        </h2>
        <p className="mx-auto mt-1.5 max-w-lg text-xs leading-relaxed text-body sm:text-sm">
          Free servicing, warranty coverage, and custom battery upgrades at our showroom.
        </p>
      </Reveal>

      <Reveal delay={0.05} className="mt-5">
        <div className="rounded-2xl bg-surface p-3 ring-1 ring-line shadow-soft sm:p-4">
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {PREMIUM_PERKS.map((perk) => (
              <PerkTile key={perk.id} perk={perk} />
            ))}
          </div>
        </div>
      </Reveal>
    </Section>
  );
}

/** Compact perks row for product pages */
export function PremiumPerksStrip() {
  return (
    <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
      {PREMIUM_PERKS.map((perk) => {
        const Icon = ICONS[perk.id];
        const style = CARD_STYLE[perk.id];
        return (
          <div
            key={perk.id}
            className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 ring-1 ${style.bg} ${style.ring}`}
          >
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${style.gradient}`}
            >
              <Icon className="h-3.5 w-3.5 text-white" strokeWidth={2.2} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold leading-tight text-heading">{perk.title}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
