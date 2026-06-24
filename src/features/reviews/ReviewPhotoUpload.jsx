import { useRef, useState } from 'react';
import { Camera, ImagePlus, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const MAX_SIZE_MB = 4;
const ACCEPTED = 'image/jpeg,image/png,image/webp,image/gif';

/**
 * Single review photo picker — returns File + preview data URL.
 */
export function ReviewPhotoUpload({ preview, onChange, disabled = false }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');

  const processFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Only image files are supported.');
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`Photo must be under ${MAX_SIZE_MB} MB.`);
      return;
    }
    setError('');
    const reader = new FileReader();
    reader.onload = (e) => onChange({ file, preview: e.target.result });
    reader.readAsDataURL(file);
  };

  const clear = (e) => {
    e?.stopPropagation();
    onChange({ file: null, preview: '' });
    setError('');
    if (inputRef.current) inputRef.current.value = '';
  };

  if (preview) {
    return (
      <div>
        <div className="relative inline-block">
          <img
            src={preview}
            alt="Review photo preview"
            className="h-32 w-full max-w-xs rounded-xl object-cover ring-2 ring-brand-200 shadow-soft sm:h-36"
          />
          {!disabled && (
            <button
              type="button"
              onClick={clear}
              className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-md transition hover:bg-red-600"
              aria-label="Remove photo"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        {!disabled && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="mt-2 flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:underline"
          >
            <Camera className="h-3.5 w-3.5" /> Change photo
          </button>
        )}
        <input ref={inputRef} type="file" accept={ACCEPTED} className="sr-only" onChange={(e) => processFile(e.target.files?.[0])} />
        {error && <p className="mt-1.5 text-xs font-medium text-red-500">{error}</p>}
      </div>
    );
  }

  return (
    <div>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && !disabled && inputRef.current?.click()}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (!disabled) processFile(e.dataTransfer.files?.[0]);
        }}
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        className={cn(
          'flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center transition-all',
          disabled && 'pointer-events-none opacity-60',
          dragging
            ? 'border-brand-400 bg-brand-50 scale-[1.01]'
            : 'cursor-pointer border-line bg-surface-alt/60 hover:border-brand-300 hover:bg-brand-50/40'
        )}
      >
        {disabled ? (
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
        ) : (
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-cyan-500 shadow-sm">
            <ImagePlus className="h-5 w-5 text-white" />
          </span>
        )}
        <div>
          <p className="text-sm font-semibold text-heading">
            {disabled ? 'Uploading photo…' : <>Tap to upload <span className="text-brand-600">your photo</span></>}
          </p>
          <p className="mt-0.5 text-xs text-muted">You with your scooter, or a delivery photo — JPG, PNG, WebP · max {MAX_SIZE_MB} MB</p>
        </div>
        <input ref={inputRef} type="file" accept={ACCEPTED} className="sr-only" onChange={(e) => processFile(e.target.files?.[0])} />
      </div>
      {error && <p className="mt-1.5 text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
}
