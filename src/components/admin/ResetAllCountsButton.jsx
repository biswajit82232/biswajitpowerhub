import { useState } from 'react';
import { RotateCcw, AlertTriangle } from 'lucide-react';
import Button from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { resetAllCounts } from '@/features/analytics/analyticsService';
import { isSupabaseConfigured } from '@/lib/supabase';

export function ResetAllCountsButton({ onReset, className }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    setLoading(true);
    try {
      await resetAllCounts();
      toast('All counts reset.', 'success');
      setOpen(false);
      onReset?.();
    } catch (e) {
      toast(e.message || 'Reset failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="secondary"
        size="sm"
        icon={RotateCcw}
        onClick={() => setOpen(true)}
        className={className}
      >
        Reset all counts
      </Button>

      <Modal open={open} onClose={() => setOpen(false)} title="Reset all counts?" size="sm">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
            <AlertTriangle className="h-7 w-7" />
          </span>
          <p className="text-sm text-body">
            Clears website visits, engagement analytics, leads, callbacks, test rides, and contact messages.
            Inventory, reviews, and settings are kept.
          </p>
          {!isSupabaseConfigured && (
            <p className="text-xs text-muted">
              Demo mode — only this browser&apos;s local tracking data will be cleared.
            </p>
          )}
          <div className="mt-2 flex w-full gap-3">
            <Button variant="secondary" fullWidth onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button variant="danger" fullWidth icon={RotateCcw} loading={loading} onClick={handleReset}>
              Reset
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
