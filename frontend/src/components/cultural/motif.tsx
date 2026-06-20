import { cn } from '@/lib/utils';
import { Lotus, Om, Veena, Bansuri, Tabla, Mridangam, Tanpura, Manjira } from '@/components/icons/cultural-icons';

/** A temple-style divider: gradient rules flanking a lotus–om–lotus motif. */
export function MotifDivider({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-center gap-3 text-primary/60', className)} aria-hidden="true">
      <span className="h-px w-12 bg-gradient-to-r from-transparent to-border sm:w-28" />
      <Lotus className="h-4 w-4" />
      <Om className="h-6 w-6 text-primary" />
      <Lotus className="h-4 w-4 -scale-x-100" />
      <span className="h-px w-12 bg-gradient-to-l from-transparent to-border sm:w-28" />
    </div>
  );
}

const INSTRUMENTS = [
  { Icon: Veena, label: 'Veena' },
  { Icon: Bansuri, label: 'Bansuri' },
  { Icon: Tanpura, label: 'Tanpura' },
  { Icon: Tabla, label: 'Tabla' },
  { Icon: Mridangam, label: 'Mridangam' },
  { Icon: Manjira, label: 'Manjira' },
];

/** Decorative row celebrating the instruments of devotional music. */
export function InstrumentBand({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-2xl border bg-muted/30 p-6', className)}>
      <div className="grid grid-cols-3 gap-5 sm:grid-cols-6">
        {INSTRUMENTS.map(({ Icon, label }) => (
          <div
            key={label}
            className="flex flex-col items-center gap-2 text-muted-foreground transition-all hover:-translate-y-0.5 hover:text-primary"
          >
            <Icon className="h-9 w-9" />
            <span className="text-xs font-medium">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
