import { useEffect, useRef } from 'react';
import { Zap, FileX2, Wallet, BatteryCharging } from 'lucide-react';
import { Section, SectionHeading } from '@/components/common/Section';

const ITEMS = [
  {
    icon: Zap,
    title: 'No Licence Required*',
    desc: 'Ride away today — eligible low-speed models need no driving licence.',
    gradient: 'from-blue-500 to-cyan-500',
    glow: 'rgba(59,130,246,0.18)',
    bg: 'from-blue-50/80 to-cyan-50/40',
    ring: 'ring-blue-100',
    bar: 'from-blue-400 to-cyan-400',
  },
  {
    icon: FileX2,
    title: 'No Registration Required*',
    desc: 'Skip the RTO queues. Zero registration paperwork for eligible models.',
    gradient: 'from-teal-500 to-emerald-500',
    glow: 'rgba(20,184,166,0.18)',
    bg: 'from-teal-50/80 to-emerald-50/40',
    ring: 'ring-teal-100',
    bar: 'from-teal-400 to-emerald-400',
  },
  {
    icon: Wallet,
    title: 'Low Running Cost',
    desc: 'Spend a fraction of petrol costs — as low as ₹0.18 per kilometre.',
    gradient: 'from-amber-500 to-orange-500',
    glow: 'rgba(245,158,11,0.18)',
    bg: 'from-amber-50/80 to-orange-50/40',
    ring: 'ring-amber-100',
    bar: 'from-amber-400 to-orange-400',
  },
  {
    icon: BatteryCharging,
    title: 'Home Charging',
    desc: 'Plug into any regular socket at home. Fully charged overnight.',
    gradient: 'from-violet-500 to-purple-500',
    glow: 'rgba(139,92,246,0.18)',
    bg: 'from-violet-50/80 to-purple-50/40',
    ring: 'ring-violet-100',
    bar: 'from-violet-400 to-purple-400',
  },
  // duplicate set for seamless loop
  {
    icon: Zap,
    title: 'No Licence Required*',
    desc: 'Ride away today — eligible low-speed models need no driving licence.',
    gradient: 'from-blue-500 to-cyan-500',
    glow: 'rgba(59,130,246,0.18)',
    bg: 'from-blue-50/80 to-cyan-50/40',
    ring: 'ring-blue-100',
    bar: 'from-blue-400 to-cyan-400',
  },
  {
    icon: FileX2,
    title: 'No Registration Required*',
    desc: 'Skip the RTO queues. Zero registration paperwork for eligible models.',
    gradient: 'from-teal-500 to-emerald-500',
    glow: 'rgba(20,184,166,0.18)',
    bg: 'from-teal-50/80 to-emerald-50/40',
    ring: 'ring-teal-100',
    bar: 'from-teal-400 to-emerald-400',
  },
  {
    icon: Wallet,
    title: 'Low Running Cost',
    desc: 'Spend a fraction of petrol costs — as low as ₹0.18 per kilometre.',
    gradient: 'from-amber-500 to-orange-500',
    glow: 'rgba(245,158,11,0.18)',
    bg: 'from-amber-50/80 to-orange-50/40',
    ring: 'ring-amber-100',
    bar: 'from-amber-400 to-orange-400',
  },
  {
    icon: BatteryCharging,
    title: 'Home Charging',
    desc: 'Plug into any regular socket at home. Fully charged overnight.',
    gradient: 'from-violet-500 to-purple-500',
    glow: 'rgba(139,92,246,0.18)',
    bg: 'from-violet-50/80 to-purple-50/40',
    ring: 'ring-violet-100',
    bar: 'from-violet-400 to-purple-400',
  },
];

const SPEED = 0.6;

function WhyMarquee() {
  const trackRef = useRef(null);
  const offsetRef = useRef(0);
  const halfRef = useRef(0);
  const pausedRef = useRef(false);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const measure = () => { halfRef.current = track.scrollWidth / 2; };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(track);

    let raf = 0;
    const tick = () => {
      if (!pausedRef.current && !document.hidden) {
        if (halfRef.current <= 0) measure();
        const half = halfRef.current;
        if (half > 0) {
          offsetRef.current -= SPEED;
          if (Math.abs(offsetRef.current) >= half) offsetRef.current = 0;
          track.style.transform = `translate3d(${offsetRef.current}px,0,0)`;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return (
    <div
      className="relative overflow-hidden"
      onMouseEnter={() => { pausedRef.current = true; }}
      onMouseLeave={() => { pausedRef.current = false; }}
    >
      {/* fade edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-white to-transparent sm:w-20" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-white to-transparent sm:w-20" />

      <div
        ref={trackRef}
        className="flex w-max gap-4 will-change-transform sm:gap-5"
        aria-live="off"
      >
        {ITEMS.map((item, i) => (
          <div
            key={`${item.title}-${i}`}
            className={`group relative w-[min(78vw,280px)] shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br ${item.bg} p-5 ring-1 ${item.ring} shadow-soft transition-shadow duration-300 hover:shadow-card-hover sm:w-72`}
          >
            {/* glow on hover */}
            <div
              className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
              style={{ background: item.glow }}
            />

            {/* icon */}
            <span
              className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${item.gradient} shadow-sm transition-transform duration-300 group-hover:scale-110`}
              style={{ boxShadow: `0 4px 16px ${item.glow}` }}
            >
              <item.icon className="h-6 w-6 text-white" strokeWidth={2} />
            </span>

            <h3 className="mt-4 font-display text-base font-bold text-heading">{item.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-body">{item.desc}</p>

            {/* bottom gradient bar */}
            <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${item.bar} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function WhyChooseUs() {
  return (
    <Section id="why" className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 hidden lg:block">
        <div className="absolute -right-24 top-0 h-64 w-64 rounded-full bg-teal-100/30 blur-3xl" />
        <div className="absolute -left-20 bottom-0 h-56 w-56 rounded-full bg-blue-100/30 blur-3xl" />
      </div>

      <SectionHeading
        eyebrow="Why Choose Us"
        title="The smarter way to ride"
        subtitle="Everything you love about electric, with none of the hassle."
      />

      <div className="mt-10 -mx-5 sm:-mx-6 lg:-mx-8">
        <WhyMarquee />
      </div>

      <p className="mt-6 text-center text-xs text-muted">
        *Applies to eligible low-speed models only.
      </p>
    </Section>
  );
}
