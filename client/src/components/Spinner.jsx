import { Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

export function Spinner({ className, size = 20 }) {
  return <Loader2 className={cn('animate-spin text-muted-foreground', className)} size={size} />;
}

export function FullPageSpinner() {
  return (
    <div className="flex h-[60vh] items-center justify-center">
      <Spinner size={32} />
    </div>
  );
}
