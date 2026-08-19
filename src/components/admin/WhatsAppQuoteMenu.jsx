import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, MessageCircle } from 'lucide-react';
import { useAsync } from '@/hooks/useAsync';
import { getScooters } from '@/features/scooters/scooterService';
import { useFinance } from '@/context/FinanceSettingsContext';
import { cn } from '@/lib/utils';
import {
  WA_TPL_LANG_KEY,
  buildQuoteMessage,
  findCatalogScooter,
  listQuoteTemplates,
} from '@/lib/whatsappTemplates';
import { whatsappCustomerUrl } from '@/config/site';

function readTplLang() {
  try {
    return localStorage.getItem(WA_TPL_LANG_KEY) === 'bn' ? 'bn' : 'en';
  } catch {
    return 'en';
  }
}

/**
 * Admin WhatsApp quote picker — price / EMI / stock / confirm templates.
 */
export function WhatsAppQuoteMenu({
  phone,
  name,
  scooterName,
  kind = 'lead',
  date,
  time,
  serviceKind,
  className,
  compact = false,
  onOpen,
}) {
  const { settings } = useFinance();
  const { data: scooters } = useAsync(() => getScooters(), []);
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState(readTplLang);
  const [modelId, setModelId] = useState('');
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const matched = useMemo(
    () => findCatalogScooter(scooters || [], scooterName) || (scooters || []).find((s) => s.id === modelId) || null,
    [scooters, scooterName, modelId],
  );

  const templates = useMemo(
    () => listQuoteTemplates({ kind, scooterName, date, time, serviceKind }),
    [kind, scooterName, date, time, serviceKind],
  );

  if (!phone) return null;

  const hrefFor = (id) =>
    whatsappCustomerUrl(
      phone,
      buildQuoteMessage({
        id,
        lang,
        name,
        scooter: matched,
        scooterName: matched?.name || scooterName,
        settings,
        date,
        time,
        serviceKind,
      }),
    );

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          onOpen?.();
        }}
        className={cn(
          'tap-target inline-flex items-center justify-center text-[#1da851]',
          compact
            ? 'rounded-lg bg-[#25D366]/10 p-2'
            : 'gap-1 rounded-xl bg-[#25D366]/10 p-2.5',
        )}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="WhatsApp templates"
        title="WhatsApp templates"
      >
        <MessageCircle className={compact ? 'h-4 w-4' : 'h-4.5 w-4.5'} />
        {!compact && <ChevronDown className="h-3 w-3" />}
      </button>

      {open && (
        <div className="absolute right-0 z-40 mt-1 w-64 overflow-hidden rounded-xl bg-white py-1 shadow-card ring-1 ring-line">
          <div className="flex items-center justify-between gap-2 border-b border-line px-3 py-2">
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted">Templates</p>
            <div className="inline-flex rounded-md bg-surface-alt p-0.5">
              {['en', 'bn'].map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setLang(id);
                    try {
                      localStorage.setItem(WA_TPL_LANG_KEY, id);
                    } catch {
                      /* ignore */
                    }
                  }}
                  className={cn(
                    'rounded px-1.5 py-0.5 text-[10px] font-bold uppercase',
                    lang === id ? 'bg-navy text-white' : 'text-muted',
                  )}
                >
                  {id === 'bn' ? 'বাং' : 'EN'}
                </button>
              ))}
            </div>
          </div>
          {!scooterName && (scooters || []).length > 0 && (
            <div className="border-b border-line px-3 py-2">
              <label className="block text-[10px] font-semibold text-muted">
                Model for price / EMI
                <select
                  value={modelId}
                  onChange={(e) => setModelId(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-line bg-white px-2 py-1 text-xs text-heading"
                >
                  <option value="">Select…</option>
                  {(scooters || []).map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}
          {templates.map((tpl) => {
            const disabled = tpl.needsModel && !matched;
            return (
              <a
                key={tpl.id}
                href={disabled ? undefined : hrefFor(tpl.id)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  if (disabled) {
                    e.preventDefault();
                    return;
                  }
                  onOpen?.();
                  setOpen(false);
                }}
                className={cn(
                  'block px-3 py-2 text-left text-sm font-medium',
                  disabled ? 'cursor-not-allowed text-muted' : 'text-heading hover:bg-brand-50',
                )}
              >
                {tpl.label}
                {disabled && (
                  <span className="mt-0.5 block text-[10px] font-normal text-muted">Pick a model first</span>
                )}
              </a>
            );
          })}
          <p className="border-t border-line px-3 py-1.5 text-[10px] leading-snug text-muted">
            Opens WhatsApp with a ready message. Preview:{' '}
            {buildQuoteMessage({
              id: 'follow',
              lang,
              name,
              scooter: matched,
              scooterName,
              settings,
            }).slice(0, 72)}
            …
          </p>
        </div>
      )}
    </div>
  );
}
