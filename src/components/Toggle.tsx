import './Toggle.scss';

interface ToggleProps {
  id: string;
  label: string;
  checked: boolean;
  className?: string;
  onChange: (checked: boolean) => void;
}

export function Toggle({ id, label, checked, onChange, className }: ToggleProps) {
  return (
    <div className={`toggle-container ${className || ''}`}>
      <label htmlFor={id} className="toggle-label">
        {label}
      </label>
      <div className="toggle-switch">
        <input
          type="checkbox"
          id={id}
          className="toggle-input"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="toggle-slider" />
      </div>
    </div>
  );
}
