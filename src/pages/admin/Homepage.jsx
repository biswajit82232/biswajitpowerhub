import { SEO } from '@/components/common/SEO';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { HomepageHeroEditor } from '@/components/admin/HomepageHeroEditor';
import { isSupabaseConfigured } from '@/lib/supabase';

export default function Homepage() {
  return (
    <>
      <SEO title="Homepage" noindex />
      <AdminHeader
        title="Homepage"
        subtitle="Hero image and other homepage appearance settings."
      />

      {!isSupabaseConfigured && (
        <div className="mb-4 max-w-2xl rounded-xl bg-amber-50 px-3 py-2.5 text-xs text-amber-700 sm:mb-5 sm:px-4 sm:py-3 sm:text-sm">
          Demo mode — connect Supabase to upload and save the homepage hero image.
        </div>
      )}

      <HomepageHeroEditor />
    </>
  );
}
