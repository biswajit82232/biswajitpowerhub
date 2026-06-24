import { useRef, useState } from 'react';
import { ImagePlus, X, Loader2, GripVertical, AlertCircle } from 'lucide-react';
import { uploadScooterImage } from './scooterService';
import { cn } from '@/lib/utils';

const MAX_MB = 8;
const ACCEPT = 'image/jpeg,image/png,image/webp';

/**
 * Multi-image upload zone for scooter inventory.
 * props:
 *   images   — string[]  current image URLs
 *   onChange — (urls: string[]) => void
 *   scooterId — string  used as storage path prefix
 */
export function ScooterImageUpload({ images = [], onChange, scooterId }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const addFiles = async (files) => {
    setError('');
    const valid = [];
    for (const f of files) {
      if (!f.type.startsWith('image/')) { setError('Only image files allowed.'); continue; }
      if (f.size > MAX_MB * 1024 * 1024) { setError(`Max ${MAX_MB} MB per photo.`); continue; }
      valid.push(f);
    }
    if (!valid.length) return;
    setUploading(true);
    try {
      const urls = await Promise.all(valid.map((f) => uploadScooterImage(f, scooterId)));
      onChange([...images, ...urls]);
    } catch (e) {
      setError('Could not load image. Try a smaller file.');
      console.error(e);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const onInput = (e) => addFiles(Array.from(e.target.files || []));
  const onDrop = (e) => { e.preventDefault(); setDragging(false); addFiles(Array.from(e.dataTransfer.files)); };
  const onDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);
  const remove = (idx) => onChange(images.filter((_, i) => i !== idx));
  const moveUp = (idx) => {
    if (idx === 0) return;
    const next = [...images];
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    onChange(next);
  };

  return (
    <div className="space-y-3">
      {/* Thumbnails */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((url, idx) => (
            <div key={url + idx} className="group relative">
              <img
                src={url}
                alt={`Photo ${idx + 1}`}
                className="h-20 w-20 rounded-xl object-cover ring-2 ring-line shadow-soft"
              />
              {/* Badge: first = cover */}
              {idx === 0 && (
                <span className="absolute -top-1.5 left-1 rounded-full bg-brand-500 px-1.5 py-0.5 text-[9px] font-bold text-white">
                  COVER
                </span>
              )}
              {/* Actions */}
              <div className="absolute inset-0 flex items-center justify-center gap-1 rounded-xl bg-heading/40 opacity-0 transition-opacity group-hover:opacity-100">
                {idx > 0 && (
                  <button
                    type="button"
                    onClick={() => moveUp(idx)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/90 text-heading shadow transition hover:bg-white"
                    title="Set as cover"
                  >
                    <GripVertical className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => remove(idx)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500 text-white shadow transition hover:bg-red-600"
                  title="Remove"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => !uploading && inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && !uploading && inputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-5 text-center transition-all',
          dragging
            ? 'border-brand-400 bg-brand-50 scale-[1.01]'
            : 'border-line bg-surface-alt/60 hover:border-brand-300 hover:bg-brand-50/40',
          uploading && 'pointer-events-none opacity-60'
        )}
      >
        {uploading ? (
          <>
            <Loader2 className="h-7 w-7 animate-spin text-brand-500" />
            <p className="text-sm font-medium text-body">Uploading…</p>
          </>
        ) : (
          <>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-cyan-500 shadow-sm">
              <ImagePlus className="h-5 w-5 text-white" />
            </span>
            <div>
              <p className="text-sm font-semibold text-heading">
                Tap to upload <span className="text-brand-600">photos</span>
              </p>
              <p className="mt-0.5 text-xs text-muted">
                JPG, PNG, WebP · Max {MAX_MB} MB · Multiple OK
              </p>
            </div>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          multiple
          className="sr-only"
          onChange={onInput}
        />
      </div>

      {error && (
        <p className="flex items-center gap-1.5 text-xs font-medium text-red-500">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {error}
        </p>
      )}

      {images.length > 0 && (
        <p className="text-[10px] text-muted">
          First photo is the cover. Hover a photo and tap ⠿ to promote it.
        </p>
      )}
    </div>
  );
}
