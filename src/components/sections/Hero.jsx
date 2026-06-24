import { motion } from 'framer-motion';
import { ArrowRight, MessageCircle, Zap, ShieldCheck, BatteryCharging, Wallet } from 'lucide-react';
import Button from '@/components/ui/Button';
import { ScooterImage } from '@/components/common/ScooterImage';
import { SITE, whatsappUrl } from '@/config/site';
import { trackEvent, EVENT } from '@/lib/tracking';

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] },
  }),
};

const STATS = [
  { value: '120 km', label: 'Max range' },
  { value: '₹0.18', label: 'Per km cost' },
  { value: '0 RTO', label: 'Paperwork*' },
  { value: '8 hrs', label: 'Full charge' },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* ── Background layers ── */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        {/* Base gradient mesh */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_80%_at_20%_-10%,#DBEAFE,transparent_60%),radial-gradient(ellipse_80%_60%_at_80%_10%,#CCFBF1,transparent_55%),radial-gradient(ellipse_60%_80%_at_50%_100%,#EFF6FF,transparent_60%)] bg-bg" />
        {/* Animated orbs */}
        <div className="absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-blue-300/20 blur-[100px] animate-orb-pulse" />
        <div className="absolute -right-20 top-10 h-[420px] w-[420px] rounded-full bg-teal-300/20 blur-[90px] animate-orb-pulse [animation-delay:3s]" />
        <div className="absolute bottom-0 left-1/2 h-64 w-[700px] -translate-x-1/2 rounded-full bg-cyan-200/20 blur-[80px]" />
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(#3B82F6 1px, transparent 1px), linear-gradient(to right, #3B82F6 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="container-px grid items-center gap-12 pb-10 pt-10 sm:pb-16 sm:pt-14 lg:grid-cols-2 lg:gap-10 lg:py-24">
        {/* ── Left column ── */}
        <div className="text-center lg:text-left">
          {/* Eyebrow badge */}
          <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0}>
            <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-50 to-accent-50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-brand-700 ring-1 ring-brand-200 shadow-sm">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-brand-gradient shadow-glow-blue">
                <Zap className="h-2.5 w-2.5 text-white" fill="white" />
              </span>
              {SITE.name}
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={1}
            className="mt-5 font-display text-display-2xl font-extrabold text-heading"
          >
            Ride Electric.
            <br />
            <span className="relative">
              Save More.
              <svg
                className="absolute -bottom-1 left-0 w-full"
                viewBox="0 0 300 10"
                preserveAspectRatio="none"
                aria-hidden
              >
                <path
                  d="M0 8 Q75 0 150 6 Q225 12 300 4"
                  stroke="url(#underline-grad)"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="underline-grad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#14B8A6" />
                  </linearGradient>
                </defs>
              </svg>
            </span>
            <br />
            <span className="text-gradient-bt">Power Every Journey.</span>
          </motion.h1>

          {/* Sub-text */}
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={2}
            className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-body sm:text-lg lg:mx-0"
          >
            Premium low-speed electric scooters — no licence, no registration*, and remarkably low
            running cost.&nbsp;{SITE.tagline}.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={3}
            className="mt-7 flex flex-wrap items-center justify-center gap-3 lg:justify-start"
          >
            <Button to="/scooters" size="sm" variant="primary" iconRight={ArrowRight}>
              View Scooters
            </Button>
            <Button
              href={whatsappUrl()}
              size="sm"
              variant="whatsapp"
              icon={MessageCircle}
              onClick={() => trackEvent(EVENT.WHATSAPP_CLICK, { from: 'hero' })}
            >
              WhatsApp Us
            </Button>
          </motion.div>

          {/* Trust chips */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={4}
            className="mt-8 flex flex-wrap items-center justify-center gap-2.5 lg:justify-start"
          >
            {[
              { icon: ShieldCheck, label: 'No Licence Required*', color: 'text-accent-600' },
              { icon: BatteryCharging, label: 'Charge at Home', color: 'text-brand-600' },
              { icon: Wallet, label: 'Low Running Cost', color: 'text-cyan-600' },
            ].map(({ icon: Icon, label, color }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-body ring-1 ring-line shadow-soft backdrop-blur-sm"
              >
                <Icon className={`h-3.5 w-3.5 ${color}`} />
                {label}
              </span>
            ))}
          </motion.div>
        </div>

        {/* ── Right column — visual ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          className="relative mx-auto w-full max-w-md lg:max-w-none"
        >
          {/* Glow ring behind card */}
          <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-br from-brand-400/20 to-teal-400/20 blur-2xl" />

          {/* Main card */}
          <div className="relative rounded-3xl bg-white p-3 shadow-card ring-1 ring-blue-100">
            {/* Shine overlay */}
            <div className="pointer-events-none absolute inset-0 rounded-3xl bg-card-shine" />
            <ScooterImage
              hue="teal"
              name="PowerHub EV"
              alt="Premium electric scooter"
              className="aspect-[4/3] w-full rounded-2xl"
            />

            {/* Floating badge — Range */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
              className="glass absolute -bottom-5 -left-4 flex items-center gap-3 rounded-2xl px-4 py-3 shadow-card"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 shadow-glow-teal">
                <BatteryCharging className="h-5 w-5 text-white" />
              </span>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">Up to</p>
                <p className="font-display text-lg font-extrabold text-heading">120 km range</p>
              </div>
            </motion.div>

            {/* Floating badge — Cost */}
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="glass absolute -right-4 top-8 flex items-center gap-2.5 rounded-2xl px-4 py-3 shadow-card"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-glow-blue">
                <Zap className="h-4 w-4 text-white" fill="white" />
              </span>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">Cost</p>
                <p className="font-display text-sm font-extrabold text-heading">₹0.18/km</p>
              </div>
            </motion.div>

            {/* Floating badge — Savings */}
            <motion.div
              animate={{ y: [0, -7, 0] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="glass absolute -right-3 bottom-12 flex items-center gap-2 rounded-xl px-3 py-2.5 shadow-card"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-xs font-bold text-heading">Save ₹27k+/year</p>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* ── Stats strip ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative border-t border-brand-100/60 bg-gradient-to-r from-brand-50/80 via-cyan-50/60 to-teal-50/80 backdrop-blur-sm"
      >
        <div className="container-px">
          <div className="grid grid-cols-2 divide-x divide-brand-100/60 sm:grid-cols-4">
            {STATS.map(({ value, label }) => (
              <div key={label} className="flex flex-col items-center gap-0.5 py-4 px-4 sm:py-5">
                <span className="font-display text-xl font-extrabold text-gradient-bt sm:text-2xl">
                  {value}
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
