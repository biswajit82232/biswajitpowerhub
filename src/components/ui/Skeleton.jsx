import { cn } from '@/lib/utils';

/** Shimmering skeleton block. */
export function Skeleton({ className }) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl bg-slate-100',
        'before:absolute before:inset-0 before:-translate-x-full',
        'before:animate-shimmer before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent',
        className
      )}
    />
  );
}

/** Skeleton matching a scooter card. */
export function ScooterCardSkeleton() {
  return (
    <div className="rounded-2xl bg-surface ring-1 ring-line shadow-soft">
      <Skeleton className="aspect-[4/3] rounded-b-none" />
      <div className="space-y-3 p-5">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-9 w-24 rounded-full" />
          <Skeleton className="h-9 w-24 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function ReviewCardSkeleton() {
  return (
    <div className="rounded-2xl bg-surface p-6 ring-1 ring-line shadow-soft">
      <Skeleton className="h-4 w-28" />
      <div className="mt-4 space-y-2">
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-2/3" />
      </div>
      <div className="mt-5 flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  );
}

/** Skeleton matching the scooter detail page layout. */
export function ScooterDetailsSkeleton() {
  return (
    <div className="container-px min-w-0 pb-10 pt-6 sm:pb-14 sm:pt-10">
      <Skeleton className="h-4 w-28" />
      <div className="mt-6 grid min-w-0 gap-8 lg:grid-cols-2 lg:gap-12">
        <Skeleton className="aspect-[4/3] w-full rounded-3xl" />
        <div className="space-y-4">
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          <Skeleton className="h-9 w-3/4" />
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-10 w-40" />
          <div className="grid grid-cols-2 gap-2">
            <Skeleton className="h-20 rounded-lg" />
            <Skeleton className="h-20 rounded-lg" />
          </div>
          <Skeleton className="h-24 w-full" />
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Skeleton className="h-14 rounded-xl" />
            <Skeleton className="h-14 rounded-xl" />
            <Skeleton className="h-14 rounded-xl" />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Skeleton className="h-14 flex-1 rounded-xl" />
            <Skeleton className="h-14 flex-1 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
