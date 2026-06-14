import { LuSun, LuMoon } from 'react-icons/lu';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { selectTheme, toggleTheme } from '@/features/slices/themeSlice';
import { Button } from './Button';

export function ThemeToggle() {
  const { mode } = useAppSelector(selectTheme);
  const dispatch = useAppDispatch();
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => dispatch(toggleTheme())}
      aria-label={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}
    >
      {mode === 'light' ? <LuMoon className="h-5 w-5" /> : <LuSun className="h-5 w-5" />}
    </Button>
  );
}
