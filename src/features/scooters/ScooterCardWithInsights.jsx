import { ScooterCard } from '@/features/scooters/ScooterCard';
import { getAllValueBadges } from '@/lib/valueBadges';
import { useSitePhotos } from '@/context/SitePhotosContext';

export function ScooterCardWithInsights({ scooter, index, insights }) {
  const { photos } = useSitePhotos();
  const valueBadges = getAllValueBadges(scooter.id, insights?.valueBadges);
  const popularityTags = [];
  if (insights?.popularWeekIds?.has?.(scooter.id)) {
    popularityTags.push({ label: '🔥 Trending', tone: 'hot' });
  }
  if (insights?.topIntentMonthIds?.has?.(scooter.id)) {
    popularityTags.push({ label: '⭐ Hot pick', tone: 'warm' });
  }
  const imageOverride = photos?.models?.[scooter.id]?.url || undefined;

  return (
    <ScooterCard
      scooter={scooter}
      index={index}
      valueBadges={valueBadges}
      popularityTags={popularityTags}
      imageOverride={imageOverride}
    />
  );
}
