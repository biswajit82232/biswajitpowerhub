import { Suspense, useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  LayoutDashboard, Bike, Package, Users, PhoneCall, CalendarCheck, Star,
  Banknote, BarChart3, LogOut, Menu, X, ExternalLink, Tag, Settings, Home, Mail,
  RefreshCw, Wrench,
} from 'lucide-react';
import { PageLoader } from '@/components/ui/Loading';
import { AdminPwaSetup } from '@/components/admin/AdminPwaSetup';
import { AdminInstallBanner } from '@/components/admin/AdminInstallBanner';
import { useAuth } from '@/context/AuthContext';
import { isSupabaseConfigured } from '@/lib/supabase';
import { getInboxBadges } from '@/features/analytics/analyticsService';
import { cn } from '@/lib/utils';

function AdminMark({ onNavigate }) {
  return (
    <NavLink
      to="/admin"
      end
      onClick={onNavigate}
      className="font-display text-base font-extrabold tracking-tight text-heading"
    >
      Admin
    </NavLink>
  );
}

const NAV_GROUPS = [
  {
    label: null,
    links: [{ to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true, badgeKey: 'total' }],
  },
  {
    label: 'Catalog',
    links: [
      { to: '/admin/inventory', label: 'Inventory', icon: Bike },
      { to: '/admin/accessories', label: 'Spare & Parts', icon: Package },
      { to: '/admin/vyapar', label: 'Vyapar Sync', icon: RefreshCw },
    ],
  },
  {
    label: 'Leads',
    links: [
      { to: '/admin/leads', label: 'Leads', icon: Users },
      { to: '/admin/callbacks', label: 'Callbacks', icon: PhoneCall, badgeKey: 'callbacks' },
      { to: '/admin/test-rides', label: 'Test Rides', icon: CalendarCheck, badgeKey: 'testRides' },
      { to: '/admin/service-bookings', label: 'Service', icon: Wrench, badgeKey: 'service' },
      { to: '/admin/messages', label: 'Messages', icon: Mail, badgeKey: 'messages' },
    ],
  },
  {
    label: 'Marketing',
    links: [
      { to: '/admin/reviews', label: 'Reviews', icon: Star, badgeKey: 'reviews' },
      { to: '/admin/offers', label: 'Offers', icon: Tag },
      { to: '/admin/homepage', label: 'Homepage', icon: Home },
    ],
  },
  {
    label: 'Site',
    links: [
      { to: '/admin/finance', label: 'Finance', icon: Banknote },
      { to: '/admin/settings', label: 'Settings', icon: Settings },
      { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    ],
  },
];

function NavItems({ onNavigate, compact, badges }) {
  return (
    <nav className="flex flex-col gap-3">
      {NAV_GROUPS.map((group) => (
        <div key={group.label || 'top'}>
          {group.label && (
            <p
              className={cn(
                'mb-1 px-3 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-muted',
                compact ? 'px-3' : 'px-3.5',
              )}
            >
              {group.label}
            </p>
          )}
          <div className="flex flex-col gap-0.5">
            {group.links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2.5 rounded-xl font-semibold transition',
                    compact ? 'px-3 py-2 text-[0.8125rem]' : 'gap-3 px-3.5 py-2.5 text-sm',
                    isActive
                      ? 'bg-brand-gradient text-white shadow-soft [&_.nav-badge]:bg-white/25'
                      : 'text-body hover:bg-brand-50 hover:text-brand-700',
                  )
                }
              >
                <l.icon className={cn(compact ? 'h-4 w-4' : 'h-4.5 w-4.5')} strokeWidth={2.2} />
                <span className="min-w-0 flex-1 truncate">{l.label}</span>
                {!!(l.badgeKey && badges?.[l.badgeKey]) && (
                  <span className="nav-badge ml-auto min-w-[1.25rem] rounded-full bg-red-500 px-1.5 py-0.5 text-center text-[0.65rem] font-bold text-white">
                    {badges[l.badgeKey] > 99 ? '99+' : badges[l.badgeKey]}
                  </span>
                )}
              </NavLink>
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}

function SidebarFooter({ onSignOut }) {
  return (
    <div className="border-t border-line pt-3">
      {!isSupabaseConfigured && (
        <p className="mb-2 rounded-lg bg-amber-50 px-3 py-2 text-[0.7rem] font-medium leading-snug text-amber-700">
          Demo mode — connect Supabase to enable data & login.
        </p>
      )}
      <a href="/" target="_blank" rel="noreferrer" className="mb-0.5 flex items-center gap-2.5 rounded-xl px-3 py-2 text-[0.8125rem] font-semibold text-body transition hover:bg-slate-50 sm:gap-3 sm:px-3.5 sm:py-2.5 sm:text-sm">
        <ExternalLink className="h-4 w-4 sm:h-4.5 sm:w-4.5" /> View site
      </a>
      <button onClick={onSignOut} className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[0.8125rem] font-semibold text-red-500 transition hover:bg-red-50 sm:gap-3 sm:px-3.5 sm:py-2.5 sm:text-sm">
        <LogOut className="h-4 w-4 sm:h-4.5 sm:w-4.5" /> Sign out
      </button>
    </div>
  );
}

export default function AdminLayout() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [badges, setBadges] = useState({});

  useEffect(() => {
    let cancelled = false;
    const load = () => {
      getInboxBadges()
        .then((b) => { if (!cancelled) setBadges(b || {}); })
        .catch(() => {});
    };
    load();
    const id = setInterval(load, 60000);
    const onFocus = () => load();
    window.addEventListener('focus', onFocus);
    return () => {
      cancelled = true;
      clearInterval(id);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-bg pt-[env(safe-area-inset-top)]">
      <AdminPwaSetup />
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-line bg-surface p-5 lg:flex">
        <AdminMark />
        <div className="mt-8 flex-1 overflow-y-auto">
          <NavItems badges={badges} />
        </div>
        <SidebarFooter onSignOut={handleSignOut} />
      </aside>

      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-line bg-surface px-3 py-2.5 lg:hidden">
        <div className="flex items-center gap-2">
          <AdminMark />
          {badges.total > 0 && (
            <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[0.65rem] font-bold text-white">
              {badges.total > 99 ? '99+' : badges.total}
            </span>
          )}
        </div>
        <button onClick={() => setOpen(true)} className="tap-target rounded-xl p-2 text-heading" aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </button>
      </header>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-heading/45" onClick={() => setOpen(false)} />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="absolute inset-y-0 left-0 flex w-[min(18rem,85vw)] flex-col bg-surface p-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
            >
              <div className="flex shrink-0 items-center justify-between">
                <AdminMark onNavigate={() => setOpen(false)} />
                <button onClick={() => setOpen(false)} className="tap-target rounded-xl p-2 text-muted" aria-label="Close">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-4 min-h-0 flex-1 overflow-y-auto overscroll-contain">
                <NavItems compact badges={badges} onNavigate={() => setOpen(false)} />
              </div>
              <SidebarFooter onSignOut={handleSignOut} />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      <main className="lg:pl-64">
        <div className="mx-auto max-w-6xl px-3 py-4 sm:px-6 sm:py-8">
          <Suspense fallback={<PageLoader />}>
            <AdminInstallBanner />
            <Outlet />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
