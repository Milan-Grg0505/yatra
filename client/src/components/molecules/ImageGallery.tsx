import { useState } from 'react';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import { cn } from '@/lib/utils';

interface ImageGalleryProps {
  images: string[];
  className?: string;
}

export function ImageGallery({ images, className }: ImageGalleryProps) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  if (!images?.length) {
    return (
      <div className={cn('aspect-[16/9] rounded-2xl bg-surface-2 dark:bg-dark-surface-2 flex items-center justify-center text-text-3', className)}>
        No images
      </div>
    );
  }

  const main = images[0]!;
  const rest = images.slice(1, 5);

  return (
    <>
      <div className={cn('grid grid-cols-4 grid-rows-2 gap-2 h-[420px] rounded-2xl overflow-hidden', className)}>
        <button
          onClick={() => {
            setIndex(0);
            setOpen(true);
          }}
          className="col-span-2 row-span-2 relative group overflow-hidden"
        >
          <img src={main} alt="" className="h-full w-full object-cover group-hover:scale-105 transition duration-500" />
        </button>
        {rest.map((src, i) => (
          <button
            key={i}
            onClick={() => {
              setIndex(i + 1);
              setOpen(true);
            }}
            className="relative group overflow-hidden"
          >
            <img src={src} alt="" className="h-full w-full object-cover group-hover:scale-105 transition duration-500" />
            {i === 3 && images.length > 5 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white font-semibold">
                +{images.length - 5} more
              </div>
            )}
          </button>
        ))}
      </div>
      <Lightbox
        open={open}
        close={() => setOpen(false)}
        index={index}
        slides={images.map((src) => ({ src }))}
      />
    </>
  );
}
