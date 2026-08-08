import { ScooterCard } from '@/features/scooters/ScooterCard';
import { getAllValueBadges } from '@/lib/valueBadges';

export function ScooterCardWithInsights({ scooter, index, insights }) {
  const valueBadges = getAllValueBadges(scooter.id, insights?.valueBadges);
  const popularityTags = [];
  if (insights?.popularWeekIds?.has?.(scooter.id)) {
    popularityTags.push({ label: '🔥 Trending', tone: 'hot' });
  }
  if (insights?.topIntentMonthIds?.has?.(scooter.id)) {
    popularityTags.push({ label: '⭐ Hot pick', tone: 'warm' });
  }

  return (
    <ScooterCard
      scooter={scooter}
      index={index}
      valueBadges={valueBadges}
      popularityTags={popularityTags}
    />
  );
}
