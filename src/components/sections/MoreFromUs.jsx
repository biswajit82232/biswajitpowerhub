import { Link } from 'react-router-dom';
import { Percent, BookOpen, Wrench, Package } from 'lucide-react';

const ITEMS = [
  {
    id: 'finance',
    label: 'FINANCE',
    to: '/finance',
    icon: Percent,
    desc: 'Easy EMI options',
  },
  {
    id: 'guides',
    label: 'GUIDES',
    to: '/guides',
    icon: BookOpen,
    desc: 'Local EV buying tips',
  },
  {
    id: 'service',
    label: 'SERVICE',
    to: '/service',
    icon: Wrench,
    desc: 'Care & upgrades',
  },
  {
    id: 'accessories',
    label: 'ACCESSORIES',
    to: '/accessories',
    icon: Package,
    desc: 'Parts & extras',
  },
];

/**
 * More From Us — four icon tiles (dealer pattern).
 */
export function MoreFromUs() {
  return (
    <section className="bg-white py-10 sm:py-14" aria-labelledby="more-heading">
      <div className="container-px">
        <h2 id="more-heading" className="dealer-section-title text-center text-body">
          More From Us
        </h2>
        <div className="mt-10 grid grid-cols-2 gap-8 sm:grid-cols-4 sm:gap-6">
          {ITEMS.map(({ id, label, to, icon: Icon, desc }) => (
            <Link
              key={id}
              to={to}
              className="group flex flex-col items-center text-center transition hover:opacity-90"
            >
              <span className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-navy text-navy transition group-hover:border-brand-500 group-hover:text-brand-500 sm:h-24 sm:w-24">
                <Icon className="h-9 w-9 sm:h-11 sm:w-11" strokeWidth={1.5} />
              </span>
              <span className="mt-4 text-sm font-bold uppercase tracking-wide text-body sm:text-base">
                {label}
              </span>
              <span className="mt-1 text-xs text-muted">{desc}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
