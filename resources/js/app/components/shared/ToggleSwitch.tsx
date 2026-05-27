interface ToggleSwitchProps {
  active: boolean;
  disabled?: boolean;
  activeColor?: string;
  ariaLabel: string;
  onClick: () => void;
}

export default function ToggleSwitch({ active, disabled, activeColor, ariaLabel, onClick }: ToggleSwitchProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
        disabled ? 'opacity-60' : ''
      } ${active ? activeColor ?? 'bg-success' : 'bg-inactive'}`}
      aria-label={ariaLabel}
    >
      <span
        className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
          active ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}
