import { Pencil, Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';

/** Shared edit / delete controls for admin catalog lists. */
export function InventoryRowActions({
  onEdit,
  onDelete,
  editLabel = 'Edit',
  deleteLabel = 'Delete',
}) {
  return (
    <div className="flex items-center gap-1">
      {onEdit && (
        <Button
          type="button"
          variant="softBrand"
          size="xs"
          icon={Pencil}
          onClick={onEdit}
          aria-label={editLabel}
          className="!h-9 !rounded-xl !px-2.5"
        >
          <span className="hidden md:inline">{editLabel}</span>
        </Button>
      )}
      {onDelete && (
        <Button
          type="button"
          variant="softDanger"
          size="xs"
          icon={Trash2}
          onClick={onDelete}
          aria-label={deleteLabel}
          className="!h-9 !rounded-xl !px-2.5"
        >
          <span className="hidden md:inline">{deleteLabel}</span>
        </Button>
      )}
    </div>
  );
}
