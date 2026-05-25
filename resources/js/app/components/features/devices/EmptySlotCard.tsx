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
      className="flex cursor-pointer flex-col items-center justify-center rounded-[12px] border-2 border-dashed border-[#c1c6d6] bg-transparent p-[25px] transition-colors hover:border-[#005bbf] hover:bg-[rgba(0,91,191,0.03)]"
    >
      <div className="mb-4 flex size-[64px] items-center justify-center rounded-full bg-[#e5e8ee]">
        <PlusIcon className="size-[18px] text-[#727785]" />
      </div>
      <p className="font-['Roboto',sans-serif] text-[20px] text-[#727785]">
        Tambah Perangkat
      </p>
      <p className="mt-2 font-['Roboto',sans-serif] text-xs text-[#c1c6d6]">
        Slot {slotNumber} dari {totalSlots}
      </p>
    </button>
  );
}
