import { AdminSEO } from '@/components/admin/AdminSEO';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { SitePhotosEditor, GbpPostGenerator } from '@/components/admin/SitePhotosEditor';
import { isSupabaseConfigured } from '@/lib/supabase';

export default function Homepage() {
  return (
    <>
      <AdminSEO title="Site Photos" />
      <AdminHeader
        title="Site Photos & GBP"
        subtitle="Upload hero, gallery, model, and about images. Draft Google Business Profile posts."
      />

      {!isSupabaseConfigured && (
        <div className="mb-4 max-w-3xl rounded-xl bg-amber-50 px-3 py-2.5 text-xs text-amber-700 sm:mb-5 sm:px-4 sm:py-3 sm:text-sm">
          Demo mode — connect Supabase to upload images to cloud storage. Local previews still work.
        </div>
      )}

      <SitePhotosEditor />
      <GbpPostGenerator />
    </>
  );
}
