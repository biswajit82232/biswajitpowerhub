import { useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { RangeSlider } from '@/components/ui/RangeSlider';
import { useCountUp } from '@/hooks/useCountUp';
import { calculateEMI } from '@/lib/finance';
import { formatINR } from '@/lib/utils';
import { EMI_DISCLAIMER } from '@/config/finance';
import { trackEvent, EVENT } from '@/lib/tracking';

function Amount({ value, className }) {
  const display = useCountUp(value, { active: true, duration: 600 });
  return <span className={className}>{formatINR(display)}</span>;
}

/**
 * Interactive EMI calculator. `settings` come from finance service (admin-managed).
 */
export function EMICalculator({ price, settings, scooterId }) {
  const tenureOptions = settings?.tenureOptions || [6, 12, 18, 24, 36];
  const [downPct, setDownPct] = useState(settings?.downPaymentPct ?? 20);
  const [rate, setRate] = useState(settings?.interestRate ?? 12);
  const [tenure, setTenure] = useState(settings?.defaultTenure ?? 12);
  const tracked = useRef(false);

  const downPayment = Math.round((price * downPct) / 100);

  const result = useMemo(
    () => calculateEMI({ price, downPayment, annualRate: rate, tenureMonths: tenure }),
    [price, downPayment, rate, tenure]
  );

  const track = () => {
    if (!tracked.current) {
      tracked.current = true;
      trackEvent(EVENT.EMI_USED, { scooterId, price });
    }
  };

  return (
    <div className="min-w-0 rounded-2xl bg-surface p-4 ring-1 ring-line shadow-soft sm:p-6">
      <h3 className="font-display text-lg font-bold text-heading">EMI Calculator</h3>
      <p className="mt-1 text-sm text-muted">Estimate your monthly payment.</p>

      <div className="mt-6 space-y-6" onPointerDown={track}>
        <div>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-sm font-semibold text-heading">
            <span>Vehicle price</span>
            <span className="break-words text-brand-600">{formatINR(price)}</span>
          </div>
          <div className="h-2 rounded-full bg-line">
            <div className="h-full rounded-full bg-brand-gradient" style={{ width: '100%' }} />
          </div>
        </div>

        <div>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-sm font-semibold text-heading">
            <span>Down payment ({downPct}%)</span>
            <span className="break-words text-brand-600">{formatINR(downPayment)}</span>
          </div>
          <RangeSlider
            value={downPct}
            min={settings?.minDownPaymentPct ?? 10}
            max={settings?.maxDownPaymentPct ?? 60}
            step={1}
            onChange={setDownPct}
            ariaLabel="Down payment percentage"
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between text-sm font-semibold text-heading">
            <span>Interest rate</span>
            <span className="text-brand-600">{rate}% p.a.</span>
          </div>
          <RangeSlider value={rate} min={6} max={24} step={0.5} onChange={setRate} ariaLabel="Interest rate" />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-heading">Tenure</label>
          <div className="flex flex-wrap gap-2">
            {tenureOptions.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setTenure(t);
                  track();
                }}
                className={`tap-target rounded-full px-4 py-2 text-sm font-semibold ring-1 transition ${
                  tenure === t
                    ? 'bg-brand-gradient text-white ring-transparent shadow-soft'
                    : 'bg-surface text-body ring-line hover:ring-brand-200'
                }`}
              >
                {t} mo
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Result */}
      <motion.div layout className="mt-6 rounded-2xl bg-surface-alt p-5">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <span className="text-sm font-medium text-body">Monthly EMI</span>
          <Amount value={result.emi} className="break-words font-display text-2xl font-extrabold text-brand-700 sm:text-3xl" />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 border-t border-line pt-4 text-sm">
          <div>
            <p className="text-muted">Total interest</p>
            <Amount value={result.totalInterest} className="font-bold text-heading" />
          </div>
          <div className="text-right">
            <p className="text-muted">Total payable</p>
            <Amount value={result.totalPayable} className="font-bold text-heading" />
          </div>
        </div>
      </motion.div>

      <p className="mt-4 text-xs text-muted">{EMI_DISCLAIMER}</p>
    </div>
  );
}
