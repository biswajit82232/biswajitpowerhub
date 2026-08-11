import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogIn, Lock, Mail } from 'lucide-react';
import { AdminSEO } from '@/components/admin/AdminSEO';
import { Field, Input } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { isSupabaseConfigured } from '@/lib/supabase';
import { AdminPwaSetup } from '@/components/admin/AdminPwaSetup';
import { AdminInstallBanner } from '@/components/admin/AdminInstallBanner';
import { adminAccessHint } from '@/lib/adminAccess';
import { isAdminStandalone } from '@/lib/adminPwa';

export default function AdminLogin() {
  const { signIn, session } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const standalone = isAdminStandalone();

  const from = location.state?.from?.pathname || '/admin';

  useEffect(() => {
    if (session) navigate(from, { replace: true });
  }, [session, from, navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(form.email, form.password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AdminSEO title="Sign in" />
      <AdminPwaSetup />
      <div className="flex min-h-dvh min-h-screen items-center justify-center bg-bg px-3 py-8 pt-[max(2rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))] sm:px-4">
        <div className="w-full max-w-md">
          {!standalone && <AdminInstallBanner />}
          <div className="mb-5 text-center sm:mb-6">
            <p className="font-display text-2xl font-extrabold tracking-tight text-heading">Admin</p>
            <p className="mt-1 text-sm text-muted">Dealership control panel</p>
          </div>
          <div className="rounded-2xl bg-surface p-5 shadow-card ring-1 ring-line sm:rounded-3xl sm:p-8">
            <h1 className="font-display text-xl font-extrabold text-heading sm:text-2xl">Sign in</h1>
            <p className="mt-1 text-sm text-muted">Use your admin account.</p>

            {!isSupabaseConfigured && (
              <div className="mt-5 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
                Supabase isn&apos;t connected yet.
                {import.meta.env.DEV ? (
                  <>
                    {' '}Add <code className="font-mono">VITE_SUPABASE_URL</code> and{' '}
                    <code className="font-mono">VITE_SUPABASE_ANON_KEY</code> to your local{' '}
                    <code className="font-mono">.env</code>, then restart the dev server.
                  </>
                ) : (
                  <>
                    {' '}In Vercel → Project → Settings → Environment Variables, add{' '}
                    <code className="font-mono">VITE_SUPABASE_URL</code> and{' '}
                    <code className="font-mono">VITE_SUPABASE_ANON_KEY</code>, then redeploy.
                  </>
                )}
              </div>
            )}

            {adminAccessHint() && (
              <div className="mt-5 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
                {adminAccessHint()}
              </div>
            )}

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <Field label="Email" htmlFor="email" required>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted" />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="username"
                    placeholder="Email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="pl-11"
                    required
                  />
                </div>
              </Field>
              <Field label="Password" htmlFor="password" required>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted" />
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="pl-11"
                    required
                  />
                </div>
              </Field>

              {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{error}</p>}

              <Button type="submit" variant="primary" size="lg" fullWidth loading={loading} icon={LogIn} disabled={!isSupabaseConfigured}>
                Sign In
              </Button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
