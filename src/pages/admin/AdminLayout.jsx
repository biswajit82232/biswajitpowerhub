import { Suspense, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  LayoutDashboard, Bike, Package, Users, PhoneCall, CalendarCheck, Star,
  Banknote, BarChart3, LogOut, Menu, X, ExternalLink, Tag, Settings, Home,
} from 'lucide-react';
import { Logo } from '@/components/common/Logo';
import { PageLoader } from '@/components/ui/Loading';
import { AdminPwaSetup } from '@/components/admin/AdminPwaSetup';
import { AdminInstallBanner } from '@/components/admin/AdminInstallBanner';
import { useAuth } from '@/context/AuthContext';
import { isSupabaseConfigured } from '@/lib/supabase';
import { cn } from '@/lib/utils';

const LINKS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/inventory', label: 'Inventory', icon: Bike },
  { to: '/admin/accessories', label: 'Spare & Parts', icon: Package },
  { to: '/admin/leads', label: 'Leads', icon: Users },
  { to: '/admin/callbacks', label: 'Callbacks', icon: PhoneCall },
  { to: '/admin/test-rides', label: 'Test Rides', icon: CalendarCheck },
  { to: '/admin/reviews', label: 'Reviews', icon: Star },
  { to: '/admin/offers', label: 'Offers', icon: Tag },
  { to: '/admin/homepage', label: 'Homepage', icon: Home },
  { to: '/admin/finance', label: 'Finance', icon: Banknote },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
];

function NavItems({ onNavigate, compact }) {
  return (
    <nav className="flex flex-col gap-0.5">
      {LINKS.map((l) => (
        <NavLink
          key={l.to}
          to={l.to}
          end={l.end}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-2.5 rounded-xl font-semibold transition',
              compact ? 'px-3 py-2 text-[0.8125rem]' : 'gap-3 px-3.5 py-2.5 text-sm',
              isActive ? 'bg-brand-gradient text-white shadow-soft' : 'text-body hover:bg-brand-50 hover:text-brand-700'
            )
          }
        >
          <l.icon className={cn(compact ? 'h-4 w-4' : 'h-4.5 w-4.5')} strokeWidth={2.2} />
          {l.label}
        </NavLink>
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
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-bg pt-[env(safe-area-inset-top)]">
      <AdminPwaSetup />
      {/* Sidebar (desktop) */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-line bg-surface p-5 lg:flex">
        <Logo compact />
        <div className="mt-8 flex-1 overflow-y-auto">
          <NavItems />
        </div>
        <SidebarFooter onSignOut={handleSignOut} />
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-line bg-surface/90 px-3 py-2.5 backdrop-blur-xl lg:hidden">
        <Logo compact />
        <button onClick={() => setOpen(true)} className="tap-target rounded-xl p-2 text-heading" aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </button>
      </header>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-heading/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="absolute inset-y-0 left-0 flex w-[min(18rem,85vw)] flex-col bg-surface p-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
            >
              <div className="flex shrink-0 items-center justify-between">
                <Logo compact />
                <button onClick={() => setOpen(false)} className="tap-target rounded-xl p-2 text-muted" aria-label="Close">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-4 min-h-0 flex-1 overflow-y-auto overscroll-contain">
                <NavItems compact onNavigate={() => setOpen(false)} />
              </div>
              <SidebarFooter onSignOut={handleSignOut} />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Content */}
      <main className="lg:pl-64">
        <div className="mx-auto max-w-6xl px-3 py-4 sm:px-6 sm:py-8">
          <div className="mb-4 hidden items-center justify-between lg:mb-6 lg:flex">
            <p className="text-sm text-muted">
              Signed in{user?.email ? ` as ${user.email}` : ''}
            </p>
          </div>
          <Suspense fallback={<PageLoader />}>
            <AdminInstallBanner />
            <Outlet />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
