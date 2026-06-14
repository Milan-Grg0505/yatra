import { useState } from 'react';
import { LuFilter, LuX } from 'react-icons/lu';
import * as Slider from '@radix-ui/react-slider';
import { Button, Checkbox } from '@/components/atoms';
import { HOTEL_TYPES } from '@/lib/constant';
import { cn, formatCurrency } from '@/lib/utils';
import type { Facility } from '@/types';

export interface SearchFilters {
  hotelType?: string;
  minPrice: number;
  maxPrice: number;
  minRating?: number;
  facilities: string[];
}

interface FilterSidebarProps {
  filters: SearchFilters;
  onChange: (next: SearchFilters) => void;
  facilities?: Facility[];
  className?: string;
}

export function FilterSidebar({ filters, onChange, facilities = [], className }: FilterSidebarProps) {
  const reset = () =>
    onChange({ hotelType: undefined, minPrice: 0, maxPrice: 50000, minRating: undefined, facilities: [] });

  return (
    <aside
      className={cn(
        'rounded-2xl bg-surface dark:bg-dark-surface border border-border dark:border-dark-border p-5',
        className,
      )}
    >
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold flex items-center gap-2">
          <LuFilter className="h-4 w-4" /> Filters
        </h3>
        <button onClick={reset} className="text-xs text-primary-600 hover:underline">
          Reset
        </button>
      </div>

      {/* Hotel type */}
      <Section title="Hotel type">
        {HOTEL_TYPES.map((t) => (
          <Checkbox
            key={t}
            checked={filters.hotelType === t}
            onCheckedChange={(c) => onChange({ ...filters, hotelType: c ? t : undefined })}
            label={t.charAt(0).toUpperCase() + t.slice(1)}
          />
        ))}
      </Section>

      {/* Price range */}
      <Section title="Price per night">
        <div className="flex justify-between text-xs text-text-2 mb-2">
          <span>{formatCurrency(filters.minPrice)}</span>
          <span>{formatCurrency(filters.maxPrice)}+</span>
        </div>
        <Slider.Root
          value={[filters.minPrice, filters.maxPrice]}
          min={0}
          max={50000}
          step={500}
          minStepsBetweenThumbs={1}
          onValueChange={([min, max]) => onChange({ ...filters, minPrice: min!, maxPrice: max! })}
          className="relative flex items-center w-full h-5 select-none"
        >
          <Slider.Track className="relative grow rounded-full bg-surface-3 dark:bg-dark-surface-3 h-1">
            <Slider.Range className="absolute h-full bg-primary-500 rounded-full" />
          </Slider.Track>
          <Slider.Thumb className="block h-4 w-4 rounded-full bg-surface border-2 border-primary-500 shadow focus:outline-none focus:ring-2 focus:ring-primary-500/50" />
          <Slider.Thumb className="block h-4 w-4 rounded-full bg-surface border-2 border-primary-500 shadow focus:outline-none focus:ring-2 focus:ring-primary-500/50" />
        </Slider.Root>
      </Section>

      {/* Rating */}
      <Section title="Minimum rating">
        {[5, 4, 3, 2, 1].map((r) => (
          <Checkbox
            key={r}
            checked={filters.minRating === r}
            onCheckedChange={(c) => onChange({ ...filters, minRating: c ? r : undefined })}
            label={`${r} ${r === 1 ? 'star' : 'stars'} & up`}
          />
        ))}
      </Section>

      {/* Facilities */}
      {facilities.length > 0 && (
        <Section title="Facilities">
          {facilities.slice(0, 12).map((f) => {
            const checked = filters.facilities.includes(f.id);
            return (
              <Checkbox
                key={f.id}
                checked={checked}
                onCheckedChange={(c) => {
                  const next = c
                    ? [...filters.facilities, f.id]
                    : filters.facilities.filter((id) => id !== f.id);
                  onChange({ ...filters, facilities: next });
                }}
                label={f.name}
              />
            );
          })}
        </Section>
      )}
    </aside>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-t border-border dark:border-dark-border first:border-t-0 py-4 first:pt-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between text-sm font-medium mb-3"
      >
        {title}
        <LuX className={cn('h-3 w-3 transition', !open && 'rotate-45')} />
      </button>
      {open && <div className="space-y-2">{children}</div>}
    </div>
  );
}

/* Mobile filter drawer wrapper */
export function MobileFilterToggle({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="outline" size="sm" onClick={onClick} className="lg:hidden">
      <LuFilter className="h-4 w-4" /> Filters
    </Button>
  );
}
