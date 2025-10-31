import './Button.scss';

interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}

export function Button({ onClick, children, className }: ButtonProps) {
  return (
    <button className={`button ${className || ''}`} onClick={onClick}>
      {children}
    </button>
  );
}
