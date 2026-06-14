import { LuCheck } from 'react-icons/lu';
import { cn } from '@/lib/utils';

export interface Step {
  key: string;
  label: string;
  description?: string;
}

interface StepperProps {
  steps: Step[];
  currentIndex: number;
  onStepClick?: (index: number) => void;
}

/**
 * Horizontal step indicator. Lets the user jump back to previously-completed
 * steps (forward jumps are blocked — they must complete the current step).
 */
export function Stepper({ steps, currentIndex, onStepClick }: StepperProps) {
  return (
    <ol className="flex w-full">
      {steps.map((step, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        const clickable = done && onStepClick;
        return (
          <li key={step.key} className="flex-1 relative">
            <button
              type="button"
              disabled={!clickable}
              onClick={() => clickable && onStepClick!(i)}
              className={cn(
                'w-full flex flex-col items-center text-center group',
                clickable ? 'cursor-pointer' : 'cursor-default',
              )}
            >
              <span
                className={cn(
                  'flex items-center justify-center h-10 w-10 rounded-full text-sm font-semibold border-2 transition-colors z-10 bg-surface dark:bg-dark-surface',
                  done
                    ? 'bg-primary-600 border-primary-600 text-white'
                    : active
                      ? 'border-primary-600 text-primary-600'
                      : 'border-border dark:border-dark-border text-text-3',
                )}
              >
                {done ? <LuCheck className="h-5 w-5" /> : i + 1}
              </span>
              <span
                className={cn(
                  'mt-2 text-xs sm:text-sm font-medium',
                  active ? 'text-text dark:text-dark-text' : 'text-text-3',
                )}
              >
                {step.label}
              </span>
              {step.description && (
                <span className="hidden sm:block text-xs text-text-3 mt-0.5">{step.description}</span>
              )}
            </button>
            {i < steps.length - 1 && (
              <span
                aria-hidden
                className={cn(
                  'absolute top-5 left-1/2 right-0 -translate-y-1/2 h-0.5 w-full -z-0',
                  done ? 'bg-primary-600' : 'bg-border dark:bg-dark-border',
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
