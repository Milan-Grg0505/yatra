import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { LuMapPin, LuCalendar, LuUsers, LuSearch } from 'react-icons/lu';
import { Button, Input } from '@/components/atoms';
import { cn, buildParams } from '@/lib/utils';
import { ROUTES } from '@/lib/constant';

interface SearchBarProps {
  className?: string;
  variant?: 'hero' | 'compact';
  defaultValues?: { city?: string; checkIn?: string; checkOut?: string; guests?: number };
}

export function SearchBar({ className, variant = 'hero', defaultValues }: SearchBarProps) {
  const navigate = useNavigate();
  const [city, setCity] = useState(defaultValues?.city ?? '');
  const [checkIn, setCheckIn] = useState(defaultValues?.checkIn ?? '');
  const [checkOut, setCheckOut] = useState(defaultValues?.checkOut ?? '');
  const [guests, setGuests] = useState(defaultValues?.guests ?? 2);
  // ✅ Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  // ✅ Auto-set check-out to be at least check-in date
  const handleCheckInChange = (value: string) => {
    setCheckIn(value);
    // If check-out is before check-in, update check-out to check-in + 1 day
    if (checkOut && value && checkOut <= value) {
      const nextDay = new Date(value);
      nextDay.setDate(nextDay.getDate() + 1);
      setCheckOut(nextDay.toISOString().split('T')[0]);
    }
  };

  const handleCheckOutChange = (value: string) => {
    setCheckOut(value);
  };
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const params = buildParams({ city, checkIn, checkOut, guests });
    navigate(`${ROUTES.HOTELS}?${params.toString()}`);
  };

  if (variant === 'compact') {
    return (
      <form
        onSubmit={onSubmit}
        className={cn(
          'flex items-center gap-2 rounded-full bg-surface dark:bg-dark-surface-2 border border-border dark:border-dark-border px-2 py-1 shadow-sm',
          className,
        )}
      >
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Where to?"
          className="flex-1 px-3 py-2 bg-transparent text-sm outline-none placeholder:text-text-3"
        />
        <Button size="sm" type="submit">
          <LuSearch className="h-4 w-4" /> Search
        </Button>
      </form>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className={cn(
        'grid grid-cols-1 md:grid-cols-[1.5fr_1fr_1fr_0.8fr_auto] gap-2 p-2 bg-surface dark:bg-dark-surface rounded-2xl shadow-elevated border border-border dark:border-dark-border',
        className,
      )}
    >
      <Input
        icon={<LuMapPin className="h-4 w-4" />}
        placeholder="Where are you going?"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        className="border-0 shadow-none focus:ring-0"
      />
      <Input
        icon={<LuCalendar className="h-4 w-4" />}
        type="date"
        value={checkIn}
        onChange={(e) => handleCheckInChange(e.target.value)}
        min={today}
        className="border-0 shadow-none focus:ring-0"
      />
      <Input
        icon={<LuCalendar className="h-4 w-4" />}
        type="date"
        value={checkOut}
        onChange={(e) => handleCheckOutChange(e.target.value)}
        min={checkIn || today} // Disable dates before check-in
        disabled={!checkIn} // Disable check-out until check-in is selected
        className="border-0 shadow-none focus:ring-0"
      />
      <Input
        icon={<LuUsers className="h-4 w-4" />}
        type="number"
        min={1}
        value={guests}
        onChange={(e) => setGuests(parseInt(e.target.value || '1', 10))}
        className="border-0 shadow-none focus:ring-0"
      />
      <Button type="submit" size="lg" className="rounded-xl">
        <LuSearch className="h-5 w-5" />
        <span className="hidden md:inline">Search</span>
      </Button>
    </form>
  );
}
