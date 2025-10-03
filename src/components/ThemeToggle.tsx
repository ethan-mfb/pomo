import './ThemeToggle.scss';
import { Button } from './Button.tsx';
import { THEMES } from '../constants.ts';
import { Theme } from '../types.ts';

interface ThemeToggleProps {
  theme: Theme;
  onToggle: () => void;
}

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  return (
    <div className="theme-toggle">
      <Button onClick={onToggle} className="theme-toggle-btn">
        {theme === THEMES.DARK ? '◐' : '◑'}
      </Button>
    </div>
  );
}
