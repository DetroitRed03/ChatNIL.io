import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, description, id, ...props }, ref) => {
    const switchId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex items-center justify-between">
        <div className="flex-1">
          {label && (
            <label
              htmlFor={switchId}
              className="text-sm font-medium text-text-primary cursor-pointer"
            >
              {label}
            </label>
          )}
          {description && (
            <p className="text-sm text-text-tertiary mt-0.5">{description}</p>
          )}
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={props.checked || false}
          onClick={() => {
            const event = {
              target: { checked: !props.checked },
            } as React.ChangeEvent<HTMLInputElement>;
            props.onChange?.(event);
          }}
          className={cn(
            'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
            props.checked ? 'bg-primary-500' : 'bg-gray-300',
            props.disabled && 'opacity-50 cursor-not-allowed',
            className
          )}
          disabled={props.disabled}
        >
          <span
            className={cn(
              'inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm',
              props.checked ? 'translate-x-6' : 'translate-x-1'
            )}
          />
        </button>
        <input
          type="checkbox"
          id={switchId}
          ref={ref}
          className="sr-only"
          {...props}
        />
      </div>
    );
  }
);

Switch.displayName = 'Switch';

export { Switch };
