import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { LogIn, Lock, Mail, ArrowLeft } from 'lucide-react';
import { SEO } from '@/components/common/SEO';
import { Logo } from '@/components/common/Logo';
import { Field, Input } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { isSupabaseConfigured } from '@/lib/supabase';
import { AdminPwaSetup } from '@/components/admin/AdminPwaSetup';
import { AdminInstallBanner } from '@/components/admin/AdminInstallBanner';

export default function AdminLogin() {
  const { signIn, session } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      <SEO title="Admin Login" noindex />
      <AdminPwaSetup />
      <div className="flex min-h-screen items-center justify-center bg-sky-fade px-4 py-12 pt-[max(3rem,env(safe-area-inset-top))]">
        <div className="w-full max-w-md">
          <AdminInstallBanner />
          <div className="mb-6 flex justify-center">
            <Logo />
          </div>
          <div className="rounded-3xl bg-surface p-8 shadow-card ring-1 ring-line">
            <h1 className="font-display text-2xl font-extrabold text-heading">Admin Login</h1>
            <p className="mt-1 text-sm text-muted">Sign in to manage your dealership.</p>

            {!isSupabaseConfigured && (
              <div className="mt-5 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
                Supabase isn't connected yet. Add your credentials to <code className="font-mono">.env</code> and create an admin user to enable login.
              </div>
            )}

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <Field label="Email" htmlFor="email" required>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted" />
                  <Input id="email" type="email" autoComplete="email" placeholder="admin@biswajitpowerhub.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="pl-11" required />
                </div>
              </Field>
              <Field label="Password" htmlFor="password" required>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted" />
                  <Input id="password" type="password" autoComplete="current-password" placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="pl-11" required />
                </div>
              </Field>

              {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{error}</p>}

              <Button type="submit" variant="primary" size="lg" fullWidth loading={loading} icon={LogIn} disabled={!isSupabaseConfigured}>
                Sign In
              </Button>
            </form>
          </div>

          <div className="mt-6 text-center">
            <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted transition hover:text-brand-700">
              <ArrowLeft className="h-4 w-4" /> Back to website
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
