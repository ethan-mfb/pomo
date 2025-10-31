import './NumberInput.scss';

export type NumberInputProps = {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  placeholder?: string | number;
  disabled?: boolean;
};

export function NumberInput(args: NumberInputProps) {
  return (
    <div className="number-input">
      <label htmlFor={args.id}>{args.label}</label>{' '}
      <input
        id={args.id}
        name={args.id}
        type="number"
        value={args.value}
        onChange={(e) => args.onChange(Number(e.target.value))}
        min={args.min}
        max={args.max}
        placeholder={args.placeholder?.toString()}
        disabled={args.disabled}
      />
    </div>
  );
}
