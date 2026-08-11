import { useState } from 'react';
import { RotateCcw, AlertTriangle } from 'lucide-react';
import Button from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Field, Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { resetAnalyticsCounts } from '@/features/analytics/analyticsService';
import { isSupabaseConfigured } from '@/lib/supabase';

export function ResetAllCountsButton({ onReset, className }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const handleReset = async () => {
    if (confirmText.trim().toUpperCase() !== 'RESET') {
      toast('Type RESET to confirm.', 'error');
      return;
    }
    setLoading(true);
    try {
      await resetAnalyticsCounts();
      toast('Analytics / visit counters cleared. Leads and inbox kept.', 'success');
      setOpen(false);
      setConfirmText('');
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
        Reset analytics
      </Button>

      <Modal
        open={open}
        onClose={() => { setOpen(false); setConfirmText(''); }}
        title="Reset analytics only?"
        size="sm"
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
            <AlertTriangle className="h-7 w-7" />
          </span>
          <p className="text-sm text-body">
            Clears website visit / engagement event logs only.
            <strong className="block mt-1 text-heading">Leads, callbacks, test rides, service, and messages are NOT deleted.</strong>
          </p>
          <Field label='Type RESET to confirm' htmlFor="reset-confirm" className="w-full text-left">
            <Input
              id="reset-confirm"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="RESET"
              autoComplete="off"
            />
          </Field>
          {!isSupabaseConfigured && (
            <p className="text-xs text-muted">
              Demo mode — only this browser&apos;s local tracking data will be cleared.
            </p>
          )}
          <div className="mt-2 flex w-full gap-3">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => { setOpen(false); setConfirmText(''); }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              fullWidth
              icon={RotateCcw}
              loading={loading}
              onClick={handleReset}
              disabled={confirmText.trim().toUpperCase() !== 'RESET'}
            >
              Reset analytics
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
