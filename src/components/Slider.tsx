import './Slider.scss';

export type SliderProps = {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  showValue?: boolean;
};

export function Slider(args: SliderProps) {
  const { min = 0, max = 100, step = 1, showValue = true } = args;

  // Calculate the percentage for the filled track
  const percentage = ((args.value - min) / (max - min)) * 100;

  return (
    <div className="slider">
      <label htmlFor={args.id} className="slider-label">
        {args.label}
        {showValue && <span className="slider-value">{args.value}</span>}
      </label>
      <input
        id={args.id}
        name={args.id}
        type="range"
        className="slider-input"
        value={args.value}
        onChange={(e) => args.onChange(Number(e.target.value))}
        min={min}
        max={max}
        step={step}
        style={{ '--slider-percentage': `${percentage}%` } as React.CSSProperties}
      />
    </div>
  );
}
