import { useEffect, useRef } from 'react';
import { Zap, FileX2, Wallet, BatteryCharging, Wrench, ShieldCheck } from 'lucide-react';
import { Section, SectionHeading } from '@/components/common/Section';

const ITEMS = [
  {
    icon: Wrench,
    title: '3 Free Servicing',
    desc: 'Complimentary scheduled service visits at our Berhampore showroom.',
    gradient: 'from-brand-500 to-sky-500',
    glow: 'rgba(37,99,235,0.18)',
    bg: 'from-brand-50/80 to-sky-50/40',
    ring: 'ring-brand-100',
    bar: 'from-brand-400 to-sky-400',
  },
  {
    icon: ShieldCheck,
    title: '1 Yr Motor & Controller Warranty',
    desc: 'Full-year coverage on motor and controller — ride with confidence.',
    gradient: 'from-blue-600 to-brand-500',
    glow: 'rgba(37,99,235,0.18)',
    bg: 'from-blue-50/80 to-brand-50/40',
    ring: 'ring-blue-100',
    bar: 'from-blue-400 to-brand-400',
  },
  {
    icon: Zap,
    title: 'No Licence Required*',
    desc: 'Ride away today — eligible low-speed models need no driving licence.',
    gradient: 'from-sky-500 to-cyan-500',
    glow: 'rgba(14,165,233,0.18)',
    bg: 'from-sky-50/80 to-cyan-50/40',
    ring: 'ring-sky-100',
    bar: 'from-sky-400 to-cyan-400',
  },
  {
    icon: FileX2,
    title: 'No Registration Required*',
    desc: 'Skip the RTO queues. Zero registration paperwork for eligible models.',
    gradient: 'from-brand-600 to-blue-500',
    glow: 'rgba(29,78,216,0.18)',
    bg: 'from-brand-50/80 to-blue-50/40',
    ring: 'ring-brand-100',
    bar: 'from-brand-400 to-blue-400',
  },
  {
    icon: Wallet,
    title: 'Low Running Cost',
    desc: 'Spend a fraction of petrol costs — remarkably low per kilometre.',
    gradient: 'from-cyan-500 to-sky-500',
    glow: 'rgba(6,182,212,0.18)',
    bg: 'from-cyan-50/80 to-sky-50/40',
    ring: 'ring-cyan-100',
    bar: 'from-cyan-400 to-sky-400',
  },
  {
    icon: BatteryCharging,
    title: 'Home Charging',
    desc: 'Plug into any regular socket at home. Fully charged overnight.',
    gradient: 'from-blue-500 to-indigo-500',
    glow: 'rgba(59,130,246,0.18)',
    bg: 'from-blue-50/80 to-indigo-50/40',
    ring: 'ring-blue-100',
    bar: 'from-blue-400 to-indigo-400',
  },
  // duplicate set for seamless loop
  {
    icon: Wrench,
    title: '3 Free Servicing',
    desc: 'Complimentary scheduled service visits at our Berhampore showroom.',
    gradient: 'from-brand-500 to-sky-500',
    glow: 'rgba(37,99,235,0.18)',
    bg: 'from-brand-50/80 to-sky-50/40',
    ring: 'ring-brand-100',
    bar: 'from-brand-400 to-sky-400',
  },
  {
    icon: ShieldCheck,
    title: '1 Yr Motor & Controller Warranty',
    desc: 'Full-year coverage on motor and controller — ride with confidence.',
    gradient: 'from-blue-600 to-brand-500',
    glow: 'rgba(37,99,235,0.18)',
    bg: 'from-blue-50/80 to-brand-50/40',
    ring: 'ring-blue-100',
    bar: 'from-blue-400 to-brand-400',
  },
  {
    icon: Zap,
    title: 'No Licence Required*',
    desc: 'Ride away today — eligible low-speed models need no driving licence.',
    gradient: 'from-sky-500 to-cyan-500',
    glow: 'rgba(14,165,233,0.18)',
    bg: 'from-sky-50/80 to-cyan-50/40',
    ring: 'ring-sky-100',
    bar: 'from-sky-400 to-cyan-400',
  },
  {
    icon: FileX2,
    title: 'No Registration Required*',
    desc: 'Skip the RTO queues. Zero registration paperwork for eligible models.',
    gradient: 'from-brand-600 to-blue-500',
    glow: 'rgba(29,78,216,0.18)',
    bg: 'from-brand-50/80 to-blue-50/40',
    ring: 'ring-brand-100',
    bar: 'from-brand-400 to-blue-400',
  },
  {
    icon: Wallet,
    title: 'Low Running Cost',
    desc: 'Spend a fraction of petrol costs — remarkably low per kilometre.',
    gradient: 'from-cyan-500 to-sky-500',
    glow: 'rgba(6,182,212,0.18)',
    bg: 'from-cyan-50/80 to-sky-50/40',
    ring: 'ring-cyan-100',
    bar: 'from-cyan-400 to-sky-400',
  },
  {
    icon: BatteryCharging,
    title: 'Home Charging',
    desc: 'Plug into any regular socket at home. Fully charged overnight.',
    gradient: 'from-blue-500 to-indigo-500',
    glow: 'rgba(59,130,246,0.18)',
    bg: 'from-blue-50/80 to-indigo-50/40',
    ring: 'ring-blue-100',
    bar: 'from-blue-400 to-indigo-400',
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
    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const tick = () => {
      if (!reduceMotion && !pausedRef.current && !document.hidden) {
        if (halfRef.current <= 0) measure();
        const half = halfRef.current;
        if (half > 0) {
          offsetRef.current -= SPEED;
          if (Math.abs(offsetRef.current) >= half) offsetRef.current = 0;
          track.style.transform = `translate3d(${offsetRef.current}px,0,0)`;
        }
      }
      if (!reduceMotion) raf = requestAnimationFrame(tick);
    };
    if (!reduceMotion) raf = requestAnimationFrame(tick);

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
        <div className="absolute -right-24 top-0 h-64 w-64 rounded-full bg-sky-100/40 blur-3xl" />
        <div className="absolute -left-20 bottom-0 h-56 w-56 rounded-full bg-brand-100/40 blur-3xl" />
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
