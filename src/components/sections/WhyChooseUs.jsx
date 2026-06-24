import { Zap, FileX2, Wallet, BatteryCharging } from 'lucide-react';
import { Section, SectionHeading } from '@/components/common/Section';
import { RevealGroup, RevealItem } from '@/components/common/Reveal';

const ITEMS = [
  {
    icon: Zap,
    title: 'No Licence Required*',
    desc: 'Ride away today — eligible low-speed models need no driving licence.',
    gradient: 'from-blue-500 to-cyan-500',
    glow: 'rgba(59,130,246,0.2)',
    bg: 'from-blue-50/80 to-cyan-50/40',
    ring: 'ring-blue-100',
    highlight: 'from-blue-500/10 to-cyan-500/5',
  },
  {
    icon: FileX2,
    title: 'No Registration Required*',
    desc: 'Skip the RTO queues. Zero registration paperwork for eligible models.',
    gradient: 'from-teal-500 to-emerald-500',
    glow: 'rgba(20,184,166,0.2)',
    bg: 'from-teal-50/80 to-emerald-50/40',
    ring: 'ring-teal-100',
    highlight: 'from-teal-500/10 to-emerald-500/5',
  },
  {
    icon: Wallet,
    title: 'Low Running Cost',
    desc: 'Spend a fraction of petrol costs — as low as ₹0.18 per kilometre.',
    gradient: 'from-amber-500 to-orange-500',
    glow: 'rgba(245,158,11,0.2)',
    bg: 'from-amber-50/80 to-orange-50/40',
    ring: 'ring-amber-100',
    highlight: 'from-amber-500/10 to-orange-500/5',
  },
  {
    icon: BatteryCharging,
    title: 'Home Charging',
    desc: 'Plug into any regular socket at home. Fully charged overnight.',
    gradient: 'from-violet-500 to-purple-500',
    glow: 'rgba(139,92,246,0.2)',
    bg: 'from-violet-50/80 to-purple-50/40',
    ring: 'ring-violet-100',
    highlight: 'from-violet-500/10 to-purple-500/5',
  },
];

export function WhyChooseUs() {
  return (
    <Section id="why" className="relative overflow-hidden">
      {/* subtle bg orb */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -right-24 top-0 h-80 w-80 rounded-full bg-teal-100/40 blur-3xl" />
        <div className="absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-blue-100/40 blur-3xl" />
      </div>

      <SectionHeading
        eyebrow="Why Choose Us"
        title="The smarter way to ride"
        subtitle="Everything you love about electric, with none of the hassle."
      />

      <RevealGroup className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {ITEMS.map((item) => (
          <RevealItem key={item.title}>
            <div
              className={`group relative h-full overflow-hidden rounded-2xl bg-gradient-to-br ${item.bg} p-6 ring-1 ${item.ring} shadow-soft transition-all duration-300 hover:-translate-y-2 hover:shadow-card-hover`}
              style={{ '--glow': item.glow }}
            >
              {/* Hover glow background */}
              <div
                className={`absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br ${item.highlight} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
              />
              {/* Top-right shine */}
              <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100" style={{ background: item.glow }} />

              {/* Icon */}
              <span
                className={`mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${item.gradient} shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg`}
                style={{ boxShadow: `0 4px 20px ${item.glow}` }}
              >
                <item.icon className="h-7 w-7 text-white" strokeWidth={2} />
              </span>

              <h3 className="font-display text-lg font-bold text-heading">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-body">{item.desc}</p>

              {/* Bottom gradient bar */}
              <div
                className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${item.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
              />
            </div>
          </RevealItem>
        ))}
      </RevealGroup>

      <p className="mt-6 text-center text-xs text-muted">
        *Applies to eligible low-speed models only.
      </p>
    </Section>
  );
}
