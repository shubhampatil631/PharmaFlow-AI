import { useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';

export function Topbar({ onMenuClick }) {
    const location = useLocation();
    const pathInitials = location.pathname.split('/').filter(Boolean).map(p => p.charAt(0).toUpperCase() + p.slice(1));
    const breadcrumbs = ['Home', ...pathInitials];

    return (
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-10">
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                >
                    <Menu size={24} />
                </button>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                    {breadcrumbs.map((crumb, index) => (
                        <div key={index} className="flex items-center gap-2">
                            {index > 0 && <span>/</span>}
                            <span className={index === breadcrumbs.length - 1 ? 'font-medium text-slate-900' : ''}>
                                {crumb}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex items-center gap-4">
                {/* Placeholder for notifications or extra actions */}
            </div>
        </header>
    );
}
