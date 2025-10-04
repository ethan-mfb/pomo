import './Toggle.scss';

interface ToggleProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function Toggle({ id, label, checked, onChange }: ToggleProps) {
  return (
    <div className="toggle-container">
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
