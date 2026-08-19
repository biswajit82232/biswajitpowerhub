import { useMemo, useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RangeSlider } from '@/components/ui/RangeSlider';
import { Select } from '@/components/ui/Input';
import { useCountUp } from '@/hooks/useCountUp';
import { calculateEMI } from '@/lib/finance';
import { formatINR } from '@/lib/utils';
import { EMI_DISCLAIMER, EMI_DISCLAIMER_NOTE, FINANCE_DEFAULTS } from '@/config/finance';
import { trackEvent, EVENT } from '@/lib/tracking';
import {
  getScooterVariants,
  hasVariants,
  withVariant,
  getStartingPrice,
} from '@/lib/scooterVariants';
import { useLocale } from '@/context/LocaleContext';

function Amount({ value, className }) {
  const display = useCountUp(value, { active: true, duration: 600 });
  return <span className={className}>{formatINR(display)}</span>;
}

/**
 * Interactive EMI calculator. `settings` come from finance service (admin-managed).
 * Pass `scooters` to enable model / variant picking (Finance page).
 * Pass a fixed `price` (+ optional `scooterId`) when the model is already chosen (PDP).
 */
export function EMICalculator({ price: priceProp, settings, scooterId: scooterIdProp, scooters }) {
  const { t } = useLocale();
  const showPicker = Array.isArray(scooters) && scooters.length > 0;
  const tenureOptions = settings?.tenureOptions || [6, 12, 18, 24, 36];
  const [downPct, setDownPct] = useState(settings?.downPaymentPct ?? 20);
  const [rate, setRate] = useState(settings?.interestRate ?? 12);
  const [tenure, setTenure] = useState(settings?.defaultTenure ?? 12);
  const [scooterId, setScooterId] = useState(scooterIdProp || '');
  const [variantId, setVariantId] = useState('');
  const tracked = useRef(false);

  useEffect(() => {
    if (!settings) return;
    setDownPct(settings.downPaymentPct ?? 20);
    setRate(settings.interestRate ?? 12);
    setTenure(settings.defaultTenure ?? 12);
  }, [settings]);

  useEffect(() => {
    if (!showPicker) return;
    setScooterId((current) =>
      current && scooters.some((s) => s.id === current) ? current : scooters[0].id
    );
  }, [showPicker, scooters]);

  const scooter = useMemo(
    () => (showPicker ? scooters.find((s) => s.id === scooterId) ?? null : null),
    [showPicker, scooters, scooterId]
  );

  const variants = useMemo(() => getScooterVariants(scooter), [scooter]);

  useEffect(() => {
    if (!scooter) return;
    const list = getScooterVariants(scooter);
    setVariantId((current) =>
      current && list.some((v) => v.id === current) ? current : list[0]?.id || ''
    );
  }, [scooterId, scooter]);

  const selected = useMemo(
    () => (scooter && variantId ? withVariant(scooter, variantId) : scooter),
    [scooter, variantId]
  );

  const price = showPicker
    ? (selected?.price ?? getStartingPrice(scooter) ?? 0)
    : (priceProp ?? 0);

  const trackScooterId = showPicker ? scooterId : scooterIdProp;

  const downPayment = Math.round((price * downPct) / 100);

  const result = useMemo(
    () => calculateEMI({
      price,
      downPayment,
      annualRate: rate,
      tenureMonths: tenure,
      fileCharges: settings?.fileCharges ?? FINANCE_DEFAULTS.fileCharges,
    }),
    [price, downPayment, rate, tenure, settings?.fileCharges]
  );

  const track = () => {
    if (!tracked.current) {
      tracked.current = true;
      trackEvent(EVENT.EMI_USED, { scooterId: trackScooterId, price });
    }
  };

  return (
    <div className="min-w-0 rounded-2xl bg-surface p-4 ring-1 ring-line shadow-soft sm:p-6">
      <h3 className="font-display text-lg font-bold text-heading">{t('fin.emi')}</h3>
      <p className="mt-1 text-sm text-muted">{t('fin.estimate')}</p>

      <div className="mt-6 space-y-6" onPointerDown={track}>
        {showPicker && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className={hasVariants(scooter) ? '' : 'sm:col-span-2'}>
              <label className="mb-1.5 block text-xs font-semibold text-muted">
                {t('fin.model')}
              </label>
              <Select
                value={scooterId}
                className="h-11"
                onChange={(e) => {
                  setScooterId(e.target.value);
                  track();
                }}
              >
                {scooters.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </Select>
            </div>
            {hasVariants(scooter) && (
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-muted">
                  {t('fin.variant')}
                </label>
                <Select
                  value={variantId}
                  className="h-11"
                  onChange={(e) => {
                    setVariantId(e.target.value);
                    track();
                  }}
                >
                  {variants.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} · {formatINR(v.price)}
                    </option>
                  ))}
                </Select>
              </div>
            )}
          </div>
        )}

        <div>
          <div className="mb-1 flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-sm font-semibold text-heading">
            <span>{t('fin.vehicle')}</span>
            <span className="break-words text-brand-600">{formatINR(price)}</span>
          </div>
          {showPicker && selected && (
            <p className="text-xs text-muted">
              {selected.name}
              {selected.selectedVariant ? ` · ${selected.selectedVariant.name}` : ''}
            </p>
          )}
        </div>

        <div>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-sm font-semibold text-heading">
            <span>{t('fin.down', { pct: downPct })}</span>
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
            <span>{t('fin.interest')}</span>
            <span className="text-brand-600">{rate}% p.a.</span>
          </div>
          <RangeSlider value={rate} min={6} max={24} step={0.5} onChange={setRate} ariaLabel="Interest rate" />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-heading">{t('fin.tenure')}</label>
          <div className="flex flex-wrap gap-2">
            {tenureOptions.map((months) => (
              <button
                key={months}
                type="button"
                onClick={() => {
                  setTenure(months);
                  track();
                }}
                className={`tap-target rounded-full px-4 py-2 text-sm font-semibold ring-1 transition ${
                  tenure === months
                    ? 'bg-brand-gradient text-white ring-transparent shadow-soft'
                    : 'bg-surface text-body ring-line hover:ring-brand-200'
                }`}
              >
                {t('fin.months', { n: months })}
              </button>
            ))}
          </div>
        </div>
      </div>

      <motion.div layout className="mt-6 rounded-2xl bg-surface-alt p-5">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <span className="text-sm font-medium text-body">{t('fin.monthly')}</span>
          <Amount value={result.emi} className="break-words font-display text-2xl font-extrabold text-brand-700 sm:text-3xl" />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 border-t border-line pt-4 text-sm">
          <div>
            <p className="text-muted">{t('fin.totalInterest')}</p>
            <Amount value={result.totalInterest} className="font-bold text-heading" />
          </div>
          <div className="text-right">
            <p className="text-muted">{t('fin.balance')}</p>
            <Amount value={result.balanceViaEmi} className="font-bold text-heading" />
          </div>
          <div className="col-span-2 flex items-center justify-between border-t border-line pt-3">
            <div>
              <p className="text-muted">{t('fin.total')}</p>
              <p className="mt-0.5 text-[10px] text-muted">{t('fin.fileNote')}</p>
            </div>
            <Amount value={result.totalPayable} className="font-bold text-heading" />
          </div>
        </div>
      </motion.div>

      <p className="mt-4 text-xs text-muted">{EMI_DISCLAIMER}</p>
      <p className="mt-1 text-[11px] text-muted">{EMI_DISCLAIMER_NOTE}</p>
    </div>
  );
}
