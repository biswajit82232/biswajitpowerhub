import { TrendingUp, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Section, SectionHeading } from '@/components/common/Section';
import { Reveal } from '@/components/common/Reveal';
import { ScooterImage } from '@/components/common/ScooterImage';
import { useAsync } from '@/hooks/useAsync';
import { getScooters } from '@/features/scooters/scooterService';
import { getPopularityEngine } from '@/features/analytics/popularityService';

function PopularityCard({ rank, title, subtitle, scooter, metric }) {
  if (!scooter) return null;
  return (
    <Link
      to={`/scooters/${scooter.id}`}
      className="group flex items-center gap-4 rounded-2xl bg-surface p-4 ring-1 ring-line shadow-soft transition hover:shadow-card-hover"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-gradient font-display text-lg font-extrabold text-white">
        {rank}
      </span>
      <ScooterImage
        src={scooter.images?.[0]}
        alt={scooter.name}
        hue={scooter.hue}
        name={scooter.name}
        className="h-16 w-20 shrink-0 rounded-xl object-cover"
      />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold uppercase tracking-wide text-brand-600">{title}</p>
        <p className="truncate font-display text-base font-bold text-heading group-hover:text-brand-700">
          {scooter.name}
        </p>
        <p className="text-xs text-muted">{subtitle} · {metric}</p>
      </div>
    </Link>
  );
}

export function PopularitySection() {
  const { data: scooters } = useAsync(() => getScooters(), []);
  const { data: pop } = useAsync(() => getPopularityEngine(), []);

  const resolve = (id) => scooters?.find((s) => s.id === id || s.name === id);

  const weekTop = pop?.mostViewedWeek?.[0];
  const monthTop = pop?.mostIntentMonth?.[0];
  const weekScooter = weekTop ? resolve(weekTop.id) : null;
  const monthScooter = monthTop ? resolve(monthTop.id) : null;

  if (!weekScooter && !monthScooter) return null;

  return (
    <Section id="popular" className="bg-surface-alt/40">
      <SectionHeading
        eyebrow="Trending now"
        title="What riders are looking at"
        subtitle="Live popularity from real browsing on our website."
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {weekScooter && (
          <Reveal>
            <PopularityCard
              rank="🔥"
              title="Most viewed this week"
              subtitle={weekScooter.tagline}
              scooter={weekScooter}
              metric={`${weekTop?.views || weekTop?.value || 0} views`}
            />
          </Reveal>
        )}
        {monthScooter && (
          <Reveal delay={0.08}>
            <PopularityCard
              rank="⭐"
              title="Top purchase intent this month"
              subtitle={monthScooter.tagline}
              scooter={monthScooter}
              metric="High buyer interest"
            />
          </Reveal>
        )}
      </div>

      {(pop?.mostViewedWeek?.length > 1 || pop?.mostIntentMonth?.length > 1) && (
        <Reveal delay={0.12} className="mt-6 flex flex-wrap justify-center gap-2">
          {pop.mostViewedWeek.slice(1, 4).map((row) => {
            const s = resolve(row.id);
            if (!s) return null;
            return (
              <Link
                key={`w-${row.id}`}
                to={`/scooters/${s.id}`}
                className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-xs font-semibold text-body ring-1 ring-line transition hover:ring-brand-200"
              >
                <TrendingUp className="h-3.5 w-3.5 text-orange-500" />
                {s.name}
              </Link>
            );
          })}
          {pop.mostIntentMonth.slice(1, 3).map((row) => {
            const s = resolve(row.id);
            if (!s) return null;
            return (
              <Link
                key={`m-${row.id}`}
                to={`/scooters/${s.id}`}
                className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-xs font-semibold text-body ring-1 ring-line transition hover:ring-brand-200"
              >
                <Star className="h-3.5 w-3.5 text-amber-500" />
                {s.name}
              </Link>
            );
          })}
        </Reveal>
      )}
    </Section>
  );
}
