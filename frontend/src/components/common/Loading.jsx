import clsx from 'clsx';
import { Loader2 } from 'lucide-react';

export function Loading({ className, size = 24 }) {
    return (
        <div className={clsx('flex items-center justify-center p-4', className)}>
            <Loader2 className="animate-spin text-sky-500" size={size} />
        </div>
    );
}
