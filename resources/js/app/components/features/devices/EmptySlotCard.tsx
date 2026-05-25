import { PlusIcon } from '../../shared/icons';

interface EmptySlotCardProps {
  slotNumber: number;
  totalSlots: number;
  onClick: () => void;
}

export default function EmptySlotCard({ slotNumber, totalSlots, onClick }: EmptySlotCardProps) {
  return (
    <button
      onClick={onClick}
      className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-transparent p-6 transition-colors hover:border-primary hover:bg-primary/[0.03]"
    >
      <div className="flex size-[56px] items-center justify-center rounded-full bg-bg-sidebar">
        <PlusIcon className="size-[18px] text-text-muted" />
      </div>
      <p className="mt-3 text-xl text-text-muted">
        Slot {slotNumber}
      </p>
      <p className="mt-2 text-xs text-border">
        {totalSlots - slotNumber + 1} slot tersedia dari {totalSlots}
      </p>
    </button>
  );
}
