import { useState } from 'react';
import { LuImage, LuX, LuChevronLeft, LuChevronRight } from 'react-icons/lu';
import { Modal } from '@/components/atoms/Modal';
import { Button } from '@/components/atoms/Button';
import { cn } from '@/lib/utils';

interface HotelGalleryProps {
  images: string[];
  alt: string;
}

/** Booking.com-style 4-up gallery with a "View all photos" button → lightbox modal. */
export function HotelGallery({ images, alt }: HotelGalleryProps) {
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);

  if (!images.length) {
    return (
      <div className="aspect-[16/9] rounded-2xl bg-surface-2 dark:bg-dark-surface-2 grid place-items-center text-text-3">
        <LuImage className="h-12 w-12" />
      </div>
    );
  }

  // Pad to 5 for layout
  const display = [...images.slice(0, 5)];

  return (
    <>
      <div className="grid grid-cols-4 grid-rows-2 gap-2 rounded-2xl overflow-hidden aspect-[16/9] relative">
        {/* Big hero */}
        <button
          type="button"
          onClick={() => { setIdx(0); setOpen(true); }}
          className="col-span-2 row-span-2 relative group"
        >
          <img src={display[0]} alt={alt} className="h-full w-full object-cover transition-transform group-hover:scale-[1.02]" />
        </button>
        {[1, 2, 3, 4].map((i) => (
          <button
            key={i}
            type="button"
            onClick={() => { setIdx(i); setOpen(true); }}
            disabled={!display[i]}
            className={cn(
              'relative group bg-surface-2 dark:bg-dark-surface-2',
              !display[i] && 'cursor-default',
            )}
          >
            {display[i] ? (
              <img src={display[i]} alt={alt} className="h-full w-full object-cover transition-transform group-hover:scale-[1.02]" />
            ) : (
              <div className="h-full w-full grid place-items-center">
                <LuImage className="h-6 w-6 text-text-3" />
              </div>
            )}
          </button>
        ))}
        {images.length > 5 && (
          <Button
            variant="surface"
            size="sm"
            className="absolute bottom-4 right-4 shadow-card"
            onClick={() => { setIdx(0); setOpen(true); }}
          >
            <LuImage className="h-4 w-4" /> View all {images.length} photos
          </Button>
        )}
      </div>

      {/* Lightbox */}
      <Modal open={open} onClose={() => setOpen(false)} size="2xl" className="bg-black/90">
        <div className="relative -m-6">
          <button
            onClick={() => setOpen(false)}
            className="absolute top-2 right-2 z-10 h-9 w-9 grid place-items-center rounded-full bg-black/60 text-white hover:bg-black"
            aria-label="Close"
          >
            <LuX className="h-5 w-5" />
          </button>
          <button
            onClick={() => setIdx((i) => (i - 1 + images.length) % images.length)}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 h-10 w-10 grid place-items-center rounded-full bg-black/60 text-white hover:bg-black"
            aria-label="Previous"
          >
            <LuChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => setIdx((i) => (i + 1) % images.length)}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 h-10 w-10 grid place-items-center rounded-full bg-black/60 text-white hover:bg-black"
            aria-label="Next"
          >
            <LuChevronRight className="h-5 w-5" />
          </button>
          <img src={images[idx]} alt={alt} className="w-full max-h-[80vh] object-contain" />
          <p className="text-center text-xs text-white/70 mt-2">{idx + 1} / {images.length}</p>
        </div>
      </Modal>
    </>
  );
}
