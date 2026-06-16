'use client';

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export function StarRating({
  value,
  onChange,
  size = 18,
  readOnly = false,
}: {
  value: number;
  onChange?: (v: number) => void;
  size?: number;
  readOnly?: boolean;
}) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={readOnly}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
          onClick={() => onChange?.(n)}
          className={cn('transition-transform', !readOnly && 'cursor-pointer hover:scale-110')}
        >
          <Star
            style={{ width: size, height: size }}
            className={cn(n <= value ? 'fill-gold text-gold' : 'text-muted-foreground/40')}
          />
        </button>
      ))}
    </div>
  );
}
